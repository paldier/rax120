#include <sys/time.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/un.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <fcntl.h>
#include <errno.h>

#include <net/ethernet.h>
#include <net/if_arp.h>
#include <net/route.h>
#include <net/if.h>
#include <netdb.h>

#include <linux/types.h>
#include <linux/if_ether.h>
#include <linux/if_pppox.h>
#include <linux/if_pppol2tp.h>

#include "l2tp_msg.h"

static int open_l2tp_socket(void) 
{
	int s, flags;
	struct sockaddr_in me;

	memset(&me, 0, sizeof(struct sockaddr_in));
	me.sin_family	= AF_INET;
	me.sin_port	= htons(L2TP_PORT);
	me.sin_addr.s_addr = htonl(INADDR_ANY);

	if ((s = socket(AF_INET, SOCK_DGRAM, 0)) < 0)
		return -1;
	if (bind(s, (struct sockaddr *) &me, sizeof(me)) < 0) {
		l2tp_info("l2tp network init: bind: %s", strerror(errno));
		close(s);
		return -1;
	}

	/* Set socket non-blocking */
	flags = fcntl(s, F_GETFL);
	flags |= O_NONBLOCK;
	fcntl(s, F_SETFL, flags);

	return s;
}

void open_l2tp_callmngr(struct l2tp_conn_mngr *conn) 
{
	int s, flags, pppox_fd = -1;
	struct sockaddr_in *peer;
	struct sockaddr_in me;
	struct sockaddr_pppol2tp sax;

	if ((s = open_l2tp_socket()) < 0) {
		l2tp_info("Can't open socket for L2TP");
		return;
	}
	conn->ctrl_socket = s;

	flags=1;
	setsockopt(s, SOL_SOCKET, SO_REUSEADDR, &flags, sizeof(flags));

	flags = fcntl(s, F_GETFL);
	if (flags == -1 || fcntl(s, F_SETFL, flags | O_NONBLOCK) == -1) {
		l2tp_info("Unable to set UDP socket nonblock.\n");
		close(s);
		return -EINVAL;
	}

	memset(&me, 0, sizeof(struct sockaddr_in));
	me.sin_family   = AF_INET;
	me.sin_port     = htons(L2TP_PORT);
	me.sin_addr.s_addr = conn->server.s_addr;
	if (connect (s, (struct sockaddr *) &me, sizeof(me)) < 0) {
		l2tp_info("Unable to connect UDP peer. Terminating.\n");
		close(s);
		return -EINVAL;
	}

	conn->tunnel_id = (__u16) time(NULL) | 0x0001;
	conn->session_id = (__u16) rand() | 0x0002;

	peer = &conn->peer_addr;
	memset((void *)peer, 0, sizeof(struct sockaddr_in));
	peer->sin_family = AF_INET;
	peer->sin_port = htons(L2TP_PORT);
	peer->sin_addr.s_addr = conn->server.s_addr;

	l2tp_tunnel_open(conn);
	if (conn->tunnel_state != L2TP_TUNNEL_ESTABLISHED) {
		l2tp_info("Can't establish the L2TP Tunnel");
		goto err;
	}

	/* Copy these code from the function "int connect_pppol2tp(struct tunnel *t)" in 
	 * xl2tpd-devel-20150930/network.c, if don't add these changes, connect() will
	 * always failed in l2tp_open_session() in the file plugin.c, need study more 
	 * in futere!!!!
	 */
	pppox_fd = socket(AF_PPPOX, SOCK_DGRAM, PX_PROTO_OL2TP);
	if(pppox_fd < 0)
		l2tp_fatal("Failed to create L2TP socket: %m");

	flags = fcntl(pppox_fd, F_GETFL);
	if (flags == -1 || fcntl(pppox_fd, F_SETFL, flags | O_NONBLOCK) == -1) {
		l2tp_info("Unable to set PPPoL2TP socket nonblock.\n");
		close(pppox_fd);
		return -EINVAL;
	}
	memset(&sax, 0, sizeof(sax));
	sax.sa_family = AF_PPPOX;
	sax.sa_protocol = PX_PROTO_OL2TP;
	sax.pppol2tp.fd = conn->ctrl_socket;
	sax.pppol2tp.addr.sin_addr.s_addr = conn->server.s_addr;
	sax.pppol2tp.addr.sin_port = htons(1701);
	sax.pppol2tp.addr.sin_family = AF_INET;
	sax.pppol2tp.s_tunnel  = conn->tunnel_id;
	sax.pppol2tp.d_tunnel  = conn->peer_tunnel;

	if (connect(pppox_fd, (struct sockaddr *)&sax, sizeof(sax)) < 0) {
		l2tp_info(" Unable to connect PPPoL2TP socket.\n");
		close(pppox_fd);
		return -EINVAL;
	}

	l2tp_session_open(conn);
	if (conn->session_state != L2TP_SESSION_ESTABLISHED) {
		l2tp_info("Can't establish the L2TP Session");
		goto err;
	}

	if(pppox_fd > -1)
		close(pppox_fd);

	return;

err:
	conn->ctrl_socket = -1;
	conn->tunnel_state = L2TP_TUNNEL_IDLE;
	conn->session_state = L2TP_SESSION_IDLE;

	close(s);
}

void close_l2tp_callmngr(struct l2tp_conn_mngr *conn) 
{
	l2tp_tunnel_close(conn);
}

