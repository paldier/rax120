#!/bin/bash

cmd="${0##*/}"

Usage()
{
	echo "Usage:	$cmd <keyfile> <rootfs_dir>"
	echo "  e.g.	$cmd deif_original.key build_dir/targetXXX/rootfs-ipq806x/"
	exit 255
}

[ $# -ne 2 ] && Usage

keyfile="$1"
rootfs_dir="$2"

if [ ! -f "$rootfs_dir/usr/share/deif/deif.list" ]; then
	echo "can't fine default file list need to encrypt!!!"
	exit 255
fi

while read -r f
do
	if [ -f "$rootfs_dir/$f" ]; then
		openssl enc -e -aes-256-cbc -kfile "$keyfile" \
			-in "$rootfs_dir/$f" -out "$rootfs_dir/$f.enc" \
			&& mv "$rootfs_dir/$f.enc" "$rootfs_dir/$f"
	else
		echo "Not found $rootfs_dir/$f !!!"
	fi
done < "$rootfs_dir/usr/share/deif/deif.list"
