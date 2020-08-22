#
# Please put subroutines shared among several scripts into this file.
#


#
# Set "$dist_path" to root directory of the first found USB storage when USB
# storage is available.
#
# If no USB storage is found, "$dist_path" remains unchanged.
#
check_usb_storage_folder()
{
	local i
	local j
	local part_list="a b c d e f g"
	local tmp

	local mnt_path="/mnt"
	local mnt_tmp

	for i in $part_list; do
		[ "x$(df | grep /dev/sd${i})" = "x" ] && continue
		j=1
		while [ $j -le 20 ]; do
			tmp=$(df | grep /dev/sd${i}${j})
			mnt_tmp=$(ls $mnt_path | grep sd${i}${j})
			[ "x$tmp" = "x" -o "x$mnt_tmp" = "x" ] && \
					j=$((j+1)) && continue

			dist_path=$mnt_path/sd${i}${j}
			break;

			j=$((j+1))
		done
		[ "x$dist_path" != "x" ] && break
	done
}
