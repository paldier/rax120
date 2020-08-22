#! /bin/sh

CONFIG="/bin/config"
FIREWALL="/www/cgi-bin/firewall.sh"

sched_block_site()
{
	if [ "x$1" = "xstart" ]; then
		if [ "x$2" = "x" ]; then
			$CONFIG set blk_site_sched=1
		else
			$CONFIG set blk_site_sched_2=1
		fi
	else
		if [ "x$2" = "x" ]; then
			$CONFIG set blk_site_sched=0
		else
			$CONFIG set blk_site_sched_2=0
		fi
	fi

	$FIREWALL restart
}

sched_block_service()
{
	if [ "x$1" = "xstart" ]; then
		if [ "x$2" = "x" ]; then
			$CONFIG set blk_svc_sched=1
		else
			$CONFIG set blk_svc_sched_2=1
		fi
	else
		if [ "x$2" = "x" ]; then
			$CONFIG set blk_svc_sched=0
		else
			$CONFIG set blk_svc_sched_2=0
		fi
	fi

	$FIREWALL restart
}

sched_block_all()
{
	if [ "x$1" = "xstart" ]; then
		if [ "x$2" = "x" ]; then
			$CONFIG set blk_svc_sched=1
			$CONFIG set blk_site_sched=1
		else
			$CONFIG set blk_svc_sched_2=1
			$CONFIG set blk_site_sched_2=1
		fi
	else
		if [ "x$2" = "x" ]; then
			$CONFIG set blk_svc_sched=0
			$CONFIG set blk_site_sched=0
		else
			$CONFIG set blk_svc_sched_2=0
			$CONFIG set blk_site_sched_2=0
		fi
	fi
	$FIREWALL restart
}

case $1 in
	"blk_site")
		sched_block_site $2 $3
		;;
	"blk_svc")
		sched_block_service $2 $3
		;;
	"blk_all")
		sched_block_all $2 $3
		;;
	*)
		echo "Usage: ${0##*/} blk_site|blk_svc|blk_all start|stop"
		exit 1
		;;
esac

