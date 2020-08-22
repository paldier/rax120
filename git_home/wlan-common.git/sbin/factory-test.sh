# script of examine the Tput for factory mode
# factory required
# 1. set 2G channel to 6, set 5G channel to 44
# 2. set 2G ssid to Netgear_2G, set 5G ssid to Netgear_5G
# 3. disable 20GHz and 40GHz coexsit of 2G
# 4. disble 2G ACS time and 5G CAC time
# 5. set 2G and 5G none security

export PATH="/usr/sbin:/usr/bin:/sbin:/bin"

wifi_iface=`uci show wireless | grep "\.device=" | awk -F. '{print $2}'`
wifi_device=`uci show wireless | grep "hwmode" | awk -F. '{print $2}'` # only wifi device has hwmode option


# wireless interface simple setting for Tput test in factory mode
if [ $1 = "boot"  ]; then 			# implement following function when boot
    for wd in $wifi_device; do
        if [ "$wd" = "wifi0" ]; then
            uci set wireless.${wd}.hwmode='11axa'
            config set wla_hwmode='11axa'

            uci set wireless.${wd}.channel='44'
            config set wla_hidden_channel='44'
        elif [ "$wd" = "wifi1" ]; then
            uci set wireless.${wd}.hwmode='11axg'
            config set wl_hwmode='11axg'

            uci set wireless.${wd}.channel='6' # also disable ACS 
            config set wl_hidden_channel='6'
        fi
    done
    for wi in $wifi_iface; do
        wl_athx=`uci -q get wireless.${wi}.ifname`
        if [ "$wl_athx" = "ath0" -o "$wl_athx" = "ath1" ]; then
            if [ "$wl_athx" = "ath0" ]; then
                uci set wireless.${wi}.ssid="Netgear_5G"
                config set wla_ssid="Netgear_5G"

                uci set wireless.${wi}.encryption=none
                uci set wireless.${wi}.key=
                config set wla_sectype='1'

                uci set wireless.${wi}.cactimeout=1
            elif [ "$wl_athx" = "ath1" ]; then
                uci set wireless.${wi}.ssid="Netgear_2G"
                config set wl_ssid="Netgear_2G"

                uci set wireless.${wi}.disablecoext='1'
                config set wl_disablecoext=1

                uci set wireless.${wi}.encryption=none
                uci set wireless.${wi}.key=
                config set wl_sectype='1'
            fi
            uci set wireless.${wi}.mode=ap
            uci set wireless.${wi}.doth=0
        fi
    done
fi

#down vap when wifi boot done
if [ $1 = "post_wlan_up"  ]; then 			
    # implement following function when wlan up
    # disable wifi interface when boot in factory mode
    for wi in $wifi_iface; do
        wl_athx=`uci -q get wireless.${wi}.ifname`
        ifconfig $wl_athx down
    done
    #disable wifi and wps led
    ledcontrol -n wifi -c green -s off
    ledcontrol -n wps -c green -s off

    exit 1
fi

uci commit wireless
config commit

