#! /bin/bash

previousReport=""
currentReport=""
old="old.html"
new="new.html"
result="result.html"
pwd="$(pwd)"
scriptPath="${pwd%%/scripts*}/scripts/fortify"
styleFile="${scriptPath}/style"

needUpdate=0
countTmp="count.tmp"

print_error() {
	log="$1"
	echo -e "\033[31m${log}\033[0m"
}

format_html() {
	cp -rf $previousReport $old
	cp -rf $currentReport $new

	files="$old $new"
	
	for i in $files; do
		sed -i 's/^[\t]*</</g' $i
		sed -i ':a;N;s/\n//g;ta' $i

		#Replace styles for diff report between fority 16.20 and fortify 19.1.0
		a="$(grep -nr 'style_99' $i | awk -F '!' '{print $1}')"
		if [ "$a" != "" ]; then
			#sed -i 's/<old tag>/<new tag>/g' $i
			sed -i 's/style_99/style_105/g' $i
			sed -i 's/style_107/style_113/g' $i
			sed -i 's/style_101/style_107/g' $i
			sed -i 's/style_104/style_110/g' $i
			sed -i 's/style_106/style_112/g' $i
			sed -i 's/style_108/style_114/g' $i
		fi

		#Seperate Issues
		sed -i 's/<tr class="style_105" valign="top" align="left"/\n&/g' $i

		#Seperate issue descriptions
		sed -i 's/<\/table><\/td><\/tr><\/table><span id="__TOC[0-9\_]*"><\/span><table/\n&/g' $i

		#Delete id for all elements
		sed -i 's/ id="[_0-9a-zA-Z\-]*"/ /g' $i
		sed -i 's/ id="[_0-9a-zA-Z\-\ \(\):]*"/ /g' $i

		#Seperate total count of High, Critical, Low
		sed -i 's/<td class="style_44"/\n&/g' $i
		sed -i 's/<td class="style_45"/\n&/g' $i
		sed -i 's/<td class="style_42"/\n&/g' $i

		sed -i 's/"/\&quot;/g' $i

		sed -i 's/<\/td><\/tr><\/table><br\/><\/div><\/td><\/tr><\/table><\/td><\/tr><\/table><\/td><\/tr><tr valign=&quot;top&quot; align=&quot;left&quot;>/<\/td><\/tr><\/table><br\/><\/div><\/td><\/tr><\/table><\/td><\/tr><\/table><\/td><\/tr>\n/g' $i
	done
}

get_group_count() {
	style=""
	file=$2
	case "$1" in
		"Critical")
			style="style_45"		
		;;
		"High")
			style="style_44"
		;;
		"Low"|*)
			style="style_42"
		;;
	esac

	grep -nr "<td class=&quot;${style}&quot;" $file | awk -F 'valign=&quot;middle&quot;><div>' '{print $2}' | awk -F '</div>' '{print $1}'
}

print_count() {
	item=$1
	old_count=$(get_group_count $item $old)
	new_count=$(get_group_count $item $new)
	if [ -z $old_count ] || [ -z $new_count ]; then
		exit 0;
	fi
	diff=$[$new_count - $old_count]
	if [ $diff -gt 0 ]; then
		echo -e "  ${item}: $new_count \033[31m ( +$diff )\033[0m"
	elif [ $diff -lt 0 ]; then
		echo -e "  ${item}: $new_count \033[32m ( $diff )\033[0m"
		needUpdate=1
	else
		echo -e "  ${item}: $new_count"
	fi
}

print_summary() {
	echo -e "Summary:"
	print_count Critical
	print_count High
}

generate_head() {
	echo -e  "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">\n<html><head>" > $result
	cat $styleFile >> $result 
	echo -e "</head>" >> $result
}

get_buf() {
	line="$1"
	echo "$line" | grep "<div style=&quot; overflow:hidden;&quot;>" | awk -F "<div style=&quot; overflow:hidden;&quot;>" '{print $2}' > .tmp
	sed -i 's/<strong>[0-9]*<\/strong>//g' .tmp
	sed -i 's/ style=&quot;background-color:#EDEDED;&quot;//g' .tmp
	sed -i 's/ style=&quot;background-color:#FEF5B7;&quot;//g' .tmp
	cat .tmp
	rm -rf .tmp
}

get_code() {
	# style_108 => Sink
	# style_104 => Source
	key="$1"
	str="$2"
	echo "$str" | awk -F "$key" '{print $2}' | awk -F '<table' '{print $2}' | awk -F '</table>' '{print $1}'
}

diff_html() {
	generate_head

	echo "<body><h1></h1>Totol: [dni-count] different items between $previousReport and $currentReport</h1><table width='100%'>" >> $result
	tag="<tr class=&quot;style_105&quot; valign=&quot;top&quot; align=&quot;left&quot;"
	count=0
	cat $new | grep "$tag" | while read line; do
		buf="`get_buf "$line"`"
		file="`echo "$buf" | awk -F ',' '{print $1}'`"
		issueType="`echo "$buf" | awk -F '(' '{print $2}' | awk -F ')</div>' '{print $1}'`"
		sink="`get_code style_108 "$buf"`"
		souce="`get_code style_104 "$buf"`"
		found=".found.tmp"
		cat $old | grep "$tag" | grep "<div style=&quot; overflow:hidden;&quot;>${file}," | grep "$issueType" | while read oldLine; do
			if [ "$oldLine" = "$line" ]; then
				#echo "Found 1"
				touch $found
				break
			fi
			oldLine="`get_buf "$oldLine"`"
			oldSink="`get_code style_108 "$oldLine"`"
			oldSource="`get_code style_104 "$oldLine"`"
			if [ "$oldSink" = "$sink" ] && [ "$oldSource" = "$souce" ] && [ "$sink" != "" ]; then
				#echo "Found 2"
				touch $found
				break
			fi
		done

		if [ ! -f $found ]; then
			count=$[$count+1]
			echo "<tr>" >> $result

			# print old report
			echo "<td valign='top' style='border-top: 3px solid'><table><tr><td align='center'><b>Old</b></td></tr>" >> $result
			icount=0
			cat $old | grep "$tag" | grep "<div style=&quot; overflow:hidden;&quot;>${file}," | grep "$issueType" | while read oldLine; do
				icount=$[$icount+1]
				echo "<tr><td colspan='3' align='center' style='border-top: 1px solid'><b>$icount</b></td></tr>" >> $result
				echo "$oldLine" >> $result
			done
			echo "</table></td>" >> $result

			# print current report
			echo "<td valign='top' style='border-top: 3px solid'><table><tr><td align='center'><b>Current</b></td></tr>" >> $result
			echo "$line" >> $result
			echo "</table></td></tr>" >> $result
		else
			rm -rf $found
		fi
		echo "$count" > $countTmp
	done
	echo "</table></body></html>" >> $result

	[ -f $countTmp ] && count=$(cat $countTmp)
	if [ $count -gt 0 ]; then
		sed -i "s/\[dni-count\]/$count/g" $result
		sed -i 's/&quot;/"/g' $result
		print_error "Found $count different items, please check in $result manully!"
	else
		echo "No different!"
		rm -rf $result
	fi
	rm -rf $countTmp
}

main() {
	previousReport="$1"
	currentReport="$2"
	if [ ! -f $previousReport ]; then
		print_error "Cannot find $previousReport"
	fi
	if [ ! -f $currentReport ]; then
		print_error "Cannot find $currentReport"
	fi
	echo "Start to diff $previousReport and $currentReport"

	format_html
	print_summary
	diff_html

	rm -rf $new $old
}

if [ $# -lt 2 ]; then
	echo "$0 <previousReport> <currentReport>"
	exit 0
fi
main "$1" "$2"
