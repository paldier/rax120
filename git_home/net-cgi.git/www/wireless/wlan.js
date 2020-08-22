var Africa=0;
var Asia=1;
var Australia=2;
var Canada=3;
var China=11;
var Europe=4;
var India=12;
var Israel=5;
var Japan=6;
var Korea=7;
var Malaysia=13;
var Mexico=8;
var Middle_East_Algeria_Syria_Yemen=14;
var Middle_East_Iran_Lebanon_Qatar=15;
var Middle_East_Turkey_Egypt_Tunisia_Kuwait=16;
var Middle_East_Saudi_Arabia=17;
var Middle_East_United_Arab_Emirates=18;
var Middle_East=22;
var Russia=19;
var Singapore=20;
var South_America=9;
var Taiwan=21;
var United_States=10;
var qca_region_arr=new Array("za", "none", "au", "ca", "eu", "il", "jp","kr", "mx", "none", "us", "cn", "none", "my", "none", "none", "tr", "sa", "ae", "ru", "sg", "tw","hk","vn","");
function getObj(name)
{
       if (document.getElementById)
       {
               return document.getElementById(name);
       }
       else if (document.all)
       {
               return document.all[name];
       }
       else if (document.layers)
       {
               return document.layers[name];
       }
}

function changekeylen(form)
{
        if(form.wepenc.options[0].selected == true)
        {
                form.KEY1.size=form.KEY2.size=form.KEY3.size=form.KEY4.size=18;
                form.KEY1.value = wep_64_key1;
                form.KEY2.value = wep_64_key2;
                form.KEY3.value = wep_64_key3;
                form.KEY4.value = wep_64_key4;
        }
        else
        {
                form.KEY1.size=form.KEY2.size=form.KEY3.size=form.KEY4.size=34;
                form.KEY1.value = wep_128_key1;
                form.KEY2.value = wep_128_key2;
                form.KEY3.value = wep_128_key3;
                form.KEY4.value = wep_128_key4;
        }
        form.generate_flag.value=0;
}

function changekeylen_a(form)
{
        if(form.wepenc_an.options[0].selected == true)
        {
                form.KEY1_an.size=form.KEY2_an.size=form.KEY3_an.size=form.KEY4_an.size=18;
                form.KEY1_an.value = wep_64_key1_a;
                form.KEY2_an.value = wep_64_key2_a;
                form.KEY3_an.value = wep_64_key3_a;
                form.KEY4_an.value = wep_64_key4_a;
        }
        else
        {
                form.KEY1_an.size=form.KEY2_an.size=form.KEY3_an.size=form.KEY4_an.size=34;
                form.KEY1_an.value = wep_128_key1_a;
                form.KEY2_an.value = wep_128_key2_a;
                form.KEY3_an.value = wep_128_key3_a;
                form.KEY4_an.value = wep_128_key4_a;
        }
        form.generate_flag.value=0;
}

function opmode_disabled()
{
        document.getElementById("opmode_all").style.display="none";
        document.getElementById("opmode_54").style.display="";
}

function opmode_abled()
{
        document.getElementById("opmode_all").style.display="";
        document.getElementById("opmode_54").style.display="none";
}

var sync_passwd;
function setSecurity(num)
{
        var form=document.forms[0];
        form.wpa1_press_flag.value=0;
        form.wpa2_press_flag.value=0;
        form.wpas_press_flag.value=0;
        if(num==2)
        {
                opmode_disabled();
                getObj("view").innerHTML=str_wep;

                /* to fix bug 25282:The length of the wep key is changed shorter when you click it.*/
                changekeylen(form);

                var keyno=wl_get_keyno;
                var keylength=wl_get_keylength;
		if(parseInt(keyno)>0)
                	form.wep_key_no[parseInt(keyno)-1].checked = true;
                form.KEY1.value=wl_key1;
                form.KEY2.value=wl_key2;
                form.KEY3.value=wl_key3;
                form.KEY4.value=wl_key4;
                form.old_length.value=keylength;
        }
        else if(num==3)
        {
                //opmode_disabled();to fix bug 31373
                opmode_abled();
                wl_sectype_change();
                getObj("view").innerHTML=str_wpa;
        }
        else if(num==4)
        {
                opmode_abled();
                wl_sectype_change();
		if(document.getElementById("passphrase"))
			sync_passwd = document.getElementById("passphrase").value;
		if(sync_passwd != undefined && sync_passwd.length > 64 && num!=wl_sectype)
		{
			if(confirm("Your WPA3-Personal password length is more than 64 characters. The other security options support a password that is less than 64 characters only. If you want to change the security option, you must change your password to be less than 64 characters. Click the OK button if you want to change your password. Click the Cancel button if you don't want to make any changes.")==false)
			{
				document.forms[0].security_type[parseInt(wl_sectype)-1].checked = true;
				return setSecurity(wl_sectype);
			}
			else
				sync_passwd = "";
		}
                getObj("view").innerHTML=str_wpa2;
		if(sync_passwd === undefined)
			sync_passwd = document.getElementById("passphrase").value;
		else {
			document.getElementById("passphrase").value = sync_passwd;
        		document.forms[0].wpa2_press_flag.value = "1";
		}
	}
        else if(num==5)
        {
                opmode_abled();
                wl_sectype_change();
		if(document.getElementById("passphrase"))
			sync_passwd = document.getElementById("passphrase").value;
		if(sync_passwd != undefined && sync_passwd.length > 64 && num!=wl_sectype)
		{
			if(confirm("Your WPA3-Personal password length is more than 64 characters. The other security options support a password that is less than 64 characters only. If you want to change the security option, you must change your password to be less than 64 characters. Click the OK button if you want to change your password. Click the Cancel button if you don't want to make any changes.")==false)
			{
				document.forms[0].security_type[parseInt(wl_sectype)-1].checked = true;
				return setSecurity(wl_sectype);
			}
			else
				sync_passwd = "";
		}
                getObj("view").innerHTML=str_wpas;
		if(sync_passwd === undefined)
			sync_passwd = document.getElementById("passphrase").value;
		else {
			document.getElementById("passphrase").value = sync_passwd;
        		document.forms[0].wpas_press_flag.value = "1";
		}
	}
        else if (num==6)
        {
                getObj("view").innerHTML=str_wpae;
                form.wpae_mode.value = get_wpae_mode;
                /*if(form.wpae_mode.value == 'WPAE-TKIP')
                        opmode_disabled();
                else
                {*/
                        opmode_abled();
                        wl_sectype_change();
                //}
                if( get_radiusSerIp != "" && get_radiusSerIp != "0.0.0.0" )
                {
                        radiusIPArray = get_radiusSerIp.split(".");
                        form.radiusIPAddr1.value = radiusIPArray[0];
                        form.radiusIPAddr2.value = radiusIPArray[1];
                        form.radiusIPAddr3.value = radiusIPArray[2];
                        form.radiusIPAddr4.value = radiusIPArray[3];
                }
                form.textWpaeRadiusPort.value = get_radiusPort;
        }
        else if(num==7)
        {
                opmode_abled();
                wl_sectype_change();
		if(document.getElementById("passphrase"))
			sync_passwd = document.getElementById("passphrase").value;
                getObj("view").innerHTML=str_wpa3;
		if(sync_passwd === undefined)
			sync_passwd = document.getElementById("passphrase").value;
		else {
			document.getElementById("passphrase").value = sync_passwd;
        		document.forms[0].wpa3_sae_press_flag.value = "1";
		}
	}
        else if(num==8)
        {
                opmode_abled();
                wl_sectype_change();
		if(document.getElementById("passphrase"))
			sync_passwd = document.getElementById("passphrase").value;
		if(sync_passwd != undefined && sync_passwd.length > 64 && num!=wl_sectype)
		{
			if(confirm("Your WPA3-Personal password length is more than 64 characters. The other security options support a password that is less than 64 characters only. If you want to change the security option, you must change your password to be less than 64 characters. Click the OK button if you want to change your password. Click the Cancel button if you don't want to make any changes.")==false)
			{
				document.forms[0].security_type[parseInt(wl_sectype)-1].checked = true;
				return setSecurity(wl_sectype);
			}
			else
				sync_passwd = "";
		}
                getObj("view").innerHTML=str_wpas_sae;
		if(sync_passwd === undefined)
			sync_passwd = document.getElementById("passphrase").value;
		else {
			document.getElementById("passphrase").value = sync_passwd;
        		document.forms[0].wpa2_press_flag.value = "1";
		}
	}
        else if (num==9)
        {
                getObj("view").innerHTML=str_wpa3e;
		opmode_abled();
		wl_sectype_change();
                if( get_radiusSerIp != "" && get_radiusSerIp != "0.0.0.0" )
                {
                        radiusIPArray = get_radiusSerIp.split(".");
                        form.radiusIPAddr1.value = radiusIPArray[0];
                        form.radiusIPAddr2.value = radiusIPArray[1];
                        form.radiusIPAddr3.value = radiusIPArray[2];
                        form.radiusIPAddr4.value = radiusIPArray[3];
                }
                form.textWpaeRadiusPort.value = get_radiusPort;
        }
        else
        {
                opmode_abled();
                wl_sectype_change();
                getObj("view").innerHTML=str_none;
        }

	if(getTop(window).guest_router_flag == 1 && wlg1_sectype == 2)
		opmode_disabled();
	
	if(smart_connect_flag == "1") {
		for(var i=0; i<form.security_type.length; i++) {
			if(form.security_type[i].checked)
				sync_user_input(form.security_type[i]);
		}
		handle_sync_input();
		toggle_an_edit();
	}
}

function opmode_an_disabled()
{
        document.getElementById("opmode_an_all").style.display="none";
        document.getElementById("opmode_an_54").style.display="";
}
function opmode_an_abled()
{
        document.getElementById("opmode_an_all").style.display="";
        document.getElementById("opmode_an_54").style.display="none";
}

var sync_passwd_an;
function setSecurity_an(num)
{
        var form=document.forms[0];
        form.wla_wpa1_press_flag.value=0;
        form.wla_wpa2_press_flag.value=0;
        form.wla_wpas_press_flag.value=0;
        if(num==2)
        {
                opmode_an_disabled();
                getObj("view_a").innerHTML=str_wep_an;

                /* to fix bug 25282:The length of the wep key is changed shorter when you click it.*/
                changekeylen_a(form);

                var keyno=wla_get_keyno;
                var keylength=wla_get_keylength;
		if(parseInt(keyno)>0)
                	form.wep_key_no_an[parseInt(keyno)-1].checked = true;
                form.KEY1_an.value=wla_key1;
                form.KEY2_an.value=wla_key2;
                form.KEY3_an.value=wla_key3;
                form.KEY4_an.value=wla_key4;
                form.old_length_a.value=keylength;
        }
        else if(num==3)
        {
                //opmode_an_disabled();to fix bug 31373
                opmode_an_abled();
                wla_sectype_change();
                getObj("view_a").innerHTML=str_wpa_an;
        }
        else if(num==4)
        {
                opmode_an_abled();
                wla_sectype_change();
		if(document.getElementById("passphrase_an"))
			sync_passwd_an = document.getElementById("passphrase_an").value;
		if(sync_passwd_an != undefined && !document.forms[0].enable_smart_connect.checked && sync_passwd_an.length > 64 && num!=wla_sectype)
		{
			if(confirm("Your WPA3-Personal password length is more than 64 characters. The other security options support a password that is less than 64 characters only. If you want to change the security option, you must change your password to be less than 64 characters. Click the OK button if you want to change your password. Click the Cancel button if you don't want to make any changes.")==false)
			{
				document.forms[0].security_type_an[parseInt(wla_sectype)-1].checked = true;
				return setSecurity_an(wla_sectype);
			}
			else
				sync_passwd_an = "";
		}
                getObj("view_a").innerHTML=str_wpa2_an;
		if(sync_passwd_an === undefined)
			sync_passwd_an = document.getElementById("passphrase_an").value;
		else {
			document.getElementById("passphrase_an").value = sync_passwd_an;
        		document.forms[0].wla_wpa2_press_flag.value = "1";
		}
	}
        else if(num==5)
        {
                opmode_an_abled();
                wla_sectype_change();
		if(document.getElementById("passphrase_an"))
			sync_passwd_an = document.getElementById("passphrase_an").value;
		if(sync_passwd_an != undefined && !document.forms[0].enable_smart_connect.checked && sync_passwd_an.length > 64 && num!=wla_sectype)
		{
			if(confirm("Your WPA3-Personal password length is more than 64 characters. The other security options support a password that is less than 64 characters only. If you want to change the security option, you must change your password to be less than 64 characters. Click the OK button if you want to change your password. Click the Cancel button if you don't want to make any changes.")==false)
			{
				document.forms[0].security_type_an[parseInt(wla_sectype)-1].checked = true;
				return setSecurity_an(wla_sectype);
			}
			else
				sync_passwd_an = "";
		}
                getObj("view_a").innerHTML=str_wpas_an;
		if(sync_passwd_an === undefined)
			sync_passwd_an = document.getElementById("passphrase_an").value;
		else {
			document.getElementById("passphrase_an").value = sync_passwd_an;
        		document.forms[0].wla_wpas_press_flag.value = "1";
		}
	}
        else if (num==6)
        {
                getObj("view_a").innerHTML=str_wpae_an;
                form.wpae_mode_an.value = get_wpae_mode_a;
                /*if(form.wpae_mode_an.value == 'WPAE-TKIP')
                        opmode_an_disabled();
                else
                {*/
                        opmode_an_abled();
                        wla_sectype_change();
                //}
                if( get_radiusSerIp_a != "" && get_radiusSerIp_a != "0.0.0.0" )
                {
                        radiusIPArray = get_radiusSerIp_a.split(".");
                        form.radiusIPAddr1_an.value = radiusIPArray[0];
                        form.radiusIPAddr2_an.value = radiusIPArray[1];
                        form.radiusIPAddr3_an.value = radiusIPArray[2];
                        form.radiusIPAddr4_an.value = radiusIPArray[3];
                }
                form.textWpaeRadiusPort_an.value = get_radiusPort_a;
        }
        else if(num==7)
        {
                opmode_an_abled();
                wla_sectype_change();
		if(document.getElementById("passphrase_an"))
			sync_passwd_an = document.getElementById("passphrase_an").value;
                getObj("view_a").innerHTML=str_wpa3_an;
		if(sync_passwd_an === undefined)
			sync_passwd_an = document.getElementById("passphrase_an").value;
		else {
			document.getElementById("passphrase_an").value = sync_passwd_an;
        		document.forms[0].wla_wpa3_sae_press_flag.value = "1";
		}
	}
        else if(num==8)
        {
                opmode_an_abled();
                wla_sectype_change();
		if(document.getElementById("passphrase_an"))
			sync_passwd_an = document.getElementById("passphrase_an").value;
		if(sync_passwd_an != undefined && !document.forms[0].enable_smart_connect.checked && sync_passwd_an.length > 64 && num!=wla_sectype)
		{
			if(confirm("Your WPA3-Personal password length is more than 64 characters. The other security options support a password that is less than 64 characters only. If you want to change the security option, you must change your password to be less than 64 characters. Click the OK button if you want to change your password. Click the Cancel button if you don't want to make any changes.")==false)
			{
				document.forms[0].security_type_an[parseInt(wla_sectype)-1].checked = true;
				return setSecurity_an(wla_sectype);
			}
			else
				sync_passwd_an = "";
		}
                getObj("view_a").innerHTML=str_wpas_sae_an;
		if(sync_passwd_an === undefined)
			sync_passwd_an = document.getElementById("passphrase_an").value;
		else {
			document.getElementById("passphrase_an").value = sync_passwd_an;
        		document.forms[0].wla_wpa2_press_flag.value = "1";
		}
	}
        else if (num==9)
        {
                getObj("view_a").innerHTML=str_wpa3e_an;
		opmode_an_abled();
		wla_sectype_change();
                if( get_radiusSerIp_a != "" && get_radiusSerIp_a != "0.0.0.0" )
                {
                        radiusIPArray = get_radiusSerIp_a.split(".");
                        form.radiusIPAddr1_an.value = radiusIPArray[0];
                        form.radiusIPAddr2_an.value = radiusIPArray[1];
                        form.radiusIPAddr3_an.value = radiusIPArray[2];
                        form.radiusIPAddr4_an.value = radiusIPArray[3];
                }
                form.textWpaeRadiusPort_an.value = get_radiusPort_a;
	}
        else
        {
                opmode_an_abled();
                wla_sectype_change();
                getObj("view_a").innerHTML=str_none_an;

        }

	if(getTop(window).guest_router_flag == 1 && wla1_sectype == 2)
		opmode_an_disabled();
}

function setSecurity_ad(num)
{
	var form=document.forms[0];
	form.wig_wpa2_press_flag.value=0;

	if(num==1)
		getObj("view_ad").innerHTML = str_none_ad;
	else if(num==4)
		getObj("view_ad").innerHTML = str_wpa2_ad;
}

function wl_sectype_change()
{
        var form=document.forms[0];
        if(form.opmode.options[0].selected == true && bgn_mode1_value == 54 && have_wep_flag == 1 && form.enable_smart_connect.checked == false)
	{
                document.getElementById("wep_54").style.display="";
	}
        else
	{
                document.getElementById("wep_54").style.display="none";
	}
}

function wl_54_sectype_change()
{
        var form=document.forms[0];
	if(have_wep_flag == 1)
	        document.getElementById("wep_54").style.display="";
	else
		document.getElementById("wep_54").style.display="none";
        document.getElementById("wpa_psk_54").style.display="";
}

function wla_sectype_change()
{
        var form=document.forms[0];
        if(convert_value_to_original(form, "opmode_an") == '1' && an_mode1_value == 54 && have_wep_flag == 1)
                document.getElementById("wep_an_54").style.display="";
        else
                document.getElementById("wep_an_54").style.display="none";
}

function wla_54_sectype_change()
{
        var form=document.forms[0];
        document.getElementById("wep_an_54").style.display="";
        document.getElementById("wpa_psk_an_54").style.display="";
}

function wpaemode()
{
        var form=document.forms[0];
        document.getElementById("opmode_all").style.display="";
        document.getElementById("opmode_54").style.display="none";
        wl_sectype_change();
	if(smart_connect_flag == "1")
		sync_user_input(form.wpae_mode);
}

function wpaemode_an()
{
        var form=document.forms[0];
        document.getElementById("opmode_an_all").style.display="";
        document.getElementById("opmode_an_54").style.display="none";
        wla_sectype_change();
}
//bug 23854:The dialogue of DFS channel is not implemented
function check_dfs()
{
	var cf = document.forms[0]; 
	var each_info = dfs_info.split(':');
	var currentMode = convert_value_to_original(cf, "opmode_an");
	var index = convert_value_to_original(cf, "WRegion");
	var channel_info;
	var channel = cf.w_channel_an;
        var ch_index = channel.selectedIndex;
        var ch_name = channel.options[ch_index].text;
	var ch_value = channel.options[ch_index].value;
	var ht160_enabled= (getTop(window).support_ht160_flag == 1 && enable_ht160 == "1" && ((index == 10 || index == 4 || (getTop(window).use_orbi_style_flag == "1" && (index == 20 || index == 22 ))) && (currentMode != 1 && currentMode != 2 && currentMode != 7 && currentMode != 8)))

	if( ch_name.indexOf('(DFS)') == -1 && !ht160_enabled)
	{ // not a DFS channel and  ht160 disabled, return true, continue other check.
		return true;
	}
	if(getTop(window).dfs_radar_detect_flag == 1){	
		var tmp_array;
		if(ht160_enabled)
		{
			if(dfs_radar_160 == undefined)
				return true;
			tmp_array = dfs_radar_160;
		}
		else if ( 1 == currentMode || 2 == currentMode || 7 == currentMode )
		{
			if(dfs_radar_20 == undefined)
				return true;

			tmp_array = dfs_radar_20;
		}
	        else if( 9 == currentMode)
        	{
			if(dfs_radar_80 == undefined)
				return true;

	                tmp_array = dfs_radar_80;
        	}
		else
		{
			if(dfs_radar_40 == undefined)
				return true;
			tmp_array = dfs_radar_40;
		}
		for( var i=0; i<tmp_array.length-1; i++)
		{
			var channel = tmp_array[i].channel;
			var min = tmp_array[i].expire/60;
			var sec = tmp_array[i].expire%60;

			if( channel == ch_value)
			{
				alert("$using_dfs_1" + min.toFixed(0) + "$using_dfs_2" + sec + "$using_dfs_3");
				return false;
			}
		}
	}else{
	  for ( i=0; i<each_info.length; i++ )
	  {
		channel_info = each_info[i].split(' '); //channel; channel_flag; channe_priflag; left_time
		var sec = channel_info[3]%60;		//change left time format
		var min = parseInt(channel_info[3]/60);
		if( (5000 + 5*(parseInt(ch_value, 10))) == parseInt(channel_info[0], 10) )
		{
			alert("$using_dfs_1" + min + "$using_dfs_2" + sec + "$using_dfs_3");
			return false;
		}
	  }
	}
	if( ch_name.indexOf('(DFS)') != -1  && confirm("$select_dfs") == false)
		return false;

	return true;
}

function check_dfs_sec()
{
	var cf = document.forms[0]; 
	var each_info = dfs_info.split(':');
	var currentMode = convert_value_to_original(cf, "opmode_an");
	var index = convert_value_to_original(cf, "WRegion");
	var channel_info;
	if(document.getElementById("sec_channel_tr").style.display == "none")
		return true;
	var channel = cf.w_channel_an_sec;
        var ch_index = channel.selectedIndex;
        var ch_name = channel.options[ch_index].text;
	var ch_value = channel.options[ch_index].value;
	var ht160_enabled= (getTop(window).support_ht160_flag == 1 && enable_ht160 == "1" && ((index == 10 || index == 4) && (currentMode != 1 && currentMode != 2 && currentMode != 7 && currentMode != 8)))

	if( ch_name.indexOf('(DFS)') == -1 && !ht160_enabled)
	{ // not a DFS channel and  ht160 disabled, return true, continue other check.
		return true;
	}
	if(getTop(window).support_second_dfs == 1 && index == 10 && cf.w_channel_an.options[cf.w_channel_an.selectedIndex].text.indexOf('(DFS)') != -1 && ch_name.indexOf('(DFS)') != -1)
	{
		alert("It is not allow to select both primary and secondary channel to DFS channel !!!");
		return false;
	}

	if(getTop(window).dfs_radar_detect_flag == 1){
		var tmp_array;
		if(ht160_enabled)
		{
			if(dfs_radar_160 == undefined)
				return true;
			tmp_array = dfs_radar_160;
		}
		else if ( 1 == currentMode || 2 == currentMode || 7 == currentMode )
		{
			if(dfs_radar_20 == undefined)
				return true;

			tmp_array = dfs_radar_20;
		}
	        else if( 9 == currentMode)
        	{
			if(dfs_radar_80 == undefined)
				return true;

	                tmp_array = dfs_radar_80;
        	}
		else
		{
			if(dfs_radar_40 == undefined)
				return true;
			tmp_array = dfs_radar_40;
		}
		for( var i=0; i<tmp_array.length-1; i++)
		{
			var channel = tmp_array[i].channel;
			var min = tmp_array[i].expire/60;
			var sec = tmp_array[i].expire%60;

			if( channel == ch_value)
			{
				alert("$using_dfs_1" + min.toFixed(0) + "$using_dfs_2" + sec + "$using_dfs_3");
				return false;
			}
		}
	}else{
	  for ( i=0; i<each_info.length; i++ )
	  {
		channel_info = each_info[i].split(' '); //channel; channel_flag; channe_priflag; left_time
		var sec = channel_info[3]%60;		//change left time format
		var min = parseInt(channel_info[3]/60);
		if( (5000 + 5*(parseInt(ch_value, 10))) == parseInt(channel_info[0], 10) )
		{
			alert("$using_dfs_1" + min + "$using_dfs_2" + sec + "$using_dfs_3");
			return false;
		}
	  }
	}
	if( ch_name.indexOf('(DFS)') != -1  && confirm("$select_dfs") == false)
		return false;

	return true;
}

function setChannel()
{
	var cf = document.forms[0];
	var index = cf.WRegion.selectedIndex;
	index=parseInt(index)+1;
	var chIndex = cf.w_channel.selectedIndex;
	var currentMode = cf.opmode.selectedIndex;
	var endChannel;

/* change it like before produce 20000, just 11 and 13
 *
	if ( currentMode == 2 && (index == 4 || index == 9 || index == 11 ))
		endChannel = 7;	
	else if ( currentMode == 2 )
		endChannel = 9;
	else
*/	
  
		endChannel = FinishChannel[index];
	if (FinishChannel[index]==14 && cf.opmode.selectedIndex!=0)
		cf.w_channel.options.length = endChannel - StartChannel[index];
	else
		cf.w_channel.options.length = endChannel - StartChannel[index] + 2;

	cf.w_channel.options[0].text = "$auto_mark";
	cf.w_channel.options[0].value = 0;

	for (var i = StartChannel[index]; i <= endChannel; i++) {
		if (i==14 && cf.opmode.selectedIndex!=0)
			continue;
		cf.w_channel.options[i - StartChannel[index] + 1].value = i;
		cf.w_channel.options[i - StartChannel[index] + 1].text = (i < 10)? "0" + i : i;
	}
	cf.w_channel.selectedIndex = ((chIndex > -1) && (chIndex < cf.w_channel.options.length)) ? chIndex : 0 ;
}

function setBChannel()
{
	var cf = document.forms[0];
	var index = cf.WRegion.selectedIndex;
	index = parseInt(index)+1;
	var chIndex = cf.w_channel.selectedIndex;
	var currentMode = cf.opmode.selectedIndex;
	var endChannel;

	endChannel = FinishChannelB[index];
	if (FinishChannelB[index]==14 && cf.opmode.selectedIndex!=0)
		cf.w_channel.options.length = endChannel - StartChannelB[index];
	else
		cf.w_channel.options.length = endChannel - StartChannelB[index] + 2;

	cf.w_channel.options[0].text = "$auto_mark";
	cf.w_channel.options[0].value = 0;

	for (var i = StartChannelB[index]; i <= endChannel; i++) {
		if (i==14 && cf.opmode.selectedIndex!=0)
			continue;
		cf.w_channel.options[i - StartChannelB[index] + 1].value = i;
		cf.w_channel.options[i - StartChannelB[index] + 1].text = (i < 10)? "0" + i : i;
	}
	cf.w_channel.selectedIndex = ((chIndex > -1) && (chIndex < cf.w_channel.options.length)) ? chIndex : 0 ;
}

function chgChA(from)
{   
	var cf = document.forms[0];
	if (from == 2)
	{
		setAChannel(cf.w_channel_an);
	}
	else
	{
		setAwlan_mode();
		setAChannel(cf.w_channel_an);
	}
}

function setAwlan_mode()
{
	if(ac_router_flag == 1)
		setACwlan_mode()
	else
		setANwlan_mode()
}

function setACwlan_mode()
{
        var cf = document.forms[0];
        var index = convert_value_to_original(cf, "WRegion");
        var currentMode = cf.opmode_an.selectedIndex;

        // bug 34916, change index number to region name, make the code easy to read and change.
	if (index == Africa || index == Israel || index == Middle_East_Turkey_Egypt_Tunisia_Kuwait || index == Middle_East_Saudi_Arabia)
        { //Israel,Middle East(Turkey/Egypt/Tunisia/Kuwait) Middle East(Saudi Arabia) Africa
                cf.opmode_an.options.length = 1;
                cf.opmode_an.options[0].text = an_wlan_mode_1;
                cf.opmode_an.options[0].value = "7";
                if (currentMode <= 0)
                        cf.opmode_an.selectedIndex = currentMode;
                else
                        cf.opmode_an.selectedIndex = 0;
                cf.w_channel_an.disabled=false;
                cf.opmode_an.disabled=false;
        }
	else if ( index == Middle_East_Algeria_Syria_Yemen )
	{           // Middle East(Algeria/Syria/Yemen), this country do not support HT20 HT40,grayout channel
                cf.w_channel_an.selectedIndex=0;
                //cf.opmode_an.selectedIndex=0;
                cf.w_channel_an.disabled=true;
                cf.opmode_an.options.length = 3;
                cf.opmode_an.options[0].text = an_wlan_mode_1;
                cf.opmode_an.options[1].text = an_wlan_mode_2;
                cf.opmode_an.options[2].text = an_wlan_mode_3;
                cf.opmode_an.options[0].value = "7";
                cf.opmode_an.options[1].value = "8";
                cf.opmode_an.options[2].value = "9";
		/*if(getTop(window).use_orbi_style_flag == "1")
		{
			cf.opmode_an.options.length = 4;
			cf.opmode_an.options[3].text = an_wlan_mode_4;
			cf.opmode_an.options[3].value = "10";
		}*/
                cf.opmode_an.disabled=true;// bug 34916, grey out mode, this region not support both HT20 and HT40
        }
	else if(index == Russia){
		cf.opmode_an.options.length = 2;
		cf.opmode_an.options[0].text = an_wlan_mode_1;
		cf.opmode_an.options[1].text = an_wlan_mode_2;
		cf.opmode_an.options[0].value = "7";
		cf.opmode_an.options[1].value = "8";
		if (currentMode > 1)
			cf.opmode_an.selectedIndex = 1;
		else
			cf.opmode_an.selectedIndex = currentMode;
		cf.w_channel_an.disabled=false;
		cf.opmode_an.disabled=false;
	}
        else{
                cf.opmode_an.options.length = 3;

                cf.opmode_an.options[0].text = an_wlan_mode_1;
                cf.opmode_an.options[1].text = an_wlan_mode_2;
                cf.opmode_an.options[2].text = an_wlan_mode_3;
                cf.opmode_an.options[0].value = "7";
                cf.opmode_an.options[1].value = "8";
                cf.opmode_an.options[2].value = "9";
		if(getTop(window).use_orbi_style_flag == "1" && getTop(window).host_name != "RAX10" && (index == 2 || index == 4 || index == 6 || index == 10 || index == 11 || index == 21 || index == 20 || index == 22 || index == 7))
		{
			cf.opmode_an.options.length = 4;
			cf.opmode_an.options[3].text = an_wlan_mode_4;
			cf.opmode_an.options[3].value = "10";
	                cf.opmode_an.selectedIndex = currentMode;
		}
		else if(currentMode > 2)
			cf.opmode_an.selectedIndex = 1;
		else
	                cf.opmode_an.selectedIndex = currentMode;
                cf.w_channel_an.disabled=false;
                cf.opmode_an.disabled=false;
        }
        return;
}

function setANwlan_mode()
{
	var cf = document.forms[0];
        var index = convert_value_to_original(cf, "WRegion");
	var currentMode = cf.opmode_an.selectedIndex;

	// bug 34916, change index number to region name, make the code easy to read and change.
	if (index == Africa || index==Israel || index == Middle_East_Turkey_Egypt_Tunisia_Kuwait || index == Middle_East_Saudi_Arabia)
	{ //Israel,Middle East(Turkey/Egypt/Tunisia/Kuwait) Middle East(Saudi Arabia) Africa
		cf.opmode_an.options.length = 2;
		cf.opmode_an.options[0].text = an_wlan_mode_1;
		cf.opmode_an.options[1].text = an_wlan_mode_2;
		cf.opmode_an.options[0].value = "1";
		cf.opmode_an.options[1].value = "2";
		if (currentMode <= 1)
			cf.opmode_an.selectedIndex = currentMode;
		else
			cf.opmode_an.selectedIndex = 1;
		cf.w_channel_an.disabled=false;
		cf.opmode_an.disabled=false;			
	}
	else if ( index == Middle_East_Algeria_Syria_Yemen )
	{		// Middle East(Algeria/Syria/Yemen), this country do not support HT20 HT40,grayout channel
		cf.w_channel_an.selectedIndex=0;
		//cf.opmode_an.selectedIndex=0;
		cf.w_channel_an.disabled=true;
		cf.opmode_an.options.length = 3;
		cf.opmode_an.options[0].text = an_wlan_mode_1;
		cf.opmode_an.options[1].text = an_wlan_mode_2;
		cf.opmode_an.options[2].text = an_wlan_mode_3;
		cf.opmode_an.options[0].value = "1";
		cf.opmode_an.options[1].value = "2";
		cf.opmode_an.options[2].value = "3";
		cf.opmode_an.disabled=true;// bug 34916, grey out mode, this region not support both HT20 and HT40
	}

	else{
		cf.opmode_an.options.length = 3;

		cf.opmode_an.options[0].text = an_wlan_mode_1;
		cf.opmode_an.options[1].text = an_wlan_mode_2;
		cf.opmode_an.options[2].text = an_wlan_mode_3;
		cf.opmode_an.options[0].value = "1";
		cf.opmode_an.options[1].value = "2";
		cf.opmode_an.options[2].value = "3";
		cf.opmode_an.selectedIndex = currentMode;
		cf.w_channel_an.disabled=false;
		cf.opmode_an.disabled=false;		
	}
	return;
}

function remove_all_5g_dfs_channel(){
	var target = document.getElementById("wireless_channel_an");

	for(var i=0; i<target.options.length; i++) {
		if(target.options[i].text.indexOf('(DFS)') != -1)
		{
			var opts = target.options;
			opts = Array.prototype.slice.apply(opts).slice(i);
			target.removeChild(opts[0]);
			i--;
		}
	}
}

$$.initChannels = function() {
        $$.getJSON('channel_info.json', function(json) {
                $$.channel_info = json;
                if ($$.channel_info && $$.channel_info.current_info ) {
                        channel = $$.channel_info.current_info.wl0;
                        channel_a = $$.channel_info.current_info.wl1;
                        $$.setChannel('wl0', channel);
                        $$.setChannel('wl1', channel_a);
                }
        });
};

$$.setChannel = function(wifix, chValue) {
	var cf = document.forms[0];
	if(channel_json == 1)
	{
		if (wifix == 'wl0') {
			$$.setChannelList('wireless_channel', $$('#wireless_region').val(), 'wl0', convert_value_to_original(cf, "opmode"), chValue);
		} else if (wifix == 'wl1') {
			$$.setChannelList('wireless_channel_an', $$('#wireless_region').val(), 'wl1', convert_value_to_original(cf, "opmode_an"), chValue);
		}
		setAwlan_mode();
	}
	else
	{
		chgChA(1);
		setBChannel();
	}
}

$$.setChannelList = function(channel_id, region_code, wlx, mode, chValue) {
        region_code= convert_value_to_original(document.forms[0],"WRegion");

        var ht160Region = new Array(2,11,4,6,10,21,20,22,23);
        var regionx = "region-"+region_code;
        var htx = 'HT20';

        if (!$$.channel_info)
        {
                $$.getJSON('channel_info.json', function(json) {
                        $$.channel_info = json;
                        channel = $$.channel_info.current_info.wl0;
                        channel_a = $$.channel_info.current_info.wl1;
                        $$.setChannelList(channel_id, region_code, wlx, mode, chValue);
                });
        }

	if( wlx != 'wl0' ) {
                htx = ( 1 == mode || 2 == mode || 7 == mode ) ? 'HT20' : (9==mode ? 'HT80' : 'HT40');
                if( mode == 10 )
                        htx = 'HT160';
        }else{
                if(mode == '573' || mode == '500')
                        htx = 'HT40';
        }

        var channel_list = $$.channel_info[regionx][wlx][htx];
        channel_list = (channel_list || '').replace(/\ /g, '').split(',');

        chValue = chValue || $$('#'+channel_id).val();

        var channel = document.getElementById(channel_id);
        channel.options.length = channel_list.length+1;
        var num = 0;
        var find_value = 0;
        var i;
        for(i = 0; i < channel_list.length; i++) {
                var ch = channel_list[i] || '';
                var val = parseInt( (ch || '').split("(DFS)")[0] );
                var text = ch;
                if(wlx == 'wl0') {
                        text = ( val == 0 ) ? "Auto" : ( val < 10 ? '0' + val : text );
                }
                if (!isNaN(val)) {
                        if( val == chValue ) {
                                find_value = num;
                        }
                        channel.options[num].value = val;
                        channel.options[num].text = text;
                        num++;
                }
        }

	channel.options.length = num;
        if(num > 0)
                $$('#'+channel_id).prop("disabled", false);
        else
                $$('#'+channel_id).prop("disabled", true);
        channel.selectedIndex = find_value;
        channel.value = channel.options[find_value] ? channel.options[find_value].value : '';
};

function setAChannel(channel)
{
	var cf = document.forms[0];
        var index = convert_value_to_original(cf, "WRegion");
	var currentMode = convert_value_to_original(cf, "opmode_an");
	var option_array=document.getElementById("wireless_channel_an").options;
	var chValue = channel.value;
	var find_value = 0;
	var i, j=0, val;
	var tmp_array = ht40_array[index];
	var secChannel = document.getElementById("w_channel_an_sec");
	var secChannelTr = document.getElementById("sec_channel_tr");
	var secValue = secChannel.value;

	secChannelTr.style.display = "none";

	if(((getTop(window).support_second_dfs == 0 && enable_ht160 == "1" )||getTop(window).use_orbi_style_flag == "1") && currentMode == 9 && (index == 10 || index == 21))
	{
		tmp_array = ht160_array10;
	}
	else if(getTop(window).use_orbi_style_flag != "1" && enable_ht160 == "1" && index == 11)
	{
		tmp_array = ht160_array11;
	}
	else if ( 1 == currentMode || 2 == currentMode || 7 == currentMode )
	{
		tmp_array = ht20_array[index];
		if(getTop(window).use_orbi_style_flag == "1" && (index == 10 || index == 21))
			tmp_array = ht20_array10;
	}
	else if( 9 == currentMode)
	{
		tmp_array = ht80_array[index];
		if(getTop(window).use_orbi_style_flag != "1" && (index == 4 || (getTop(window).support_second_dfs == 1 && index == 10))&& enable_ht160 === "1")
			secChannelTr.style.display = "";
	}
	else if(getTop(window).use_orbi_style_flag == "1" && currentMode == 10 && (index == 2 || index == 11))
	{
		tmp_array = ht160_array2;
	}
	else if(getTop(window).use_orbi_style_flag == "1" && currentMode == 10 && (index == 4  || index == 6 || index == 10 || index == 21 || index == 7))
	{
		tmp_array = ht160_array4;
	}
	else if(getTop(window).use_orbi_style_flag == "1" && currentMode == 10 && (index == 20 || index == 22))
	{
		tmp_array = ht160_array23;
	}
	else if(getTop(window).use_orbi_style_flag == "1" && (index == 10 || index == 21))
	{
		tmp_array = ht40_array10;
	}

	channel.options.length = tmp_array.length+1;

	if ( dfs_channel_router_flag == 1 && parent.auto_5g_chennel_flag == 1) //Australia, Canada, Europe
	{
		channel.options[j].value = 0;
		channel.options[j].text = "$auto_mark";
		j++;
	}

	for ( i = 0; i < tmp_array.length; i++ )
	{
		if ( 0 == hidden_dfs_channel && ( 1 == dfs_channel_router_flag ||
			( dfs_canada_router_flag == 1 &&  index == 3 ) || //Australia, Canada, Europe
			( dfs_australia_router_flag == 1 &&  index == 2 ) ||
			( dfs_europe_router_flag == 1 &&  index == 4 ) ||
			( dfs_japan_router_flag && index == 6 ) || index == 10 ) ||
			( index==22 || (getTop(window).use_orbi_style_flag != "1" && index==23 )) || //Vietnam, Hong Kong
			( dfs_russia_router_flag && index == 19 ) || index ==12 &&
			( index != 11 ) )
		{
			if ( tmp_array[i].indexOf("(DFS)") > -1 )
			{
				if(getTop(window).use_orbi_style_flag != "1" && index == 2 && enable_ht160 == "1")
					continue;
				val =  tmp_array[i].split("(DFS)")[0];
				channel.options[j].value = val;
				channel.options[j].text = tmp_array[i];
				j++;
			}
			else
			{
				channel.options[j].value = channel.options[j].text = tmp_array[i];
				j++
			}
		}
		else
		{
			if ( tmp_array[i].indexOf("(DFS)") > -1 )
				continue;
			/* spec14
			if(currentMode == 9 && index == 21)//50244
				if(tmp_array[i] == "60" || tmp_array[i] == "64")
					continue;
			if( index == 17 && (tmp_array[i] == "149" || tmp_array[i] == "153" || tmp_array[i] == "157" || tmp_array[i] == "161" || tmp_array[i] == "165") )//53381
				continue;
			*/
			channel.options[j].value = channel.options[j].text = tmp_array[i];
			j++;
		}

	}
	channel.options.length = j;

	for(i=0; i<option_array.length; i++)
	{
		if(option_array[i].value == chValue)
		{
			find_value = 1;
			channel.selectedIndex = i;
			break
		}
	}
	if (find_value == 0)
	{/* to fix bug 27403 */
		for(i=0;i<option_array.length;i++)
		{
			if(option_array[i].value == wla_get_channel)
			{
				find_value = 1;
				channel.selectedIndex = i;
				break;
			}
		}	
	}
	if(find_value == 0)
		channel.selectedIndex = 0;

	if(secChannelTr.style.display !== "none") {
		secChannel.innerHTML = channel.innerHTML;
		not_conflict_ht80(channel);
		if(index == 4)
			not_conflict_eu_sec(channel);
	
		var secOpts = secChannel.options;
		var secFind = false;

		for(var i=0; i<secOpts.length; i++) {
			if(secOpts[i].value == secValue) {
				secFind = true;
				secChannel.selectedIndex = i;
				break;
			}
		}

		if(secFind === false) {
			for(var i=0; i<secOpts.length; i++) {
				if(secOpts[i].value === get_sec_channel) {
					secFind = true;
					secChannel.selectedIndex = i;
					break;
				}
			}
		}

		if(secFind === false)
			secChannel.selectedIndex = 0;
	}
	if((getTop(window).remove_5g_dfs_flag == 1 && index != 2 && index != 4 && index != 6 && index != 10 && index != 11 && index != 21 && index != 20 && index != 22 && index != 23 && index != 7) || (getTop(window).use_orbi_style_flag != "1" && (index == 23)) )
		remove_all_5g_dfs_channel();
}

function not_conflict_ht80(source) {
	var id = (source.id === "wireless_channel_an"? "w_channel_an_sec": "wireless_channel_an");
	var target = document.getElementById(id);

	var firstIndex = source.selectedIndex;
	var part = Math.floor(firstIndex/4);
	var end = (part + 1)*4;
	var start = end - 4;
	var opts = target.options;
	opts = Array.prototype.slice.apply(opts).slice(start, end);
	for(var i=0; i<opts.length; i++) {
		target.removeChild(opts[i]);
	}
}

function not_conflict_eu_sec(source) {
	var id = (source.id === "wireless_channel_an"? "w_channel_an_sec": "wireless_channel_an");
	var target = document.getElementById(id);

	var firstIndex = source.selectedIndex;
	var part = Math.floor(firstIndex/4);
	if(part == 1)
	{
		var opts = target.options;
		opts = Array.prototype.slice.apply(opts).slice(4, 12);
		for(var i=0; i<opts.length; i++) {
			target.removeChild(opts[i]);
		}
	}
	if(part == 2 || part == 3)
	{
		var opts = target.options;
		opts = Array.prototype.slice.apply(opts).slice(4, 8);
		for(var i=0; i<opts.length; i++) {
			target.removeChild(opts[i]);
		}
	}
}

function check_wlan()
{
	if( check_dfs() == false)
	{
		return false;
	}
	//fix bug 29094
	var tag1=0;//when the value is 1, not pop up "guest_tkip_300_150" for 5G 
	var tag2=0;//when the value is 1, not pop up "guest_tkip_aes_300_150" for 5G
	var tag3=0;//when the value is 1, not pop up "wlan_tkip_aes_300_150" for 5G
	var cf=document.forms[0];

        var WRegion_value = convert_value_to_original(cf, "WRegion");
	if((WRegion_value == 4 || (getTop(window).support_second_dfs == 1 && WRegion_value == 10))&& enable_ht160 === "1" && check_dfs_sec() == false)
	{
		return false;
	}
	
	/*bug 41791 
	var ssid_bgn = document.forms[0].ssid.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");*/
	var ssid_bgn = document.forms[0].ssid.value;
	//var space_flag=0;
	var haven_wpe=0;
	var haven_alert_tkip=0;

	/*bug 41791
	var wla1_ssid=document.forms[0].wla1ssid.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");
	var wlg1_ssid=document.forms[0].wlg1ssid.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");*/
	var wla1_ssid=document.forms[0].wla1ssid.value;
	var wlg1_ssid=document.forms[0].wlg1ssid.value;
	
/*	if( wps_progress_status == "2" || wps_progress_status == "3" || wps_progress_status == "start" )
	{
		alert("$wps_in_progress");
		return false;
	}
*/
	if(ssid_bgn == "")
	{
		alert("$ssid_null");
		return false;
	}
	if(cf.enable_smart_connect.checked==false){
        	if(IsGameRouter() && cf.ssid.value==cf.ssid_an.value){
			alert("$ssid_not_allowed_same");
			return false;				
		}
	}

	if(ssid_bgn == wlg1_ssid)
	{
		alert("$ssid_not_allowed_same");
		return false;
	}
	
	for(i=0;i<ssid_bgn.length;i++)
	{
		if(isValidChar_space(ssid_bgn.charCodeAt(i))==false)
		{
			alert("$ssid_not_allowed");
			return false;
		}
	}

	/* to fix bug 25082 */
	/*for(i=0;i<ssid_bgn.length;i++)
	{
		if(ssid_bgn.charCodeAt(i)!=32)
			space_flag++;
	}
	if(space_flag==0)
	{
		alert("$ssid_null");
		return false;
	}*/
	cf.wl_ssid.value = ssid_bgn;
	
	//16400
	if(cf.ssid_bc.checked == true)
		cf.wl_enable_ssid_broadcast.value="1";
	else
		cf.wl_enable_ssid_broadcast.value="0";

	/* 	in our old web page, the cancel button value is alway the cancel mark, so the condition will never be 
		true, so just remove it.
	
	if(cf.Cancel.value=="WLG_wireless.htm")
		cf.opmode_bg.value=cf.opmode.value;
	*/
	
	/*        remove select region for new spec	
	if(cf.WRegion.selectedIndex == 0)
	{
		alert("$coun_select");
		return false;
	}
	*/
	
	cf.wl_apply_flag.value = "1";//bug 30924,if click the 'Apply' wl_apply_flag is '1',otherwise is '0'
	cf.wl_WRegion.value = convert_value_to_original(cf, "WRegion");
	cf.qca_wireless_region.value = qca_region_arr[parseInt(cf.wl_WRegion.value)];
	if ( wds_endis_fun == 1 )
	{
		if ( cf.w_channel.selectedIndex == 0 )
		{
			alert("$wds_auto_channel");
			return false;
		}
	}
	cf.wl_hidden_wlan_channel.value = cf.w_channel.value;
	if( cf.enable_coexistence.checked == true)
                cf.hid_enable_coexist.value="0";
        else
                cf.hid_enable_coexist.value="1";

	if(cf.security_type[1].checked == true)
	{
		if( checkwep(cf)== false)
			return false;
		cf.wl_hidden_sec_type.value=2;
	}
	else if(cf.security_type[2].checked == true)
	{
		if( checkpsk(cf.passphrase, cf.wl_sec_wpaphrase_len)== false)
			return false;
		cf.wl_hidden_sec_type.value=3;
		//bug 41791cf.wl_hidden_wpa_psk.value = cf.passphrase.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.wl_hidden_wpa_psk.value = cf.passphrase.value;
	}
	else if(cf.security_type[3].checked == true)
	{
		if( checkpsk(cf.passphrase, cf.wl_sec_wpaphrase_len)== false)
			return false;
		cf.wl_hidden_sec_type.value=4;
		//bug 41791cf.wl_hidden_wpa_psk.value = cf.passphrase.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.wl_hidden_wpa_psk.value = cf.passphrase.value;
	}	
	else if(cf.security_type[4].checked == true)
	{
		if( checkpsk(cf.passphrase, cf.wl_sec_wpaphrase_len)== false)
			return false;
		cf.wl_hidden_sec_type.value=5;
		//bug 41791cf.wl_hidden_wpa_psk.value = cf.passphrase.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.wl_hidden_wpa_psk.value = cf.passphrase.value;
	}	
	else if(cf.security_type[5].checked == true || cf.security_type[8].checked == true)
	{
		radiusServerIP = cf.radiusIPAddr1.value+'.'+ cf.radiusIPAddr2.value + '.' + cf.radiusIPAddr3.value + '.' + cf.radiusIPAddr4.value;
		if( radiusServerIP == "" || checkipaddr(radiusServerIP) == false )
		{
			alert("$invalid_ip");
			return false;
		}
		if(isSameSubNet(radiusServerIP,lanSubnet,lanIP,lanSubnet) == false && isSameSubNet(radiusServerIP,wanSubnet,wanIP,wanSubnet) == false )
        {
            alert("$diff_LanWan_subnet");
			return false;
        }
		if( isSameIp(lanIP, radiusServerIP) == true )
		{
			alert("$invalid_ip");
			return false;
		}
		if( isSameIp(wanIP, radiusServerIP) == true )
		{
			alert("$conflicted_with_wanip");
			return false;
		}	
		cf.radiusServerIP.value = radiusServerIP;
		
		radiusPort=parseInt(cf.textWpaeRadiusPort.value,10);
		if( isNaN(radiusPort) || radiusPort < 1 || radiusPort > 65535 )
		{
			alert("$radiusPort65535");
			return false;
		}
		cf.textWpaeRadiusPort.value=radiusPort;
		if( cf.textWpaeRadiusSecret.value == "" )
		{
			alert("$radiusSecret128");
			return false;
		}
		if( cf.textWpaeRadiusSecret.length > 128 )
		{
			alert("$radiusSecret128");
			return false;
		}
		for(i=0;i<cf.textWpaeRadiusSecret.value.length;i++)
		{
		    if(isValidChar(cf.textWpaeRadiusSecret.value.charCodeAt(i))==false)
		    {
		        alert("$radiusSecret128");
				cf.textWpaeRadiusSecret.focus();
				return false;
			}
		}
		//bug 41791cf.hidden_WpaeRadiusSecret.value = cf.textWpaeRadiusSecret.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");
		cf.hidden_WpaeRadiusSecret.value = cf.textWpaeRadiusSecret.value;
		if(cf.security_type[5].checked == true)
		cf.wl_hidden_sec_type.value=6;
		else
		cf.wl_hidden_sec_type.value=9;
        cf.textWpaeRadiusPort.value=port_range_interception(cf.textWpaeRadiusPort.value);		
	}	
	else if(cf.security_type[6].checked == true)
	{
		if( checkpsk128(cf.passphrase, cf.wl_sec_wpaphrase_len)== false)
			return false;
		cf.wl_hidden_sec_type.value=7;
		//bug 41791cf.wl_hidden_wpa_psk.value = cf.passphrase.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.wl_hidden_wpa_psk.value = cf.passphrase.value;
	}
	else if(cf.security_type[7].checked == true)
	{
		if( checkpsk(cf.passphrase, cf.wl_sec_wpaphrase_len)== false)
			return false;
		cf.wl_hidden_sec_type.value=8;
		//bug 41791cf.wl_hidden_wpa_psk.value = cf.passphrase.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.wl_hidden_wpa_psk.value = cf.passphrase.value;
	}
	else
		cf.wl_hidden_sec_type.value=1;

	//When user selects WPA-PSK(TKIP)+150Mbps and WPA-PSK(TKIP)+300Mbps, set wl_simple_mode=1,Bug No.19591
	//or select "WPA-PSK [TKIP] + WPA2-PSK [AES]"+150Mbps and "WPA-PSK [TKIP] + WPA2-PSK [AES]"+300Mbps 
	var opmode_value = convert_value_to_original(cf, "opmode");
	if((opmode_value=="2") || (opmode_value=="3"))
	{
	    if(cf.security_type[1].checked == true || cf.security_type[2].checked == true)
		{
			if ( !haven_alert_tkip )
			{
				if(confirm("$wlan_tkip_300_150") == false)
				{
					return false;
				}
				haven_alert_tkip = 1;
			}

			cf.wl_hidden_wlan_mode.value = "1"; //save for wl_simple_mode

		}
		else if(cf.security_type[3].checked == true)
		{
			if(guest_mode_flag == 1)
			{
				tag1 = 1;
				if(confirm("$guest_tkip_300_150") == false)
				{
					return false;
				}
				cf.wl_hidden_wlan_mode.value = "1"; 
			}
			else if(guest_mode_flag == 2)
			{
				tag2 = 1;
				if(confirm("$guest_tkip_aes_300_150") == false)
				{
					return false;	
				}		
				cf.wl_hidden_wlan_mode.value = opmode_value;
			}
			else
				cf.wl_hidden_wlan_mode.value = opmode_value;
		}
		else if(cf.security_type[4].checked == true)
		{
			tag3 = 1;
			if(confirm("$wlan_tkip_aes_300_150") == false)
			{
				return false;	
			}
			
			cf.wl_hidden_wlan_mode.value = opmode_value;
		}
		else if(cf.security_type[5].checked == true)//Bug 19803 WPA/WPA2 Enterprise, has three WPA Mode
		{
			if(cf.wpae_mode.value == 'WPAE-TKIPAES')
			{
				tag3 = 1;
				if(confirm("$wlan_tkip_aes_300_150") == false)
					return false;

				cf.wl_hidden_wlan_mode.value = opmode_value;
			}
			else
			{
				if(guest_mode_flag == 1)
				{
					tag1 = 1;
					if(confirm("$guest_tkip_300_150") == false)
					{
						return false;
					}
					cf.wl_hidden_wlan_mode.value = "1"; 
				}
				else if(guest_mode_flag == 2)
				{
					tag2 = 1;
					if(confirm("$guest_tkip_aes_300_150") == false)
					{
						return false;	
					}		
					cf.wl_hidden_wlan_mode.value = opmode_value;
				}
				else 
					cf.wl_hidden_wlan_mode.value = opmode_value;
			}
		}
		else
		{
			if(guest_mode_flag == 1)
			{
				tag1 = 1;
				if(confirm("$guest_tkip_300_150") == false)
				{
					return false;
				}
				cf.wl_hidden_wlan_mode.value = "1";
			}
			else
				cf.wl_hidden_wlan_mode.value = opmode_value;
		}
	}
	else
	{
		cf.wl_hidden_wlan_mode.value = opmode_value;
	}

	var flad_op = false;
	if(parent.bgn_mode3_value > 150 && cf.enable_coexistence.checked == true && (opmode_value!="1") && (opmode_value!="2"))
	{
	    flad_op = true;
	     alert(msg);
	}
	
	//cf.wl_mode.value = opmode_value;
	//var haven_alert = '0';
	if(cf.security_type[1].checked == true)
	{
		/* To fix Bug 33991
		if ( cf.authAlgm.value == 1 && endis_wl_radio == 1)
        	{
			haven_alert = '1';
                	if (!confirm("$wep_or_wps"))
	                	return false;
		}*/
		
		if(an_router_flag == 1 ){	
			if( wla_mode == '1' && an_mode1_value == 54 )
				alert("$wep_just_one_ssid_an");
			else if( guest_router_flag == 1 )
				alert("$wep_just_one_ssid"+" (2.4GHz).");		
		}
		else if( guest_router_flag == 1 )
			alert("$wep_just_one_ssid");
	}		

	if(ad_router_flag == 1)
	{
		var ssid_ad = document.forms[0].ssid_ad.value;
		if( ssid_ad == "")
		{
			alert("$ssid_null");
			return false;
		}
		if(ssid_bgn == wlg1_ssid || ssid_bgn == wla1_ssid || ssid_ad == wlg1_ssid || ssid_ad == wla1_ssid)
		{
			alert("$ssid_not_allowed_same");
			return false;
		}
		for(i=0;i<ssid_ad.length;i++)
		{
			if(isValidChar_space(ssid_ad.charCodeAt(i))==false)
			{
				alert("$ssid_not_allowed");
				return false;
			}
			var code = ssid_ad.charCodeAt(i);
			if(code == "34" || code == "38" || code == "39" || code == "40" || code == "41" || code == "42" || code == "59" || code == "60" || code == "62")
			{
				alert("60G wireless ssid doesn't support these characters \"&'()*;<>");
				return false;
			}
		}
		cf.wig_ssid.value = ssid_ad;
		cf.wig_hidden_wlan_channel.value = cf.w_channel_ad.value;
		if(cf.security_type_ad[0].checked == true)
		{
			cf.wig_hidden_sec_type.value = 1;
		}
		else if(cf.security_type_ad[1].checked == true)
		{
			if(checkpsk(cf.passphrase_ad, cf.wig_sec_wpaphrase_len, "ad") == false)
				return false;
			cf.wig_hidden_sec_type.value = 4;
			cf.wig_hidden_wpa_psk.value = cf.passphrase_ad.value;
		}
	}
	
	if(an_router_flag == 1)
	{		
		/* bug 41791
		var ssid_an = document.forms[0].ssid_an.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");*/
		var ssid_an = document.forms[0].ssid_an.value;
		if( ssid_an == "")
		{
			alert("$ssid_null");
			return false;
		}
		if(ssid_bgn == wlg1_ssid || ssid_bgn == wla1_ssid || ssid_an == wlg1_ssid || ssid_an == wla1_ssid)
		{
			alert("$ssid_not_allowed_same");
			return false;
		}
		for(i=0;i<ssid_an.length;i++)
		{
			if(isValidChar_space(ssid_an.charCodeAt(i))==false)
			{
				alert("$ssid_not_allowed");
				return false;
			}
		}

		/* to fix bug 25082 */
		/*space_flag=0;
		for(i=0;i<ssid_an.length;i++)
		{
			if(ssid_an.charCodeAt(i)!=32)
				space_flag++;
		}
		if(space_flag==0)
		{
			alert("$ssid_null");
			return false;
		}*/
		
		cf.wla_ssid.value = ssid_an;
		cf.wla_WRegion.value = convert_value_to_original(cf, "WRegion");

		//16400
		if(cf.ssid_bc_an.checked == true)
			cf.wla_enable_ssid_broadcast.value="1";
		else
			cf.wla_enable_ssid_broadcast.value="0";
		if(cf.enable_video_an.checked == true)
			cf.hidden_enable_video.value=1;
		else
			cf.hidden_enable_video.value=0;	
/*
		if ( wla_wds_endis_fun == 1 )
		{
			if ( cf.w_channel_an.selectedIndex == 0 )
			{
				alert("$wds_auto_channel");
				return false;
			}
		}	
*/
		cf.wla_hidden_wlan_channel.value = cf.w_channel_an.value;
		if(document.getElementById("sec_channel_tr").style.display !== "none")
			cf.wla_hidden_sec_channel.value = cf.w_channel_an_sec.value;
		var channel_select_index = cf.w_channel_an.selectedIndex;
		if(cf.w_channel_an.options[channel_select_index].text.indexOf("DFS") != -1)
			cf.wla_hidden_sel_dfs.value = "1";
			
		//for a/n
		if(cf.security_type_an[1].checked == true)
		{
			if( checkwep_a(cf)== false)
				return false;
			cf.wla_hidden_sec_type.value=2;
		}
		else if(cf.security_type_an[2].checked == true)
		{
			if( checkpsk(cf.passphrase_an, cf.wla_sec_wpaphrase_len)== false)
				return false;
			cf.wla_hidden_sec_type.value=3;
			//bug 41791cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
			cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value;
		}
		else if(cf.security_type_an[3].checked == true)
		{
			if( checkpsk(cf.passphrase_an, cf.wla_sec_wpaphrase_len)== false)
				return false;
			cf.wla_hidden_sec_type.value=4;
			//bug 41791cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
			cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value;
		}	
		else if(cf.security_type_an[4].checked == true)
		{
			if( checkpsk(cf.passphrase_an, cf.wla_sec_wpaphrase_len)== false)
				return false;
			cf.wla_hidden_sec_type.value=5;
			//bug 41791cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
			cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value;
		}	
		else if(cf.security_type_an[5].checked == true || cf.security_type_an[8].checked == true)
		{
			radiusServerIP = cf.radiusIPAddr1_an.value+'.'+ cf.radiusIPAddr2_an.value + '.' + cf.radiusIPAddr3_an.value + '.' + cf.radiusIPAddr4_an.value;
			if( radiusServerIP == "" || checkipaddr(radiusServerIP) == false )
			{
				alert("$invalid_ip");
				return false;
			}
			if(isSameSubNet(radiusServerIP,lanSubnet,lanIP,lanSubnet) == false && isSameSubNet(radiusServerIP,wanSubnet,wanIP,wanSubnet) == false )
			{
	            		alert("$invalid_ip");
				return false;
			}
			if( isSameIp(lanIP, radiusServerIP) == true )
			{
				alert("$invalid_ip");
				return false;
			}
			if( isSameIp(wanIP, radiusServerIP) == true )
			{
				alert("$conflicted_with_wanip");
				return false;
			}	
			cf.radiusServerIP_a.value = radiusServerIP;
			
			radiusPort=parseInt(cf.textWpaeRadiusPort_an.value,10);
			if( isNaN(radiusPort) || radiusPort < 1 || radiusPort > 65535 )
			{
				alert("$radiusPort65535");
				return false;
			}
			cf.textWpaeRadiusPort_an.value=radiusPort;
			if( cf.textWpaeRadiusSecret_an.value == "" )
			{
				alert("$radiusSecret128");
				return false;
			}
			if( cf.textWpaeRadiusSecret_an.length > 128 )
			{
				alert("$radiusSecret128");
				return false;
			}
			for(i=0;i<cf.textWpaeRadiusSecret_an.value.length;i++)
			{
			        if(isValidChar(cf.textWpaeRadiusSecret_an.value.charCodeAt(i))==false)
			        {
			        	alert("$radiusSecret128");
					cf.textWpaeRadiusSecret_an.focus();
					return false;
				}
			}
			//bug 41791cf.hidden_WpaeRadiusSecret_a.value = cf.textWpaeRadiusSecret_an.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");
			cf.hidden_WpaeRadiusSecret_a.value = cf.textWpaeRadiusSecret_an.value;

			cf.textWpaeRadiusPort_an.value=port_range_interception(cf.textWpaeRadiusPort_an.value);
			if(cf.security_type_an[5].checked == true)
			cf.wla_hidden_sec_type.value=6;
			else
			cf.wla_hidden_sec_type.value=9;
		}	
		else if(cf.security_type_an[6].checked == true)
		{
			if( checkpsk128(cf.passphrase_an, cf.wla_sec_wpaphrase_len)== false)
				return false;
			cf.wla_hidden_sec_type.value=7;
			//bug 41791cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
			cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value;
		}
		else if(cf.security_type_an[7].checked == true)
		{
			if( checkpsk(cf.passphrase_an, cf.wla_sec_wpaphrase_len)== false)
				return false;
			cf.wla_hidden_sec_type.value=8;
			//bug 41791cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
			cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value;
		}
		else
			cf.wla_hidden_sec_type.value=1;

		//5GHz a/n : When user selects WPA-PSK(TKIP)+150Mbps and WPA-PSK(TKIP)+300Mbps, set wl_simple_mode=1,Bug No.19591
		//or select "WPA-PSK [TKIP] + WPA2-PSK [AES]"+150Mbps and "WPA-PSK [TKIP] + WPA2-PSK [AES]"+300Mbps 
		var opmode_an_value = convert_value_to_original(cf, "opmode_an");
		if((opmode_an.value!="1"))
		{
			if(cf.security_type_an[1].checked == true)
				cf.wla_hidden_wlan_mode.value = "1"; //save for wla_simple_mode
			else if(cf.security_type_an[2].checked == true)
			{
				if ( !haven_alert_tkip )
				{
					if(confirm("$wlan_tkip_300_150") == false)
					{
						return false;
					}
					haven_alert_tkip = 1;
				}

				cf.wla_hidden_wlan_mode.value = "1"; //save for wla_simple_mode
			}
			else if(cf.security_type_an[3].checked == true)
			{
				if(wla_guest_mode_flag == 1)
				{
					if(tag1 == 0)
					{
						if(confirm("$guest_tkip_300_150") == false)
							return false;
					}
					cf.wla_hidden_wlan_mode.value = "1"; 
				}
				else if(wla_guest_mode_flag == 2)
				{
					if(tag2 == 0)
					{
						if(confirm("$guest_tkip_aes_300_150") == false)
							return false;		
					}
					cf.wla_hidden_wlan_mode.value = opmode_an_value;
				}
				else
					cf.wla_hidden_wlan_mode.value = opmode_an_value;
			}
			else if(cf.security_type_an[4].checked == true)
			{
				if(tag3 == 0)
				{
					if(confirm("$wlan_tkip_aes_300_150") == false)
						return false;	
				}
				cf.wla_hidden_wlan_mode.value = opmode_an_value;
			}
			else if(cf.security_type_an[5].checked == true)//Bug 19803 WPA/WPA2 Enterprise, has three WPA Mode
			{
				if(cf.wpae_mode_an.value == 'WPAE-TKIP')
				{
					if ( !haven_alert_tkip )
					{
						if(confirm("$wlan_tkip_300_150") == false)
							return false;
						haven_alert_tkip = 1;
					}
					cf.wla_hidden_wlan_mode.value = "1"; //save for wl_simple_mode
				}
				else if(cf.wpae_mode_an.value == 'WPAE-TKIPAES')
				{
					if(tag3 == 0)
					{
						if(confirm("$wlan_tkip_aes_300_150") == false)
							return false;
					}
					cf.wla_hidden_wlan_mode.value = opmode_an_value;
				}
				else
				{
					if(wla_guest_mode_flag == 1)
					{
						if(tag1 == 0)
						{
							if(confirm("$guest_tkip_300_150") == false)
								return false;
						}
						cf.wla_hidden_wlan_mode.value = "1"; 
					}
					else if(wla_guest_mode_flag == 2)
					{
						if(tag2 == 0)
						{
							if(confirm("$guest_tkip_aes_300_150") == false)
								return false;	
						}		
						cf.wla_hidden_wlan_mode.value = opmode_an_value;
					}
					else
						cf.wla_hidden_wlan_mode.value = opmode_an_value;
				}
			}
			else
			{
				if(wla_guest_mode_flag == 1)
				{
					if(tag1 == 0)
					{
						if(confirm("$guest_tkip_300_150") == false)
							return false;
					}
					cf.wla_hidden_wlan_mode.value = "1";
				}
				else
					cf.wla_hidden_wlan_mode.value = opmode_an_value;
			}
		}
		else
		{
			cf.wla_hidden_wlan_mode.value = opmode_an_value;
		}
		
		
	if(parent.an_mode3_value > 150 && wla_disablecoext != 1 && (opmode_an_value!="1") && (opmode_an_value!="2"))
	{
	   if(flad_op != true)
	     alert(an_msg);
	
	}
	
		
		/*countryIndex=cf.WRegion.value;
		if( (countryIndex == 5 || countryIndex == 14) && !confirm("$notSupportWLA") )
			return false;
		*/
		//cf.wla_hidden_wlan_mode.value = opmode_an_value;
		
		if(cf.security_type_an[1].checked == true && endis_wla_radio == 1)
		{
			/*To fix Bug 33991
		        if ( cf.authAlgm_an.value == 1)
	                {
				if(haven_alert == '0')
	                        	if (!confirm("$wep_or_wps"))
	                                	return false;
			}*/
		
			if(cf.security_type[1].checked == false)
				alert("$wep_just_one_ssid_an");
	        }
		var channel_a=cf.w_channel_an.value;
		var country=cf.wl_WRegion.value;
		//transmit power control, according to the change of country, change values of wl_txctrl and wla_txctrl.
		wlan_txctrl(cf, wl_txctrl_web, wla_txctrl_web, channel_a, country);

	}

	//bug 33156
	if( endis_wl_radio == 1 && cf.ssid_bc.checked == false ||
	(an_router_flag ==1 && endis_wla_radio == 1 && cf.ssid_bc_an.checked == false) )
	{
		if(!confirm("$wps_warning1"))
			return false;
		haven_wpe = 1;
	}

	if( endis_wl_radio == 1 && (cf.wl_hidden_sec_type.value == "2" || cf.wl_hidden_sec_type.value == "3") ||
	(an_router_flag ==1 && endis_wla_radio == 1 &&( cf.wla_hidden_sec_type.value == "2" || cf.wla_hidden_sec_type.value == "3" )) )
	{
		if(haven_wpe == 0)
		{
			if(!confirm("$wps_warning2"))
				return false;
		}
	}

	if( cf.wl_hidden_sec_type.value == "1" || (an_router_flag ==1 && cf.wla_hidden_sec_type.value == "1" ) )
	{
		if(!confirm("$wps_warning3"))
			return false;
	}

	if((endis_wl_radio == 1 && cf.wl_hidden_sec_type.value == "6" ) ||
	(an_router_flag ==1 && cf.wla_hidden_sec_type.value == "6" && endis_wla_radio == 1))
	{
		if(haven_wpe == 0)
		{
			if (!confirm("$wpae_or_wps"))
				return false;
		}
	}
	if(WRegion_value != wl_get_countryA && cf.ssid_bc_an.checked == true)
		cf.change_region_flag.value = 1;
	else
		cf.change_region_flag.value = 0;
	
	if(cf.enable_ax.checked == true)
		cf.hid_wla_ax.value = "1";
	else
		cf.hid_wla_ax.value = "0";
	if(cf.enable_ax.checked == true)
	{
		if(cf.ofdma_2g.checked == true)
			cf.hid_ofdma_2g.value = "1";
		else
			cf.hid_ofdma_2g.value = "0";
		if(cf.ofdma_5g.checked == true)
			cf.hid_ofdma_5g.value = "1";
		else
			cf.hid_ofdma_5g.value = "0";
	}

	if(smart_connect_flag == "1") {
		if(cf.enable_smart_connect.checked)
			cf.hid_enable_smart_connect.value = "1";
	}
	
	cf.submit();
	return true;	
}

function check_wlan_guest(type)
{
	var cf=document.forms[0];
	
	/*bug 41791
	var ssid = document.forms[0].ssid.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");
	var ssid_an = document.forms[0].ssid_an.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");*/
	//var space_flag=0;
	var ssid = document.forms[0].ssid.value;
	var ssid_an = document.forms[0].ssid_an.value;
	cf.s_gssid.value=ssid;
	cf.s_gssid_an.value=ssid_an;

	/*bug 41791
	var wl_ssid=document.forms[0].wlssid.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");
	var wla_ssid=document.forms[0].wlassid.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");*/
	var wl_ssid=document.forms[0].wlssid.value;
	var wla_ssid=document.forms[0].wlassid.value;
	var tag1 = 0;
	/* Fixed Bug28645: if WPS is in progress, it must not be interrupt when user want to enable Guest Network 
	if( wps_progress_status == "2" || wps_progress_status == "3" || wps_progress_status == "start" )
	{
		alert("$wps_in_progress");
		return false;
	}*/
	if(ssid == "")
	{
		alert("$ssid_null");
		return false;
	}
	if(ssid_an == "")
	{
		alert("$ssid_null");
		return false;
	}
        if(ssid == wl_ssid || ssid == wla_ssid)
        {
                alert("$ssid_not_allowed_same");
                return false;
        }
	if(ssid_an == wl_ssid || ssid_an == wla_ssid)
        {
                alert("$ssid_not_allowed_same");
                return false;
        }
	if(ssid == ssid_an)
	{
		alert("$ssid_not_allowed_same");
		return false;
	}
	for(i=0;i<ssid.length;i++)
	{
		if(isValidChar_space(ssid.charCodeAt(i))==false)
		{
			alert(ssid + "$ssid_not_allowed");
			return false;
		}
	}
	for(i=0;i<ssid_an.length;i++)
	{
		if(isValidChar_space(ssid_an.charCodeAt(i))==false)
		{
			alert(ssid_an + "$ssid_not_allowed");
			return false;
		}
	}
	if(type == 'gre')
	{
	    if(cf.enable_gre.checked == true){
		cf.hidden_enable_gre.value = 1;
		if(cf.enable_dhcp_relay.checked = true)
			cf.hidden_enable_dhcp_relay.value = "1";	
		else
			cf.hidden_enable_dhcp_relay.value = "0";
		cf.hidden_oppsite_ip.value = cf.GRE_op_ip1.value + "." + cf.GRE_op_ip2.value + "." + cf.GRE_op_ip3.value + "." + cf.GRE_op_ip4.value;
		if(cf.enable_vlan_id.checked == true)
		{
			var wl_gre_vid = cf.vlan_id_24.value;
			if(wl_gre_vid == "" )
			{
				alert("$wlan_gre_24_null");
				return false;
			}
			if(!(wl_gre_vid >= 1 && wl_gre_vid <= 4094))
			{
				alert("$wlan_gre_24_invalid");
				return false;
			}
			cf.hidden_wl_gre_vlanid.value = wl_gre_vid;
			if(an_router_flag == 1)
			{
				var wla_gre_vid = cf.vlan_id_50.value;
				if(wla_gre_vid == "" )
				{
					alert("$wlan_gre_50_null");
					return false;
				}
				if( !(wla_gre_vid >= 1 && wla_gre_vid <= 4094))
				{
					alert("$wlan_gre_50_invalid");
					return false;
				}
				cf.hidden_wla_gre_vlanid.value = wla_gre_vid;
			}
			cf.hidden_enable_gre_vlan.value = 1;
		}
		else
			cf.hidden_enable_gre_vlan.value = 0;
	
		if(checkipaddr(cf.hidden_oppsite_ip.value)==false)
		{
			alert("$invalid_ip");
			return false;

		}
           } else
		cf.hidden_enable_gre.value = 0;
	}

	/* to fix bug 25082 */
	/*for(i=0;i<ssid.length;i++)
	{
		if(ssid.charCodeAt(i)!=32)
			space_flag++;
	}
	for(i=0;i<ssid_an.length;i++)
	{
		if(ssid_an.charCodeAt(i)!=32)
			space_flag++;
	}
	if(space_flag==0)
	{
		alert("$ssid_null");
		return false;

	}*/

	if(cf.enable_bssid.checked == true)
		cf.hidden_enable_guestNet.value=1;
	else
		cf.hidden_enable_guestNet.value=0;
	if(cf.enable_bssid_an.checked == true)
		cf.hidden_enable_guestNet_an.value=1;
	else
		cf.hidden_enable_guestNet_an.value=0;
		
	if(cf.enable_ssid_bc.checked == true)
		cf.hidden_enable_ssidbro.value=1;
	else
		cf.hidden_enable_ssidbro.value=0;
	if(cf.enable_ssid_bc_an.checked == true)
		cf.hidden_enable_ssidbro_an.value=1;
	else
		cf.hidden_enable_ssidbro_an.value=0;
		
	if(cf.enable_video_an.checked == true)
		cf.hidden_enable_video_an.value=1;
	else
		cf.hidden_enable_video_an.value=0;

	if(type == 'bgn')
	{
		if(cf.allow_access.checked == true)
			cf.hidden_allow_see_and_access.value=1;
		else
			cf.hidden_allow_see_and_access.value=0;
		if(cf.allow_access_an.checked == true)
			cf.hidden_allow_see_and_access_an.value=1;
		else
			cf.hidden_allow_see_and_access_an.value=0;
	}

	var haven_alert_tkip = 0;
	cf.wl_hidden_wlan_mode.value = wl_simple_mode;
	cf.wl_hidden_wlan_mode_an.value = wl_simple_mode_an;
	
	if(wireless_sectype=="2" && cf.enable_bssid.checked == true && cf.security_type[1].checked == true)// to fix bug 30740
	{
		if(parent.an_router_flag == 1){
			if(wl_simple_mode_an == "1" && an_mode1_value == 54)
				alert("$wep_just_one_ssid_an");
			else
				alert("$wep_just_one_ssid"+" (2.4GHz).");
		}
		else
			alert("$wep_just_one_ssid");
		return false;
	}

	if(cf.security_type[1].checked == true)
	{
		cf.hidden_guest_network_mode_flag.value=0;
		cf.wl_hidden_wlan_mode.value = "1";
		if( checkwep(cf)== false)
			return false;
		cf.hidden_sec_type.value=2;

		if(parent.an_router_flag == 1){
			if(wl_simple_mode_an == "1" && an_mode1_value == 54)
				alert("$wep_just_one_ssid_an");
			else
				alert("$wep_just_one_ssid"+" (2.4GHz).");
		}
		else
			alert("$wep_just_one_ssid");
	}
	else if(cf.security_type[2].checked == true)
	{
		if( checkpsk(cf.passphrase, cf.sec_wpaphrase_len)== false)
			return false;

		/* Bug 20177, the same as bug 19591 and 19803.
		When user selects WPA-PSK(TKIP)+150Mbps and WPA-PSK(TKIP)+300Mbps, set wl_simple_mode=1,
		or select "WPA-PSK [TKIP] + WPA2-PSK [AES]"+150Mbps and "WPA-PSK [TKIP] + WPA2-PSK [AES]"+300Mbps */
		if(wl_simple_mode != "1")
		{
			if ( !haven_alert_tkip )
			{
				if(confirm("$wlan_tkip_300_150") == false)
				{
					return false;
				}
				haven_alert_tkip = 1;
			}
			cf.hidden_guest_network_mode_flag.value=0;
		}
		cf.hidden_guest_network_mode_flag.value=1;
		cf.wl_hidden_wlan_mode.value = "1";

		cf.hidden_sec_type.value=3;
		//bug 41791 cf.hidden_wpa_psk.value = cf.passphrase.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.hidden_wpa_psk.value = cf.passphrase.value;
	}
	else if(cf.security_type[3].checked == true)
	{
		cf.hidden_guest_network_mode_flag.value=0;
		if( checkpsk(cf.passphrase, cf.sec_wpaphrase_len)== false)
			return false;
		cf.hidden_sec_type.value=4;
		//bug 41791cf.hidden_wpa_psk.value = cf.passphrase.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.hidden_wpa_psk.value = cf.passphrase.value;
	}	
	else if(cf.security_type[4].checked == true)
	{
		if( checkpsk(cf.passphrase, cf.sec_wpaphrase_len)== false)
			return false;
		
		if(wl_simple_mode != "1")
        {
			tag1 = 1;
			if(confirm("$wlan_tkip_aes_300_150") == false)
			{
				cf.hidden_guest_network_mode_flag.value=0;
				return false;
			}
		}
		cf.hidden_guest_network_mode_flag.value=2;
		cf.wl_hidden_wlan_mode.value = wl_simple_mode;

		cf.hidden_sec_type.value=5;
		//bug 41791cf.hidden_wpa_psk.value = cf.passphrase.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.hidden_wpa_psk.value = cf.passphrase.value;
	}	
	else if(cf.security_type[5].checked == true)
	{
		if(cf.wpae_mode.value == "WPAE-TKIP")
		{
			if(wl_simple_mode != "1")
			{
				if ( !haven_alert_tkip )
				{
					if(confirm("$wlan_tkip_300_150") == false)
					{
						return false
					}
					haven_alert_tkip = 1;
				}
				cf.hidden_guest_network_mode_flag.value=0;
			}
			cf.hidden_guest_network_mode_flag.value=1;
			cf.wl_hidden_wlan_mode.value = "1";
		}
		else if(cf.wpae_mode.value == 'WPAE-TKIPAES')
		{
			if(wl_simple_mode != "1")
			{
				tag1 = 1;
				if(confirm("$wlan_tkip_aes_300_150") == false)
				{
					cf.hidden_guest_network_mode_flag.value=0;
					return false;
				}
			}
			cf.hidden_guest_network_mode_flag.value=2;
			cf.wl_hidden_wlan_mode.value = wl_simple_mode;
			cf.textWpaeRadiusPort.value=port_range_interception(cf.textWpaeRadiusPort.value);
		}
		else
		{
			cf.hidden_guest_network_mode_flag.value=0;
			cf.wl_hidden_wlan_mode.value = wl_simple_mode;
		}
			
		radiusServerIP = cf.radiusIPAddr1.value+'.'+ cf.radiusIPAddr2.value + '.' + cf.radiusIPAddr3.value + '.' + cf.radiusIPAddr4.value;
		if( radiusServerIP == "" || checkipaddr(radiusServerIP) == false )
		{
			alert("$invalid_ip");
			return false;
		}
		if(isSameSubNet(radiusServerIP,lanSubnet,lanIP,lanSubnet) == false && isSameSubNet(radiusServerIP,wanSubnet,wanIP,wanSubnet) == false)
        {
            alert("$invalid_ip");
			return false;
        }
		if( isSameIp(lanIP, radiusServerIP) == true )
		{
			alert("$invalid_ip");
			return false;
		}
		if( isSameIp(wanIP, radiusServerIP) == true )
		{
			alert("$conflicted_with_wanip");
			return false;
		}	
		cf.radiusServerIP.value = radiusServerIP;
		
		radiusPort=parseInt(cf.textWpaeRadiusPort.value,10);
		if( isNaN(radiusPort) || radiusPort < 1 || radiusPort > 65535 )
		{
			alert("$radiusPort65535");
			return false;
		}
		cf.textWpaeRadiusPort.value=radiusPort;
		if( cf.textWpaeRadiusSecret.value == "" )
		{
			alert("$radiusSecret128");
			return false;
		}
		if( cf.textWpaeRadiusSecret.length > 128 )
		{
			alert("$radiusSecret128");
			return false;
		}
                for(i=0;i<cf.textWpaeRadiusSecret.value.length;i++)
		{
			if(isValidChar(cf.textWpaeRadiusSecret.value.charCodeAt(i))==false)
			{
				alert("$radiusSecret128");
				cf.textWpaeRadiusSecret.focus();
				return false;
			}
		}
		//bug 41791cf.hidden_WpaeRadiusSecret.value = cf.textWpaeRadiusSecret.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");
		cf.hidden_WpaeRadiusSecret.value = cf.textWpaeRadiusSecret.value;

/*		if (!confirm("$wpae_or_wps"))
			return false;			
*/
		cf.hidden_sec_type.value=6;
	}	
	else if(cf.security_type[6].checked == true)
	{
		cf.hidden_guest_network_mode_flag.value=0;
		if( checkpsk128(cf.passphrase, cf.sec_wpaphrase_len)== false)
			return false;
		cf.hidden_sec_type.value=7;
		//bug 41791cf.hidden_wpa_psk.value = cf.passphrase.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.hidden_wpa_psk.value = cf.passphrase.value;
	}	
	else if(cf.security_type[7].checked == true)
	{
		if( checkpsk(cf.passphrase, cf.sec_wpaphrase_len)== false)
			return false;
		
		if(wl_simple_mode != "1")
			tag1 = 1;
		cf.hidden_guest_network_mode_flag.value=2;
		cf.wl_hidden_wlan_mode.value = wl_simple_mode;

		cf.hidden_sec_type.value=8;
		//bug 41791cf.hidden_wpa_psk.value = cf.passphrase.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.hidden_wpa_psk.value = cf.passphrase.value;
	}	
	else
		cf.hidden_sec_type.value=1;
		
	if(wla_sectype=="2" && cf.enable_bssid.checked == true && cf.security_type_an[1].checked == true)//to fix bug 30740
	{
		if(parent.an_router_flag == 1)
			alert("$wep_just_one_ssid_an");
		else
			alert("$wep_just_one_ssid");
		return false;
	}

	if(cf.security_type_an[1].checked == true)
	{
		cf.hidden_guest_network_mode_flag_an.value=0;
		cf.wl_hidden_wlan_mode_an.value = "1";
		if( checkwep_a(cf)== false)
			return false;
		cf.hidden_sec_type_an.value=2;

		if(cf.security_type[1].checked == false)
			alert("$wep_just_one_ssid_an");
		//else
			//alert("$wep_just_one_ssid");
	}
	else if(cf.security_type_an[2].checked == true)
	{
		if( checkpsk(cf.passphrase_an, cf.sec_wpaphrase_len_an)== false)
			return false;

		/* Bug 20177, the same as bug 19591 and 19803.
		   When user selects WPA-PSK(TKIP)+150Mbps and WPA-PSK(TKIP)+300Mbps, set wl_simple_mode=1,
		   or select "WPA-PSK [TKIP] + WPA2-PSK [AES]"+150Mbps and "WPA-PSK [TKIP] + WPA2-PSK [AES]"+300Mbps */
		if(wl_simple_mode != "1")
		{
			if ( !haven_alert_tkip )
			{
				if(confirm("$wlan_tkip_300_150") == false)
				{
					return false;
				}
				haven_alert_tkip = 1;
			}
			cf.hidden_guest_network_mode_flag.value=0;
		}
		cf.hidden_guest_network_mode_flag_an.value=1;
		cf.wl_hidden_wlan_mode_an.value = "1";

		cf.hidden_sec_type_an.value=3;
		//bug 41791cf.hidden_wpa_psk_an.value = cf.passphrase_an.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.hidden_wpa_psk_an.value = cf.passphrase_an.value;
	}
	else if(cf.security_type_an[3].checked == true)
	{
		cf.hidden_guest_network_mode_flag_an.value=0;
		if( checkpsk(cf.passphrase_an, cf.sec_wpaphrase_len_an)== false)
			return false;
		cf.hidden_sec_type_an.value=4;
		//bug 41791cf.hidden_wpa_psk_an.value = cf.passphrase_an.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.hidden_wpa_psk_an.value = cf.passphrase_an.value;
	}	
	else if(cf.security_type_an[4].checked == true)
	{
		if( checkpsk(cf.passphrase_an, cf.sec_wpaphrase_len_an)== false)
			return false;
		
		if(wl_simple_mode_an != "1")
        {
			if(tag1 == 0)
			{
				if(confirm("$wlan_tkip_aes_300_150") == false)
				{
					cf.hidden_guest_network_mode_flag_an.value=0;
					return false;
				}
			}
		}
		cf.hidden_guest_network_mode_flag_an.value=2;
		cf.wl_hidden_wlan_mode_an.value = wl_simple_mode_an;

		cf.hidden_sec_type_an.value=5;
		//bug 41791cf.hidden_wpa_psk_an.value = cf.passphrase_an.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.hidden_wpa_psk_an.value = cf.passphrase_an.value;
	}	
	else if(cf.security_type_an[5].checked == true)
	{
		if(cf.wpae_mode_an.value == "WPAE-TKIP")
		{
			if(wl_simple_mode != "1")
			{
				if ( !haven_alert_tkip )
				{
					if(confirm("$wlan_tkip_300_150") == false)
					{
						return false
					}
					haven_alert_tkip = 1;
				}
				cf.hidden_guest_network_mode_flag.value=0;
			}
			cf.hidden_guest_network_mode_flag_an.value=1;
			cf.wl_hidden_wlan_mode_an.value = "1";
		}
		else if(cf.wpae_mode_an.value == 'WPAE-TKIPAES')
		{
			if(wl_simple_mode_an != "1")
			{
				if(tag1 == 0)
				{
					if(confirm("$wlan_tkip_aes_300_150") == false)
					{
						cf.hidden_guest_network_mode_flag_an.value=0;
						return false;
					}
				}
			}
			cf.hidden_guest_network_mode_flag_an.value=2;
			cf.wl_hidden_wlan_mode_an.value = wl_simple_mode_an;
			cf.textWpaeRadiusPort_an.value=port_range_interception(cf.textWpaeRadiusPort_an.value);
		}
		else
		{
			cf.hidden_guest_network_mode_flag_an.value=0;
			cf.wl_hidden_wlan_mode_an.value = wl_simple_mode_an;
		}
			
		radiusServerIP = cf.radiusIPAddr1_an.value+'.'+ cf.radiusIPAddr2_an.value + '.' + cf.radiusIPAddr3_an.value + '.' + cf.radiusIPAddr4_an.value;
		if( radiusServerIP == "" || checkipaddr(radiusServerIP) == false )
		{
			alert("$invalid_ip");
			return false;
		}
		if(isSameSubNet(radiusServerIP,lanSubnet,lanIP,lanSubnet) == false && isSameSubNet(radiusServerIP,wanSubnet,wanIP,wanSubnet) == false)
        {
            alert("$invalid_ip");
			return false;
        }
		if( isSameIp(lanIP, radiusServerIP) == true )
		{
			alert("$invalid_ip");
			return false;
		}
		if( isSameIp(wanIP, radiusServerIP) == true )
		{
			alert("$conflicted_with_wanip");
			return false;
		}	
		cf.radiusServerIP_a.value = radiusServerIP;
		
		radiusPort=parseInt(cf.textWpaeRadiusPort_an.value,10);
		if( isNaN(radiusPort) || radiusPort < 1 || radiusPort > 65535 )
		{
			alert("$radiusPort65535");
			return false;
		}
		cf.textWpaeRadiusPort_an.value=radiusPort;
		if( cf.textWpaeRadiusSecret_an.value == "" )
		{
			alert("$radiusSecret128");
			return false;
		}
		if( cf.textWpaeRadiusSecret_an.length > 128 )
		{
			alert("$radiusSecret128");
			return false;
		}
                for(i=0;i<cf.textWpaeRadiusSecret_an.value.length;i++)
		{
			if(isValidChar(cf.textWpaeRadiusSecret_an.value.charCodeAt(i))==false)
			{
				alert("$radiusSecret128");
				cf.textWpaeRadiusSecret_an.focus();
				return false;
			}
		}
		//bug 41791cf.hidden_WpaeRadiusSecret_a.value = cf.textWpaeRadiusSecret_an.value.replace(/\\/g,"\\\\\\\\").replace(/`/g,"\\\\\\`").replace(/"/g,"\\\"");
		cf.hidden_WpaeRadiusSecret_a.value = cf.textWpaeRadiusSecret_an.value;

/*		if (!confirm("$wpae_or_wps"))
			return false;			
*/
		cf.hidden_sec_type_an.value=6;
	}	
	else if(cf.security_type_an[6].checked == true)
	{
		cf.hidden_guest_network_mode_flag_an.value=0;
		if( checkpsk128(cf.passphrase_an, cf.sec_wpaphrase_len_an)== false)
			return false;
		cf.hidden_sec_type_an.value=7;
		//bug 41791cf.hidden_wpa_psk_an.value = cf.passphrase_an.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.hidden_wpa_psk_an.value = cf.passphrase_an.value;
	}	
	else if(cf.security_type_an[7].checked == true)
	{
		if( checkpsk(cf.passphrase_an, cf.sec_wpaphrase_len_an)== false)
			return false;
		
		cf.hidden_guest_network_mode_flag_an.value=2;
		cf.wl_hidden_wlan_mode_an.value = wl_simple_mode_an;

		cf.hidden_sec_type_an.value=8;
		//bug 41791cf.hidden_wpa_psk_an.value = cf.passphrase_an.value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/"/g,"\\\"");
		cf.hidden_wpa_psk_an.value = cf.passphrase_an.value;
	}	
	else
		cf.hidden_sec_type_an.value=1;
		
/*        if(cf.security_type[1].checked == true)
        {
                if ( cf.authAlgm.value == 1 && cf.enable_guestNet.checked == true)
                {
                        if (!confirm(wep_or_wps))
                                return false;
                }
        }
*/
	cf.submit();
	return true;
}

function handle_samrt_connect() {
	var cf = document.forms[0];

	handle_sync_input();
	sync_broadcast();

	if(!cf.enable_smart_connect.checked) {
		cf.hid_enable_smart_connect.value = "0";
		toggle_an_edit();
		if(cf.ssid.value.length > "29")
			cf.ssid_an.value = cf.ssid.value.substr(0,29)+"-5G";
		else
			cf.ssid_an.value = cf.ssid.value+"-5G";
		return;
	}

	alert("You currently have different WiFi settings for the 2.4GHz Radio and the 5GHz Radio. Once click Apply button, we will overwrite the settings for the 5GHz Radio with the 2.4GHz Radio settings.");

	cf.ssid_an.value = cf.ssid.value;
	cf.ssid_bc_an.checked = cf.ssid_bc.checked;
	cf.hid_enable_smart_connect.value = "1";

	for(var i=0; i<cf.security_type.length; i++) {
		if(cf.security_type[i].checked) {
			var wl_id = cf.security_type[i].id;
		}
	}
	for(var i=0; i<cf.security_type_an.length; i++) {
		if(cf.security_type_an[i].checked) {
			var wla_id = cf.security_type_an[i].id;
		}
	}
	if(wl_id == "security_wep") {
		cf[id_mapping(wla_id)].checked = true;
		cf[id_mapping(wla_id)].onclick();
		cf.passphrase.value = cf.passphrase_an.value;
		cf.passphrase.onfocus();
		cf.passphrase.onkeypress();
	}
	else if(wl_id != "security_wpa_enter" && wl_id != "security_wpa3_enter") {
		cf[id_mapping(wl_id)].checked = true;
		cf[id_mapping(wl_id)].onclick();
		if(wl_id != "security_disable") {
			cf.passphrase_an.value = cf.passphrase.value;
			cf.passphrase_an.onfocus();
			cf.passphrase_an.onkeypress();
		}
	}
	else {
		cf[id_mapping(wl_id)].checked = true;
		cf[id_mapping(wl_id)].onclick();
		var radius_ids = ["radius_ipaddress1", "radius_ipaddress2", "radius_ipaddress3", "radius_ipaddress4", "radius_port", "radius_secret"];
		for(var i=0; i<radius_ids.length; i++) {
			cf[id_mapping(radius_ids[i])].value = cf[radius_ids[i]].value;
		}
		if(wl_id != "security_wpa3_enter"){
		cf.wpae_mode_an.options[cf.wpae_mode.selectedIndex].selected = true;
		wpaemode_an();
		}
	}

	toggle_an_edit();
}

function sync_broadcast() {
	var cf = document.forms[0];
	if(cf.enable_smart_connect.checked) {
		cf.ssid_bc.addEventListener("click", function() {
			cf.ssid_bc_an.checked = cf.ssid_bc.checked;
		})
	}
	else {
		try {
			cf.ssid_bc.removeListener("click");
		}
		catch(e) {}
	}
}

function id_mapping(origin) {
	if(origin.indexOf("security_an_") == 0)
		return origin.replace("security_an_", "security_");
	else if(origin.indexOf("security_") == 0)
		return origin.replace("security_", "security_an_");
	else if(/^radius\w+_an$$/g.test(origin))
		return origin.replace(/^(radius\w+)_an$$/g, "$$1");
	else if(/^radius\w+$$/g.test(origin))
		return origin.replace(/^(radius\w+)$$/g, "$$1_an");
	else //ssid, passphrase, wpae_mode, ssid_bc
		return (origin + "_an");
}

function sync_user_input(origin) {
	if(document.forms[0].enable_smart_connect.checked == false)
		return;
	var target = document.getElementById(id_mapping(origin.id));
	if(origin.options != undefined) {
		target.options[parseInt(origin.selectedIndex)].selected = true;
		target.onchange();
	}
	else if(origin.type == "radio") {
		target.checked = origin.checked;
		simulate_behavior(target);
	}
	else {
		target.value = origin.value;
		simulate_behavior(target);
	}
}

function toggle_an_edit() {
	var cf = document.forms[0];
	var passphrase_ans = document.getElementsByName("passphrase_an");
	var flag = !!cf.enable_smart_connect.checked;
	wl_sectype_change();
	cf.ssid_an.disabled = flag;
	cf.ssid_bc_an.disabled = flag;
	for(var i=0; i<cf.security_type_an.length; i++) {
		cf.security_type_an[i].disabled = flag;
	}
	for(var i=0; i< passphrase_ans.length; i++)
		passphrase_ans[i].disabled = flag;
	var radius_ids = ["wpae_mode", "radius_ipaddress1", "radius_ipaddress2", "radius_ipaddress3", "radius_ipaddress4", "radius_port", "radius_secret"];
	for(var i=0; i<radius_ids.length; i++) {
		if(!!cf[id_mapping(radius_ids[i])])
			cf[id_mapping(radius_ids[i])].disabled = flag;
	}
}

function handle_sync_input() {
	var cf = document.forms[0];
	var target = ["ssid", "passphrase", "radius_ipaddress1", "radius_ipaddress2", "radius_ipaddress3", "radius_ipaddress4", "radius_port", "radius_secret"];

	for(var i=0; i<target.length; i++) {
		if(!!cf[target[i]] && !!cf[id_mapping(target[i])]) {
			if(cf.enable_smart_connect.checked) {
				cf[target[i]].addEventListener("input", function() {
					sync_user_input(this);
				})
			}
			else {
				try {
					cf[target[i]].removeListener("input");
				}
				catch(e){}
			}
		}
	}
}

function simulate_behavior(target) {
	if(typeof target.onfocus == "function")
		target.onfocus();
	if(typeof target.onclick == "function")
		target.onclick();
	if(typeof target.onkeypress == "function")
		target.onkeypress();
}

var ht20_array = new Array(
/* 0 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "136(DFS)", "140(DFS)" ),
/* 1 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161", "165" ),
/* 2 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161", "165" ),
/* 3 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161", "165" ),
/* 4 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)" ),
/* 5 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)" ),
/* 6 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)" ),
/* 7 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161", "165" ),
/* 8 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "149", "153", "157", "161", "165" ),
/* 9 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161", "165" ),
/* 10 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161", "165" ),
/* 11 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "149", "153", "157", "161", "165" ),
/* 12 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "149", "153", "157", "161", "165" ),
/* 13 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161", "165" ),
/* 14 */ new Array(""),
/* 15 */ new Array( "149", "153", "157", "161", "165" ),
/* 16 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)" ),
/* 17 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)" ),
/* 18 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161", "165" ),
/* 19 */ new Array( "36", "40", "44", "48", "52", "56", "60", "64", "132", "136", "140", "149", "153", "157", "161", "165" ),
/* 20 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161", "165" ),
/* 21 */ new Array( "36", "40", "44", "48", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161", "165" ),
/* 22 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161", "165" ),
/* 23 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)" )
);

var ht40_array = new Array(
/* 0 */ new Array(""),
/* 1 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "149", "153", "157", "161" ),
/* 2 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "132(DFS)", "136(DFS)", "149", "153", "157", "161" ),
/* 3 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "132(DFS)", "136(DFS)", "149", "153", "157", "161" ),
/* 4 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)" ),
/* 5 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)" ),
/* 6 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)" ),
/* 7 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" ),
/* 8 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "149", "153", "157", "161" ),
/* 9 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "149", "153", "157", "161" ),
/* 10 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "149", "153", "157", "161" ),
/* 11 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "149", "153", "157", "161" ),
/* 12 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "149", "153", "157", "161" ),
/* 13 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" ),
/* 14 */ new Array(""),
/* 15 */ new Array( "149", "153", "157", "161" ),
/* 16 */ new Array(""),
/* 17 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)" ),
/* 18 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "149", "153", "157", "161" ),
/* 19 */ new Array( "36", "40", "44", "48", "52", "56", "60", "64", "132", "136", "149", "153", "157", "161" ),
/* 20 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "149", "153", "157", "161" ),
/* 21 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "149", "153", "157", "161" ),
/* 22 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "132(DFS)", "136(DFS)", "149", "153", "157", "161" ),
/* 23 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)" )
);

var ht80_array = new Array(
/* 0 */ new Array(""),
/* 1 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" ),
/* 2 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "149", "153", "157", "161" ),
/* 3 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "149", "153", "157", "161" ),
/* 4 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)" ),
/* 5 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)" ),
/* 6 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)" ),
/* 7 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" ),
/* 8 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "149", "153", "157", "161" ),
/* 9 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" ),
/* 10 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" ),
/* 11 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "149", "153", "157", "161" ),
/* 12 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "149", "153", "157", "161" ),
/* 13 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" ),
/* 14 */ new Array(""),
/* 15 */ new Array( "149", "153", "157", "161" ),
/* 16 */ new Array(""),
/* 17 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)" ),
/* 18 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" ),
/* 19 */ new Array( "36", "40", "44", "48", "52", "56", "60", "64", "149", "153", "157", "161" ),
/* 20 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" ),
/* 21 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" ),
/* 22 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "149", "153", "157", "161" ),
/* 23 */ new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)" )
);

var ht20_array10 = new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "144(DFS)", "149", "153", "157", "161", "165" );
var ht40_array10 = new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "144(DFS)", "149", "153", "157", "161" );
if(getTop(window).use_orbi_style_flag == "1")
var ht160_array10 = new Array("36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "144(DFS)", "149", "153", "157", "161");
else
var ht160_array10 = new Array("36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161");
var ht160_array11 = new Array("36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "149", "153", "157", "161" );
var ht160_array2 = new Array("36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)");
var ht160_array4 = new Array("36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)");
if(getTop(window).use_orbi_style_flag == "1")
{
	ht20_array[20] = ht20_array[22] = ht20_array[23] = new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "149", "153", "157", "161" , "165" );
	ht40_array[20] = ht40_array[22] = ht40_array[23] = new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "149", "153", "157", "161" );
	ht80_array[20] = ht80_array[22] = ht80_array[23] = new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "149", "153", "157", "161" );
	ht160_array23 = new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)" );
	ht20_array[7] = new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "144(DFS)", "149", "153", "157", "161", "165" );
	ht40_array[7] = ht80_array[7] = new Array( "36", "40", "44", "48", "52(DFS)", "56(DFS)", "60(DFS)", "64(DFS)", "100(DFS)", "104(DFS)", "108(DFS)", "112(DFS)", "116(DFS)", "120(DFS)", "124(DFS)", "128(DFS)", "132(DFS)", "136(DFS)", "140(DFS)", "144(DFS)", "149", "153", "157", "161" );
}
