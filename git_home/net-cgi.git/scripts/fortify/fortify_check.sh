#! /bin/bash

#exec 1>/dev/null
running=".fortify.running"
rm -rf $running
mkdir $running

CC=""
STAGING_DIR=""
pwd="$(pwd)"
pkg="${USER}_`date '+%Y%m%d-%H%M%S'`"
scriptPath="${pwd%%/scripts*}/scripts/fortify"
previousReport=""
currentReport=""

usage() {
	echo -e "Usage $0 <project path> <product name>"
	echo -e "   <product path>: product compile path"
	echo -e "   <product name>[option]: Used for different the scan result with \"<product name>-net-cgi.html\""
	echo -e "For example, \"$0 ~/projects/rax120-builidroot.git rax120\""
	exit 1;
}

print_error() {
	log="$1"
	echo -e "\033[31m${log}\033[0m"
}

print_steps() {
	step="$1"
	echo -e "\033[33m${step}\033[0m"
}

get_source() {
	local path
	local cmd
	local dir
	path="$1"
	dir=""
	cp -rf src/* $running/
	for cmd in "$path/build_dir/"target*; do
		if [ -x "$cmd" ] && [ -d "$cmd" ]; then
			dir="$cmd"
			break;
		fi
	done
	if [ -z "$dir" ]; then
		print_error "Cannot find target* folder in $path/build_dir, please make the product already compiled!"
		exit 1
	fi
	netCgiConfigPath="$dir/net-cgi/files/net-cgi.config"
	if [ ! -z "$netCgiConfigPath" ] && [ -f $netCgiConfigPath ]; then
		cp "$netCgiConfigPath" $running/
		sed -i "s/\$(NETCGI_CONF)/net-cgi.config/g" $running/Makefile
	else
		echo "$netCgiConfigPath is not exist!"
		exit 1;
	fi
}

export_cc() {
	local bin
	local path
	local cmd
	path="$1"
	TOOLCHAIN=`find "${path}/staging_dir" -name "toolchain*gcc*"`
	if [ ! -z "$TOOLCHAIN" ]; then
		list="bin usr/bin usr/local/bin"
		for bin in $list; do
			for cmd in "$TOOLCHAIN/$bin/"*-*cc*; do
				if [ -x "$cmd" ] && [ ! -h "$cmd" ]; then
					CC=$(cd "${cmd%/*}"; pwd)/${cmd##*/}
					break
				fi
			done
		done
	fi
	if [ ! -z "$CC" ]; then
		config="$path/.config"
		if [ -f $config ]; then
			TARGET_OPTIMIZATION=`grep -nr "CONFIG_TARGET_OPTIMIZATION" $config | awk -F 'CONFIG_TARGET_OPTIMIZATION="' '{print $2}' | awk -F '"' '{print $1}'`
			if [ ! -z "$TARGET_OPTIMIZATION" ]; then
				CC="$CC $TARGET_OPTIMIZATION"
				export EXTRA_OPTIMIZATION="$TARGET_OPTIMIZATION"
			fi
			EXTRA_OPTIMIZATION=`grep -nr "CONFIG_EXTRA_OPTIMIZATION" $config | awk -F 'CONFIG_EXTRA_OPTIMIZATION"' '{print $2}' | awk -F '"' '{print $1}'`
			if [ ! -z "$EXTRA_OPTIMIZATION" ]; then
				CC="$CC $EXTRA_OPTIMIZATION"
			fi
		fi
		CC="$CC -fhonour-copts -Wno-error=unused-but-set-variable -Wno-error=unused-result"
	fi
	for cmd in "$path/staging_dir/"target*; do
		if [ -x "$cmd" ] && [ -d "$cmd" ]; then
			STAGING_DIR="$cmd"
			break;
		fi
	done
	if [ ! -z "$STAGING_DIR" ] && [ ! -z "$CC" ]; then
		CC="$CC -I$STAGING_DIR/include -I$STAGING_DIR/usr/include"
	fi
	if [ ! -z "$TOOLCHAIN" ] && [ ! -z "$CC" ]; then
		CC="$CC -I$TOOLCHAIN/include -I$TOOLCHAIN/usr/include"
	fi

	if [ -z "$CC" ]; then
		print_error "Cannot find current gcc command"
		exit 1
	fi
	if [ -z "$STAGING_DIR" ]; then
		print_error "Cannot find STAGING_DIR"
		exit 1
	fi
	export CC="sourceanalyzer -b $pkg $CC"
	export STAGING_DIR="$STAGING_DIR"
}


main() {
	local path
	path="$1"
	if [ ! -d $path ]; then
		print_error "$path does not exist!"
		usage $@
	fi
	if [ "${path: -1}" = "/" ]; then
		path="${path%/*}"
		echo "path:$path"
	fi
	if [ $# -gt 1 ]; then
		product="$(echo $2 | tr 'A-Z' 'a-z')"
	else
		product="${path##*/}"
		product="${product%-*}"
		product="$(echo $product | tr 'A-Z' 'a-z')"
	fi
	previousReport="$scriptPath/${product}-net-cgi.html"
	currentReport="${pwd%%/scripts*}/${product}-${pkg}.html"
	print_steps "Start to set $product's enviroment..."
	export_cc $1
	print_steps "Start to get source to $running..." 
	get_source $1
	
	print_steps "Start to scan fortify..."
	sourceanalyzer -b "$pkg" -clean
	cd $running
	sourceanalyzer -b "$pkg" make MAKE:="sourceanalyzer -b $pkg make" 1>/dev/null
	if [ $? -ne 0 ]; then
		print_error "Failed to compile project, please make sure <product path> is correct. Maybe you need to pull to project and re-compile it!"
		exit 1
	fi
	sourceanalyzer -b "$pkg" -scan -f "$pkg.fpr"
	cd ..
	if [ -f "$running/$pkg.fpr" ]; then
		BIRTReportGenerator \
			-template "Developer Workbook" \
			-format HTML \
			-source "$running/$pkg.fpr" \
			-output "$currentReport" \
			-searchQuery "[fortify priority order]:critical or [fortify priority order]:high"
		if [ -f $previousReport ] && [ -f $currentReport ]; then
			print_steps "Start to diff reports..."
			${scriptPath}/diff-html.sh "$previousReport" "$currentReport"
		else
			print_error "Cannot compare the scan result!"
			print_error "Please make sure $previousReport and $currentReport exist!"
		fi
	else
		print_error "Cannot find $running/$pkg.fpr"
	fi

	rm -rf $running
}

if [ $# -lt 1 ]; then
        usage $@
fi
main $@
