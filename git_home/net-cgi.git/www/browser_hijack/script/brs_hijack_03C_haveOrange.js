function initPage()
{
	//buttons left
	var btns_div1 = document.getElementById("back");
	btns_div1.value = bh_back_mark;

	if( master == "admin" )
	btns_div1.onclick = function()
	{
		return goBack();
	}
	else
		btns_div1.className = "grey_short_btn";
	
	
	//buttons right
	var btns_div2 = document.getElementById("next");
	btns_div2.value = bh_next_mark;
	if( master == "admin" )
	btns_div2.onclick = function()
	{
		return check_orange();
	}
	else
		btns_div2.className = "grey_short_btn";

	var cf=document.forms[0];
	if(ad_router_flag == "0")
		document.getElementById("60G_td").style.display = "none";
	if(con_endis_wl_radio=="1")
		cf.iptv_ports_10.disabled=false;
	else
		cf.iptv_ports_10.disabled=true;
	if(con_endis_wla_radio=="1")
		cf.iptv_ports_11.disabled=false;
	else
		cf.iptv_ports_11.disabled=true;
	if(get_endis_guestNet=="1")
		cf.iptv_ports_12.disabled=false;
	else
		cf.iptv_ports_12.disabled=true;
	if(get_endis_guestNet_an=="1")
		cf.iptv_ports_13.disabled=false;
	else
		cf.iptv_ports_13.disabled=true;

}

function goBack()
{
	if(top.dsl_enable_flag == "0")
		this.location.href = "BRS_02_genieHelp.html";
	else	
	{
		if(getTop(window).location.href.indexOf("BRS_index.htm") > -1)
			this.location.href = "BRS_ISP_country_help.html";
		else
			this.location.href = "DSL_WIZ_sel.htm";
	}	
	return true;
}

function check_orange()
{
	var cf = document.forms[0];
	if(cf.Orange_type.value != "singtel_singa_dhcp" && cf.Orange_type.value != "unifi_malaysia_dhcp" && cf.Orange_type.value != "maxis_malaysia_dhcp"){
		if(cf.orange_login.value=="")
		{
			alert("$login_name_null");
			return false;
		}
	}
	for(var i=0;i<cf.orange_login.value.length;i++)
	{
		if(isValidChar(cf.orange_login.value.charCodeAt(i))==false)
		{
			alert("$loginname_not_allowed");
			return false;
		}
	}

	if(cf.enable_orange.checked == true)
	{
		cf.hidden_enable_orange.value = "1";
	} else {
		cf.hidden_enable_orange.value = "0";
	}
	top.orange_apply_flag="1";
	if(cf.enable_orange.checked == true){
		if(cf.Orange_type.value == "singtel_singa_dhcp" || cf.Orange_type.value == "unifi_malaysia_dhcp" || cf.Orange_type.value == "maxis_malaysia_dhcp" || cf.Orange_type.value == "unifi_malaysia_pppoe" || cf.Orange_type.value == "maxis_malaysia_pppoe"){
		var wired=0;
		var wireless=0;
		if(ad_router_flag == "1")
			wireless_limit = parseInt("10011",2);/*guest wireless always hide*/
		else
			wireless_limit = parseInt("00011",2);
		for(var count=0; count<lan_ports_num; count++){
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
			if(wired==Math.pow(2, lan_ports_num)-1 && wireless==wireless_limit)
			{
				alert("$vlan_error6");
				return false;
			}
			if(wired==0 && wireless==0)
			{
				alert("$vlan_error5");
				return false;
			}
        		
		cf.hid_wired_port.value=wired;
		cf.hid_wireless_port.value=wireless;
	  }
	}
        		
	cf.submit();
}       		
        		
addLoadEvent(initPage);
        		
