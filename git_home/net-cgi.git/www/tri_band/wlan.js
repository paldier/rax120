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
var dfs_count=0;

/************show password************/
function change_password_display(ele){
	var pwdInput = $$(ele).parents('.tdright').find('.input1').prop("outerHTML");
	var replaceInput;

	var pwd = $$(ele).parents('.tdright').find('.input1');
	var pwd_value = $$(ele).parents('.tdright').find('.input1').val();

	if (pwd.attr('type') == "password"){
		replaceInput = $$(ele).parents('.tdright').find('.input1').prop("outerHTML").replace("password","text");
		$$(ele).attr('src', 'image/pwd_display_eye.png');
	} else {
		replaceInput = $$(ele).parents('.tdright').find('.input1').prop("outerHTML").replace("text","password");
		$$(ele).attr('src', 'image/pwd_close_eye.png');
	}
	pwd.replaceWith(replaceInput);
	$$(ele).parents('.tdright').find('.input1').val(pwd_value);

	var cf=document.forms[0];
	if( $$('#enable_smart_connect').length > 0 && cf.enable_smart_connect.checked )
	{
		handle_sync_input();
		toggle_an_edit();
		toggle_tri_edit();
	}
}

function tri_router_loadvalue()
{
	var form=document.forms[0];
	var channel_tri=wla_2nd_get_channel;

	str_have_tri=getObj("hidden_tri").innerHTML;
	str_have_tri=str_have_tri.replace(/\`/g, "&#96;");
	getObj("hidden_tri").innerHTML='';
	getObj("have_tri").innerHTML=str_have_tri;

	if( mode_tri == '1' || mode_tri == '7')
		form.opmode_tri.options[0].selected = true;
	else if( mode_tri == '2' || mode_tri == '8')
		form.opmode_tri.options[1].selected = true;
	else if(getTop(window).use_orbi_style_flag == "1" && enable_ht160_2nd == "1" && form.opmode_tri.options.length=="4" && mode_tri == '10')
		form.opmode_tri.options[3].selected = true;
	else // mode_an == '3' '5' '6' || mode_an == '9'
		form.opmode_tri.options[2].selected = true;

	if(old_wla_2nd_endis_ssid_broadcast=='1')
		form.ssid_bc_tri.checked = true;
	else
		form.ssid_bc_tri.checked = false;

	if( get_enable_video_value == 1 )
		form.enable_video_tri.checked = true;
	else
		form.enable_video_tri.checked = false;

	setAwlan_mode_tri();
	if(valid_region == 1)
	{
		//fix bug 29087:5Ghz channel show blank on IE
		form.w_channel_tri.value = channel_tri;
		if(form.w_channel_tri.selectedIndex == -1)
			form.w_channel_tri.options[0].selected = true;
		form.w_channel_tri_sec.value = get_2nd_sec_channel;
		if(form.w_channel_tri_sec.options.length !== 0 && form.w_channel_tri_sec.selectedIndex == -1)
			form.w_channel_tri_sec.options[0].selected = true;
	}

	setSecurity_tri(wla_2nd_sectype);

	if(wla_2nd_sectype==4 || wla_2nd_sectype==8)
		$$("#passphrase_tri").val(wla_2nd_wpa2_psk);
	else if(wla_2nd_sectype==5)
		$$("#passphrase_tri").val(wla_2nd_wpas_psk);
	else if(wla_2nd_sectype==7)
		$$("#passphrase_tri").val(wla_2nd_wpa3_sae_psk);

	document.getElementById("wpa_psk_tri_54").style.display="none";
	var sectype_tri=wla_2nd_sectype;
	if ( wla_2nd_wds_endis_fun == '0' || endis_wla_2nd_radio == '0' ||pr_wds_support_wpa == 1 )
		setDisabled(false,form.security_type_tri[2],form.security_type_tri[3],form.security_type_tri[4]);
	else
		setDisabled(true,form.security_type_tri[2],form.security_type_tri[3],form.security_type_tri[4]);

	if ( wla_2nd_wds_endis_fun == '0' || endis_wla_2nd_radio == '0')
		setDisabled(false,form.security_type_tri[5]);
	else
		setDisabled(true,form.security_type_tri[5]);

	if(parseInt(sectype_tri)>1)
		form.security_type_tri[parseInt(sectype_tri)-2].checked=true;
	else
		form.security_type_tri[parseInt(sectype_tri)-1].checked=true;

	if(wla_2nd_sectype == '2')
	{
		var keyno=wla_2nd_get_keyno;
		var keylength=wla_2nd_get_keylength;
		changekeylen_tri(document.forms[0]);
		if(parseInt(keyno)>0)
			form.wep_key_no_tri[parseInt(keyno)-1].checked = true;
		form.KEY1_tri.value=wla_2nd_key1;
		form.KEY2_tri.value=wla_2nd_key2;
		form.KEY3_tri.value=wla_2nd_key3;
		form.KEY4_tri.value=wla_2nd_key4;
		form.old_length_a.value=keylength;
	}
	else if(wla_2nd_sectype==6)
	{
		form.wpae_mode_tri.value = get_wpae_mode_tri;
		if( get_radiusSerIp_tri != "" && get_radiusSerIp_tri != "0.0.0.0" )
		{
			radiusIPArray = get_radiusSerIp_tri.split(".");
			form.radiusIPAddr1_tri.value = radiusIPArray[0];
			form.radiusIPAddr2_tri.value = radiusIPArray[1];
			form.radiusIPAddr3_tri.value = radiusIPArray[2];
			form.radiusIPAddr4_tri.value = radiusIPArray[3];
		}
		form.textWpaeRadiusPort_tri.value = get_radiusPort_tri;
	}
}


function Change_ax_opmode(cf)
{
	var i=cf.opmode_an.options.length;
	for(i;i>0;i--)
	{
		if(cf.enable_ax.checked == true)
			cf.opmode_an.options[i-1].text=window['an_wlan_mode_'+i];
		else
			cf.opmode_an.options[i-1].text=window['an_wlan_mode_'+(i+4)];
	}
	var j=cf.opmode_tri.options.length;
	for(j;j>0;j--)
	{
		if(cf.enable_ax.checked == true)
			cf.opmode_tri.options[j-1].text=window['tri_wlan_mode_'+j];
		else
			cf.opmode_tri.options[j-1].text=window['tri_wlan_mode_'+(j+4)];
	}

	if(cf.enable_ax.checked == true)
	{
		wlan_mode_3_value = (wlan_mode_3_value=="1147")?"1146":wlan_mode_3_value;
		cf.opmode.options[0].text = wlan_mode_1;
		cf.opmode.options[1].text = wlan_mode_2;
		cf.opmode.options[2].text = wlan_mode_3;
		cf.opmode.options[0].value = wlan_mode_1_value;
		cf.opmode.options[1].value = wlan_mode_2_value;
		cf.opmode.options[2].value = wlan_mode_3_value;
		document.getElementById("ofdma_tr").style.display = "";
		if(enable_ofdma_2g == "1")
			cf.ofdma_2g.checked = true;
		else
			cf.ofdma_2g.checked = false;
		if(enable_ofdma_5g == "1")
			cf.ofdma_5g.checked = true;
		else
			cf.ofdma_5g.checked = false;
		if(enable_ofdma_5g2 == "1")
			cf.ofdma_5g2.checked = true;
		else
			cf.ofdma_5g2.checked = false;
	}
	else
	{
		cf.opmode.options[0].text = wlan_mode_4;
		cf.opmode.options[1].text = wlan_mode_5;
		cf.opmode.options[2].text = wlan_mode_6;
		cf.opmode.options[0].value = "1";
		cf.opmode.options[1].value = "2";
		cf.opmode.options[2].value = "3";
		document.getElementById("ofdma_tr").style.display = "none";
	}
}

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

	$$("#none").css("display","none");
	$$("#wpae").css("display","none");
	$$("#wep").css("display","none");
	$$("#passphrase_div").css("display","block");
	$$("#wpaPwdPhrExtText").html("$sec_863_or_64h");
	$$("#passphrase").attr("maxlength",64);

	if(num==4 || num==5 || num==8)
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
	}

        if(num==2)
        {
                opmode_disabled();
		$$("#wep").css("display","block");
		$$("#passphrase_div").css("display","none");
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
        else if(num==4)
	{
		document.forms[0].wpa2_press_flag.value = "1";
		if(have_wpa3_flag == "1")
			$$("#sec_title").html("(WPA2-Personal)");
		else
			$$("#sec_title").html("(WPA2-PSK)");
	}
        else if(num==5)
	{
		document.forms[0].wpas_press_flag.value = "1";
		if(have_wpa3_flag == "1")
			$$("#sec_title").html("(WPA-Personal + WPA2-Personal)");
		else
			$$("#sec_title").html("(WPA-PSK + WPA2-PSK)");
	}
        else if (num==6)
        {
		$$("#wpae").css("display","block");
		$$("#passphrase_div").css("display","none");
                form.wpae_mode.value = get_wpae_mode;
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
        else if(num==7)
        {
		opmode_abled();
		wl_sectype_change();
		document.forms[0].wpa3_sae_press_flag.value = "1";
		$$("#sec_title").html("(WPA3-Personal)");
		$$("#wpaPwdPhrExtText").html("(8-127 characters or 128 hex digits)");
		$$("#passphrase").attr("maxlength",128);
	}
        else if(num==8)
	{
		document.forms[0].wpa2_press_flag.value = "1";
		$$("#sec_title").html("(WPA2-Personal + WPA3-Personal)");
	}
        else
        {
                opmode_abled();
                wl_sectype_change();
		$$("#none").css("display","block");
		$$("#wpae").css("display","none");
		$$("#passphrase_div").css("display","none");
		$$("#wep").css("display","none");
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
		toggle_tri_edit();
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

function opmode_tri_disabled()
{
        document.getElementById("opmode_tri_all").style.display="none";
        document.getElementById("opmode_tri_54").style.display="";
}
function opmode_tri_abled()
{
	if( $$('#opmode_tri_all').length > 0 )
	{
		document.getElementById("opmode_tri_all").style.display="";
		document.getElementById("opmode_tri_54").style.display="none";
	}
}

var sync_passwd_an;
function setSecurity_an(num)
{
        var form=document.forms[0];
        form.wla_wpa1_press_flag.value=0;
        form.wla_wpa2_press_flag.value=0;
        form.wla_wpas_press_flag.value=0;

	$$("#none_an").css("display","none");
	$$("#wpae_an").css("display","none");
	$$("#passphrase_div_an").css("display","block");
	$$("#wpaPwdPhrExtText_an").html("$sec_863_or_64h");
	$$("#passphrase_an").attr("maxlength",64);

        if(num==4 || num==5 || num==8)
        {
                opmode_an_abled();
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
	}

	if(num==4)
	{
		document.forms[0].wla_wpa2_press_flag.value = "1";
		if(have_wpa3_flag == "1")
			$$("#sec_title_an").html("(WPA2-Personal)");
		else
			$$("#sec_title_an").html("(WPA2-PSK)");
	}
        else if(num==5)
	{
		document.forms[0].wla_wpas_press_flag.value = "1";
		if(have_wpa3_flag == "1")
			$$("#sec_title_an").html("(WPA-Personal + WPA2-Personal)");
		else
			$$("#sec_title_an").html("(WPA-PSK + WPA2-PSK)");
	}
        else if (num==6)
        {
		$$("#none_an").css("display","none");
		$$("#wpae_an").css("display","block");
		$$("#passphrase_div_an").css("display","none");
                form.wpae_mode_an.value = get_wpae_mode_a;
                /*if(form.wpae_mode_an.value == 'WPAE-TKIP')
                        opmode_an_disabled();
                else
                {*/
                        opmode_an_abled();
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
		document.forms[0].wla_wpa3_sae_press_flag.value = "1";
		$$("#sec_title_an").html("(WPA3-Personal)");
		$$("#wpaPwdPhrExtText_an").html("(8-127 characters or 128 hex digits)");
		$$("#passphrase_an").attr("maxlength",128);
	}
        else if(num==8)
	{
		document.forms[0].wla_wpa2_press_flag.value = "1";
		$$("#sec_title_an").html("(WPA2-Personal + WPA3-Personal)");
	}
        else
        {
		$$("#none_an").css("display","block");
		$$("#wpae_an").css("display","none");
		$$("#passphrase_div_an").css("display","none");
                opmode_an_abled();

        }

	if(getTop(window).guest_router_flag == 1 && wla1_sectype == 2)
		opmode_an_disabled();
}

var sync_passwd_tri;
function setSecurity_tri(num)
{
        var form=document.forms[0];
        form.wla_2nd_wpa1_press_flag.value=0;
        form.wla_2nd_wpa2_press_flag.value=0;
        form.wla_2nd_wpas_press_flag.value=0;

	$$("#none_tri").css("display","none");
	$$("#wpae_tri").css("display","none");
	$$("#passphrase_div_tri").css("display","block");
	$$("#wpaPwdPhrExtText_tri").html("$sec_863_or_64h");
	$$("#passphrase_tri").attr("maxlength",64);

	var smart_connect_tag="1";
	if($$('#enable_smart_connect').length > 0)
		smart_connect_tag = !document.forms[0].enable_smart_connect.checked;
	if(num==4 || num==5 || num==8)
	{
		opmode_tri_abled();
		if(document.getElementById("passphrase_tri"))
			sync_passwd_tri = document.getElementById("passphrase_tri").value;
		if(sync_passwd_tri != undefined && smart_connect_tag && sync_passwd_tri.length > 64 && num!=wla_2nd_sectype)
		{
			if(confirm("Your WPA3-Personal password length is more than 64 characters. The other security options support a password that is less than 64 characters only. If you want to change the security option, you must change your password to be less than 64 characters. Click the OK button if you want to change your password. Click the Cancel button if you don't want to make any changes.")==false)
			{
				document.forms[0].security_type_tri[parseInt(wla_2nd_sectype)-1].checked = true;
				return setSecurity_tri(wla_2nd_sectype);
			}
			else
				sync_passwd_tri = "";
		}
	}
        if(num==4)
        {
		document.forms[0].wla_2nd_wpa2_press_flag.value = "1";
		if(have_wpa3_flag == "1")
			$$("#sec_title_tri").html("(WPA2-Personal)");
		else
			$$("#sec_title_tri").html("(WPA2-PSK)");
        }
        else if(num==5)
        {
		document.forms[0].wla_2nd_wpas_press_flag.value = "1";
		if(have_wpa3_flag == "1")
			$$("#sec_title_tri").html("(WPA-Personal + WPA2-Personal)");
		else
			$$("#sec_title_tri").html("(WPA-PSK + WPA2-PSK)");
        }
        else if (num==6)
        {
		$$("#none_tri").css("display","none");
		$$("#wpae_tri").css("display","block");
		$$("#passphrase_div_tri").css("display","none");
                form.wpae_mode_tri.value = get_wpae_mode_tri;
                        opmode_tri_abled();
		if( get_radiusSerIp_tri != "" && get_radiusSerIp_tri != "0.0.0.0" )
                {
                        radiusIPArray = get_radiusSerIp_tri.split(".");
                        form.radiusIPAddr1_tri.value = radiusIPArray[0];
                        form.radiusIPAddr2_tri.value = radiusIPArray[1];
                        form.radiusIPAddr3_tri.value = radiusIPArray[2];
                        form.radiusIPAddr4_tri.value = radiusIPArray[3];
                }
                form.textWpaeRadiusPort_tri.value = get_radiusPort_tri;
        }
	else if(num==7)
        {
                opmode_tri_abled();
		document.forms[0].wla_2nd_wpa3_sae_press_flag.value = "1";
		$$("#sec_title_tri").html("(WPA3-Personal)");
		$$("#wpaPwdPhrExtText_tri").html("(8-127 characters or 128 hex digits)");
		$$("#passphrase_tri").attr("maxlength",128);
        }
	else if(num==8)
        {
		document.forms[0].wla_2nd_wpa2_press_flag.value = "1";
		$$("#sec_title_tri").html("(WPA2-Personal + WPA3-Personal)");
        }
	else
        {
		$$("#none_tri").css("display","block");
                $$("#wpae_tri").css("display","none");
                $$("#passphrase_div_tri").css("display","none");
                opmode_tri_abled();

        }
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

function wla_54_sectype_change()
{
        var form=document.forms[0];
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
}

function wpaemode_tri()
{
        var form=document.forms[0];
        document.getElementById("opmode_tri_all").style.display="";
        document.getElementById("opmode_tri_54").style.display="none";
}
//bug 23854:The dialogue of DFS channel is not implemented
function check_dfs(type)
{
	var cf = document.forms[0]; 
	var each_info = dfs_info.split(':');
	var currentMode = cf.opmode_an.value;
	var index = cf.WRegion.value;
	var channel_info;
	if(type == "tri")
		var channel = cf.w_channel_tri;
	else
		var channel = cf.w_channel_an;

        var ch_index = channel.selectedIndex;
        var ch_name = channel.options[ch_index].text;
	var ch_value = channel.options[ch_index].value;
	var ht160_enabled= (getTop(window).support_ht160_flag == 1 && enable_ht160 == "1" && ((index == 10 || index == 4 || (getTop(window).use_orbi_style_flag == "1" && (index == 20 || index == 22 || index == 23 ))) && (currentMode != 1 && currentMode != 2 && currentMode != 7 && currentMode != 8)))

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

	if(dfs_count == 0)
	{
		if( ch_name.indexOf('(DFS)') != -1  && confirm("$select_dfs") == false)
			return false;
		else
			dfs_count=1;
	}

	return true;
}

function check_dfs_sec()
{
	var cf = document.forms[0]; 
	var each_info = dfs_info.split(':');
	var currentMode = cf.opmode_an.value;
	var index = cf.WRegion.value;
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
        var cf = document.forms[0];
        var index = cf.WRegion.value;
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
                cf.w_channel_an.disabled=true;
                cf.opmode_an.options.length = 3;
                cf.opmode_an.options[0].text = an_wlan_mode_1;
                cf.opmode_an.options[1].text = an_wlan_mode_2;
                cf.opmode_an.options[2].text = an_wlan_mode_3;
                cf.opmode_an.options[0].value = "7";
                cf.opmode_an.options[1].value = "8";
                cf.opmode_an.options[2].value = "9";
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
		if(currentMode > 2)
			cf.opmode_an.selectedIndex = 1;
		else
	                cf.opmode_an.selectedIndex = currentMode;
                cf.w_channel_an.disabled=false;
                cf.opmode_an.disabled=false;
        }
        return;
}

function setAwlan_mode_tri()
{
	var cf = document.forms[0];
	var index = cf.WRegion.value;
	var currentMode = cf.opmode_tri.selectedIndex;

	if (index == Africa || index == Israel || index == Middle_East_Turkey_Egypt_Tunisia_Kuwait || index == Middle_East_Saudi_Arabia)
	{ //Israel,Middle East(Turkey/Egypt/Tunisia/Kuwait) Middle East(Saudi Arabia) Africa
		cf.opmode_tri.options.length = 1;
		cf.opmode_tri.options[0].text = tri_wlan_mode_1;
		cf.opmode_tri.options[0].value = "7";
		if (currentMode <= 0)
			cf.opmode_tri.selectedIndex = currentMode;
		else
			cf.opmode_tri.selectedIndex = 0;
		cf.w_channel_tri.disabled=false;
		cf.opmode_tri.disabled=false;
	}
	else if ( index == Middle_East_Algeria_Syria_Yemen )
	{           // Middle East(Algeria/Syria/Yemen), this country do not support HT20 HT40,grayout channel
		cf.w_channel_tri.selectedIndex=0;
		cf.w_channel_tri.disabled=true;
		cf.opmode_tri.options.length = 3;
		cf.opmode_tri.options[0].text = tri_wlan_mode_1;
		cf.opmode_tri.options[1].text = tri_wlan_mode_2;
		cf.opmode_tri.options[2].text = tri_wlan_mode_3;
		cf.opmode_tri.options[0].value = "7";
		cf.opmode_tri.options[1].value = "8";
		cf.opmode_tri.options[2].value = "9";
		cf.opmode_tri.disabled=true;// bug 34916, grey out mode, this region not support both HT20 and HT40
	}
	else if(index == Russia){
		cf.opmode_tri.options.length = 2;
		cf.opmode_tri.options[0].text = tri_wlan_mode_1;
		cf.opmode_tri.options[1].text = tri_wlan_mode_2;
		cf.opmode_tri.options[0].value = "7";
		cf.opmode_tri.options[1].value = "8";
		if (currentMode > 1)
			cf.opmode_tri.selectedIndex = 1;
		else
			cf.opmode_tri.selectedIndex = currentMode;
		cf.w_channel_tri.disabled=false;
		cf.opmode_tri.disabled=false;
	}
	else{
		cf.opmode_tri.options.length = 3;

		cf.opmode_tri.options[0].text = tri_wlan_mode_1;
		cf.opmode_tri.options[1].text = tri_wlan_mode_2;
		cf.opmode_tri.options[2].text = tri_wlan_mode_3;
                cf.opmode_tri.options[0].value = "7";
                cf.opmode_tri.options[1].value = "8";
                cf.opmode_tri.options[2].value = "9";
                if(getTop(window).use_orbi_style_flag == "1" && (index == 2 || index == 4 || index == 6 || index == 10 || index == 11 || index == 21 || index == 20 || index == 22 || index == 23))
                {
                        cf.opmode_tri.options.length = 4;
                        cf.opmode_tri.options[3].text = tri_wlan_mode_4;
                        cf.opmode_tri.options[3].value = "10";
                        cf.opmode_tri.selectedIndex = currentMode;
                }
                else if(currentMode > 2)
                        cf.opmode_tri.selectedIndex = 1;
                else
                        cf.opmode_tri.selectedIndex = currentMode;
                cf.w_channel_tri.disabled=false;
                cf.opmode_tri.disabled=false;
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
			channel = $$.channel_info.current_info.wl1;
			channel_a = $$.channel_info.current_info.wl2;
			channel_tri = $$.channel_info.current_info.wl0;
			$$.setChannel('wl1', channel);
			$$.setChannel('wl2', channel_a);
			$$.setChannel('wl0', channel_tri);
		}
	});
};

$$.setChannel = function(wifix, chValue) {
	if (wifix == 'wl1') {
		$$.setChannelList('wireless_channel', $$('#wireless_region').val(), 'wl1', $$('#opmode').val(), chValue);
	} else if (wifix == 'wl2') {
		$$.setChannelList('wireless_channel_an', $$('#wireless_region').val(), 'wl2', $$('#opmode_an').val(), chValue);
	} else if (wifix == 'wl0') {
		$$.setChannelList('wireless_channel_tri', $$('#wireless_region').val(), 'wl0', $$('#opmode_tri').val(), chValue);
	}
}

$$.setChannelList = function(channel_id, region_code, wlx, mode, chValue) {
	region_code= document.forms[0].WRegion.value;

	var ht160Region = new Array(2,11,4,6,10,21,20,22,23);
	var regionx = "region-"+region_code;
	var htx = 'HT20';

	if (!$$.channel_info)
	{
		$$.getJSON('channel_info.json', function(json) {
			$$.channel_info = json;
			channel = $$.channel_info.current_info.wl1;
			channel_a = $$.channel_info.current_info.wl2;
			channel_tri = $$.channel_info.current_info.wl0;
			$$.setChannelList(channel_id, region_code, wlx, mode, chValue);
		});
	}

	if( wlx != 'wl1' ) {
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
		if(wlx == 'wl1') {
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
        var index = cf.WRegion.value;
        var currentMode = cf.opmode_an.value;
        var chValue = cf.w_channel_an.value;
        $$.initChannels('wireless_channel_an', index, 'wl2', currentMode, chValue);
}

function setAChannel2(channel)
{
	var cf = document.forms[0];
	var index = cf.WRegion.value;
	var currentMode = cf.opmode_an.value;
	var option_array=document.getElementById("wireless_channel_an").options;
	var chValue = channel.value;
	var find_value = 0;
	var i, j=0, val;
	var tmp_array = ht40_array[index];
	var secChannel = document.getElementById("w_channel_an_sec");
	var secChannelTr = document.getElementById("sec_channel_tr");
	var secValue = secChannel.value;

	secChannelTr.style.display = "none";

	if( 9 == currentMode)
	{
		if(getTop(window).use_orbi_style_flag != "1" && (index == 4 || (getTop(window).support_second_dfs == 1 && index == 10))&& enable_ht160 === "1")
			secChannelTr.style.display = "";
	}

	channel.options.length = tmp_array.length+1;
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
	if((getTop(window).remove_5g_dfs_flag == 1 && index != 2 && index != 4 && index != 6 && index != 10 && index != 11 && index != 21 && index != 20 && index != 22 && index != 23) || (getTop(window).use_orbi_style_flag != "1" && (index == 23)) )
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

var tag1=0;//when the value is 1, not pop up "guest_tkip_300_150" for 5G
var tag2=0;//when the value is 1, not pop up "guest_tkip_aes_300_150" for 5G
var tag3=0//when the value is 1, not pop up "wlan_tkip_aes_300_150" for 5G
function check_wlan()
{
	//fix bug 29094
	tag1=0;
        tag2=0;
        tag3=0;

	var cf=document.forms[0];
	if(cf.w_channel_an.options.length > 0 && cf.w_channel_tri.options.length > 0)
	{
		dfs_count=0;
		if( check_dfs("an") == false || check_dfs("tri") == false)
			return false;

		if((cf.WRegion.value == 4 || (getTop(window).support_second_dfs == 1 && cf.WRegion.value == 10))&& enable_ht160 === "1" && check_dfs_sec() == false)
			return false;
	}
	
	var haven_wpe=0;
	var haven_alert_tkip=0;

	var wla1_ssid=document.forms[0].wla1ssid.value;
	var wlg1_ssid=document.forms[0].wlg1ssid.value;

	var opmode_value=cf.opmode.value;
        if(cf.opmode.value=="54")
                opmode_value = "1";
        else if(cf.opmode.value=="573.5" || cf.opmode.value=="286")
                opmode_value = "2";
        else if(cf.opmode.value=="1146" || cf.opmode.value=="573")
                opmode_value = "3";
	
	if(check_wlan_24g(cf, opmode_value) == false)
		return false;

	if(cf.enable_smart_connect.checked==false){
        	if(IsGameRouter() && cf.ssid.value==cf.ssid_an.value){
			alert("$ssid_not_allowed_same");
			return false;				
		}
	}
	
	cf.wl_apply_flag.value = "1";//bug 30924,if click the 'Apply' wl_apply_flag is '1',otherwise is '0'
	cf.qca_wireless_region.value = qca_region_arr[parseInt(cf.WRegion.value)];
	if ( wds_endis_fun == 1 )
	{
		if ( cf.w_channel.selectedIndex == 0 )
		{
			alert("$wds_auto_channel");
			return false;
		}
	}

	var flad_op = false;
	if(parent.bgn_mode3_value > 150 && cf.enable_coexistence.checked == true && (opmode_value!="1") && (opmode_value!="2"))
	{
	    flad_op = true;
	     alert(msg);
	}
	
	if(cf.security_type[1].checked == true)
	{
		if( wla_mode == '1' && an_mode1_value == 54 )
			alert("$wep_just_one_ssid_an");
		else if( guest_router_flag == 1 )
			alert("$wep_just_one_ssid"+" (2.4GHz).");
	}		

	if(check_wlan_an(cf) ==  false)
		return false;

	if(cf.ssid.value == wlg1_ssid || cf.ssid.value == wla1_ssid || ssid_an == wlg1_ssid || ssid_an == wla1_ssid)
	{
		alert("$ssid_not_allowed_same");
		return false;
	}

	if(check_wlan_tri(cf) ==  false)
		return false;


	if(parent.an_mode3_value > 150 && wla_disablecoext != 1 && (cf.opmode_an.value!="1") && (cf.opmode_an.value!="2"))
	{
	   if(flad_op != true)
	     alert(an_msg);
	
	}
	
	var channel_a=cf.w_channel_an.value;
	var country=cf.wl_WRegion.value;
	//transmit power control, according to the change of country, change values of wl_txctrl and wla_txctrl.
	wlan_txctrl(cf, wl_txctrl_web, wla_txctrl_web, channel_a, country);

	//bug 33156
	if( endis_wl_radio == 1 && cf.ssid_bc.checked == false ||
	(an_router_flag ==1 && endis_wla_radio == 1 && cf.ssid_bc_an.checked == false)
	|| (endis_wla_2nd_radio == 1 && cf.ssid_bc_tri.checked == false) )
	{
		if(!confirm("$wps_warning1"))
			return false;
		haven_wpe = 1;
	}

	if( endis_wl_radio == 1 && (cf.wl_hidden_sec_type.value == "2" || cf.wl_hidden_sec_type.value == "3") ||
	(an_router_flag ==1 && endis_wla_radio == 1 &&( cf.wla_hidden_sec_type.value == "2" || cf.wla_hidden_sec_type.value == "3" )) ||
	(endis_wla_2nd_radio == 1 &&( cf.wla_2nd_hidden_sec_type.value == "2" || cf.wla_2nd_hidden_sec_type.value == "3" )))
	{
		if(haven_wpe == 0)
		{
			if(!confirm("$wps_warning2"))
				return false;
		}
	}

	if( cf.wl_hidden_sec_type.value == "1" || (an_router_flag ==1 && cf.wla_hidden_sec_type.value == "1" ) || cf.wla_2nd_hidden_sec_type.value == "1")
	{
		if(!confirm("$wps_warning3"))
			return false;
	}

	if((endis_wl_radio == 1 && cf.wl_hidden_sec_type.value == "6" ) ||
	(an_router_flag ==1 && cf.wla_hidden_sec_type.value == "6" && endis_wla_radio == 1) ||
	(cf.wla_2nd_hidden_sec_type.value == "6" && endis_wla_2nd_radio == 1))
	{
		if(haven_wpe == 0)
		{
			if (!confirm("$wpae_or_wps"))
				return false;
		}
	}
	if(document.getElementsByName("WRegion")[0].value != wl_get_countryA && cf.ssid_bc_an.checked == true)
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
		if(cf.ofdma_5g2.checked == true)
			cf.hid_ofdma_5g2.value = "1";
		else
			cf.hid_ofdma_5g2.value = "0";
	}

	if(smart_connect_flag == "1") {
		if(cf.enable_smart_connect.checked)
			cf.hid_enable_smart_connect.value = "1";
	}
	
	cf.submit();
	return true;	
}

function check_wlan_24g(cf, opmode_value)
{
	var ssid_bgn = cf.ssid.value;
        if( check_ssid(ssid_bgn) == false )
                return false;

        cf.wl_ssid.value = ssid_bgn;
        cf.wl_WRegion.value =cf.WRegion.value;

        if(cf.ssid_bc.checked == true)
                cf.wl_enable_ssid_broadcast.value="1";
        else
                cf.wl_enable_ssid_broadcast.value="0";
        if(cf.enable_video_an.checked == true)
                cf.hidden_enable_video.value=1;
        else
                cf.hidden_enable_video.value=0;

        cf.wl_hidden_wlan_channel.value = cf.w_channel.value;
	if( cf.enable_coexistence.checked == true)
		cf.hid_enable_coexist.value="0";
	else
		cf.hid_enable_coexist.value="1";

	var channel_select_index = cf.w_channel_an.selectedIndex;

        if((opmode_value!="1") && (opmode_value!="54"))
        {
                if( $$('#security_wpa').prop('checked'))
                {
                        if ( !haven_alert_tkip )
                        {
                                if(confirm("$wlan_tkip_300_150") == false)
                                        return false;
                                haven_alert_tkip = 1;
                        }
                        cf.wl_hidden_wlan_mode.value = "1";
                }
		else if($$('#security_wpa2').prop('checked'))
		{
			if(guest_mode_flag == 1)
			{
				tag1 = 1;
				if(confirm("$guest_tkip_300_150") == false)
					return false;
				cf.wl_hidden_wlan_mode.value = "1";
			}
			else if(guest_mode_flag == 2)
			{
				tag2 = 1;
				if(confirm("$guest_tkip_aes_300_150") == false)
					return false;
				cf.wl_hidden_wlan_mode.value = opmode_value;
			}
			else
				cf.wl_hidden_wlan_mode.value = opmode_value;
		}
                else if($$('#security_auto').prop('checked'))
                {
                        if(tag3 == 0)
                        {
                                if(confirm("$wlan_tkip_aes_300_150") == false)
                                        return false;
                        }
                        cf.wl_hidden_wlan_mode.value = opmode_value;
                }
		else if($$('#security_wpa_enter').prop('checked'))
		{
			tag3 = 1;
			if(cf.wpae_mode.value == 'WPAE-TKIPAES')
			{
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
						return false;
					cf.wl_hidden_wlan_mode.value = "1";
				}
				else if(guest_mode_flag == 2)
				{
					tag2 = 1;
					if(confirm("$guest_tkip_aes_300_150") == false)
						return false;
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
					return false;
				cf.wl_hidden_wlan_mode.value = "1";
			}
			else
				cf.wl_hidden_wlan_mode.value = opmode_value;
		}
        }
	else
                cf.wl_hidden_wlan_mode.value = opmode_value;

        if($$('#security_disable').prop('checked'))
        {
                cf.wl_hidden_sec_type.value=1;
        }
        else
        {
                if($$('#security_wpa3').prop('checked')) //WPA3-Personal
                {
                        if( checkpsk128(cf.passphrase, cf.wl_sec_wpaphrase_len)== false)
                                return false;
			cf.wl_hidden_sec_type.value=7;
			cf.wl_hidden_wpa_psk.value = cf.passphrase.value;
                }
                else if(!$$('#security_wpa_enter').prop('checked'))
                {
                        if( checkpsk(cf.passphrase, cf.wl_sec_wpaphrase_len)== false)
                                return false;
                        cf.wl_hidden_wpa_psk.value = cf.passphrase.value;
                }

		if($$('#security_wpa_enter').prop('checked')) //WPA/WPA2 Enterprise
                {
                        var  bgn_ip = cf.radiusIPAddr1.value+'.'+ cf.radiusIPAddr2.value + '.' + cf.radiusIPAddr3.value + '.' + cf.radiusIPAddr4.value;
                        var bgn_port = parseInt(cf.textWpaeRadiusPort.value,10);
                        var bgn_secret = cf.textWpaeRadiusSecret;

                        if(check_radius_info(bgn_ip, bgn_port, bgn_secret) == false)
                                return false;

                        cf.radiusServerIP.value = bgn_ip;
                        cf.textWpaeRadiusPort.value=port_range_interception(cf.textWpaeRadiusPort.value);
                        cf.hidden_WpaeRadiusSecret.value = cf.textWpaeRadiusSecret.value;
                        cf.wl_hidden_sec_type.value=6;
                }

                if($$('#security_wpa').prop('checked')) //WPA-Personal(TKIP)
                        cf.wl_hidden_sec_type.value=3;
                else if($$('#security_wpa2').prop('checked')) //WPA2-Personal(AES)
                        cf.wl_hidden_sec_type.value=4;
                else if($$('#security_auto').prop('checked')) //WPA-Personal(TKIP)+WPA2-Personal(AES)
                        cf.wl_hidden_sec_type.value=5;
                else if($$('#security_auto_wpa3').prop('checked'))//WPA2-Personal(AES)+WPA3-Personal
                        cf.wl_hidden_sec_type.value=8;
        }
}

function check_wlan_an(cf)
{
	var ssid_an = cf.ssid_an.value;
	if( check_ssid(ssid_an) == false )
		return false;

	cf.wla_ssid.value = ssid_an;
	cf.wla_WRegion.value =cf.WRegion.value;

	if(cf.ssid_bc_an.checked == true)
                cf.wla_enable_ssid_broadcast.value="1";
        else
                cf.wla_enable_ssid_broadcast.value="0";
	if(cf.enable_video_an.checked == true)
		cf.hidden_enable_video.value=1;
	else
		cf.hidden_enable_video.value=0;

	cf.wla_hidden_wlan_channel.value = cf.w_channel_an.value;

	var channel_select_index = cf.w_channel_an.selectedIndex;
	if(cf.w_channel_an.options.length > 0)
	{
		if(cf.w_channel_an.options[channel_select_index].text.indexOf("DFS") != -1)
			cf.wla_hidden_sel_dfs.value = "1";
	}

	if((cf.opmode_an.value!="1"))
        {
                if( $$('#security_an_wpa').prop('checked'))
                {
                        if ( !haven_alert_tkip )
                        {
                                if(confirm("$wlan_tkip_300_150") == false)
                                        return false;
                                haven_alert_tkip = 1;
                        }
                        cf.wla_hidden_wlan_mode.value = "1";
                }
                else if($$('#security_an_auto').prop('checked'))
                {
                        if(tag3 == 0)
                        {
                                if(confirm("$wlan_tkip_aes_300_150") == false)
                                        return false;
                        }
                        cf.wla_hidden_wlan_mode.value = cf.opmode_an.value;
                }
		else if($$('#security_an_wpa_enter').prop('checked'))
		{
			if(cf.wpae_mode_an.value == 'WPAE-TKIPAES' && tag3 == 0)
			{
				if(confirm("$wlan_tkip_aes_300_150") == false)
					return false;
				tag3 = 1;
				cf.wla_hidden_wlan_mode.value = cf.opmode_an.value;
			}
			else
			{
				if(guest_mode_flag == 1)
				{
					tag1 = 1;
					if(confirm("$guest_tkip_300_150") == false)
						return false;
					cf.wla_hidden_wlan_mode.value = "1";
				}
				else if(guest_mode_flag == 2)
				{
					tag2 = 1;
					if(confirm("$guest_tkip_aes_300_150") == false)
						return false;
					cf.wla_hidden_wlan_mode.value = cf.opmode_an.value;
				}
				else
					cf.wla_hidden_wlan_mode.value = cf.opmode_an.value;
			}
		}
		else
                        cf.wla_hidden_wlan_mode.value = cf.opmode_an.value;
        }
        else
                cf.wla_hidden_wlan_mode.value = cf.opmode_an.value;

	if($$('#security_an_disable').prop('checked'))
        {
                cf.wla_hidden_sec_type.value=1;
        }
        else
        {
                if($$('#security_an_wpa3').prop('checked')) //WPA3-Personal
                {
                        if( checkpsk128(cf.passphrase_an, cf.wla_sec_wpaphrase_len)== false)
                                return false;
                        cf.wla_hidden_sec_type.value=7;
			cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value;
                }
                else if(!$$('#security_an_wpa_enter').prop('checked'))
                {
                        if( checkpsk(cf.passphrase_an, cf.wla_sec_wpaphrase_len)== false)
                                return false;
                        cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value;
                }

		if($$('#security_an_wpa_enter').prop('checked')) //WPA/WPA2 Enterprise
                {
                        var  an_ip = cf.radiusIPAddr1_an.value+'.'+ cf.radiusIPAddr2_an.value + '.' + cf.radiusIPAddr3_an.value + '.' + cf.radiusIPAddr4_an.value;
                        var an_port = parseInt(cf.textWpaeRadiusPort_an.value,10);
                        var an_secret = cf.textWpaeRadiusSecret_an;

                        if(check_radius_info(an_ip, an_port, an_secret) == false)
                                return false;

                        cf.radiusServerIP_a.value = an_ip;
                        cf.textWpaeRadiusPort_an.value=port_range_interception(cf.textWpaeRadiusPort_an.value);
                        cf.hidden_WpaeRadiusSecret_a.value = cf.textWpaeRadiusSecret_an.value;
                        cf.wla_hidden_sec_type.value=6;
                }

                if($$('#security_an_wpa').prop('checked')) //WPA-Personal(TKIP)
                        cf.wla_hidden_sec_type.value=3;
                else if($$('#security_an_wpa2').prop('checked')) //WPA2-Personal(AES)
                        cf.wla_hidden_sec_type.value=4;
                else if($$('#security_an_auto').prop('checked')) //WPA-Personal(TKIP)+WPA2-Personal(AES)
                        cf.wla_hidden_sec_type.value=5;
                else if($$('#security_an_auto_wpa3').prop('checked'))//WPA2-Personal(AES)+WPA3-Personal
                        cf.wla_hidden_sec_type.value=8;
        }
}

function check_wlan_tri(cf)
{
	var ssid_tri = cf.ssid_tri.value;
	if( check_ssid(ssid_tri) == false )
		return false;

	cf.wla_2nd_ssid.value = ssid_tri;
	cf.wla_2nd_WRegion.value =cf.WRegion.value;

	if(cf.ssid_bc_tri.checked == true)
		cf.wla_2nd_enable_ssid_broadcast.value="1";
	else
		cf.wla_2nd_enable_ssid_broadcast.value="0";

	cf.wla_2nd_hidden_wlan_channel.value = cf.w_channel_tri.value;

	var channel_select_index = cf.w_channel_tri.selectedIndex;
	if(cf.w_channel_tri.options.length > 0)
	{
		if(cf.w_channel_tri.options[channel_select_index].text.indexOf("DFS") != -1)
			cf.wla_2nd_hidden_sel_dfs.value = "1";
	}

	if((cf.opmode_tri.value!="1"))
	{
		if( $$('#security_tri_wpa').prop('checked'))
		{
			if ( !haven_alert_tkip )
			{
				if(confirm("$wlan_tkip_300_150") == false)
					return false;
				haven_alert_tkip = 1;
			}
			cf.wla_2nd_hidden_wlan_mode.value = "1";
		}
		else if($$('#security_tri_auto').prop('checked'))
		{
			if(tag3 == 0)
			{
				if(confirm("$wlan_tkip_aes_300_150") == false)
					return false;
			}
			cf.wla_2nd_hidden_wlan_mode.value = cf.opmode_tri.value;
		}
		else if($$('#security_tri_wpa_enter').prop('checked'))
		{
			if(cf.wpae_mode_tri.value == 'WPAE-TKIPAES' && tag3 == 0)
			{
				if(confirm("$wlan_tkip_aes_300_150") == false)
					return false;
				tag3 = 1;
				cf.wla_2nd_hidden_wlan_mode.value = cf.opmode_tri.value;
			}
			else
			{
				if(guest_mode_flag == 1)
				{
					tag1 = 1;
					if(confirm("$guest_tkip_300_150") == false)
						return false;
					cf.wla_2nd_hidden_wlan_mode.value = "1";
				}
				else if(guest_mode_flag == 2)
				{
					tag2 = 1;
					if(confirm("$guest_tkip_aes_300_150") == false)
						return false;
					cf.wla_2nd_hidden_wlan_mode.value = cf.opmode_tri.value;
				}
				else
					cf.wla_2nd_hidden_wlan_mode.value = cf.opmode_tri.value;
			}
		}
		else
			cf.wla_2nd_hidden_wlan_mode.value = cf.opmode_tri.value;
	}
	else
		cf.wla_2nd_hidden_wlan_mode.value = cf.opmode_tri.value;

	if($$('#security_tri_disable').prop('checked'))
	{
		cf.wla_2nd_hidden_sec_type.value=1;
	}
	else
	{
		if($$('#security_tri_wpa3').prop('checked')) //WPA3-Personal
		{
			if( checkpsk128(cf.passphrase_tri, cf.wla_2nd_sec_wpaphrase_len)== false)
				return false;
			cf.wla_2nd_hidden_sec_type.value=7;
			cf.wla_2nd_hidden_wpa_psk.value = cf.passphrase_tri.value;
		}
		else if(!$$('#security_tri_wpa_enter').prop('checked'))
		{
			if( checkpsk(cf.passphrase_tri, cf.wla_2nd_sec_wpaphrase_len)== false)
				return false;
			cf.wla_2nd_hidden_wpa_psk.value = cf.passphrase_tri.value;
		}

		if($$('#security_tri_wpa_enter').prop('checked')) //WPA/WPA2 Enterprise
		{
			var  tri_ip = cf.radiusIPAddr1_tri.value+'.'+ cf.radiusIPAddr2_tri.value + '.' + cf.radiusIPAddr3_tri.value + '.' + cf.radiusIPAddr4_tri.value;
			var tri_port = parseInt(cf.textWpaeRadiusPort_tri.value,10);
			var tri_secret = cf.textWpaeRadiusSecret_tri;

			if(check_radius_info(tri_ip, tri_port, tri_secret) == false)
				return false;

			cf.radiusServerIP_tri.value = tri_ip;
			cf.textWpaeRadiusPort_tri.value=port_range_interception(cf.textWpaeRadiusPort_tri.value);
			cf.hidden_WpaeRadiusSecret_tri.value = cf.textWpaeRadiusSecret_tri.value;
			cf.wla_2nd_hidden_sec_type.value=6;
		}

		if($$('#security_tri_wpa').prop('checked')) //WPA-Personal(TKIP)
			cf.wla_2nd_hidden_sec_type.value=3;
		else if($$('#security_tri_wpa2').prop('checked')) //WPA2-Personal(AES)
			cf.wla_2nd_hidden_sec_type.value=4;
		else if($$('#security_tri_auto').prop('checked')) //WPA-Personal(TKIP)+WPA2-Personal(AES)
			cf.wla_2nd_hidden_sec_type.value=5;
		else if($$('#security_tri_auto_wpa3').prop('checked'))//WPA2-Personal(AES)+WPA3-Personal
			cf.wla_2nd_hidden_sec_type.value=8;
	}
}

function check_ssid(c_ssid)
{
	if( c_ssid == "")
	{
		alert("$ssid_null");
		return false;
	}
	for(i=0;i<c_ssid.length;i++)
	{
		if(isValidChar_space(c_ssid.charCodeAt(i))==false)
		{
			alert("$ssid_not_allowed");
			return false;
		}
	}
}

function check_radius_info(radius_ip, radius_port, radius_secret)
{
	if(isSameSubNet(radius_ip,lanSubnet,lanIP,lanSubnet) == false && isSameSubNet(radius_ip,wanSubnet,wanIP,wanSubnet) == false )
	{
		alert("$diff_LanWan_subnet");
		return false;
	}

	if( radius_ip == "" || checkipaddr(radius_ip) == false )
	{
		alert("$invalid_ip");
		return false;
	}

	if( isSameIp(lanIP, radius_ip) == true )
	{
		alert("$invalid_ip");
		return false;
	}
	if( isSameIp(wanIP, radius_ip) == true )
	{
		alert("$conflicted_with_wanip");
		return false;
	}
	if( isNaN(radius_port) || radius_port < 1 || radius_port > 65535 )
	{
		alert("$radiusPort65535");
		return false;
	}
	if( radius_secret.value == "")
	{
		alert("$radiusSecret128");
		return false;
	}
	if( radius_secret.length > 128 )
	{
		alert("$radiusSecret128");
		return false;
	}
	for(i=0;i<radius_secret.value.length;i++)
	{
		if(isValidChar(radius_secret.value.charCodeAt(i))==false)
		{
			alert("$radiusSecret128");
			radius_secret.focus();
			return false;
		}
	}
}

function tri_router_guest_loadvalue()
{
	var form=document.forms[0];
	str_have_tri=getObj("hidden_tri").innerHTML;
	str_have_tri=str_have_tri.replace(/\`/g, "&#96;");
        getObj("hidden_tri").innerHTML='';
        getObj("have_tri").innerHTML=str_have_tri;
	//menu_color_change('guest_a');

	if( get_endis_guestNet_tri == 1 && endis_wla_radio_tri == 1)
		form.enable_bssid_tri.checked = true;
	else
		form.enable_bssid_tri.checked = false;
	if( get_endis_guestSSIDbro_tri == 1 )
		form.enable_ssid_bc_tri.checked = true;
	else
		form.enable_ssid_bc_tri.checked = false;

	if( get_enable_video_value_tri == 1 )
		form.enable_video_tri.checked = true;
	else
		form.enable_video_tri.checked = false;

	if( fbwifi_enable != '1' )
	{
		if(get_endis_allow_see_and_access_tri == 1)
			form.allow_access_tri.checked = true;
		else
			form.allow_access_tri.checked = false;
	}
	if(enable_ap_flag == 1 || fbwifi_enable == '1' || enable_extender_flag == '1' )
		setDisabled(true, form.allow_access_tri);

	setSecurity_tri(wla_2nd_sectype);
	if(wla_2nd_sectype==4 || wla_2nd_sectype==8)
		$$("#passphrase_tri").val(wla1_2nd_wpa2_psk);
	else if(wla_2nd_sectype==5)
		$$("#passphrase_tri").val(wla1_2nd_wpas_psk);
	else if(wla_2nd_sectype==7)
		$$("#passphrase_tri").val(wla1_2nd_wpa3_sae_psk);

	var sectype_tri=wla_2nd_sectype;

	if ( wla_wds_endis_fun_tri == '0' || endis_wla_radio_tri == '0' )
		setDisabled(false,form.security_type_tri[2],form.security_type_tri[3],form.security_type_tri[4],form.security_type_tri[5]);
	else
		setDisabled(true,form.security_type_tri[2],form.security_type_tri[3],form.security_type_tri[4],form.security_type_tri[5]);

	//Bug 19665, should not be both set to wep in main network and guest network.
	if(endis_wla_radio_tri==1 && wifi_tri_sectype==2)
		form.security_type_tri[1].disabled = true;

	if(parseInt(sectype_tri)>2)
		form.security_type_tri[parseInt(sectype_tri)-3].checked=true;
	else
		form.security_type_tri[parseInt(sectype_tri)-1].checked=true;
	if(wla_2nd_sectype==6)
	{
		form.wpae_mode_tri.value = get_wpae_mode_tri;
		if( get_radiusSerIp_tri != "" && get_radiusSerIp_tri != "0.0.0.0" )
		{
			radiusIPArray_tri = get_radiusSerIp_tri.split(".");
			form.radiusIPAddr1_tri.value = radiusIPArray_tri[0];
			form.radiusIPAddr2_tri.value = radiusIPArray_tri[1];
			form.radiusIPAddr3_tri.value = radiusIPArray_tri[2];
			form.radiusIPAddr4_tri.value = radiusIPArray_tri[3];
		}
		form.textWpaeRadiusPort_tri.value = get_radiusPort_tri;
	}
}

var guest_tag1=0;
function check_wlan_guest(type)
{
	var cf=document.forms[0];
	
	var ssid = document.forms[0].ssid.value;
	var ssid_an = document.forms[0].ssid_an.value;
	var ssid_tri = document.forms[0].ssid_tri.value;
	cf.s_gssid.value=ssid;
	cf.s_gssid_an.value=ssid_an;
	cf.s_gssid_tri.value=ssid_tri;

        if(ssid == wl_ssid || ssid == wla_ssid || ssid == wla_2nd_ssid)
        {
                alert("$ssid_not_allowed_same");
                return false;
        }
	if(ssid_an == wl_ssid || ssid_an == wla_ssid || ssid_an == wla_2nd_ssid)
        {
                alert("$ssid_not_allowed_same");
                return false;
        }
	if(ssid_tri == wl_ssid || ssid_tri == wla_ssid || ssid_tri == wla_2nd_ssid)
        {
                alert("$ssid_not_allowed_same");
                return false;
	}
	if(ssid == ssid_an || ssid == ssid_tri)
	{
		alert("$ssid_not_allowed_same");
		return false;
	}

	var haven_alert_tkip = 0;
	cf.wl_hidden_wlan_mode.value = wl_simple_mode;
	cf.wl_hidden_wlan_mode_an.value = wl_simple_mode_an;
	cf.wl_hidden_wlan_mode_tri.value = wl_simple_mode_tri;

	if(wireless_sectype=="2" && cf.enable_bssid.checked == true && cf.security_type[1].checked == true)// to fix bug 30740
	{
		if(wl_simple_mode_an == "1" && an_mode1_value == 54)
			alert("$wep_just_one_ssid_an");
		else
			alert("$wep_just_one_ssid"+" (2.4GHz).");
		return false;
	}

	if(cf.security_type[1].checked == true)
	{
		cf.hidden_guest_network_mode_flag.value=0;
		cf.wl_hidden_wlan_mode.value = "1";
		if( checkwep(cf)== false)
			return false;
		cf.hidden_sec_type.value=2;

		if(wl_simple_mode_an == "1" && an_mode1_value == 54)
			alert("$wep_just_one_ssid_an");
		else
			alert("$wep_just_one_ssid"+" (2.4GHz).");
	}

	if(check_wlan_guest_24g(cf) ==  false)
		return false;

	if(check_wlan_guest_an(cf) ==  false)
		return false;

	if(check_wlan_guest_tri(cf) ==  false)
		return false;

	cf.submit();
	return true;
}

function check_wlan_guest_24g(cf)
{
	var ssid_bgn = cf.ssid.value;
	if( check_ssid(ssid_bgn) == false )
		return false;

	if(cf.enable_bssid.checked == true)
		cf.hidden_enable_guestNet.value=1;
	else
		cf.hidden_enable_guestNet.value=0;

	if(cf.enable_ssid_bc.checked == true)
		cf.hidden_enable_ssidbro.value=1;
	else
		cf.hidden_enable_ssidbro.value=0;

	if(cf.allow_access.checked == true)
		cf.hidden_allow_see_and_access.value=1;
	else
		cf.hidden_allow_see_and_access.value=0;

	if($$('#security_disable').prop('checked'))
	{
		cf.hidden_sec_type.value=1;
	}
	else
	{
		if($$('#security_wpa3').prop('checked')) //WPA3-Personal
		{
			if( checkpsk128(cf.passphrase, cf.sec_wpaphrase_len)== false)
				return false;
			cf.hidden_sec_type.value=7;
			cf.hidden_guest_network_mode_flag.value=0;
			cf.hidden_wpa_psk.value = cf.passphrase.value;
		}
		else if(!$$('#security_wpa_enter').prop('checked'))
		{
			if( checkpsk(cf.passphrase, cf.sec_wpaphrase_len)== false)
				return false;
			cf.hidden_wpa_psk.value = cf.passphrase.value;
		}

		if($$('#security_wpa_enter').prop('checked')) //WPA/WPA2 Enterprise
		{
			if(cf.wpae_mode.value == 'WPAE-TKIPAES')
			{
				if(wl_simple_mode != "1")
				{
					if(guest_tag1 == 0)
					{
						if(confirm("$wlan_tkip_aes_300_150") == false)
						{
							cf.hidden_guest_network_mode_flag.value=0;
							return false;
						}
						guest_tag1 = 1;
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

			var guest_ip = cf.radiusIPAddr1.value+'.'+ cf.radiusIPAddr2.value + '.' + cf.radiusIPAddr3.value + '.' + cf.radiusIPAddr4.value;
			var guest_port = parseInt(cf.textWpaeRadiusPort.value,10);
			var guest_secret = cf.textWpaeRadiusSecret;

			if(check_radius_info(guest_ip, guest_port, guest_secret) == false)
				return false;

			cf.radiusServerIP.value = guest_ip;
			cf.textWpaeRadiusPort.value=port_range_interception(cf.textWpaeRadiusPort.value);
			cf.hidden_WpaeRadiusSecret.value = cf.textWpaeRadiusSecret.value;

			cf.hidden_sec_type.value=6;
		}

		if($$('#security_wpa2').prop('checked'))
		{
			cf.hidden_guest_network_mode_flag.value=0;
			cf.hidden_sec_type.value=4;
		}
		else if($$('#security_auto').prop('checked')) //WPA-Personal(TKIP)+WPA2-Personal(AES)
		{
			if(wl_simple_mode!= "1")
			{
				if(guest_tag1 == 0)
				{
					if(confirm("$wlan_tkip_aes_300_150") == false)
					{
						cf.hidden_guest_network_mode_flag.value=0;
						return false;
					}
				}
			}
			cf.hidden_guest_network_mode_flag.value=2;
			cf.wl_hidden_wlan_mode.value = wl_simple_mode;
			cf.hidden_sec_type.value=5;
		}
		else if($$('#security_auto_wpa3').prop('checked'))
		{

			cf.hidden_guest_network_mode_flag.value=2;
			cf.wl_hidden_wlan_mode.value = wl_simple_mode;

			cf.hidden_sec_type.value=8;
		}
        }
}

function check_wlan_guest_an(cf)
{
	var ssid_an = cf.ssid_an.value;
	if( check_ssid(ssid_an) == false )
		return false;

	if(cf.enable_bssid_an.checked == true)
		cf.hidden_enable_guestNet_an.value=1;
	else
		cf.hidden_enable_guestNet_an.value=0;

	if(cf.enable_ssid_bc_an.checked == true)
		cf.hidden_enable_ssidbro_an.value=1;
	else
		cf.hidden_enable_ssidbro_an.value=0;

	if(cf.enable_video_an.checked == true)
		cf.hidden_enable_video_an.value=1;
	else
		cf.hidden_enable_video_an.value=0;

	if(cf.allow_access_an.checked == true)
		cf.hidden_allow_see_and_access_an.value=1;
	else
		cf.hidden_allow_see_and_access_an.value=0;

	if($$('#security_an_disable').prop('checked'))
	{
		cf.hidden_sec_type_an.value=1;
	}
	else
	{
		if($$('#security_an_wpa3').prop('checked')) //WPA3-Personal
		{
			if( checkpsk128(cf.passphrase_an, cf.sec_wpaphrase_len_an)== false)
				return false;
			cf.hidden_sec_type_an.value=7;
			cf.hidden_guest_network_mode_flag_an.value=0;
			cf.hidden_wpa_psk_an.value = cf.passphrase_an.value;
		}
		else if(!$$('#security_an_wpa_enter').prop('checked'))
		{
			if( checkpsk(cf.passphrase_an, cf.sec_wpaphrase_len_an)== false)
				return false;
			cf.hidden_wpa_psk_an.value = cf.passphrase_an.value;
		}

		if($$('#security_an_wpa_enter').prop('checked')) //WPA/WPA2 Enterprise
		{
			if(cf.wpae_mode_an.value == 'WPAE-TKIPAES')
			{
				if(wl_simple_mode_an != "1")
				{
					if(guest_tag1 == 0)
					{
						if(confirm("$wlan_tkip_aes_300_150") == false)
						{
							cf.hidden_guest_network_mode_flag_an.value=0;
							return false;
						}
						guest_tag1 = 1;
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

			var guest_an_ip = cf.radiusIPAddr1_an.value+'.'+ cf.radiusIPAddr2_an.value + '.' + cf.radiusIPAddr3_an.value + '.' + cf.radiusIPAddr4_an.value;
			var guest_an_port = parseInt(cf.textWpaeRadiusPort_an.value,10);
			var guest_an_secret = cf.textWpaeRadiusSecret_an;

			if(check_radius_info(guest_an_ip, guest_an_port, guest_an_secret) == false)
				return false;

			cf.radiusServerIP_a.value = guest_an_ip;
			cf.textWpaeRadiusPort_an.value=port_range_interception(cf.textWpaeRadiusPort_an.value);
			cf.hidden_WpaeRadiusSecret_a.value = cf.textWpaeRadiusSecret_an.value;

			cf.hidden_sec_type_an.value=6;
		}

		if($$('#security_an_wpa2').prop('checked'))
		{
			cf.hidden_guest_network_mode_flag_an.value=0;
			cf.hidden_sec_type_an.value=4;
		}
		else if($$('#security_an_auto').prop('checked')) //WPA-Personal(TKIP)+WPA2-Personal(AES)
		{
			if(wl_simple_mode_an != "1")
			{
				if(guest_tag1 == 0)
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
		}
		else if($$('#security_an_auto_wpa3').prop('checked'))
		{

			cf.hidden_guest_network_mode_flag_an.value=2;
			cf.wl_hidden_wlan_mode_an.value = wl_simple_mode_an;

			cf.hidden_sec_type_an.value=8;
		}
	}
}

function check_wlan_guest_tri(cf)
{
	var ssid_tri = cf.ssid_tri.value;
	if( check_ssid(ssid_tri) == false )
		return false;

	if(cf.enable_bssid_tri.checked == true)
		cf.hidden_enable_guestNet_tri.value=1;
	else
		cf.hidden_enable_guestNet_tri.value=0;

	if(cf.enable_ssid_bc_tri.checked == true)
		cf.hidden_enable_ssidbro_tri.value=1;
	else
		cf.hidden_enable_ssidbro_tri.value=0;

	if(cf.enable_video_tri.checked == true)
		cf.hidden_enable_video_tri.value=1;
	else
		cf.hidden_enable_video_tri.value=0;

	if(cf.allow_access_tri.checked == true)
		cf.hidden_allow_see_and_access_tri.value=1;
	else
		cf.hidden_allow_see_and_access_tri.value=0;

	if($$('#security_tri_disable').prop('checked'))
	{
		cf.hidden_sec_type_tri.value=1;
	}
	else
	{
		if($$('#security_tri_wpa3').prop('checked')) //WPA3-Personal
		{
			if( checkpsk128(cf.passphrase_tri, cf.sec_wpaphrase_len_tri)== false)
				return false;
			cf.hidden_sec_type_tri.value=7;
			cf.hidden_guest_network_mode_flag_tri.value=0;
			cf.hidden_wpa_psk_tri.value = cf.passphrase_tri.value;
		}
		else if(!$$('#security_tri_wpa_enter').prop('checked'))
		{
			if( checkpsk(cf.passphrase_tri, cf.sec_wpaphrase_len_tri)== false)
				return false;
			cf.hidden_wpa_psk_tri.value = cf.passphrase_tri.value;
		}

		if($$('#security_tri_wpa_enter').prop('checked')) //WPA/WPA2 Enterprise
		{
			if(cf.wpae_mode_tri.value == 'WPAE-TKIPAES')
			{
				if(wl_simple_mode_tri != "1")
				{
					if(guest_tag1 == 0)
					{
						if(confirm("$wlan_tkip_aes_300_150") == false)
						{
							cf.hidden_guest_network_mode_flag_tri.value=0;
							return false;
						}
					}
				}
				cf.hidden_guest_network_mode_flag_tri.value=2;
				cf.wl_hidden_wlan_mode_tri.value = wl_simple_mode_tri;
				cf.textWpaeRadiusPort_tri.value=port_range_interception(cf.textWpaeRadiusPort_tri.value);
			}
			else
			{
				cf.hidden_guest_network_mode_flag_tri.value=0;
				cf.wl_hidden_wlan_mode_tri.value = wl_simple_mode_tri;
			}

			var guest_tri_ip = cf.radiusIPAddr1_tri.value+'.'+ cf.radiusIPAddr2_tri.value + '.' + cf.radiusIPAddr3_tri.value + '.' + cf.radiusIPAddr4_tri.value;
			var guest_tri_port = parseInt(cf.textWpaeRadiusPort_tri.value,10);
			var guest_tri_secret = cf.textWpaeRadiusSecret_tri;

			if(check_radius_info(guest_tri_ip, guest_tri_port, guest_tri_secret) == false)
				return false;

			cf.radiusServerIP_tri.value = guest_tri_ip;
			cf.textWpaeRadiusPort_tri.value=port_range_interception(cf.textWpaeRadiusPort_tri.value);
			cf.hidden_WpaeRadiusSecret_tri.value = cf.textWpaeRadiusSecret_tri.value;

			cf.hidden_sec_type_tri.value=6;
		}

		if($$('#security_tri_wpa2').prop('checked'))
		{
			cf.hidden_guest_network_mode_flag_tri.value=0;
			cf.hidden_sec_type_tri.value=4;
		}
		else if($$('#security_tri_auto').prop('checked')) //WPA-Personal(TKIP)+WPA2-Personal(AES)
		{
			if(wl_simple_mode_tri != "1")
			{
				if(guest_tag1 == 0)
				{
					if(confirm("$wlan_tkip_aes_300_150") == false)
					{
						cf.hidden_guest_network_mode_flag_tri.value=0;
						return false;
					}
				}
			}
			cf.hidden_guest_network_mode_flag_tri.value=2;
			cf.wl_hidden_wlan_mode_tri.value = wl_simple_mode_tri;
			cf.hidden_sec_type_tri.value=5;
		}
		else if($$('#security_tri_auto_wpa3').prop('checked'))                                                                {

			cf.hidden_guest_network_mode_flag_tri.value=2;
			cf.wl_hidden_wlan_mode_tri.value = wl_simple_mode_tri;

			cf.hidden_sec_type_tri.value=8;
		}
	}
}

function handle_smart_connect() {
	var cf = document.forms[0];

	handle_sync_input();
	sync_broadcast();

	if(!cf.enable_smart_connect.checked) {
		cf.hid_enable_smart_connect.value = "0";
		toggle_an_edit();
		toggle_tri_edit();
		if(cf.ssid.value.length > "28")
		{
			cf.ssid_tri.value = cf.ssid.value.substr(0,28)+"-5G2";
			if(cf.ssid.value.length > "29")
				cf.ssid_an.value = cf.ssid.value.substr(0,29)+"-5G";
		}
		else
		{
			cf.ssid_an.value = cf.ssid.value+"-5G";
			cf.ssid_tri.value = cf.ssid.value+"-5G2";
		}
		return;
	}

	alert("You currently have different WiFi settings for the 2.4GHz Radio and the 5GHz Radio. Once click Apply button, we will overwrite the settings for the 5GHz Radio with the 2.4GHz Radio settings.");

	cf.ssid_an.value = cf.ssid.value;
	cf.ssid_bc_an.checked = cf.ssid_bc.checked;
	cf.hid_enable_smart_connect.value = "1";

	cf.ssid_tri.value = cf.ssid.value;
        cf.ssid_bc_tri.checked = cf.ssid_bc.checked;

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

	if(wl_id != "security_wpa_enter") {
		cf[id_mapping(wl_id)].checked = true;
		cf[id_mapping(wl_id)].onclick();
		if(wl_id != "security_disable") {
			cf.passphrase_an.value = cf.passphrase.value;
		}
	}
	else {
		cf[id_mapping(wl_id)].checked = true;
		cf[id_mapping(wl_id)].onclick();
		var radius_ids = ["radius_ipaddress1", "radius_ipaddress2", "radius_ipaddress3", "radius_ipaddress4", "radius_port", "radius_secret"];
		for(var i=0; i<radius_ids.length; i++) {
			cf[id_mapping(radius_ids[i])].value = cf[radius_ids[i]].value;
		}
		cf.wpae_mode_an.options[cf.wpae_mode.selectedIndex].selected = true;
		wpaemode_an();
	}

	for(var i=0; i<cf.security_type_tri.length; i++) {
                if(cf.security_type_tri[i].checked) {
                        var wla_2nd_id = cf.security_type_tri[i].id;
                }
        }
        if(wl_id != "security_wpa_enter") {
                cf[id_mapping_tri(wl_id)].checked = true;
                cf[id_mapping_tri(wl_id)].onclick();
                if(wl_id != "security_disable") {
                        cf.passphrase_tri.value = cf.passphrase.value;
                }
        }
        else {
                cf[id_mapping_tri(wl_id)].checked = true;
                cf[id_mapping_tri(wl_id)].onclick();
                var radius_ids = ["radius_ipaddress1", "radius_ipaddress2", "radius_ipaddress3", "radius_ipaddress4", "radius_port", "radius_secret"];
                for(var i=0; i<radius_ids.length; i++) {
                        cf[id_mapping_tri(radius_ids[i])].value = cf[radius_ids[i]].value;
                }
                cf.wpae_mode_tri.options[cf.wpae_mode.selectedIndex].selected = true;
                wpaemode_tri();
        }

	toggle_an_edit();
	toggle_tri_edit();
}

function sync_broadcast() {
	var cf = document.forms[0];
	if(cf.enable_smart_connect.checked) {
		cf.ssid_bc.addEventListener("click", function() {
			cf.ssid_bc_an.checked = cf.ssid_bc.checked;
			cf.ssid_bc_tri.checked = cf.ssid_bc.checked;
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

function id_mapping_tri(origin) {
        if(origin.indexOf("security_tri_") == 0)
                return origin.replace("security_tri_", "security_");
        else if(origin.indexOf("security_") == 0)
                return origin.replace("security_", "security_tri_");
        else if(/^radius\w+_tri$$/g.test(origin))
                return origin.replace(/^(radius\w+)_tri$$/g, "$$1");
        else if(/^radius\w+$$/g.test(origin))
                return origin.replace(/^(radius\w+)$$/g, "$$1_tri");
        else //ssid, passphrase, wpae_mode, ssid_bc
                return (origin + "_tri");
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

	var target_tri = document.getElementById(id_mapping_tri(origin.id));
	if(origin.options != undefined) {
		target_tri.options[parseInt(origin.selectedIndex)].selected = true;
		target_tri.onchange();
	}
	else if(origin.type == "radio") {
		target_tri.checked = origin.checked;
		simulate_behavior(target_tri);
	}
	else {
                target_tri.value = origin.value;
                simulate_behavior(target_tri);
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

function toggle_tri_edit() {
        var cf = document.forms[0];
        var passphrase_tris = document.getElementsByName("passphrase_tri");
        var flag = !!cf.enable_smart_connect.checked;
        cf.ssid_tri.disabled = flag;
        cf.ssid_bc_tri.disabled = flag;
        for(var i=0; i<cf.security_type_tri.length; i++) {
                cf.security_type_tri[i].disabled = flag;
        }
        for(var i=0; i< passphrase_tris.length; i++)
                passphrase_tris[i].disabled = flag;
        var radius_ids = ["wpae_mode", "radius_ipaddress1", "radius_ipaddress2", "radius_ipaddress3", "radius_ipaddress4", "radius_port", "radius_secret"];
        for(var i=0; i<radius_ids.length; i++) {
                if(!!cf[id_mapping_tri(radius_ids[i])])
                        cf[id_mapping_tri(radius_ids[i])].disabled = flag;
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
}
