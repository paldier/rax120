/* dhcpc.h */
#ifndef _DHCPC_H
#define _DHCPC_H

#include "libbb_udhcp.h"

#define INIT_SELECTING	0
#define REQUESTING	1
#define BOUND		2
#define RENEWING	3
#define REBINDING	4
#define INIT_REBOOT	5
#define RENEW_REQUESTED 6
#define RELEASED	7

struct client_config_t {
	char foreground;		/* Do not fork */
	char quit_after_lease;		/* Quit after obtaining lease */
	char abort_if_no_lease;		/* Abort if no lease */
	char background_if_no_lease;	/* Fork to background if no lease */
	char *interface;		/* The name of the interface to use */
	char *pidfile;			/* Optionally store the process ID */
	char *script;			/* User script to run at dhcp events */
	unsigned char *clientid;	/* Optional client id to use */
	unsigned char *hostname;	/* Optional hostname to use */
	unsigned char *domain_name; 	/* Optional domain name to use */
	int ifindex;			/* Index number of the interface to use */
	unsigned char arp[6];		/* Our arp address */
#ifdef SUPPORT_OPTION_60
	unsigned char *vendor;		/* option 60, identify the vendor's ID */
#endif
#ifdef SUPPORT_OPTION_77
	unsigned char *user_class;	/* option 77, User Class information */
#endif
#ifdef SUPPORT_OPTION_90
	unsigned char *authentication;	/* option 90, Authentication */
#endif
	unsigned char apmode;		/* 1 if DUT is running in AP mode, 0 if DUT is running in Router mode */
};

char hostname_buff[64];
#define HOSTNAME_FILE	"/tmp/dhcp_name.conf"

extern struct client_config_t client_config;

#endif
