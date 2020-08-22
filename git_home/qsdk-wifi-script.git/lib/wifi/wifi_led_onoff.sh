#!/bin/sh

. /etc/ath/wifi.conf

WIFI_LED_ON='ledcontrol -n wifi -c green -s on'
WIFI_LED_OFF='ledcontrol -n wifi -c green -s off'
WIFI_LED_OPTOFF='ledcontrol -n wifi -c red -s off'
WPS_LED_ON='ledcontrol -n wps -c green -s on'
WPS_LED_OFF='rm -f /var/run/wps_led.pid; wpsled wps_lock_down stop; /sbin/ledcontrol -n wps -c green -s off'
WPS_LED_OPTOFF='ledcontrol -n wps -c red -s off'
WPS_AP_LOCK_ON='wpsled wps_lock_down on &'
TRAFFIC_11G_ON="ledcontrol -n wlan2g -c green -s on"
TRAFFIC_11G_OFF="ledcontrol -n wlan2g -c green -s off"
TRAFFIC_11G_OPTOFF="ledcontrol -n wlan2g -c red -s off"
TRAFFIC_11A_ON="ledcontrol -n wlan5g -c green -s on"
TRAFFIC_11A_OFF="ledcontrol -n wlan5g -c green -s off"
TRAFFIC_11A_OPTOFF="ledcontrol -n wlan5g -c red -s off"
BLINK_11G_ON="echo 1 > /sys/class/net/${g_device}/led"
BLINK_11G_OFF="echo 0 > /sys/class/net/${g_device}/led"
BLINK_11A_ON="echo 1 > /sys/class/net/${a_device}/led"
BLINK_11A_OFF="echo 0 > /sys/class/net/${a_device}/led"

on_led_qcawifi () {
    local radio_num=$1
    local security_type=$2
    local radio_type=$3
    local led_option=$4
    local g_ap_setup_locked=0
    local a_ap_setup_locked=0

	if [ "$led_option" = "0" -o "$led_option" = "1" ]; then
		[ "$radio_num" -gt "0" ] && eval ${WIFI_LED_ON} || eval ${WIFI_LED_OFF}
	else
		[ "$radio_num" -gt "0" ] && eval ${WIFI_LED_OPTOFF} || eval ${WIFI_LED_OFF}
	fi

	if [ "$led_option" = "0" -o "$led_option" = "1" ]; then
		[ "$radio_num" -gt "0" -a "$security_type" -gt "1" ] && eval ${WPS_LED_ON} || eval ${WPS_LED_OFF}
	else
		[ "$radio_num" -gt "0" -a "$security_type" -gt "1" ] && eval ${WPS_LED_OPTOFF} || eval ${WPS_LED_OFF}
	fi

    if [ "$radio_type" = "dual" ]; then
        config_get vifs "$g_device" vifs
        g_vif=`echo $vifs | cut -d" " -f1`
        config_get vifs "$a_device" vifs
        a_vif=`echo $vifs | cut -d" " -f1`
        config_get g_ap_setup_locked "$g_vif" ap_setup_locked 0
        config_get a_ap_setup_locked "$a_vif" ap_setup_locked 0
    elif [ "$radio_type" = "11g" ]; then
        config_get vifs "$g_device" vifs
        g_vif=`echo $vifs | cut -d" " -f1`
        config_get g_ap_setup_locked "$g_vif" ap_setup_locked 0
    elif [ "$radio_type" = "11a" ]; then
        config_get vifs "$a_device" vifs
        a_vif=`echo $vifs | cut -d" " -f1`
        config_get a_ap_setup_locked "$a_vif" ap_setup_locked 0
    fi
    [ "$g_ap_setup_locked" = "1" -o "$a_ap_setup_locked" = "1" ] && eval ${WPS_AP_LOCK_ON}

    if [ "$radio_type" = "dual" ]; then
        if [ "$led_option" = "0" ]; then
            eval ${TRAFFIC_11G_ON}
            eval ${BLINK_11G_ON}
            eval ${TRAFFIC_11A_ON}
            eval ${BLINK_11A_ON}
        elif [ "$led_option" = "1" ]; then
            eval ${TRAFFIC_11G_ON}
            eval ${BLINK_11G_OFF}
            eval ${TRAFFIC_11A_ON}
            eval ${BLINK_11A_OFF}
        elif [ "$led_option" = "2" ]; then
            eval ${BLINK_11G_OFF}
            eval ${TRAFFIC_11G_OPTOFF}
            eval ${BLINK_11A_OFF}
            eval ${TRAFFIC_11A_OPTOFF}
        fi
    elif [ "$radio_type" = "11g" ]; then
        if [ "$led_option" = "0" ]; then
            eval ${TRAFFIC_11G_ON}
            eval ${BLINK_11G_ON}
        elif [ "$led_option" = "1" ]; then
            eval ${TRAFFIC_11G_ON}
            eval ${BLINK_11G_OFF}
        elif [ "$led_option" = "2" ]; then
            eval ${BLINK_11G_OFF}
            eval ${TRAFFIC_11G_OPTOFF}
        fi
    elif [ "$radio_type" = "11a" ]; then
        if [ "$led_option" = "0" ]; then
            eval ${TRAFFIC_11A_ON}
            eval ${BLINK_11A_ON}
        elif [ "$led_option" = "1" ]; then
            eval ${TRAFFIC_11A_ON}
            eval ${BLINK_11A_OFF}
        elif [ "$led_option" = "2" ]; then
            eval ${BLINK_11A_OFF}
            eval ${TRAFFIC_11A_OPTOFF}
        fi
    fi
}

off_led_qcawifi () {
    local radio_num=$1
    local security_type=$2
    local radio_type=$3
    local led_option=$4
    local g_ap_setup_locked=0
    local a_ap_setup_locked=0

    eval ${WIFI_LED_OFF}
	if [ "$led_option" = "0" -o "$led_option" = "1" ]; then
		[ "$radio_num" -gt "0" ] && eval ${WIFI_LED_ON}
	else
		[ "$radio_num" -gt "0" ] && eval ${WIFI_LED_OPTOFF}
	fi

    eval ${WPS_LED_OFF}
	if [ "$led_option" = "0" -o "$led_option" = "1" ]; then
		[ "$radio_num" -gt "0" -a "$security_type" -gt "1" ] && eval ${WPS_LED_ON}
	else
		[ "$radio_num" -gt "0" -a "$security_type" -gt "1" ] && eval ${WPS_LED_OPTOFF}
	fi

    if [ "$radio_type" = "dual" ]; then
        config_get vifs "$g_device" vifs
        g_vif=`echo $vifs | cut -d" " -f1`
        config_get vifs "$a_device" vifs
        a_vif=`echo $vifs | cut -d" " -f1`
        config_get g_ap_setup_locked "$g_vif" ap_setup_locked 0
        config_get a_ap_setup_locked "$a_vif" ap_setup_locked 0
    elif [ "$radio_type" = "11g" ]; then
        config_get vifs "$g_device" vifs
        g_vif=`echo $vifs | cut -d" " -f1`
        config_get g_ap_setup_locked "$g_vif" ap_setup_locked 0
    elif [ "$radio_type" = "11a" ]; then
        config_get vifs "$a_device" vifs
        a_vif=`echo $vifs | cut -d" " -f1`
        config_get a_ap_setup_locked "$a_vif" ap_setup_locked 0
    fi
    [ "$g_ap_setup_locked" = "1" -o "$a_ap_setup_locked" = "1" ] && eval ${WPS_AP_LOCK_ON}

    if [ "$radio_type" = "dual" ]; then
        if [ "$led_option" = "0" ]; then
            eval ${TRAFFIC_11G_ON}
            eval ${BLINK_11G_ON}
            eval ${TRAFFIC_11A_ON}
            eval ${BLINK_11A_ON}
        elif [ "$led_option" = "1" ]; then
            eval ${TRAFFIC_11G_ON}
            eval ${BLINK_11G_OFF}
            eval ${TRAFFIC_11A_ON}
            eval ${BLINK_11A_OFF}
        elif [ "$led_option" = "2" ]; then
            eval ${BLINK_11G_OFF}
            eval ${TRAFFIC_11G_OFF}
            eval ${BLINK_11A_OFF}
            eval ${TRAFFIC_11A_OFF}
        fi
    elif [ "$radio_type" = "11g" ]; then
        if [ "$led_option" = "0" ]; then
            eval ${TRAFFIC_11G_ON}
            eval ${BLINK_11G_ON}
        elif [ "$led_option" = "1" ]; then
            eval ${TRAFFIC_11G_ON}
            eval ${BLINK_11G_OFF}
        elif [ "$led_option" = "2" ]; then
            eval ${BLINK_11G_OFF}
            eval ${TRAFFIC_11G_OFF}
        fi
    elif [ "$radio_type" = "11a" ]; then
        if [ "$led_option" = "0" ]; then
            eval ${TRAFFIC_11A_ON}
            eval ${BLINK_11A_ON}
        elif [ "$led_option" = "1" ]; then
            eval ${TRAFFIC_11A_ON}
            eval ${BLINK_11A_OFF}
        elif [ "$led_option" = "2" ]; then
            eval ${BLINK_11A_OFF}
            eval ${TRAFFIC_11A_OFF}
        fi
    elif [ "$radio_type" = "none" ]; then
            eval ${BLINK_11G_OFF}
            eval ${TRAFFIC_11G_OFF}
            eval ${BLINK_11A_OFF}
            eval ${TRAFFIC_11A_OFF}
    fi
}

force_off_led_qcawifi () {
    eval ${WIFI_LED_OFF}
    eval ${WPS_LED_OFF}
    eval ${BLINK_11G_OFF}
    eval ${TRAFFIC_11G_OFF}
    eval ${BLINK_11A_OFF}
    eval ${TRAFFIC_11A_OFF}
}
