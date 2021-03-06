/*
 **************************************************************************
 * Copyright (c) 2016, The Linux Foundation. All rights reserved.
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
 * nss_connnmgr_dtls.h
 */

#ifndef _NSS_CONNMGR_DTLS_H_
#define _NSS_CONNMGR_DTLS_H_

#include "nss_dtlsmgr.h"
#include <nss_crypto_if.h>

/*
 * Debug macros
 */
#if (NSS_DTLSMGR_DEBUG_LEVEL < 1)
#define nss_dtlsmgr_assert(fmt, args...)
#else
#define nss_dtlsmgr_assert(c) BUG_ON(!(c))
#endif

#if defined(CONFIG_DYNAMIC_DEBUG)
/*
 * Compile messages for dynamic enable/disable
 */
#define nss_dtlsmgr_warn(s, ...) pr_debug("%s[%d]:" s, __func__, \
					  __LINE__, ##__VA_ARGS__)
#define nss_dtlsmgr_info(s, ...) pr_debug("%s[%d]:" s, __func__, \
					  __LINE__, ##__VA_ARGS__)
#define nss_dtlsmgr_trace(s, ...) pr_debug("%s[%d]:" s, __func__, \
					   __LINE__, ##__VA_ARGS__)
#else

/*
 * Statically compile messages at different levels
 */
#if (NSS_DTLSMGR_DEBUG_LEVEL < 2)
#define nss_dtlsmgr_warn(s, ...)
#else
#define nss_dtlsmgr_warn(s, ...) pr_warn("%s[%d]:" s, __func__, \
					 __LINE__, ##__VA_ARGS__)
#endif

#if (NSS_DTLSMGR_DEBUG_LEVEL < 3)
#define nss_dtlsmgr_info(s, ...)
#else
#define nss_dtlsmgr_info(s, ...) pr_notice("%s[%d]:" s, __func__, \
					   __LINE__, ##__VA_ARGS__)
#endif

#if (NSS_DTLSMGR_DEBUG_LEVEL < 4)
#define nss_dtlsmgr_trace(s, ...)
#else
#define nss_dtlsmgr_trace(s, ...)  pr_info("%s[%d]:" s, __func__, \
					   __LINE__, ##__VA_ARGS__)
#endif
#endif

#define NSS_DTLSMGR_HDR_LEN 13			/* DTLS header length */
#define NSS_DTLSMGR_CAPWAPHDR_LEN 4		/* CAPWAP-DTLS header length */
#define NSS_DTLSMGR_SESSION_MAGIC 0x5d7eb219	/* DTLS session magic value */

/*
 * DTLS payload content type
 */
#define NSS_DTLSMGR_CTYPE_APP 23		/* Application data */

/*
 * DTLS metadata
 */
#define NSS_DTLSMGR_METADATA_LEN 4		/* DTLS metadata length */
#define NSS_DTLSMGR_METADATA_CTYPE(m) (m >> 24)	/* DTLS metadata content type */
#define NSS_DTLSMGR_METADATA_ERROR(m) ((m >> 16) & 0x00FF)
						/* DTLS metadata error */
/*
 * DTLS metadata error types
 */
#define NSS_DTLSMGR_METADATA_ERROR_OK 0

/*
 * DTLS Manager session
 */
struct nss_dtlsmgr_session {
	uint32_t magic;			/* Magic value used to
					   verify DTLS session */
	atomic_t ref;			/* Reference counter */
	uint32_t ver;			/* DTLS version */
	uint32_t flags;			/* Session flags */
	uint32_t crypto_idx_encap;	/* Current encap crypto session idx */
	uint32_t crypto_idx_decap;	/* Current decap crypto session idx */
	uint32_t cidx_encap_pending;	/* Pending encap crypto session idx */
	uint32_t cidx_decap_pending;	/* Pending decap crypto session idx */
	nss_dtlsmgr_session_stats_update_cb_t stats_update_cb;
					/* Callback for Stats update */
	uint32_t nss_dtls_if;		/* NSS DTLS session I/F */
	struct nss_ctx_instance *nss_ctx;
					/* NSS context */
	struct net_device *netdev;	/* Netdevice */
	uint16_t sport;			/* Source UDP/UDPLite port */
	uint16_t dport;			/* Destination UDP/UDPLite port */
	uint16_t window_size;		/* Anit-replay window size */
	uint16_t epoch;			/* Current Epoch */
	union nss_dtlsmgr_ip sip;	/* Source IPv4/IPv6 address */
	union nss_dtlsmgr_ip dip;	/* Destination IPv4/IPv6 address */
	uint32_t nss_app_if;		/* NSS I/F of application using
					   this DTLS session */
	uint8_t ip_ttl;			/* IP Time To Live */
};

/*
 * DTLS Manager global context type
 */
struct nss_dtlsmgr_ctx {
	nss_crypto_handle_t crypto_hdl;
	spinlock_t lock;
	struct nss_dtlsmgr_session *session[NSS_MAX_DTLS_SESSIONS];
};

/*
 * DTLS Manager per session netdev private data
 */
struct nss_dtlsmgr_netdev_priv {
	struct nss_dtlsmgr_session *s;
};

nss_dtlsmgr_status_t nss_dtlsmgr_netdev_create(struct nss_dtlsmgr_session *ds);
nss_dtlsmgr_status_t nss_dtlsmgr_netdev_destroy(struct nss_dtlsmgr_session *ds);

#endif
