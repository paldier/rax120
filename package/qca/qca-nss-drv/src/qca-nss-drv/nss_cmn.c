/*
 **************************************************************************
 * Copyright (c) 2014-2017 The Linux Foundation. All rights reserved.
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
 * nss_cmn.c
 *	NSS generic APIs
 */

#if (NSS_DT_SUPPORT == 1)
#include <linux/of.h>
#endif

#include "nss_tx_rx_common.h"

/*
 * nss_cmn_response_str
 *	Common response structure string
 */
int8_t *nss_cmn_response_str[NSS_CMN_RESPONSE_LAST] = {
	"Message Acknowledge without errors",
	"Common message version not supported",
	"Unknown Interface",
	"Length Error",
	"Message Error",
	"FW Notification Message",
};

/*
 * nss_cmn_msg_init()
 *	Initialize the common message structure.
 */
void nss_cmn_msg_init(struct nss_cmn_msg *ncm, uint32_t if_num, uint32_t type,  uint32_t len, void *cb, void *app_data)
{
	ncm->interface = if_num;
	ncm->version = NSS_HLOS_MESSAGE_VERSION;
	ncm->type = type;
	ncm->len = len;
	ncm->cb = (nss_ptr_t)cb;
	ncm->app_data = (nss_ptr_t)app_data;
}
EXPORT_SYMBOL(nss_cmn_msg_init);

/*
 * nss_cmn_get_interface_number()
 *	Return the interface number of the NSS net_device.
 *
 * Returns -1 on failure or the interface number of dev is an NSS net_device.
 */
int32_t nss_cmn_get_interface_number(struct nss_ctx_instance *nss_ctx, struct net_device *dev)
{
	int i;

	NSS_VERIFY_CTX_MAGIC(nss_ctx);
	if (unlikely(nss_ctx->state != NSS_CORE_STATE_INITIALIZED)) {
		nss_warning("%p: Interface number could not be found as core not ready", nss_ctx);
		return -1;
	}

	nss_assert(dev != 0);

	/*
	 * Check physical interface table
	 */
	for (i = 0; i < NSS_MAX_NET_INTERFACES; i++) {
		if (dev == nss_ctx->subsys_dp_register[i].ndev) {
			return i;
		}
	}

	nss_warning("%p: Interface number could not be found as interface has not registered yet", nss_ctx);
	return -1;
}
EXPORT_SYMBOL(nss_cmn_get_interface_number);

/*
 * nss_cmn_get_interface_dev()
 *	Return the net_device for NSS interface id.
 *
 * Returns NULL on failure or the net_device for NSS interface id.
 */
struct net_device *nss_cmn_get_interface_dev(struct nss_ctx_instance *ctx, uint32_t if_num)
{
	struct nss_ctx_instance *nss_ctx = (struct nss_ctx_instance *)ctx;

	NSS_VERIFY_CTX_MAGIC(nss_ctx);
	if (unlikely(nss_ctx->state != NSS_CORE_STATE_INITIALIZED)) {
		nss_warning("%p: Interface device could not be found as core not ready", nss_ctx);
		return NULL;
	}

	if (unlikely(if_num >= NSS_MAX_NET_INTERFACES)) {
		return NULL;
	}

	return nss_ctx->subsys_dp_register[if_num].ndev;
}
EXPORT_SYMBOL(nss_cmn_get_interface_dev);

/*
 * nss_cmn_get_interface_number_by_dev_and_type()
 *	Return the NSS interface id for the net_device.
 *
 * Returns < 0 on failure or the NSS interface id for the given device and type.
 */
int32_t nss_cmn_get_interface_number_by_dev_and_type(struct net_device *dev, uint32_t type)
{
	int i, core;
	struct nss_subsystem_dataplane_register *nsdr;

	nss_assert(dev != 0);
	for (core = 0; core < NSS_MAX_CORES; core++) {
		for (i = 0; i < NSS_MAX_NET_INTERFACES; i++) {
			nsdr = &nss_top_main.nss[core].subsys_dp_register[i];
			if (dev == nsdr->ndev && type == nsdr->type) {
				return i;
			}
		}
	}

	nss_warning("Interface number could not be found for %p (%s) as interface has not registered yet", dev, dev->name);
	return -1;
}
EXPORT_SYMBOL(nss_cmn_get_interface_number_by_dev_and_type);

/*
 * nss_cmn_get_interface_number_by_dev()
 *	Return the NSS interface id for the net_device.
 *
 * Returns < 0 on failure or the NSS interface id for the given device.
 */
int32_t nss_cmn_get_interface_number_by_dev(struct net_device *dev)
{
	return nss_cmn_get_interface_number_by_dev_and_type(dev, 0);
}
EXPORT_SYMBOL(nss_cmn_get_interface_number_by_dev);

/*
 * nss_cmn_get_state()
 *	return the NSS initialization state
 */
nss_state_t nss_cmn_get_state(struct nss_ctx_instance *ctx)
{
	struct nss_ctx_instance *nss_ctx = (struct nss_ctx_instance *)ctx;
	nss_state_t state = NSS_STATE_UNINITIALIZED;

	NSS_VERIFY_CTX_MAGIC(nss_ctx);
	spin_lock_bh(&nss_top_main.lock);
	if (nss_ctx->state == NSS_CORE_STATE_INITIALIZED) {
		state = NSS_STATE_INITIALIZED;
	}
	spin_unlock_bh(&nss_top_main.lock);

	return state;
}
EXPORT_SYMBOL(nss_cmn_get_state);

/*
 * nss_cmn_interface_is_redirect()
 * 	Return true if the interface is a redirect interface.
 */
bool nss_cmn_interface_is_redirect(struct nss_ctx_instance *nss_ctx, int32_t interface_num)
{
	enum nss_dynamic_interface_type type = nss_dynamic_interface_get_type(nss_ctx, interface_num);

	return type == NSS_DYNAMIC_INTERFACE_TYPE_WIFI
		|| type == NSS_DYNAMIC_INTERFACE_TYPE_802_3_REDIR_N2H
		|| type == NSS_DYNAMIC_INTERFACE_TYPE_802_3_REDIR_H2N
		|| type == NSS_DYNAMIC_INTERFACE_TYPE_VIRTIF_DEPRECATED;
}
EXPORT_SYMBOL(nss_cmn_interface_is_redirect);

/*
 * nss_cmn_rx_dropped_sum()
 *	Sum rx_dropped count.
 */
uint32_t nss_cmn_rx_dropped_sum(struct nss_cmn_node_stats *node_stats)
{
	uint32_t sum = 0;
	int i;
	for (i = 0; i < NSS_MAX_NUM_PRI; i++) {
		sum += node_stats->rx_dropped[i];
	}
	return sum;
}
EXPORT_SYMBOL(nss_cmn_rx_dropped_sum);

/*
 * nss_cmn_register_queue_decongestion()
 *	Register for queue decongestion event
 */
nss_cb_register_status_t nss_cmn_register_queue_decongestion(struct nss_ctx_instance *nss_ctx, nss_cmn_queue_decongestion_callback_t event_callback, void *app_ctx)
{
	uint32_t i;

	NSS_VERIFY_CTX_MAGIC(nss_ctx);
	spin_lock_bh(&nss_ctx->decongest_cb_lock);

	/*
	 * Find vacant location in callback table
	 */
	for (i = 0; i< NSS_MAX_CLIENTS; i++) {
		if (nss_ctx->queue_decongestion_callback[i] == NULL) {
			nss_ctx->queue_decongestion_callback[i] = event_callback;
			nss_ctx->queue_decongestion_ctx[i] = app_ctx;
			spin_unlock_bh(&nss_ctx->decongest_cb_lock);
			return NSS_CB_REGISTER_SUCCESS;
		}
	}

	spin_unlock_bh(&nss_ctx->decongest_cb_lock);
	return NSS_CB_REGISTER_FAILED;
}
EXPORT_SYMBOL(nss_cmn_register_queue_decongestion);

/*
 * nss_cmn_unregister_queue_decongestion()
 *	Unregister for queue decongestion event
 */
nss_cb_unregister_status_t nss_cmn_unregister_queue_decongestion(struct nss_ctx_instance *nss_ctx, nss_cmn_queue_decongestion_callback_t event_callback)
{
	uint32_t i;

	NSS_VERIFY_CTX_MAGIC(nss_ctx);
	spin_lock_bh(&nss_ctx->decongest_cb_lock);

	/*
	 * Find actual location in callback table
	 */
	for (i = 0; i< NSS_MAX_CLIENTS; i++) {
		if (nss_ctx->queue_decongestion_callback[i] == event_callback) {
			nss_ctx->queue_decongestion_callback[i] = NULL;
			nss_ctx->queue_decongestion_ctx[i] = NULL;
			spin_unlock_bh(&nss_ctx->decongest_cb_lock);
			return NSS_CB_UNREGISTER_SUCCESS;
		}
	}

	spin_unlock_bh(&nss_ctx->decongest_cb_lock);
	return NSS_CB_UNREGISTER_FAILED;
}
EXPORT_SYMBOL(nss_cmn_unregister_queue_decongestion);

/*
 * nss_cmn_get_nss_enabled()
 * 	Check if NSS mode is supported on platform
 *
 * This API checks the device tree parameter to decide on whether
 * NSS mode is enabled. On older kernels this will always return true
 */
bool nss_cmn_get_nss_enabled(void)
{
#if (NSS_DT_SUPPORT == 1)
	struct device_node *cmn = NULL;

	/*
	 * Get reference to NSS common device node
	 */
	cmn = of_find_node_by_name(NULL, "nss-common");
	if (!cmn) {
		nss_info_always("nss is not enabled on this platform\n");
		return false;
	}
#endif
	return true;
}
EXPORT_SYMBOL(nss_cmn_get_nss_enabled);
