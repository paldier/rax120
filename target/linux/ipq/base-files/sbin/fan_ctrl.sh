#! /bin/sh
# $1: stop/start $2: ctrl_cycle  $3: target_speed  
start()
{
#    current_speed=`cat /sys/bus/i2c/devices/0-003e/fan1_target`
     target_speed=$2
#    div=10
#    let "diff=target_speed-current_speed"
#    let "aver=diff/div"
#    for index in $(seq 1 $div);do
#	let "linear_speed=current_speed+aver*index"
	#242 is the lowest speed,if not set ,fan's noise will be terrible.
	#speed queue : 2700 2200 1800 1400. 2700/div(10) = 270 > 242. set upper val is 280
#	if [ $linear_speed -le 280 ];then
#	   linear_speed=242
#	fi
	echo $target_speed > /sys/bus/i2c/devices/0-0049/fan1_target
	echo $target_speed > /sys/bus/i2c/devices/0-003e/fan1_target
	sleep $1 
#    done
}

stop()
{ 
    echo 0 > /sys/bus/i2c/devices/0-0049/fan1_target
    echo 0 > /sys/bus/i2c/devices/0-003e/fan1_target
    sleep $1
}

useage()
{
    echo "useage: start: fan_ctrl_algoritm.sh [start] [ctrl_cycle] [target_speed] "
    echo "	stop: fan_ctrl_algorithm.sh [stop] [ctrl_cycle]"
}

case "$1" in
    start) start $2 $3;;
    stop) stop $2;;
    *) useage;;
esac
