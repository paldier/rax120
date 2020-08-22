/* options.h */
#ifndef _OPTIONS_H
#define _OPTIONS_H

#include "packet.h"
#include "config.h"

#define TYPE_MASK	0x0F

enum {
	OPTION_IP=1,
	OPTION_IP_PAIR,
#if defined (RFC3442_121_SUPPORT) || defined (RFC3442_249_SUPPORT)
	OPTION_IP_COMP,
#endif
	OPTION_STRING,
	OPTION_BOOLEAN,
	OPTION_U8,
	OPTION_U16,
	OPTION_S16,
	OPTION_U32,
	OPTION_S32,
	OPTION_6RD
};

#define OPTION_REQ	0x10 /* have the client request this option */
#define OPTION_LIST	0x20 /* There can be a list of 1 or more of these */

#ifdef SUPPORT_SPECIFIC_ISP
#define VENDOR_ADSL_FORUM_ENTERPRISE_NUMBER	3561
#define VENDOR_IDENTIFYING_FOR_GATEWAY		1
#define VENDOR_ENTERPRISE_LEN			4    /* 4 bytes */
#define VENDOR_IDENTIFYING_INFO_LEN		142
#define VENDOR_IDENTIFYING_OPTION_CODE		125
#define VENDOR_OPTION_CODE_OFFSET		0
#define VENDOR_OPTION_LEN_OFFSET		1
#define VENDOR_OPTION_ENTERPRISE_OFFSET		2
#define VENDOR_OPTION_DATA_OFFSET		6
#define VENDOR_OPTION_DATA_LEN			1
#define VENDOR_OPTION_SUBCODE_LEN		1
#define VENDOR_SUBCODE_AND_LEN_BYTES		2
#define VENDOR_GATEWAY_OUI_SUBCODE		4
#define VENDOR_GATEWAY_SERIAL_NUMBER_SUBCODE	5
#define VENDOR_GATEWAY_PRODUCT_CLASS_SUBCODE	6

#define _LB4_deviceOui		"289EFC"
#define _LB4_deviceSerialNum	"NQ2019044010129"
#define _LB4_deviceProductClass	"Livebox 4"

#define _ESMS_deviceOui			"3872c0"
#define _ESMS_deviceSerialNum		"3872c034f445"
#define _ESMS_deviceProductClass	"WAP5813_V2"

#define OUI_LENGTH		8
#define SN_LENGTH		16
#define PC_LENGTH		16

#define OPT_DATA_LEN		256
#define OPT_FOR_GATEWAY		1
#define _SP_MOVISTAR_PVT240	":::::239.0.2.10:22222:v6.0:239.0.2.30:22222"
#define _SP_MOVISTAR_DNS	"172.26.23.3"

#define FTI_PREFIX		"fti/"
#define ORG_FR_OPT60		"sagem"
#define ORG_FR_INT_LB3_OPT77	"FSVDSL_livebox.Internet.softathome.Livebox3"
#define ORG_FR_INT_LB4_OPT77	"FSVDSL_livebox.Internet.softathome.Livebox4"
#define ORG_FR_IPTV_LB3_OPT77	"FSVDSL_livebox.MLTV.softathome.Livebox3"
#define ORG_FR_IPTV_LB4_OPT77	"FSVDSL_livebox.MLTV.softathome.Livebox4"
#define ORG_ES_OPT60		"arcadyan"
#define ORG_ES_INT_OPT77	"FSVDSL_livebox.Internet.arcadyan.LiveboxPlus"
#define ORG_ES_IPTV_OPT77	"FSVDSL_livebox.MLTV.arcadyan.LiveboxPlus"
#endif

//add dhcp config file 

#define ENABLE_SPAIN_FILE "/tmp/udhcp/enable_orange_spain"
#define LB_VER_FILE "/tmp/udhcp/LB_ver"
#define LB4_DEV_OUI_FILE "/tmp/udhcp/LB4_dev_oui"
#define LB4_DEV_SN_FILE "/tmp/udhcp/LB4_dev_sn"
#define LB4_DEV_PC_FILE "/tmp/udhcp/LB4_dev_pc"
#define ENABLE_ORANGE_FILE "/tmp/udhcp/enable_orange"
#define ORANGE_IPTV_FILE "/tmp/udhcp/orange_spain_iptv"
#define MOVISTAR_IPTV_FILE "/tmp/udhcp/movistar_spain_iptv"
#define LAN_IPADDR_FILE "/tmp/udhcp/lan_ipaddr"
#define IPV6_TYPE_FILE "/tmp/udhcp/ipv6_type"

struct dhcp_option {
	char name[16];
	char flags;
	unsigned char code;
};

extern struct dhcp_option options[];
extern int option_lengths[];

#ifdef	DHCPD_SHOW_CLIENT_OPTIONS
void get_option_codes(struct dhcpMessage *packet, char *options);
#endif
unsigned char *get_option(struct dhcpMessage *packet, int code);
int end_option(unsigned char *optionptr);
int add_option_string(unsigned char *optionptr, unsigned char *string);
int add_simple_option(unsigned char *optionptr, unsigned char code, u_int32_t data);
struct option_set *find_option(struct option_set *opt_list, char code);
void attach_option(struct option_set **opt_list, struct dhcp_option *option, char *buffer, int length);

#ifdef SUPPORT_SPECIFIC_ISP
int createVIoption(int type, char *VIinfo);
int createSMOptInfo(int type, int code, char *OptInfo);
#endif

#endif
