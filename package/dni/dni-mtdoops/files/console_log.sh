#!/bin/sh

# save the console log in memory. Reboot will lost console log data

. /sbin/debug_functions.sh

#
# Whether or not console log should be rotated.
#
# "1": console log should be rotated
# (empty string): No need to rotate console log
#
log_rotate="1"

# Determine directory where logs will be stored.
dist_path="/tmp"
check_usb_storage_folder  # May change "dist_path"

if [ "$dist_path" != "/tmp" ]; then
	#
	# Console log will be stored in external USB disk, so there is no need
	# to rotate console log.
	#
	log_rotate=
fi

#
# Store numeric part of console log file name (Console-log${file_num}.txt).
#
# If log rotation is enabled, console log will be rotated between files
# "Console-log1.txt" and "Console-log2.txt".
#
file_num=1

while [ 1 ]
do
	cat /sys/devices/platform/soc/78b3000.serial/console \
			>> $dist_path/Console-log$file_num.txt

	sleep 1

	if [ ! "$log_rotate" ]; then
		continue
	fi

	# Rotate log. The maximum of each file is 5MB.
	filesize=$(ls -l $dist_path/Console-log$file_num.txt | \
			awk '{print $5}')
	if [ $filesize -ge 5242880 ]; then
		echo "filesize if over, change to another Console-log file"
		if [ $file_num -eq 1 ]; then
			file_num=2;
		else
			file_num=1;
		fi
		#
		# Once 1 file has reached the maximum(5MB), start write to
		# another file.
		#
		[ -f $dist_path/Console-log$file_num.txt ] && \
				rm -rf $dist_path/Console-log$file_num.txt
	fi
done

