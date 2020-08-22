#! /bin/sh

while :; do
	sleep 60

	netscan_status=`ps | grep net-scan | grep -v grep | grep -v killall`
	if [ -z "$netscan_status" ];then
		killall -9 net-scan
		time=`date '+%Y-%m-%dT%H:%M:%SZ'`
		echo "Restart net-scan:$time" >> /tmp/restart_process_list
		/usr/sbin/net-scan
	fi

	fing_status=`ps | grep fing-devices | grep -v grep | grep -v killall`
	if [ -z "$fing_status" ];then
		killall -9 fing-devices
		time=`date '+%Y-%m-%dT%H:%M:%SZ'`
		echo "Restart fing-devices:$time" >> /tmp/restart_process_list
		/usr/sbin/fing-devices 2> /dev/null
	fi

done

