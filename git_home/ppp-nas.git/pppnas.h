#ifndef _PPP_NAS_H_
#define _PPP_NAS_H_

#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/ioctl.h>
#include <net/if.h>

#include "libnetlink.h"

struct net_iface 
{
	int 	ifindex;
	
	struct in_addr addr;	/* IP address */
	struct in_addr netmask;	/* IP address netmask*/
	struct in_addr dstaddr;	/* P-t-P IP address */
};

typedef unsigned int __u32;

struct net_route
{
	int oif;
	int tid;

	__u32 dst;
	__u32 gw;
};

struct net_rule
{
	unsigned int pref;
	unsigned int fwmark;
	unsigned int tid;
	
	__u32 src;	
	__u32 dst;	
	__u8  dst_len;
};

extern void if_fetch(char* ifname, struct net_iface * ife);

extern void iproute_add(struct net_route * rt_info);
extern void iproute_flush_cache(void);

extern void iprule_add(struct net_rule * rule);
extern void iprule_del(struct net_rule * rule);


extern struct rtnl_handle rth;

#endif

