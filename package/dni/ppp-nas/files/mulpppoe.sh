#!/bin/sh

usage()
{
	echo "Usage: $0 start|stop|restart"
	exit 1
}

# Global defines
[ -f /dni-gconfig ] && . /dni-gconfig
CONFIG="/bin/config"
FIREWALL="/usr/sbin/net-wall start"

# Local defines
PPP_NAS_BIN="/usr/sbin/ppp-nas"

PPPOE_S1="pppoe-session1"
PPPOE_S2="pppoe-session2"
TMP_P="/tmp/ppp"
PPP_P="/etc/ppp"
PEER_P="$PPP_P/peers"

PPP_S1_P="$PEER_P/$PPPOE_S1"
PPP_S2_P="$PEER_P/$PPPOE_S2"

P1_IP_UP="$PPP_P/pppoe1-ip-up"
P1_IP_DOWN="$PPP_P/pppoe1-ip-down"
P2_IP_UP="$PPP_P/pppoe2-ip-up"
P2_IP_DOWN="$PPP_P/pppoe2-ip-down"

P1_PAP="$PPP_P/pap-secrets"
P1_CHAP="$PPP_P/chap-secrets"
P2_PAP="$PPP_P/pap1-secrets"
P2_CHAP="$PPP_P/chap1-secrets"

# Copy this from /etc/functions.sh
load_modules()
{
	[ -d /etc/modules.d ] && {
		cd /etc/modules.d
		sed 's/^[^#]/insmod &/' $* | ash 2>&- || :
	}
}


# $1 config name; $2 default value if null
config_get()
{
	local value
	[ -z $1 ] && echo "$2" && return

	value=`$CONFIG get $1`
	echo "${value:-$2}"
}

early_prepare()
{
	mknod /dev/ppp c 180 0
	load_modules /etc/modules.d/60-pppoe-mod

	[ -e $TMP_P ] || mkdir -p $TMP_P

	if [ ! -d $PEER_P ] ;then
		rm -rf $PPP_P
		mkdir -p $PEER_P
	fi
}

# Define all values we need in this script
configs_set()
{
	# s1, s2 common
	dod=`config_get wan_endis_dod`
	mtu=`config_get wan_mulppp_mtu 1492`

	# s1, s2 private
	p1_idletime=`config_get wan_mulpppoe1_idletime`

	p1_service=`config_get wan_mulpppoe1_service`
	p2_service=`config_get wan_mulpppoe2_servicename`


	p1_username=`config_get wan_mulpppoe1_username`
	p1_passwd=`config_get wan_mulpppoe1_passwd`
	p2_username=`config_get wan_mulpppoe2_username`
	p2_passwd=`config_get wan_mulpppoe2_password`

	p1_dns_assign=`config_get wan_mulpppoe1_dns_assign`
	p2_dns_assign=`config_get wan_mulpppoe2_dns_assign`
	p1_dns1=`config_get wan_ether_dns1`
	p1_dns2=`config_get wan_ether_dns2`
	p2_dns1=`config_get wan_ether2_dns1`
	p2_dns2=`config_get wan_ether2_dns2`

	p1_ip_assign=`config_get wan_mulpppoe1_wan_assign`
	p1_ip=`config_get wan_mulpppoe1_ip`
	p2_ip_assign=`config_get wan_mulpppoe2_wan_assign`
	p2_ip=`config_get wan_mulpppoe2_ip`

	en_s2=`config_get wan_enable_session2`

	[ "x${DGC_WAN_IF_NONUSE_BRIDGE}" = "xy" ] && wan_if=$DGC_WAN_ETH_IF || wan_if=$DGC_WAN_BR_IF
}

# Some general common things first
general_ppp_option()
{
	[ -z $1 ] && echo "$0: too few arg" && return
	cat <<EOF > $1
lcp-echo-interval 20
lcp-echo-failure 3
defaultroute
no-replace-dns
noipdefault
hide-password
noauth
noaccomp
default-asyncmap
EOF
}

# Append something
append_file()
{
	[ -z "$1" ] && echo "append_file: too few arg" && return
	local f_name=$1
	shift
	echo "$*" >> $f_name
}

# Generate provider options file
config_options()
{
	### For Session1 #################################
	general_ppp_option $PPP_S1_P
	append_file $PPP_S1_P "replacedefaultroute"

	if [ "x$dod" = "x1" -a $p1_idletime -gt 0 ]; then
		append_file $PPP_S1_P "idle $p1_idletime"
		append_file $PPP_S1_P "demand"
	else
		append_file $PPP_S1_P "persist"
	fi

	append_file $PPP_S1_P "ip-up-script $P1_IP_UP"
	append_file $PPP_S1_P "ip-down-script $P1_IP_DOWN"

	[ "x$p1_dns_assign" != "x1" ] && append_file $PPP_S1_P "usepeerdns"

	append_file $PPP_S1_P "mru $mtu"
	append_file $PPP_S1_P "mtu $mtu"

	append_file $PPP_S1_P "plugin rp-pppoe.so ${wan_if:-brwan}"

	[ "x$p1_ip_assign" = "x1" ] && append_file $PPP_S1_P "${p1_ip}:"

	[ -n "$p1_username" ] && append_file $PPP_S1_P "user $p1_username"
	append_file $PPP_S1_P "unit 0"

	[ "x$p1_service" != "x" ] && append_file $PPP_S1_P "rp_pppoe_service $p1_service"
	sed -i '/rp_pppoe_service/ s/\\/\\\\/g' $PPP_S1_P
	sed -i '/rp_pppoe_service/ s/\#/\\#/g' $PPP_S1_P

	### For Session2 ##################################
	[ "x$en_s2" = "x0" ] && return
	general_ppp_option $PPP_S2_P

	append_file $PPP_S2_P "persist"

	append_file $PPP_S2_P "ip-up-script $P2_IP_UP"
	append_file $PPP_S2_P "ip-down-script $P2_IP_DOWN"
	append_file $PPP_S2_P "pap-file $P2_PAP"
	append_file $PPP_S2_P "chap-file $P2_CHAP"

	[ "x$p2_dns_assign" != "x1" ] && append_file $PPP_S2_P "usepeerdns"

	append_file $PPP_S2_P "mru $mtu"
	append_file $PPP_S2_P "mtu $mtu"

	append_file $PPP_S2_P "plugin rp-pppoe.so ${wan_if:-brwan}"

	[ "x$p2_ip_assign" = "x1" ] && append_file $PPP_S2_P "${p2_ip}:"

	[ -n "$p2_username" ] && append_file $PPP_S2_P "user $p2_username"
	append_file $PPP_S2_P "unit 1"

	[ "x$p2_service" != "x" ] && append_file $PPP_S2_P "rp_pppoe_service $p2_service"
	sed -i '/rp_pppoe_service/ s/\\/\\\\/g' $PPP_S2_P
	sed -i '/rp_pppoe_service/ s/\#/\\#/g' $PPP_S2_P
}

p1_ud_script()
{
	cat <<EOF > $P1_IP_UP
#!/bin/sh
$FIREWALL
$PPP_NAS_BIN $PPPOE_S1 up
/sbin/ledcontrol -n wan -c green -s on
EOF
	cat <<EOF > $P1_IP_DOWN
#!/bin/sh
$PPP_NAS_BIN $PPPOE_S1 down
/sbin/ledcontrol -n wan -c amber -s on
EOF

chmod +x $P1_IP_UP $P1_IP_DOWN
}


p2_ud_script()
{
	cat <<EOF > $P2_IP_UP
#!/bin/sh
$FIREWALL
$PPP_NAS_BIN $PPPOE_S2 up
EOF
	cat <<EOF > $P2_IP_DOWN
#!/bin/sh
$PPP_NAS_BIN $PPPOE_S2 down
EOF

chmod +x $P2_IP_UP $P2_IP_DOWN
}


up_down_script()
{
	p1_ud_script
	[ "x$en_s2" = "x0" ] && return
	p2_ud_script
}

# $0 file usr passwd
_sec_set()
{
	[ -z "$1" -o -z "$2" -o -z "$3" ] && echo "_sec_set: too few arg" && return

	rm -f $1
	append_file $1 "$2	*	$3"
}

sec_set()
{
	_sec_set $P1_PAP "$p1_username" "$p1_passwd"
	_sec_set $P1_CHAP "$p1_username" "$p1_passwd"
	[ "x$en_s2" = "x0" ] && return
	_sec_set $P2_PAP "$p2_username" "$p2_passwd"
	_sec_set $P2_CHAP "$p2_username" "$p2_passwd"
}

# $0: p1|p2 pppoe_dns.conf
_dns_set()
{
	[ -z "$1" -o -z "$2" ] && echo "_dns_set: too few arg" && return

	local dns_assign dns1 dns2
	eval dns_assign=\$${1}_dns_assign
	eval dns1=\$${1}_dns1
	eval dns2=\$${1}_dns2

	if [ "x$dns_assign" = "x1" ]; then
		rm -f $2 /tmp/resolv.conf
		[ -n $dns1 ] && (
		echo $dns1 > $2
		echo "nameserver $dns1" > /tmp/resolv.conf
		)
		[ -n $dns2 ] && (
		echo $dns2 >> $2
		echo "nameserver $dns2" >> /tmp/resolv.conf
		)
	fi
}

p1_dns_set()
{
	_dns_set p1 $PPP_P/pppoe1-dns.conf
}

p2_dns_set()
{
	_dns_set p2 $PPP_P/pppoe2-dns.conf
}

start()
{
	echo "MulPPPoE start"
	early_prepare

	configs_set
	config_options
	up_down_script
	sec_set

	if [ "x$dod" != "x2" ]; then
		$PPP_NAS_BIN $PPPOE_S1 start
	fi
	p1_dns_set


	if [ "x$en_s2" = "x1" ]; then
		sleep 2
		echo "start multipppoe session2"
		$PPP_NAS_BIN $PPPOE_S2 start &
		touch /etc/ppp/enable_ppp1
		touch /etc/ppp/pppoe2-domain.conf
		p2_dns_set
	fi

	echo "."
}

clean_finish()
{
	rm -f $PPP_P/pppoe1-dns.conf $PPP_P/pppoe2-dns.conf
}

stop()
{
	echo "MulPPPoE stop"
	$PPP_NAS_BIN $PPPOE_S1 stop
	$PPP_NAS_BIN $PPPOE_S2 stop
	clean_finish
	echo "."
}

case $1 in
	"start")
		start;;
	"stop")
		stop;;
	"restart")
		stop
		start
		;;
	*)
		usage;;
esac

