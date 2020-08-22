#!/bin/sh

wan4_type=`config get wan_proto`
wan6_type=`config get ipv6_type`

start()
{
	if [ "x$1" = "x4" ]; then
		if [ "x$wan_type" = "xpppoe" -a "x$wan6_type" != "xpppoe" ]; then
			/etc/init.d/net-wan restart manually 4 >/dev/console
            #pppd call dial-provider updetach
		elif [ "x$wan_type" = "xpppoe" ];then
			if [ "x`config get ipv6_sameinfo`" = "x1" ]; then
				/etc/init.d/net-wan restart manually >/dev/console
                #pppd call dial-provider updetach
			else
				/etc/init.d/net-wan restart manually 4 > /dev/console
                #pppd call dial-provider updetach
			fi
		else
            #pppd call dial-provider updetach
			/etc/init.d/net-wan restart manually 4
		fi
	elif [ "x$1" = "x6" ]; then
		if [ "x$wan6_type" = "xpppoe" -a "x$wan4_type" != "xpppoe" ]; then
			/etc/net6conf/net6conf start
		elif [ "x$wan6_type" = "xpppoe" ];then
			if [ "x`config get ipv6_sameinfo`" = "x1" ]; then
				/etc/init.d/net-wan restart manually >/dev/console
                #pppd call dial-provider updetach
			else
				/etc/net6conf/net6conf restart
			fi
		else
			/etc/net6conf/net6conf restart
		fi
	fi
}

stop()
{
	if [ "x$1" = "x4" ]; then
        pppoev4_pid=`cat /var/run/ppp0.pid`
		if [ "x$wan_type" = "xpppoe" -a "x$wan6_type" != "xpppoe" ]; then
			/etc/init.d/net-wan stop manually 4 >/dev/console
            #kill $pppoev4_pid 
		elif [ "x$wan_type" = "xpppoe" ];then
			if [ "x`config get ipv6_sameinfo`" = "x1" ]; then
				/etc/init.d/net-wan stop manually  >/dev/console
                #kill $pppoev4_pid 
			else
				/etc/init.d/net-wan stop manually  4 > /dev/console
                #kill $pppoev4_pid 
			fi
		else
			/etc/init.d/net-wan stop manually  4
            #kill $pppoev4_pid 
		fi
	elif [ "x$1" = "x6" ]; then
		if [ "x$wan6_type" = "xpppoe" -a "x$wan4_type" != "xpppoe" ]; then
			/etc/net6conf/net6conf stop
		elif [ "x$wan6_type" = "xpppoe" ];then
            pppoev4_pid=`cat /var/run/ppp0.pid`
			if [ "x`config get ipv6_sameinfo`" = "x1" ]; then
				/etc/init.d/net-wan stop manually  >/dev/console
                #kill $pppoev4_pid 
			else
				/etc/net6conf/net6conf stop
			fi
		else
			/etc/net6conf/net6conf stop
		fi
	fi

}

case "$1" in
	start)
	start $2
	;;
	stop)
    	stop $2
    	;;
	restart)
	restart $2
	;;
esac
