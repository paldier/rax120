#!/bin/sh

. /sbin/debug_functions.sh

dist_path="/tmp"
check_usb_storage_folder  # May change "dist_path"

echo "Save the collect log into debug-log.zip and upload to user"

#
# Lists of debug log files to be saved.
#
# WARNING: due to restriction of this shell script, please DO NOT use any
# space character in file/directory names.
#

# logs which needs "unix2dos"
txt_logs="
    /tmp/panic_log.txt
    ${dist_path}/Console-log1.txt
    ${dist_path}/Console-log2.txt
    /tmp/basic_debug_log.txt
    /tmp/wireless_log1.txt
    /tmp/wireless_log2.txt
    /tmp/dmesg.txt
"

logs_to_be_saved="
    $txt_logs
    /tmp/lan.pcap
    /tmp/wan.pcap
"

#Disblae wireless debug log
iwpriv ath0 dbgLVL 0x100
iwpriv ath1 dbgLVL 0x100

module_name=`cat /module_name`

# Save the router config file
/bin/config backup /tmp/NETGEAR_$module_name.cfg

mtd_oops=`part_dev crashinfo`

# Save dmesg log
/bin/dmesg > /tmp/dmesg.txt

# Collect basic debug information if it is not enable when boot
debug_on_boot=$(cat /tmp/collect_debug)
[ "$debug_on_boot" != "1" ] && /sbin/basic_log.sh

cd /tmp

# System will zipped all debug files into 1 zip file and save to client browser
# So a debug-log.zip file will includes
# (1) Console log
# (2) Basic debug information
# (3) router config file
# (4) LAN/WAN packet capture

#Disable the capture
killall tcpdump
killall tcpdump
killall basic_log.sh 
killall console_log.sh 
killall wlandebug.sh
/bin/config set netscan_debug=0

echo close > /sys/devices/platform/soc/78b3000.serial/console

dd if=$mtd_oops of=/tmp/panic_log.txt bs=131072 count=2

for debug_log in $txt_logs; do
	if [ -f $debug_log ]; then
		unix2dos $debug_log
	fi
done

if [ "`/bin/config get dgc_func_have_armor`" = "1" ];then
	tar -zcvf armor.tar.gz /tmp/upagent.log /tmp/UpAgent.log /tmp/dal_ash.log /tmp/bitdefender_logs.tar.gz
	armor_log="/tmp/armor.tar.gz"
fi

zip -j debug-log.zip NETGEAR_$module_name.cfg $logs_to_be_saved /tmp/dal/d2d/* /tmp/dal_ash.log /tmp/dalh.log /tmp/upagent.log /tmp/fing_dil.log /tmp/dillog /tmp/xagent.log /tmp/bst.log $armor_log /var/log/netscan/*

cd /tmp
rm -rf \
	debug-usb \
	debug_cpu \
	debug_flash \
	debug_mem \
	debug_mirror_on \
	debug_session \
	NETGEAR_$module_name.cfg \
	$logs_to_be_saved \
	$armor_log
echo 0 > /tmp/collect_debug
