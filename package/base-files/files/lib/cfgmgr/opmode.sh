#the following line combines the last line to prevent this file from being sourced twice
if [ "x$opmode_sh" = "x" ]; then opmode_sh="sourced"
. /lib/cfgmgr/cfgmgr.sh
. /lib/cfgmgr/enet.sh

# name of NIF :
#   Eth Lan NIF will always be "eth1"
#   Eth Wan NIF will always be "eth0"
#   Lan NIF will always be "br0"
#   Wan NIF will be "brwan" or "ppp0"

# vlan-iptv related configs :
#
#   enable_vlan (1/0) : enable / disable
#     vlan_type (1/0) : vlan group / bridge group (iptv)
#
#   vlan group configs :
#     vlan_tag_1 ~ vlan_tag_10 :
#         Enable   Name      VID     Priority   lan-ports    wireless
#          1/0    xxxxxx    1-4094     0-7      x (4bits)    x (4bits)
#        lan-ports : 
#            bit0 -> lan1       belongs to vlan group or not
#            bit1 -> lan2       belongs to vlan group or not
#            bit2 -> lan3       belongs to vlan group or not
#            bit3 -> lan4       belongs to vlan group or not
#        wireless :
#            bit0 -> 2.4G       belongs to vlan group or not
#            bit1 -> 5G         belongs to vlan group or not
#            bit3 -> 2.4G-Guest belongs to vlan group or not
#            bit4 -> 5G-Guest   belongs to vlan group or not
#
#   bridge group (iptv) configs :
#     wan_brig_ssid1 (1/0)       : 2.4G       belongs to bridge group or not
#     wan_brig_ssid2 (1/0)       : 5G         belongs to bridge group or not
#     wan_brig_guest_ssid1 (1/0) : 2.4G-Guest belongs to bridge group or not
#     wan_brig_guest_ssid2 (1/0) : 5G-Guest   belongs to bridge group or not
#     iptv_mask (4 bits) : 
#            bit0 -> lan1                     belongs to bridge group or not
#            bit1 -> lan2                     belongs to bridge group or not
#            bit2 -> lan3                     belongs to bridge group or not
#            bit3 -> lan4                     belongs to bridge group or not
#     iptv_mask_change :
#
#   wlg1_endis_guestNet (1/0) : 2.4G-Guest enable or not
#   wla1_endis_guestNet (1/0) :   5G-Guest enable or not
#
#   opmode related induced configs : 
#     i_opmode (normal/iptv/vlan/apmode/brmode) : device operation mode
#     i_wlg_br                                  : the bridge wlg belongs to
#     i_wla_br                                  : the bridge wla belongs to
#     i_wlg_guest_br                            : the bridge wlg_guest belongs to
#     i_wla_guest_br                            : the bridge wla_guest belongs to
#     i_wlg_pri                                 : the priority of wlg
#     i_wla_pri                                 : the priority of wla
#     i_wlg_guest_pri                           : the priority of wlg_guest
#     i_wla_guest_pri                           : the priority of wla_guest
#

op_opmode() # ret: factory / brmode / apmode / extmode / normal / vlan / iptv
{
	#[ "$($CONFIG get factory_mode)" = "1" ] && echo "factory" && return
	[ "$($CONFIG get extender_mode)" = "1" ] && echo "extmode" && return
	[ $($CONFIG get bridge_mode) = "1" ] && echo "brmode" && return
	[ $($CONFIG get ap_mode) = "1" ] && echo "apmode" && return
	! [ $($CONFIG get enable_vlan) = "1" ] && echo "normal" && return
	[ $($CONFIG get vlan_type) = "1" ] && echo "vlan" || echo "iptv"
}

op_set_induced_configs()
{
	local opmode=$(op_opmode)
	local i_wlg_br="br0" i_wla_br="br0" i_wlg_guest_br="br0" i_wla_guest_br="br0"
	local i_wlg_pri="" i_wla_pri="" i_wlg_guest_pri="" i_wla_guest_pri=""
	local i tv i_vid

	oc echo "opmode = $opmode"
	$CONFIG set i_opmode=$opmode

	# Set opmode in kernel
        if [ -f /proc/simple_config/opmode ]; then
		case "$opmode" in
        		normal) echo 0 > /proc/simple_config/opmode ;;
        		apmode) echo 1 > /proc/simple_config/opmode ;;
        	esac
	fi

	case "$opmode" in
	iptv)
		[ "$($CONFIG get wan_brig_ssid1)" = "1" ] && i_wlg_br="brwan"
		[ "$($CONFIG get wan_brig_ssid2)" = "1" ] && i_wla_br="brwan"
		[ "$($CONFIG get wan_brig_guest_ssid1)" = "1" ] && i_wlg_guest_br="brwan"
		[ "$($CONFIG get wan_brig_guest_ssid2)" = "1" ] && i_wla_guest_br="brwan"
		;;

	vlan)
		for i in 1 2 3 4 5 6 7 8 9 10; do
			tv=$($CONFIG get vlan_tag_$i)
			[ -n "$tv" ] || continue
			set - $(echo $tv)
			# $1: enable, $2: name, $3: vid, $4: pri, $5:wports, $6:wlports
			[ "$1" = "1" ] || continue
			[ "$2" = "Internet" ] && i_vid=$3 && continue
			[ $(( 1 & $6 )) -ne 0 ] && i_wlg_br="br$3" && i_wlg_pri="$4"
			[ $(( 2 & $6 )) -ne 0 ] && i_wla_br="br$3" && i_wla_pri="$4"
			[ $(( 4 & $6 )) -ne 0 ] && i_wlg_guest_br="br$3" && i_wlg_guest_pri="$4"
			[ $(( 8 & $6 )) -ne 0 ] && i_wla_guest_br="br$3" && i_wla_guest_pri="$4"
		done
		[ "$i_vid" != "0" ] && {
			[ "$i_wlg_br" = "br$i_vid" ] && i_wlg_br="brwan"
			[ "$i_wla_br" = "br$i_vid" ] && i_wla_br="brwan"
			[ "$i_wlg_guest_br" = "br$i_vid" ] && i_wlg_guest_br="brwan"
			[ "$i_wla_guest_br" = "br$i_vid" ] && i_wla_guest_br="brwan"
		}
		;;
	esac

	$CONFIG set i_wlg_br="$i_wlg_br"
	$CONFIG set i_wla_br="$i_wla_br"
	$CONFIG set i_wlg_guest_br="$i_wlg_guest_br"
	$CONFIG set i_wla_guest_br="$i_wla_guest_br"
	$CONFIG set i_wlg_pri="$i_wlg_pri"
	$CONFIG set i_wla_pri="$i_wla_pri"
	$CONFIG set i_wlg_guest_pri="$i_wlg_guest_pri"
	$CONFIG set i_wla_guest_pri="$i_wla_guest_pri"
}

bond_create_ifs()
{
	local landefmac=$($CONFIG get lan_factory_mac)
	local wandefmac=$($CONFIG get cur_wanmac)

	bond_init
	[ "x$wandefmac" = "x" ] && wandefmac=$($CONFIG get wan_factory_mac)
	ifconfig $RawEthLan hw ether $wandefmac
	ifconfig $RawEthWan hw ether $wandefmac
	ifconfig $BondEth hw ether $wandefmac
	ifconfig $BondEth up
	vconfig add $BondEth 1 && ifconfig $BondEth.1 down
	vconfig add $BondEth 2 && ifconfig $BondEth.2 down
	ip link set dev $BondEth.1 name eth1
	ip link set dev $BondEth.2 name eth0
}

br_create() # $1: brname
{
	brctl addbr $1
	brctl setfd $1 0
	brctl stp $1 0
	echo 0 > /sys/devices/virtual/net/$1/bridge/multicast_snooping
}

br_allbrs()
{
	awk '/br[0-9wo]/ {print $1}' /proc/net/dev |sed 's/://g'
}

br_allnifs() # $1: brx
{
	brctl show $1 | awk '!/interface/ {print $NF}' | grep -E "eth|ath|host0.|bond"
}

# For RAX120, add bond2 (default) to br0
br_add_bond()
{
	local brname=$1
	local mode=$($CONFIG get link_aggregation_sta)
	if [ $mode -eq 1 -o $mode -eq 2 ] && [ -e "/proc/net/bonding/$BondEth2" ]; then
		brctl addif $brname $BondEth2
		ifconfig $BondEth2 up
	else
		brctl addif $brname $RawEthLan2
		brctl addif $brname $RawEthLan3
	fi
}

op_del_all_brs_vifs()
{
	local brx nif
	local landefmac=$($CONFIG get lan_factory_mac)
	local wandefmac=$($CONFIG get wan_factory_mac)
    local wan_preference=$($CONFIG get wan_preference)


	for brx in $(br_allbrs); do
		ifconfig $brx down
		for nif in $(br_allnifs $brx); do 
			ifconfig $nif down
			brctl delif $brx $nif
			case "$nif" in
			eth1|eth0|eth2|eth3|eth4)
				;;
			eth*)
				vconfig rem $nif
				;;
			esac
		done
		[ "$brx" != br0 -a $brx != "brwan" ] && brctl delbr $brx
	done

	ifconfig eth1 down
	vconfig rem eth1 || ip link set dev eth1 name $RawEthLan
	ifconfig eth0 down

    if [ "$wan_preference" != "1" ]; then
	    vconfig rem eth0 || ip link set dev eth0 name $RawEthWan
    fi
	#vconfig rem eth0 || ip link set dev eth0 name $RawEthWan
	[ -n "$RawEth" ] && ifconfig $RawEth down || {
		ifconfig $RawEthLan down
		ifconfig $RawEthWan down
		ifconfig eth2 down
		ifconfig eth3 down
		ifconfig eth4 down
	}
    if [ "$wan_preference" != "1" ]; then
        echo "-$RawEthWan" > /sys/devices/virtual/net/bond0/bonding/slaves
    fi
        echo "-$RawEthLan" > /sys/devices/virtual/net/bond0/bonding/slaves
	ifconfig $RawEthLan hw ether $landefmac
	ifconfig $RawEthWan hw ether $wandefmac 
	ifconfig $BondEth down
}

op_create_br0_brwan()
{
	br_create br0
	br_create brwan
}

factory_mode_create_brs_and_vifs()
{
	local landefmac=$($CONFIG get lan_factory_mac)
	local wandefmac=$($CONFIG get wan_factory_mac)

	if [ -n "$RawEth" ]; then
		ifconfig $RawEth hw ether $landefmac
		ifconfig $RawEth up
		vconfig add $RawEth 0 && ifconfig $RawEth.0 down
		vconfig add $RawEth 1 && ifconfig $RawEth.1 down
		ip link set dev $RawEth.0 name eth1
		ip link set dev $RawEth.1 name eth0
	else
		ifconfig $RawEthLan hw ether $landefmac
		ifconfig $RawEthLan1 hw ether $landefmac
		ifconfig $RawEthLan2 hw ether $landefmac
		ifconfig $RawEthLan3 hw ether $landefmac
		ifconfig $RawEthLanX hw ether $landefmac
		ifconfig $RawEthWan hw ether $wandefmac
	fi

	brctl addif br0 $RawEthLan1
	brctl addif br0 $RawEthLan
	brctl addif br0 $RawEthWan
	brctl addif br0 $RawEthLanX
	br_add_bond br0

	ifconfig br0 hw ether $landefmac
	sw_configvlan "factory"
}

apmode_create_brs_and_vifs()
{
	local landefmac=$($CONFIG get lan_factory_mac)
	local wandefmac=$($CONFIG get wan_factory_mac)

	if [ -n "$RawEth" ]; then
		ifconfig $RawEth hw ether $landefmac
		ifconfig $RawEth up
		vconfig add $RawEth 0 && ifconfig $RawEth.0 down
		vconfig add $RawEth 1 && ifconfig $RawEth.1 down
		ip link set dev $RawEth.0 name eth1
		ip link set dev $RawEth.1 name eth0
	elif [ "$enable_bond" = "1" ]; then
		bond_create_ifs
	else
		ifconfig $RawEthLan hw ether $landefmac
		ifconfig $RawEthLan1 hw ether $landefmac
		ifconfig $RawEthLan2 hw ether $landefmac
		ifconfig $RawEthLan3 hw ether $landefmac
		ifconfig $RawEthLanX hw ether $landefmac
		ifconfig $RawEthWan hw ether $wandefmac
	fi

	brctl addif br0 $RawEthLan1
	brctl addif br0 $RawEthLan
	brctl addif br0 $RawEthWan
	brctl addif br0 $RawEthLanX
	br_add_bond br0

	ifconfig br0 hw ether $landefmac
	#sw_configvlan "apmode"
}

normal_create_brs_and_vifs()
{
	local landefmac=$($CONFIG get lan_factory_mac)
	local wandefmac=$($CONFIG get wan_factory_mac)

	if [ -n "$RawEth" ]; then
		ifconfig $RawEth hw ether $landefmac
		ifconfig $RawEth up
		vconfig add $RawEth 0 && ifconfig $RawEth.0 down
		vconfig add $RawEth 1 && ifconfig $RawEth.1 down
		ip link set dev $RawEth.0 name eth1
		ip link set dev $RawEth.1 name eth0
	elif [ "$enable_bond" = "1" ]; then
		bond_create_ifs
	else
		ifconfig $RawEthLan hw ether $landefmac
		ifconfig $RawEthLan1 hw ether $landefmac
		ifconfig $RawEthLan2 hw ether $landefmac
		ifconfig $RawEthLan3 hw ether $landefmac
		ifconfig $RawEthLanX hw ether $landefmac
		ifconfig $RawEthWan hw ether $wandefmac
	fi

	brctl addif br0 $RawEthLan
	brctl addif br0 $RawEthLan1
	brctl addif br0 $RawEthLanX
	br_add_bond br0

	ifconfig br0 hw ether $landefmac
	#fix up the vlan tag mode to normal DUT crash temporary
	ifconfig $RawEthWan up
	brctl addif brwan $RawEthWan
	#sw_configvlan "normal"
}

iptv_create_brs_and_vifs()
{
	local landefmac=$($CONFIG get lan_factory_mac)
	local wandefmac=$($CONFIG get wan_factory_mac)

	if [ -n "$RawEth" ]; then
		ifconfig $RawEth hw ether $landefmac
		ifconfig $RawEth up
		vconfig add $RawEth 0 && ifconfig $RawEth.0 down
		vconfig add $RawEth 1 && ifconfig $RawEth.1 down
		ip link set dev $RawEth.0 name eth1
		ip link set dev $RawEth.1 name eth0
	else
		ifconfig $RawEthLan hw ether $landefmac
		ifconfig $RawEthLan1 hw ether $landefmac
		ifconfig $RawEthLan2 hw ether $landefmac
		ifconfig $RawEthLan3 hw ether $landefmac
		ifconfig $RawEthLanX hw ether $landefmac
		ifconfig $RawEthWan hw ether $wandefmac
		if [ "$WanIndepPhy" = "0" ]; then
			#brctl addif br0 $RawEthLan5G
			#fix up change vlan tag to bridge mode DUT crash temporary
			ifconfig $RawEthWan up
			brctl addif brwan $RawEthWan
		else
			ifconfig $RawEthLan up
			vconfig add $RawEthLan 0 && ifconfig $RawEthLan.0 down
			vconfig add $RawEthLan 1 && ifconfig $RawEthLan.1 up
			brctl addif brwan $RawEthLan.1
		fi
	fi

	ifconfig br0 hw ether $landefmac
	sw_configvlan "iptv" $($CONFIG get iptv_mask)
}

vlan_set_vif_pri() # $1: vif, $2: pri
{
	local p

	for p in 0 1 2 3 4 5 6 7; do
		vconfig set_ingress_map $1 $p $p
		vconfig set_egress_map $1 $p $2
	done
}

nif_existed() # $1: nif
{
	ifconfig $1 >/dev/null 2>&1
}

vlan_create_br_and_vif() # $1: vid, $2: pri , $3:wports
{
	local brx="br$1"
	local i mask=$(($3 & 0x1f))

	nif_existed $brx && return

	br_create $brx
	if [ -n "$RawEth" ]; then
		vconfig add $RawEth $1 && ifconfig $RawEth.$1 up
		brctl addif $brx $RawEth.$1
		vlan_set_vif_pri $RawEth.$1 $2
	else
		if [ "$WanIndepPhy" = "0" ]; then
			bond_mode=$($CONFIG get link_aggregation_sta)
			if [ "$bond_mode"  = "0" ] || [ ! -e "/proc/net/bonding/$BondEth2" ] ;then
				for i in 0 1 2 3 5; do
					iface="eth$i"
					if [ $(( $(eth_mask $i) & $mask )) -ne 0 ];then
						brctl delif br0 $iface
						brctl addif $brx $iface
					fi
				done
			elif [ "$bond_mode"  = "1" ] || [ "$bond_mode"  = "2" ];then
				for i in 0 1 5; do
					iface="eth$i"
					if [ $(( $(eth_mask $i) & $mask )) -ne 0 ];then
						brctl delif br0 $iface
						brctl addif $brx $iface
					fi
				done
				ifconfig $BondEth2 up
				if [ $(( 2 & $mask )) -ne 0 ];then
					brctl delif br0 $BondEth2
					brctl addif $brx $BondEth2
				fi
			fi
			vconfig add $RawEthWan $1 && ifconfig $RawEthWan.$1 up
			brctl addif $brx $RawEthWan.$1
		else
			vconfig add $RawEthLan $1 && ifconfig $RawEthLan.$1 up
			vconfig add $RawEthWan $1 && ifconfig $RawEthWan.$1 up
			brctl addif $brx $RawEthLan.$1
			brctl addif $brx $RawEthWan.$1
		fi
		vlan_set_vif_pri $RawEthWan.$1 $2
		ifconfig $brx hw ether $wandefmac	
		brctl stp $brx on
	fi
	ifconfig $brx up
}

vlan_create_internet_vif() # $1: vid, $2: pri
{
	local brx="br$1"

	if nif_existed $brx; then
		ifconfig $brx down
		if [ -n "$RawEth" ]; then
			ifconfig $RawEth.$1 down && brctl delif $brx $RawEth.$1
			ip link set dev $RawEth.$1 name eth4
		else
			if [ "$WanIndepPhy" = "0" ]; then
				ifconfig $RawEthWan.$1 down && brctl delif $brx $RawEthWan.$1
			else
				ifconfig $RawEthLan.$1 down && brctl delif $brx $RawEthLan.$1
				ifconfig $RawEthWan.$1 down && brctl delif $brx $RawEthWan.$1
				brctl addif brwan $RawEthLan.$1
			fi
			ip link set dev $RawEthWan.$1 name eth4
		fi
		brctl delbr $brx
	else
		if [ -n "$RawEth" ]; then
			vconfig add $RawEth $1 && ifconfig $RawEth.$1 down
			ip link set dev $RawEth.$1 name eth4
		else
			vconfig add $RawEthWan $1 && ifconfig $RawEthWan.$1 down
			ip link set dev $RawEthWan.$1 name eth4
		fi
	fi
	vlan_set_vif_pri $RawEthWan.$1 $2
	brctl addif brwan $RawEthWan.$1
}

vlan_create_intranet_vif() # $1: vid, $2: pri
{
	local brx="br$1"

	nif_existed $brx && return

	br_create $brx
	if [ -n "$RawEth" ]; then
		vconfig add $RawEth $1 && ifconfig $RawEth.$1 up
		brctl addif $brx $RawEth.$1
		vlan_set_vif_pri $RawEth.$1 $2
	else
		vconfig add $RawEthWan $1 && ifconfig $RawEthWan.$1 up
		brctl addif $brx $RawEthWan.$1
		vlan_set_vif_pri $RawEthWan.$1 $2
	fi
	ifconfig $brx up
}

vlan_create_isp_iptv_vif() # $1: vid, $2: pri
{
    local vid=$1
    local pri=$2
    local brx="brotv"

    if nif_existed $brx; then
        echo "*** brotv is existed."
    else
        br_create $brx
    fi

    vconfig add $RawEthWan $vid && ifconfig $RawEthWan.$vid up
    vlan_set_vif_pri $RawEthWan.$vid $pri
    brctl addif $brx $RawEthWan.$vid
}

vlan_get_freevid() # $1: up / down
{
	local updown=$1
	local i tv vids
	local freevid

	for i in 0 1 2 3 4 5 6 7 8 9 10; do
		tv=$($CONFIG get vlan_tag_$i)
		[ -n "$tv" ] || continue
		set - $(echo $tv)
		# $1: enable, $2: name, $3: vid, $4: pri, $5:wports, $6:wlports
		[ "$1" = "1" ] || continue
		#[ "$2" = "Internet" -o "$2" = "Intranet" ] && continue
		[ "$vids" = "" ] && vids="x${3}x" || vids="$vids x${3}x"
	done

	[ "$updown" = "up" ] && freevid=1 || freevid=4094
	while true; do
		echo $vids | grep -q "x${freevid}x" || break
		[ "$updown" = "up" ] && freevid=$(($freevid + 1)) || freevid=$(($freevid - 1))
	done
	echo $freevid
}

vlan_get_lanvid()
{
	vlan_get_freevid up
}

vlan_get_wanvid()
{
	vlan_get_freevid down
}

vlan_create_brs_and_vifs()
{
	local landefmac=$($CONFIG get lan_factory_mac)
	local wandefmac=$($CONFIG get wan_factory_mac)
	local lanvid=$(vlan_get_lanvid)
	local firmware_region=`cat /tmp/firmware_region | awk '{print $1}'`
	local ru_feature=0

	if [ "x$firmware_region" = "xWW" ] || [ "x$firmware_region" = "x" ] ;then
		if [ "x$($CONFIG get GUI_Region)" = "xRussian" ] ;then
			ru_feature=1
		fi
	elif [ "x$firmware_region" = "xRU" ] ;then
		ru_feature=1
	fi

	local vlan_enable_bridge=$($CONFIG get enable_orange)
	local enable_spvoda_iptv=$($CONFIG get voda_spain_iptv)
	local enable_spmovistar_iptv=$($CONFIG get movistar_spain_iptv)
	local enable_sporange_iptv=$($CONFIG get orange_spain_iptv)
	local i tv used_wports=0
	local i_vid i_pri

	if [ -n "$RawEth" ]; then
		ifconfig $RawEth hw ether $landefmac
		ifconfig $RawEth up
		vconfig add $RawEth 0 && ifconfig $RawEth.0 down
		ip link set dev $RawEth.0 name eth1
	else
		ifconfig $RawEthLan hw ether $landefmac
		ifconfig $RawEthLan1 hw ether $landefmac
		ifconfig $RawEthLan2 hw ether $landefmac
		ifconfig $RawEthLan3 hw ether $landefmac
		ifconfig $RawEthLanX hw ether $landefmac
		ifconfig $RawEthWan hw ether $wandefmac
		if [ "$WanIndepPhy" = "0" ]; then
			ip link set dev $RawEthLan name eth0
		else
			ifconfig $RawEthLan up
			vconfig add $RawEthLan $lanvid && ifconfig $RawEthLan.$lanvid down
			ip link set dev $RawEthLan.$lanvid name eth1
		fi
		ifconfig $RawEthWan up
	fi
	
	ifconfig $RawEthLan up
	ifconfig $RawEthLan1 up
	ifconfig $RawEthLan2 up
	ifconfig $RawEthLan3 up
	ifconfig $RawEthLanX up

	brctl addif br0 $RawEthLan
	brctl addif br0 $RawEthLan1
	brctl addif br0 $RawEthLanX
	br_add_bond br0

	ifconfig br0 hw ether $landefmac

	for i in 0 1 2 3 4 5 6 7 8 9 10; do
		tv=$($CONFIG get vlan_tag_$i)
		[ -n "$tv" ] || continue
		set - $(echo $tv)
		# $1: enable, $2: name, $3: vid, $4: pri, $5:wports, $6:wlports
		[ "$1" = "1" ] || continue
		if [ "$2" = "Internet" ]; then 
			i_vid=$3
			i_pri=$4
			if [ "$i_vid" != "0" ]; then
				vlan_create_internet_vif $i_vid $i_pri
			fi
		elif [ "$2" = "Intranet" ]; then
			if [ "$ru_feature" = "1" ]; then
				vlan_create_intranet_vif $3 $4
			fi
		else
			used_wports=$(($used_wports | $5))
			#vlan_create_br_and_vif $3 $4 $5
            if [ "$vlan_enable_bridge" = "1" ] && [ "$3" = "838" -o "$3" = "840" ]; then
                # Orange France ISP VOD: VLAN ID 838; IPTV: VLAN ID 840
                vlan_create_isp_iptv_vif "838" "4"
                sw_configvlan "vlan" "add" "br" "838" "0" "4"
                vlan_create_isp_iptv_vif "840" "5"
                sw_configvlan "vlan" "add" "br" "840" "0" "5"
            elif [ "$enable_spvoda_iptv" = "1" -a "$3" = "105" ]; then
                # Vodafone Spain ISP IPTV: VLAN ID 105
                vlan_create_isp_iptv_vif "105" "4"
                sw_configvlan "vlan" "add" "br" "105" "0" "4"
            elif [ "$enable_spmovistar_iptv" = "1" -a "$3" = "2" ]; then
                # MoviStar Spain ISP IPTV: VLAN ID 2
                vlan_create_isp_iptv_vif "2" "4"
                sw_configvlan "vlan" "add" "br" "2" "0" "4"
            elif [ "$enable_sporange_iptv" = "1" -a "$3" = "838" ]; then
                # Orange Spain ISP IPTV: VLAN ID 838
                vlan_create_isp_iptv_vif "838" "4"
                sw_configvlan "vlan" "add" "br" "838" "0" "4"
                vlan_create_isp_iptv_vif "840" "5"
                sw_configvlan "vlan" "add" "br" "840" "0" "5"
            else
                vlan_create_br_and_vif $3 $4 $5
                sw_configvlan "vlan" "add" "vlan" $3 $5 $4
            fi
		fi
	done
}

op_create_brs_and_vifs()
{
	local opmode=$($CONFIG get i_opmode)

	op_del_all_brs_vifs  2>/dev/null
	case "$opmode" in
	normal) normal_create_brs_and_vifs ;;
	iptv) iptv_create_brs_and_vifs ;;
	vlan) vlan_create_brs_and_vifs ;;
	#factory) factory_mode_create_brs_and_vifs ;;
	*) apmode_create_brs_and_vifs ;;
	esac
}

fi #-------------------- this must be the last line -----------------------------
