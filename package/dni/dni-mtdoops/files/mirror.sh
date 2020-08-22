# !/bin/sh

# Port Mirror Parameters For RAX120 --- Gets from QCA case 03304655
# WAN port  - 5
# LAN port1 - 4
# analypt   - mirror
# ptingress - TX
# ptegress  - RX

port(){
if [ "$2" = "on" ];then
	ssdk_sh mirror analypt set 4
	ssdk_sh mirror ptingress set 5 enable
	ssdk_sh mirror ptegress set 5 enable
else
	ssdk_sh mirror analypt set 0
	ssdk_sh mirror ptingress set 5 disable
	ssdk_sh mirror ptegress set 5 disable
fi
} 

if [ "$2" != "on" -a "$2" != "off" ];then
	echo "usage: mirror.sh <port> <status>"
	echo "example: mirror.sh 1 on"
	return
fi
port $1 $2

