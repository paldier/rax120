#!/bin/sh

# Move below commands into boot script to collect more console log
# echo enable > /sys/devices/platform/soc/78b3000.serial/console
# /sbin/console_log.sh &

/bin/config set netscan_debug=1

/sbin/basic_log.sh &
/sbin/wlandebug.sh &
/sbin/capture_packet.sh 
if [ "`/bin/config get dgc_func_have_armor`" = "1" ];then
	/opt/bitdefender/share/scripts/archive_logs.sh &
fi
