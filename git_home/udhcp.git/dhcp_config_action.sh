#!/bin/sh

#Purpose:
#update udhcp related parameters from config database

[ ! -e /tmp/udhcp ] && mkdir /tmp/udhcp

CONFIG=/bin/config

ENABLE_SPAIN_FILE="/tmp/udhcp/enable_orange_spain"
LB_VER_FILE="/tmp/udhcp/LB_ver"
LB4_DEV_OUI_FILE="/tmp/udhcp/LB4_dev_oui"
LB4_DEV_SN_FILE="/tmp/udhcp/LB4_dev_sn"
LB4_DEV_PC_FILE="/tmp/udhcp/LB4_dev_pc"
ENABLE_ORANGE_FILE="/tmp/udhcp/enable_orange"
ORANGE_IPTV_FILE="/tmp/udhcp/orange_spain_iptv"
MOVISTAR_IPTV_FILE="/tmp/udhcp/movistar_spain_iptv"
LAN_IPADDR_FILE="/tmp/udhcp/lan_ipaddr"
IPV6_TYPE_FILE="/tmp/udhcp/ipv6_type"

$CONFIG get enable_orange_spain >$ENABLE_SPAIN_FILE
$CONFIG get LB_ver >$LB_VER_FILE
$CONFIG get LB4_dev_oui >$LB4_DEV_OUI_FILE
$CONFIG get LB4_dev_sn >$LB4_DEV_SN_FILE
$CONFIG get LB4_dev_pc >$LB4_DEV_PC_FILE
$CONFIG get enable_orange >$ENABLE_ORANGE_FILE
$CONFIG get orange_spain_iptv >$ORANGE_IPTV_FILE
$CONFIG get movistar_spain_iptv >$MOVISTAR_IPTV_FILE
$CONFIG get lan_ipaddr >$LAN_IPADDR_FILE
$CONFIG get ipv6_type >$IPV6_TYPE_FILE

