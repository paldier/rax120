#ifndef _CLIENTPACKET_H
#define _CLIENTPACKET_H

#include <netinet/ip.h>
#include <netinet/udp.h>

u_int32_t random_xid(void);
int send_discover(u_int32_t xid, u_int32_t requested);
int send_selecting(u_int32_t xid, u_int32_t server, u_int32_t requested);
int send_renew(u_int32_t xid, u_int32_t server, u_int32_t ciaddr);
int send_renew(u_int32_t xid, u_int32_t server, u_int32_t ciaddr);
int send_release(u_int32_t server, u_int32_t ciaddr);
int send_decline(u_int32_t xid, u_int32_t requested, u_int32_t svrid);
int get_raw_packet(struct dhcpMessage *payload, int fd);

#endif
