#!/bin/sh
usage()
{
	echo "Usage: $0 <on-board high threshold> <on-board low threshold> <check period>"
	echo "default: 88 80 60"
	exit
}

level_dc_set()
{
	wifi=$1
	dc=${2:-0}
	thermaltool -i $wifi -set -e 1 -off0 $dc -hi0 150 -lo0 -100
	thermaltool -i $wifi -set -e 1 -off1 $dc -hi1 150 -lo1 -100
	thermaltool -i $wifi -set -e 1 -off2 $dc -hi2 150 -lo2 -100
	thermaltool -i $wifi -set -e 1 -off3 $dc -hi3 150 -lo3 -100
}

thermal_check()
{
	board_hi=${1:-88}
	board_lo=${2:-80}
	delay=${3:-60}

	while [ 1 ]
	do
		temp=`cat /proc/pct2075/temp`
		thermal_board=${temp%%.*}
		if [ $thermal_board -le 0 ];then
		    thermal_board=0
		fi

		cur_0=`thermaltool -i wifi0 -get |grep 'level: 0, low thresold' |awk -F '[ ,:]+' '{print $3 $6 $9 $11}'`
		cur_1=`thermaltool -i wifi1 -get |grep 'level: 0, low thresold' |awk -F '[ ,:]+' '{print $3 $6 $9 $11}'`

		if [ $thermal_board -le $board_lo ]; then
			for var in $(seq 0 1)
			do
				eval now=\$cur_$var
				if [ "$now" != "0-1001500" ]; then
					echo "cur board temp is $thermal_board Set Wifi$var 0" >/dev/console
					level_dc_set wifi$var 0
				fi
			done
		fi

		if [ $thermal_board -ge $board_hi ]; then
			for var in $(seq 0 1)
			do
				eval now=\$cur_$var
				if [ "$now" != "0-10015050" ]; then
					echo "cur board temp is $thermal_board Set Wifi$var 50" >/dev/console
					level_dc_set wifi$var 50
				fi
			done
		fi
		sleep $delay
	done
}

thermal_init()
{
	for var in $(seq 0 1)
	do
		echo "Thermal Init Set ALL wifi 0" >/dev/console
		level_dc_set wifi$var 0
	done
}

check_start()
{
	if [ "x$1" = "x" -o "x$2" = "x" ]; then
		usage $0
		exit
	fi
	thermal_init
	thermal_check $1 $2 $3
}

check_stop()
{
	killall ${0##*/} > /dev/null
}

case "$1" in
	stop)
		check_stop
		break
	;;
	start)
		check_start $2 $3 $4
		break
	;;
	*)
		usage $0
	;;
esac
