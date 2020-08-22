#!/bin/sh

# Collect basi debug information

BASIC_INFO_FILE="/tmp/basic_debug_log.txt"
FILE_SIZE=1048576
all_cmd="
cat /firmware_version
ifconfig
route
cat /proc/net/arp
cat /tmp/resolv.conf
free
cat /proc/meminfo
cat /proc/slabinfo
ps
mount
killall -SIGUSR2 net-scan;sleep 6;cat /tmp/netscan/attach_device
"

collect_cmd_output() {
	[ -z "$*" ] && return
	echo "==================== $* ====================" >> $BASIC_INFO_FILE
	eval $* >> $BASIC_INFO_FILE
	echo "" >> $BASIC_INFO_FILE
}

collect_basic_info() {
	echo "${all_cmd}" | while read cmd
	do
		collect_cmd_output $cmd
	done
}

basic_log() {
	debug_on_boot=$(cat /tmp/collect_debug)
	if [ "$debug_on_boot" = "1" ]; then
		while [ 1 ]
		do
			echo "########### [ $(date -R) start ] #############" \
					>> $BASIC_INFO_FILE
			collect_basic_info
			echo "########### [ $(date -R) end ] #############" \
					>> $BASIC_INFO_FILE

			sleep 300
			filesize=$(ls -l $BASIC_INFO_FILE | awk '{print $5}')
			if [ $filesize -ge $FILE_SIZE ]; then
				echo "filesize if over, rm $BASIC_INFO_FILE"
				rm -rf $BASIC_INFO_FILE
			fi
		done
	else
		collect_basic_info
	fi
}

basic_log
