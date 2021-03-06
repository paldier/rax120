/*
 ******************************************************************************
 * Copyright (c) 2018, The Linux Foundation. All rights reserved.
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
 * ****************************************************************************
 */

#ifndef __NSS_C2C_TX_STATS_H
#define __NSS_C2C_TX_STATS_H

#include <nss_cmn.h>

/**
 * C2C_TX node statistics
 */
enum nss_c2c_tx_stats_types {
	NSS_C2C_TX_STATS_PBUF_SIMPLE = NSS_STATS_NODE_MAX,
						/**< Number of received simple pbuf. */
	NSS_C2C_TX_STATS_PBUF_SG,		/**< Number of S/G pbuf received. */
	NSS_C2C_TX_STATS_PBUF_RETURNING,	/**< Number of returning S/G pbuf. */
	NSS_C2C_TX_STATS_MAX,
};

/*
 * C2C_TX statistics APIs
 */
extern void nss_c2c_tx_stats_sync(struct nss_ctx_instance *nss_ctx, struct nss_c2c_tx_stats *nct);
extern void nss_c2c_tx_stats_dentry_create(void);

#endif /* __NSS_C2C_TX_STATS_H */
