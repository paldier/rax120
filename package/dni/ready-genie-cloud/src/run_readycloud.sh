#!/bin/sh 
start()
{
	[ -d /opt ] && {
		/opt/xagent/run-xagent.sh
		/www/cgi-bin/readycloud_control.cgi
		sleep 2
		readycloud_enable=$(/bin/config get readycloud_enable)
		if [ "$readycloud_enable" = "1" ]; then
			readycloud_user_admim="$(/bin/config get readycloud_user_admin)"
			readycloud_user_passsword="$(/bin/config get readycloud_user_password)"
			./opt/rcagent/scripts/register.sh $readycloud_user_admim $readycloud_user_passsword
		fi
	}
}

while true 
	do 
    wanproto_status=`/bin/config get wan_proto` 2> /dev/null
    wandod_status=`/bin/config get wan_endis_dod` 2> /dev/null
    wanport_status=`cat /tmp/WAN_status` 2> /dev/null
	doping=0

	if [ "$wanport_status" != "Link down" ];then 
        if [ "$wanproto_status" = "pppoe" -o "$wanproto_status" = "pptp" ] && [ "$apmode_status" = "0" ]; then
            if [ "$wandod_status" = "1" ];then
				doping=0
			else 
				doping=1
			fi
		else
			doping=1
		fi
		if [ "$doping" = "1" ];then
			ping_result="/tmp/cloud_ping_result" 

		    ping -c 2 www.netgear.com > $ping_result 2> /dev/null

			result=`cat $ping_result`
		    if [ "x$result" != "x" -a "x$(echo $result |grep "100% packet loss")" = "x" ]; then
				rm /tmp/cloud_ping_result
				break
			fi
		fi
	fi
	sleep 30
done
start 
