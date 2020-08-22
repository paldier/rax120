#!/bin/sh
# #################################################################
# Temp ctrl through /sbin/fan_ctrl, following is linear control curves.
#  Y(rpm)
#  ^ 	               	                   # [3000rpm,86'C]
#  |                                  *
#  |                             *
#  |                        *
#  |          *  *  *  *  * # [2300rpm,76'C]
#  |          *
#  |          # [trigger temp]
#- 0 - - - - - - - - - - - - - - - - - - - - - - -- - - - - > X('C) 
################################################wallEVA############
ctrl_cycle=$1
float_range=$2
trigger_temp=$3
country=$(cat /tmp/firmware_region)
high_temp=86
if [ "$country" == "AU" ];then
	high_speed=3200
else
	high_speed=3000
fi
low_temp=76
low_speed=2250
kg=$(($((high_speed-low_speed))/$((high_temp-low_temp))))

if [[ "$float_range" && "$ctrl_cycle" ]];then
    while [ 1 ]; do
    temp_pct2075=`cat /proc/pct2075/temp`
    temp_board=${temp_pct2075%%.*}
    temp_error=$((temp_board-low_temp))
    cal_speed=$(($((kg*temp_error))+$low_speed))
    cur_speed=`cat /sys/bus/i2c/devices/0-003e/fan1_target`
    float_error=$((cal_speed-cur_speed))
################## Get Float Error ABS Value##############
    if [ $float_error -ge 0 ];then
    	float_error=$float_error
    else
	float_error=${float_error##*-}
    fi
##########################################################
    if [ $temp_board -ge $high_temp ];then
	/sbin/fan_ctrl.sh start $ctrl_cycle $high_speed
    elif [ $temp_board -ge $low_temp ];then
    	if [ $float_error -ge $float_range ];then
	  /sbin/fan_ctrl.sh start $ctrl_cycle $cal_speed
	else
	  sleep $ctrl_cycle
	fi
    fi
    
    fan_enable_file="/tmp/always_enable_fan"
    if [ -f $fan_enable_file ] && [ `cat $fan_enable_file` -eq 1 ];then
	/sbin/fan_ctrl.sh start $ctrl_cycle $low_speed
    else
	if [ $temp_board -ge $trigger_temp ];then	
	  /sbin/fan_ctrl.sh start $ctrl_cycle $low_speed
        else
    	  /sbin/fan_ctrl.sh stop $ctrl_cycle
        fi
    fi

    done
else
    echo "Useage: temp_ctrl.sh [ctrl_cycle] [float_range] [trigger_temp]"
    echo "Note: To avoid fan shock,Ctrl_cycle is better to more than 10 seconds "
    exit 0
fi
