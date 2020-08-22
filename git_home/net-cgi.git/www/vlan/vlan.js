function check_vlan_input(cf,flag)
{
	var tmp_vlan_name = cf.vlan_name.value;
	if(parent.support_orange_flag ==1){
	cf.vlan_name.disabled = false;
	cf.vlan_id.disabled = false;
	cf.vlan_priority.disabled = false;
	if(cf.vlan_name.value == "Orange France IPTV")
		cf.vlan_name.value = "OrangeIPTV";
	}
	if(parent.support_singapore_isp_flag == 1)
		if(cf.vlan_name.value == "SingTel Singapore IPTV")
			cf.vlan_name.value = "SingTelSingaporeIPTV";
	if(parent.support_malaysia_isp_flag == 1 || parent.support_malaysia_pppoe_isp_flag == 1){
		if(cf.vlan_name.value == "Unifi Malaysia IPTV")
			cf.vlan_name.value = "UnifiMalaysiaIPTV";
		if(cf.vlan_name.value == "Maxis Malaysia IPTV")
			cf.vlan_name.value = "MaxisMalaysiaIPTV";
	}
	if(parent.support_spain_isp_flag == 1){
		if(cf.vlan_name.value == "Vodafone Spain IPTV")
			cf.vlan_name.value = "VodaSpainIPTV";
		if(cf.vlan_name.value == "Orange Spain IPTV")
			cf.vlan_name.value = "OrangeSpainIPTV";
		if(cf.vlan_name.value == "MoviStar Spain IPTV")
			cf.vlan_name.value = "MoviStarSpainIPTV";
	}
	//cf.vlan_name.value = cf.vlan_name.value.replace(/\s*/g,"");
	if(!(flag=='edit' && default_internet ==1))
	{
		
		if (cf.vlan_name.value.length>24 || cf.vlan_name.value.length==0)
		{
			alert("$vlan_error11");
			return false;
		}
		for(i=0; i<cf.vlan_name.value.length; i++)
		{
			if(isValidChar(cf.vlan_name.value.charCodeAt(i)) == false)
			{
				alert("$vlan_error11");
				return false;
			}
		}
		for((is_for_RU == 1)? i=0: i=1;i<=array_num;i++)
		{
			var str=eval( 'vlanArray' + i )
			var str_info=str.split(' ');
			if(str_info[1] == cf.vlan_name.value && (!(flag == 'edit' && sel_num==i )))
			{
				if(parent.support_orange_flag ==1 && cf.vlan_name.value == "OrangeIPTV") {
					alert("$vlan_error4_1 " +"Orange France IPTV" +" $vlan_error4_2");
					cf.vlan_name.value = "Orange France IPTV";
				}
				else if(parent.support_spain_isp_flag ==1 && (cf.vlan_name.value == "VodaSpainIPTV" || cf.vlan_name.value == "OrangeSpainIPTV" || cf.vlan_name.value == "MoviStarSpainIPTV")) {
					alert("$vlan_error4_1 " + tmp_vlan_name +" $vlan_error4_2");
					cf.vlan_name.value = tmp_vlan_name;
				}
				else if((parent.support_malaysia_isp_flag ==1 || parent.support_malaysia_pppoe_isp_flag ==1)&& (cf.vlan_name.value == "UnifiMalaysiaIPTV" || cf.vlan_name.value == "MaxisMalaysiaIPTV")) {
					alert("$vlan_error4_1 " +tmp_vlan_name +" $vlan_error4_2");
					cf.vlan_name.value = tmp_vlan_name;
				}
				else if(parent.support_singapore_isp_flag == 1 && cf.vlan_name.value == "SingTelSingaporeIPTV") {
					alert("$vlan_error4_1 " +tmp_vlan_name +" $vlan_error4_2");
					cf.vlan_name.value = tmp_vlan_name;
				}
				else {
					alert("$vlan_error4_1 " +cf.vlan_name.value +" $vlan_error4_2");
				}
				change_type(cf);
				return false;
			}
		}
		if(!_isNumeric(cf.vlan_id.value))
		{
			alert("$vlan_error3");
			return false;
		}
		var str_tmp=parseInt(cf.vlan_id.value,10);
		if(str_tmp <1 || str_tmp >4094)
		{
			alert("$vlan_error3");
			return false;
		}
	}
	if(cf.vlan_id.value.length == 0)
	{
		alert("$vlan_error1");
		return false;
	}
	if(cf.vlan_priority.value=="")
		cf.vlan_priority.value="0";
	if(!_isNumeric(cf.vlan_priority.value))
	{
		alert("$vlan_error2");
		return false;
	}
	str_tmp=parseInt(cf.vlan_priority.value,10);
	if(str_tmp >7)
	{
		alert("$vlan_error2");
		return false;
	}

	var str_inter=eval( 'vlanArray1');
	var str_inter_info=str_inter.split(' ');
	var inter_wireless = parseInt(str_inter_info[5], 10).toString(2).split("");
	var inter_wired = parseInt(str_inter_info[4], 10).toString(2).split("");
	if(!(flag=='edit' && default_internet ==1))
	{
		var wired=0;
		var wireless=0;
		if(ad_router_flag == "1")
			wireless_limit = parseInt("10011",2);/*guest wireless always hide*/
		else
		{
			if(tri_router_flag == "1")
				wireless_limit = parseInt("100011",2);
			else
				wireless_limit = parseInt("00011",2);
		}
		for(var count=0; count<wired_ports_num; count++){
			if(parent.use_orbi_style_flag == "1" && wan_preference === "1" && count==wan_agg_port-1)
				continue;
			if(eval("cf.iptv_ports_"+count+".checked==true"))
				wired += Math.pow(2, count);
		}
		if(cf.iptv_ports_10.checked==true)
			wireless += 1;
		if(cf.iptv_ports_12.checked==true)
			wireless += 4;
		if(cf.iptv_ports_11.checked==true)
			wireless += 2;
		if(cf.iptv_ports_13.checked==true)
			wireless += 8;
		if(cf.iptv_ports_14.checked==true && ad_router_flag == "1")
			wireless += 16;
		if(cf.iptv_ports_15.checked==true && tri_router_flag == "1")
			wireless += 32;
		if(wired==Math.pow(2, wired_ports_num)-1 && wireless==wireless_limit)
		{
			alert("$vlan_error6");
			return false;
		}
		if(wired==0 && wireless==0)
		{
			if(!(parent.support_orange_flag ==1 && cf.vlan_type.value == "orange")){
				alert("$vlan_error5");
				change_type(cf);
				return false;
			}
		}

		cf.hid_wired_port.value=wired;
		cf.hid_wireless_port.value=wireless;
	}
	
		for(var i=1;i<=array_num;i++){
			var str=eval( 'vlanArray' + i );
			var str_info=str.split(' ');
			if(str_info[2] == cf.vlan_id.value && parseInt(str_info[5],10) > 0 && cf.hid_wireless_port.value > 0 && !(flag == 'edit' && sel_num==i )){
				alert("$vlan_id:"+cf.vlan_id.value+" $vlan_error15");
				return false;
			}
			
			if(str_info[2]==cf.vlan_id.value && str_info[3]==cf.vlan_priority.value && cf.hid_wired_port.value > 0 &&
		   (!(flag == 'edit' && sel_num==i )))
			{
				alert("$vlan_id:"+cf.vlan_id.value+ " / $qos_priority:"+cf.vlan_priority.value+" $vlan_error14");
				return false;
			}
			
		}
		
	if(flag=='edit')
	{
		if(default_internet ==1)
		{
			cf.hid_vlan_name.value=each_info[1];
			
			if(!_isNumeric(cf.vlan_id.value))
			{
				alert("$vlan_error3");
				return false;
			}
			var str_tmp=parseInt(cf.vlan_id.value,10);
			if(str_tmp <0 || str_tmp >4094)
			{
				alert("$vlan_error13");
				return false;
			}
			if(str_tmp==0)
					cf.vlan_priority.value="0";
			if(parent.support_orange_flag ==1 || parent.support_spain_isp_flag ==1 || parent.support_malaysia_isp_flag ==1 || parent.support_singapore_isp_flag ==1 || parent.support_malaysia_pppoe_isp_flag ==1){
				if(cf.vlan_type.value == "orange_dhcp")
					cf.hid_vlan_orange.value = "1";
				else if(cf.vlan_type.value == "orange_pppoe")
					cf.hid_vlan_orange.value = "2";
				else if(cf.vlan_type.value == "orange_spain_dhcp")
					cf.hid_vlan_orange.value = "3";
				else if(cf.vlan_type.value == "movistar_spain_pppoe")
					cf.hid_vlan_orange.value = "4";
				else if(cf.vlan_type.value == "vodafone_spain_pppoe")
					cf.hid_vlan_orange.value = "5";
				else if(cf.vlan_type.value == "singtel_singa_dhcp")
					cf.hid_vlan_orange.value = "6";
				else if(cf.vlan_type.value == "unifi_malaysia_dhcp")
					cf.hid_vlan_orange.value = "7";
				else if(cf.vlan_type.value == "maxis_malaysia_dhcp")
					cf.hid_vlan_orange.value = "8";
				else if(cf.vlan_type.value == "unifi_malaysia_pppoe")
					cf.hid_vlan_orange.value = "9";
				else if(cf.vlan_type.value == "maxis_malaysia_pppoe")
					cf.hid_vlan_orange.value = "10";
				else
					cf.hid_vlan_orange.value = "11";

				if(cf.vlan_type.value == "orange_dhcp" || cf.vlan_type.value == "orange_pppoe" || cf.vlan_type.value == "movistar_spain_pppoe" || cf.vlan_type.value == "vodafone_spain_pppoe"|| cf.vlan_type.value == "unifi_malaysia_pppoe" || cf.vlan_type.value == "maxis_malaysia_pppoe"){
					if(cf.orange_username.value=="")
					{
						alert("$login_name_null");
						change_type(cf);
						return false;
					}
					for(i=0;i<cf.orange_username.value.length;i++)
					{
						if(isValidChar(cf.orange_username.value.charCodeAt(i))==false)
						{
							alert("$loginname_not_allowed");
							change_type(cf);
							return false;
						}
					}
				}
			}
			cf.hid_wired_port.value=each_info[4];
			cf.hid_wireless_port.value=each_info[5];
		}
		else
			cf.hid_vlan_name.value=cf.vlan_name.value;
	}
 	if(!(flag=='edit' && default_internet==1))
		change_internet_port(flag, cf);

        cf.vlan_id.value=parseInt(cf.vlan_id.value,10);
	return true;
}

function change_internet_port(type, cf){
		/*check other group wireless port is check or not*/
		var wiredOrResult = 0;
		var wirelessOrResult = 0;
		for(var i=2;i<=array_num;i++){
			var str=eval( 'vlanArray' + i );
			var str_info=str.split(' ');
			if(type == "add" || (type == "edit"&&i != sel_num) || (type == "delete" && i!=cf.select_del_num.value)){
				var wireless = parseInt(str_info[5]);
				var wired = parseInt(str_info[4]);
				wiredOrResult = wiredOrResult | wired;/*or operation to gather to ports information*/
				wirelessOrResult = wirelessOrResult | wireless;
			}
				
		}
		//alert("wired"+wiredOrResult.toString(2)+"wireless"+wirelessOrResult.toString(2));
		if(type != "delete")
		{
		wiredOrResult = wiredOrResult | cf.hid_wired_port.value;
		wirelessOrResult = wirelessOrResult | cf.hid_wireless_port.value;
		}
		//alert("afterwired"+wiredOrResult.toString(2)+"afterwireless"+wirelessOrResult.toString(2));
		var interWired = wiredOrResult ^ (Math.pow(2, wired_ports_num)-1);
		var interWireless = wirelessOrResult ^ 63;/*xor operation to get internet port information*/
		
		var inter_info=vlanArray1.split(' ');
		cf.hid_internet_group.value = inter_info[0] + " " + inter_info[1] + " " + inter_info[2] + " " + inter_info[3] + " " + interWired + " " + interWireless;
		var intra_info=vlanArray0.split(' ');
		cf.hid_intranet_group.value = intra_info[0] + " " + intra_info[1] + " " + intra_info[2] + " " + intra_info[3] + " " + interWired + " " + interWireless;
		//alert(cf.hid_internet_group.value);
		
	
	
	
}

function click_add_btn(cf)
{
	if(array_num>=10 || (is_for_RU == 1 && array_num>=9))
	{
		alert("$vlan_error9");
		return false;
	}
	else
	{
		location.href="VLAN_add.htm";
		return true;
	}
}

function check_iptv_input(cf)
{
	var wired = 0;
	var wireless = 0;
	var wired_ports = new Array(); //{lan6, lan5, lan4, lan3, lan2, lan1}
	var wlan_ports = new Array(); //{60G, Guest5G, Guest24G, 5G, 24G}
	for(i=0; i<wired_ports_num; i++)
	{
		if(parent.use_orbi_style_flag == "1" && wan_preference === "1" && i==wan_agg_port-1)
		{
			wired_ports[wired_ports_len-i] = "0";
			continue;
		}
		if(eval("cf."+"iptv_ports_"+i).checked == true)
		{
			wired_ports[wired_ports_len-i] = "1";
			eval("cf."+"hid_bri_lan"+(i+1)).value = "1";
		}
		else
		{	
			wired_ports[wired_ports_len-i] = "0";
			eval("cf."+"hid_bri_lan"+(i+1)).value = "0";
		}
	}
	for(i=10; i<16; i++)
	{
		if(eval("cf."+"iptv_ports_"+i).checked == true)
		{
			wlan_ports[15-i] = "1";
			if(i == 10 || i == 11)
				eval("cf."+"hid_brig_ssid"+(i-9)).value = "1";
			else if(i == 15 )
				eval("cf."+"hid_brig_ssid3").value = "1";
			else if(i == 12 || i == 13)
				eval("cf."+"hid_brig_guest_ssid"+(i-11)).value = "1";
			else if(i == 14)
				eval("cf."+"hid_brig_ssid_ad").value = "1";
		}
		else
		{
			wlan_ports[15-i] = "0";
			if(i == 10 || i == 11)
				eval("cf."+"hid_brig_ssid"+(i-9)).value = "0";
			else if(i == 15)
				eval("cf."+"hid_brig_ssid3").value = "0";
			else if(i == 12 || i == 13)
				eval("cf."+"hid_brig_guest_ssid"+(i-11)).value = "0";
			else if(i == 14)
				eval("cf."+"hid_brig_ssid_ad").value = "0";
		}
	}
	if(ad_router_flag == "1")
		wireless_limit = parseInt("10011",2);/*guest wireless always hide*/
	else
	{
		if(tri_router_flag == "1")
			wireless_limit = parseInt("100011",2);
		else
			wireless_limit = parseInt("00011",2);
	}
	wired = parseInt(wired_ports.join(""), 2);
	wireless = parseInt(wlan_ports.join(""), 2);
	if(wired==Math.pow(2, wired_ports_num)-1 && wireless==wireless_limit)
	{
		alert("$vlan_error6");
		return false;
	}
	if(wired==0 && wireless==0)
	{
		alert("$vlan_error5");
		return false;
	}
	cf.hid_iptv_mask.value=wired;
	cf.hid_iptv_mask2.value=wireless;
	return true;
}

function click_edit_btn(cf)
{
	var select_num;
	var count_select=0;
	if (array_num == 1 && is_for_RU != 1)
	{
		if(cf.ruleSelect.checked == true)
		{
			count_select++;
			select_num=parseInt(cf.ruleSelect.value);
		}
	}
	else
	{
		for(i=0; (is_for_RU == 1)? i<=array_num : i<array_num; i++)
		{
			if(cf.ruleSelect[i].checked == true)
			{
				count_select++;
				select_num=parseInt(cf.ruleSelect[i].value);
			}
		}
	}
	if(count_select==0)
	{
		alert("$port_edit");
		return false;
	}
	else
	{
		cf.select_edit_num.value =select_num;
		cf.submit_flag.value="vlan_edit";
		cf.action="/apply.cgi?/VLAN_edit.htm timestamp="+ts;
	}
	cf.submit();
	return true;
}

function click_delete_btn(cf)
{
	var count_select=0;
	var select_num;
	if (array_num == 1 && is_for_RU != 1)
	{
		if(cf.ruleSelect.checked == true)
		{
			count_select++;
			select_num=parseInt(cf.ruleSelect.value);
		}
	}
	else
	{
		for(i=0; (is_for_RU == 1)? i<=array_num : i<array_num; i++)
		{
			if(cf.ruleSelect[i].checked == true)
			{
				count_select++;
				select_num=parseInt(cf.ruleSelect[i].value);
			}
		}
	}
	if(count_select==0)
	{
		alert("$port_del");
		return false;
	}
	else
	{
		var sel_str=eval( 'vlanArray' + select_num )
		var sel_info=sel_str.split(' ');

		if(confirm("$vlan_warn1"+" "+ sel_info[1]+"?") ==false)
			return false;
		if(sel_info[1]=="Internet" || (sel_info[1]=="Intranet" && is_for_RU==1))
		{
			alert(sel_info[1]+" $vlan_port_del_msg");
			return false;
		}
		cf.select_del_num.value =select_num;
		cf.submit_flag.value="vlan_delete";
		change_internet_port("delete", cf);
	}
	cf.submit();
	return true;
}

function click_apply(cf)
{
	if(cf.vlan_iptv_enable.checked==true)
	{
		if(cf.vlan_iptv_select[1].checked==true)
		{					
			var count_enable=0;
			var sel_list="";
			var port1=port2=port3=port4=port5=port6=port10=port11=port12=port13=port14=port15=0;
			for(i=1;i<=array_num;i++)
			{
				var boxName= "vlan_check"+i;
				if(document.getElementById(boxName).checked == true)
				{
					var sel_str=eval( 'vlanArray' + i );
					var sel_info=sel_str.split(' ');
					var wired_port=parseInt(sel_info[4],10).toString(2);
					var wlan_port=parseInt(sel_info[5],10).toString(2);
					var zero = "";
					for(u=0; u<(6-wired_port.length); u++)
						zero = zero + "0";
					var tmp_lan = (zero + wired_port).split("");
					var zero = "";
					for(u=0; u<(6-wlan_port.length); u++)
						zero = zero + "0";
					var tmp_wlan = (zero + wlan_port).split("");
					for(j=0; j<7; j++)
					{
						if(tmp_lan[j] == "1")
							eval("port"+(j+1)+"++");
						if(j<5)
						{
							if(tmp_wlan[j] == "1")
								eval("port"+(15-j)+"++");
						}
					}
					sel_list+= i;
					sel_list+= "#";
					count_enable++;
				}
			}
			if( (array_num >1 && orange_note == 0) && cf.hid_inter_lan1.value=="0" && cf.hid_inter_lan2.value=="0" && cf.hid_inter_lan3.value=="0" &&
                        cf.hid_inter_lan4.value=="0" && cf.hid_inter_lan5.value=="0" && cf.hid_inter_lan6.value=="0" && cf.hid_inter_wireless1.value=="0" && cf.hid_inter_wireless2.value=="0" && cf.hid_inter_wireless5.value=="0" )	
			{	alert("$vlan_error16");
				return false;
			}
			if(port1>1 ||port2>1 ||port3>1 ||port4>1 ||port5>1 ||port6>1 ||port10>1 ||port11>1 ||port14>1 || port15>1)
			{
				alert("$vlan_port_dup");
				return false;
			}
			if(count_enable>7)
			{
				alert("$vlan_error10");
				return false;
			}
			else
			{
				cf.hid_enable_vlan.value="1";
				cf.hid_vlan_type.value="1";
				cf.hid_sel_list.value=sel_list;
				cf.hid_enabled_num.value=count_enable;
				cf.submit_flag.value="apply_vlan";
			}
		}
		else//bridge
		{
			if(check_iptv_input(cf) == false)
				return false;
			cf.hid_enable_vlan.value="1";
			cf.hid_vlan_type.value="0";
			cf.submit_flag.value="apply_iptv_edit";
		}
		if(vlan_free_flag == 1)
		{
			clearNoNum(document.getElementById("vlan_id_input"));
			if(document.getElementById("enable_vlan_id").checked) {
				var vlan_id_num = parseInt(document.getElementById("vlan_id_input").value);
				if(isNaN(vlan_id_num) || vlan_id_num < 1 || vlan_id_num > 4094) {
					alert("Invalid vlan id, it should be digital and under range of 1~4094");
					return false;
				}
				cf.hid_vlan_id_input.value = "1";
			}
		}
	}
	else
	{
		cf.hid_enable_vlan.value="0";
		cf.submit_flag.value="disable_vlan_iptv";
	}
	return true;
}

function clearNoNum(ele) {
	return ele.value = ele.value.replace(/[^\d]/g, "");
}

function uncheckWlanOption(ele) {
	if(ele.checked) {
		if(document.getElementById("iptv_ports_10").checked == true || document.getElementById("iptv_ports_11").checked == true || document.getElementById("iptv_ports_14").checked == true)
			alert("WiFi interface does not support packets with VLAN ID");
		document.getElementById("iptv_ports_10").checked = false;
		document.getElementById("iptv_ports_11").checked = false;
		document.getElementById("iptv_ports_14").checked = false;
	}
}

function uncheckVlanIDOption(ele) {
	if(vlan_free_flag == 1)
	{
		if(ele.checked) {
			if(document.getElementById("enable_vlan_id").checked == true)
				alert("WiFi interface does not support packets with VLAN ID");
			document.getElementById("enable_vlan_id").checked = false;
		}
	}
}

function change_lan_agg_show(tag)
{
	var cf=document.forms[0];
	document.getElementById("lan_port2").style.display="none";
	document.getElementById("lan_port_label1").innerHTML="Port1+Port2(Aggregated)";
	if(tag=="vlan_tag")
	{
		var list=document.getElementsByClassName("vlan_tag_port2");
		for(var i=0;i<list.length;i++)
			list[i].style.display="none";
		var labels=document.getElementsByClassName("vlan_tag_label1");
		for(var j=0;j<labels.length;j++)
			labels[j].innerHTML="Port1+Port2(Aggregated)";
	}
}

function syncAgg(pre)
{
	var cf=document.forms[0];
	if(pre.checked == true)
		cf.iptv_ports_1.checked=true;
	else
		cf.iptv_ports_1.checked=false;
}
