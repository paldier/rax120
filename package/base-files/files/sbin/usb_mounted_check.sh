#!/bin/ash

mounted=0

for partion in $(ls /dev/ | grep 'sd[a-z][1-9]')
do
        if [ -z "$partion" ];then
                continue;
        fi

        for point in $(mount |grep 'sd[a-z][1-9]'|awk '{print $1}'|grep 'sd[a-z][1-9]')
        do
                echo "partion=$partion, point=$point" > /dev/console
                if [ "/dev/$partion" = "$point" ];then
                        echo "[usb_mounted_check]: partion $partion is already mouted." > /dev/console
                        mounted=1
                        break
                fi
        done

        if [ $mounted -eq 0 ];then
                /sbin/hotplug2.mount $partion
        fi
done
