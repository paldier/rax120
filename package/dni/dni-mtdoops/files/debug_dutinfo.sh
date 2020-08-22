#!/bin/sh

CPU_INFO=/tmp/debug_cpu
MEM_INFO=/tmp/debug_mem
FLASH_INFO=/tmp/debug_flash
SESSION_INFO=/tmp/debug_session
WLAN_DRV_INFO=/tmp/debug_wlan

cpu_usage()
{
	CPU_LOG1=$(cat /proc/stat | grep "cpu " | awk '{print $2" "$3" "$4" "$5" "$6" "$7" "$8}')
	SYS_IDLE1=$(echo $CPU_LOG1 | awk '{print $4}')
	SYS_TOTAL1=$(echo $CPU_LOG1 | awk '{print $1+$2+$3+$4+$5+$6+$7}')

	sleep 1

	CPU_LOG2=$(cat /proc/stat | grep "cpu " | awk '{print $2" "$3" "$4" "$5" "$6" "$7" "$8}')
	SYS_IDLE2=$(echo $CPU_LOG2 | awk '{print $4}')
	SYS_TOTAL2=$(echo $CPU_LOG2 | awk '{print $1+$2+$3+$4+$5+$6+$7}')

	SYS_IDLE=$(echo "${SYS_IDLE2} ${SYS_IDLE1}" | awk '{print $1-$2}')
	SYS_TOTAL=$(echo "${SYS_TOTAL2} ${SYS_TOTAL1}" | awk '{print $1-$2}')

	USAGE=`echo "${SYS_IDLE} ${SYS_TOTAL}" | awk '{print 100-$1/$2*100}'`

	echo "${USAGE}%" > $CPU_INFO
}

mem_usage()
{
	used_kb=`free | grep "Mem" | awk '{print $3}'`
	used_mb=`expr ${used_kb} / 1024`

	unused_kb=`free | grep "Mem" | awk '{print $4}'`
	unused_mb=`expr ${unused_kb} / 1024`

	total_kb=`free | grep "Mem" | awk '{print $2}'`
	total_mb=`expr ${total_kb} / 1024`

	echo "${used_mb}MB/${total_mb}MB" > $MEM_INFO
}

session_usage()
{
	used_session=`cat /proc/sys/net/ipv4/netfilter/ip_conntrack_count`
	total_session=`cat /proc/sys/net/ipv4/netfilter/ip_conntrack_max`
	
	echo "${used_session}/${total_session}" > $SESSION_INFO
}

flash_usage()
{
	while read dev size erasesize name
	do
		name=$(echo $name | sed 's/\"//g')
		[ "$name" = "name" -o "$name" = "kernel" -o "$name" = "rootfs" -o "${name:0:4}" = "vol_" ] && continue
		size=$(printf %d 0x$size)
		[ "$name" = "reserved" ] && reserved_size=$size
		size_sum=$(($size_sum + $size))
	done < /proc/mtd
	max_size=$(($size_sum / 1048576))
	reserved_size=$(($reserved_size / 1048576))
	echo "$(($max_size - $reserved_size))MB/${max_size}MB" > $FLASH_INFO
}

wlan_drv_version()
{
	echo "7.0.1487.032" > $WLAN_DRV_INFO
}

dist_path=""

. /sbin/debug_functions.sh

cpu_usage
mem_usage
session_usage
flash_usage
wlan_drv_version
check_usb_storage_folder
if [ "X$dist_path" != "X" ]; then
	echo 1 > /tmp/debug-usb
else
	echo 0 > /tmp/debug-usb
fi
