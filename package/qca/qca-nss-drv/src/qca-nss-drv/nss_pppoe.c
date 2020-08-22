/*
 **************************************************************************
 * Copyright (c) 2013-2019, The Linux Foundation. All rights reserved.
 * Permission to use, copy, modify, and/or distribute this software for
 * any purpose with or without fee is hereby granted, provided that the
 * above copyright notice and this permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 **************************************************************************
 */

/*
 * nss_pppoe.c
 *	NSS PPPoE APIs
 */

#include "nss_tx_rx_common.h"
#include <linux/if_pppox.h>
#include "nss_pppoe_stats.h"

#define NSS_PPPOE_TX_TIMEOUT 3000 /* 3 Seconds */
typedef void (*nss_pppoe_msg_callback_t)(void *app_data, struct nss_pppoe_msg *msg);
int nss_pppoe_br_accel_mode __read_mostly = NSS_PPPOE_BR_ACCEL_MODE_EN_5T;

/*
 * Private data structure
 */
static struct nss_pppoe_pvt {
	struct semaphore sem;
	struct completion complete;
	int response;
	void *cb;
	void *app_data;
} pppoe_pvt;

/*
 * nss_pppoe_tx()
 *	Transmit an PPPoe message to the FW.
 */
nss_tx_status_t nss_pppoe_tx(struct nss_ctx_instance *nss_ctx, struct nss_pppoe_msg *nim)
{
	struct nss_cmn_msg *ncm = &nim->cm;

	/*
	 * Sanity check the message
	 */
	if (ncm->interface != NSS_PPPOE_RX_INTERFACE) {
		nss_warning("%p: tx request for another interface: %d", nss_ctx, ncm->interface);
		return NSS_TX_FAILURE;
	}

	if (ncm->type > NSS_PPPOE_MAX) {
		nss_warning("%p: message type out of range: %d", nss_ctx, ncm->type);
		return NSS_TX_FAILURE;
	}

	return nss_core_send_cmd(nss_ctx, nim, sizeof(*nim), NSS_NBUF_PAYLOAD_SIZE);
}

/*
 * nss_pppoe_br_help()
 *	Usage information for pppoe bride accel mode
 */
static inline void nss_pppoe_br_help(int mode)
{
	printk("Incorrect pppoe bridge accel mode: %d\n", mode);
	printk("Supported modes\n");
	printk("%d: pppoe bridge acceleration disable\n", NSS_PPPOE_BR_ACCEL_MODE_DIS);
	printk("%d: pppoe bridge acceleration enable with 5-tuple\n", NSS_PPPOE_BR_ACCEL_MODE_EN_5T);
	printk("%d: pppoe bridge acceleration enable with 3-tuple\n", NSS_PPPOE_BR_ACCEL_MODE_EN_3T);
}

/*
 **********************************
 Rx APIs
 **********************************
 */

/*
 * nss_pppoe_rx_msg_handler()
 *	Handle NSS -> HLOS messages for PPPoE
 */
static void nss_pppoe_rx_msg_handler(struct nss_ctx_instance *nss_ctx, struct nss_cmn_msg *ncm, __attribute__((unused))void *app_data)
{
	struct nss_pppoe_msg *nim = (struct nss_pppoe_msg *)ncm;
	void *ctx;
	nss_pppoe_msg_callback_t cb;

	BUG_ON(ncm->interface != NSS_PPPOE_RX_INTERFACE);

	/*
	 * Sanity check the message type
	 */
	if (ncm->type > NSS_PPPOE_MAX) {
		nss_warning("%p: message type out of range: %d", nss_ctx, ncm->type);
		return;
	}

	if (nss_cmn_get_msg_len(ncm) > sizeof(struct nss_pppoe_msg)) {
		nss_warning("%p: message length is invalid: %d", nss_ctx, nss_cmn_get_msg_len(ncm));
		return;
	}

	/*
	 * Log failures
	 */
	nss_core_log_msg_failures(nss_ctx, ncm);

	/*
	 * Handling PPPoE messages coming from NSS fw.
	 */
	switch (nim->cm.type) {
	case NSS_PPPOE_RX_NODE_STATS_SYNC:
		nss_pppoe_stats_node_sync(nss_ctx, &nim->msg.pppoe_node_stats_sync);
		break;
	case NSS_PPPOE_RX_CONN_STATS_SYNC:
		nss_pppoe_stats_exception_sync(nss_ctx, &nim->msg.pppoe_conn_stats_sync);
		break;
	case NSS_PPPOE_RX_SESSION_RESET:
		nss_pppoe_stats_session_reset(nss_ctx, &nim->msg.pppoe_session_reset);
		break;
	default:
		nss_warning("%p: Received response %d for type %d, interface %d",
				nss_ctx, ncm->response, ncm->type, ncm->interface);
	}

	/*
	 * Update the callback and app_data for NOTIFY messages, pppoe sends all notify messages
	 * to the same callback/app_data.
	 */
	if (ncm->response == NSS_CMM_RESPONSE_NOTIFY) {
		ncm->cb = (nss_ptr_t)NULL;
		ncm->app_data = (nss_ptr_t)NULL;
	}

	/*
	 * Do we have a call back
	 */
	if (!ncm->cb) {
		return;
	}

	/*
	 * callback
	 */
	cb = (nss_pppoe_msg_callback_t)ncm->cb;
	ctx = (void *)ncm->app_data;

	cb(ctx, nim);
}

/*
 * nss_pppoe_sync_msg_callback()
 *	Callback to handle the completion of NSS->HLOS messages.
 */
static void nss_pppoe_sync_msg_callback(void *app_data, struct nss_pppoe_msg *npm)
{
	nss_pppoe_msg_callback_t callback = (nss_pppoe_msg_callback_t)pppoe_pvt.cb;
	void *data = pppoe_pvt.app_data;

	pppoe_pvt.cb = NULL;
	pppoe_pvt.app_data = NULL;

	pppoe_pvt.response = NSS_TX_SUCCESS;
	if (npm->cm.response != NSS_CMN_RESPONSE_ACK) {
		nss_warning("pppoe Error response %d\n", npm->cm.response);
		pppoe_pvt.response = NSS_TX_FAILURE;
	}

	if (callback) {
		callback(data, npm);
	}

	complete(&pppoe_pvt.complete);
}

/*
 * nss_pppoe_tx_msg_sync()
 */
nss_tx_status_t nss_pppoe_tx_msg_sync(struct nss_ctx_instance *nss_ctx,
						struct nss_pppoe_msg *msg)
{
	nss_tx_status_t status;
	int ret = 0;

	down(&pppoe_pvt.sem);
	pppoe_pvt.cb = (void *)msg->cm.cb;
	pppoe_pvt.app_data = (void *)msg->cm.app_data;

	msg->cm.cb = (nss_ptr_t)nss_pppoe_sync_msg_callback;
	msg->cm.app_data = (nss_ptr_t)NULL;

	status = nss_pppoe_tx(nss_ctx, msg);
	if (status != NSS_TX_SUCCESS) {
		nss_warning("%p: nss_pppoe_tx_msg failed\n", nss_ctx);
		up(&pppoe_pvt.sem);
		return status;
	}

	ret = wait_for_completion_timeout(&pppoe_pvt.complete, msecs_to_jiffies(NSS_PPPOE_TX_TIMEOUT));
	if (!ret) {
		nss_warning("%p: PPPoE msg tx failed due to timeout\n", nss_ctx);
		pppoe_pvt.response = NSS_TX_FAILURE;
	}

	status = pppoe_pvt.response;
	up(&pppoe_pvt.sem);
	return status;
}

/*
 * nss_pppoe_br_accel_mode_handler()
 *	Enable/disable pppoe bridge acceleration in NSS
 */
static int nss_pppoe_br_accel_mode_handler(struct ctl_table *ctl, int write, void __user *buffer, size_t *lenp, loff_t *ppos)
{
	struct nss_ctx_instance *nss_ctx = &nss_top_main.nss[0];
	struct nss_pppoe_msg npm;
	struct nss_pppoe_br_accel_cfg_msg *npbacm;
	nss_tx_status_t status;
	int ret;
	enum nss_pppoe_br_accel_modes current_value, new_val;

	/*
	 * Take snap shot of current value
	 */
	current_value = nss_pppoe_br_accel_mode;

	/*
	 * Write the variable with user input
	 */
	ret = proc_dointvec(ctl, write, buffer, lenp, ppos);
	if (ret || (!write)) {
		return ret;
	}

	new_val = nss_pppoe_br_accel_mode;
	if ((new_val < NSS_PPPOE_BR_ACCEL_MODE_DIS) || (new_val >= NSS_PPPOE_BR_ACCEL_MODE_MAX)) {
		nss_warning("%p: value out of range: %d\n", nss_ctx, new_val);
		nss_pppoe_br_accel_mode = current_value;
		nss_pppoe_br_help(new_val);
		return -EINVAL;
	}

	memset(&npm, 0, sizeof(struct nss_pppoe_msg));
	nss_pppoe_msg_init(&npm, NSS_PPPOE_RX_INTERFACE, NSS_PPPOE_RX_BR_ACCEL_CFG,
		sizeof(struct nss_pppoe_br_accel_cfg_msg), NULL, NULL);

	npbacm = &npm.msg.br_accel;
	npbacm->br_accel_cfg = new_val;

	status = nss_pppoe_tx_msg_sync(nss_ctx, &npm);
	if (status != NSS_TX_SUCCESS) {
		nss_warning("%p: Send acceleration mode message failed\n", nss_ctx);
		nss_pppoe_br_accel_mode = current_value;
		return -EIO;
	}

	return 0;
}

/*
 * nss_pppoe_get_br_accel_mode()
 *	Gets PPPoE bridge acceleration mode
 */
enum nss_pppoe_br_accel_modes nss_pppoe_get_br_accel_mode(void)
{
	return nss_pppoe_br_accel_mode;
}
EXPORT_SYMBOL(nss_pppoe_get_br_accel_mode);

static struct ctl_table nss_pppoe_table[] = {
	{
		.procname               = "br_accel_mode",
		.data                   = &nss_pppoe_br_accel_mode,
		.maxlen                 = sizeof(int),
		.mode                   = 0644,
		.proc_handler           = &nss_pppoe_br_accel_mode_handler,
	},
	{ }
};

static struct ctl_table nss_pppoe_dir[] = {
	{
		.procname		= "pppoe",
		.mode			= 0555,
		.child			= nss_pppoe_table,
	},
	{ }
};

static struct ctl_table nss_pppoe_root_dir[] = {
	{
		.procname		= "nss",
		.mode			= 0555,
		.child			= nss_pppoe_dir,
	},
	{ }
};

static struct ctl_table nss_pppoe_root[] = {
	{
		.procname		= "dev",
		.mode			= 0555,
		.child			= nss_pppoe_root_dir,
	},
	{ }
};

static struct ctl_table_header *nss_pppoe_header;

/*
 * nss_pppoe_register_sysctl()
 *	Register sysctl specific to pppoe
 */
void nss_pppoe_register_sysctl(void)
{
	/*
	 * Register sysctl table.
	 */
	nss_pppoe_header = register_sysctl_table(nss_pppoe_root);
}

/*
 * nss_pppoe_unregister_sysctl()
 *	Unregister sysctl specific to pppoe
 */
void nss_pppoe_unregister_sysctl(void)
{
	/*
	 * Unregister sysctl table.
	 */
	if (nss_pppoe_header) {
		unregister_sysctl_table(nss_pppoe_header);
	}
}

/*
 * nss_pppoe_register_handler()
 */
void nss_pppoe_register_handler(struct nss_ctx_instance *nss_ctx)
{
	nss_core_register_handler(nss_ctx, NSS_PPPOE_RX_INTERFACE, nss_pppoe_rx_msg_handler, NULL);

	sema_init(&pppoe_pvt.sem, 1);
	init_completion(&pppoe_pvt.complete);

	nss_pppoe_stats_dentry_create();
}

/*
 * nss_pppoe_msg_init()
 *	Initialize pppoe message.
 */
void nss_pppoe_msg_init(struct nss_pppoe_msg *npm, uint16_t if_num, uint32_t type, uint32_t len,
			void *cb, void *app_data)
{
	nss_cmn_msg_init(&npm->cm, if_num, type, len, (void *)cb, app_data);
}
