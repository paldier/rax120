function syncStatus(pre, pre1, pre2)
{
	cf=document.forms[0];
	if(pre.checked == true)
	{
		if(pre1 =="wl_" || pre2 == "wl_")
			cf.wsc_config.checked=true;
		if(pre1 =="wla_" || pre2 == "wla_")
			cf.wla_wsc_config.checked=true;
		if(pre1 =="wla_2nd_" || pre2 == "wla_2nd_")
			cf.wla_2nd_wsc_config.checked=true;
	}
	else
	{
		if(pre1 =="wl_" || pre2 == "wl_")
			cf.wsc_config.checked=false;
		if(pre1 =="wla_" || pre2 == "wla_")
			cf.wla_wsc_config.checked=false;
		if(pre1 =="wla_2nd_" || pre2 == "wla_2nd_")
			cf.wla_2nd_wsc_config.checked=false;
	}
}

function check_static_ip_mask_gtw()
{
	form=document.forms[0];
	form.hid_ap_ipaddr.value=form.WPethr1.value+'.'+form.WPethr2.value+'.'+form.WPethr3.value+'.'+form.WPethr4.value;
    form.hid_ap_subnet.value=form.WMask1.value+'.'+form.WMask2.value+'.'+form.WMask3.value+'.'+form.WMask4.value;
    form.hid_ap_gateway.value=form.WGateway1.value+'.'+form.WGateway2.value+'.'+form.WGateway3.value+'.'+form.WGateway4.value;
	
	if(checkipaddr(form.hid_ap_ipaddr.value)==false || is_sub_or_broad(form.hid_ap_ipaddr.value, form.hid_ap_ipaddr.value, form.hid_ap_subnet.value) == false)
	{
		alert("$invalid_ip");
		return false;
	}
	if(checksubnet(form.hid_ap_subnet.value, 0)==false)
	{
		alert("$invalid_mask");
		return false;
	}
	if(checkgateway(form.hid_ap_gateway.value)==false || is_sub_or_broad( form.hid_ap_gateway.value, form.hid_ap_gateway.value, form.hid_ap_subnet.value) == false)
	{
		alert("$invalid_gateway");
		return false;
	}
	if(isGateway(form.hid_ap_ipaddr.value,form.hid_ap_subnet.value,form.hid_ap_gateway.value)==false)
	{
		alert("$invalid_gateway");
		return false;		
	}
	if( isSameIp(form.hid_ap_ipaddr.value, form.hid_ap_gateway.value) == true )
	{
		alert("$invalid_gateway");
		return false;
	}
	if(isSameSubNet(form.hid_ap_ipaddr.value,form.hid_ap_subnet.value,form.hid_ap_gateway.value,form.hid_ap_subnet.value) == false)
	{
		alert("$same_subnet_ip_gtw");
		return false;
	}
	return true;
}

function check_static_dns( wan_assign )
{
	var form=document.forms[0];
	form.ap_dnsaddr1.value=form.DAddr1.value+'.'+form.DAddr2.value+'.'+form.DAddr3.value+'.'+form.DAddr4.value;
    form.ap_dnsaddr2.value=form.PDAddr1.value+'.'+form.PDAddr2.value+'.'+form.PDAddr3.value+'.'+form.PDAddr4.value;
	form.hid_ap_ipaddr.value=form.WPethr1.value+'.'+form.WPethr2.value+'.'+form.WPethr3.value+'.'+form.WPethr4.value;

	if(form.ap_dnsaddr1.value=="...")
		form.ap_dnsaddr1.value="";

	if(form.ap_dnsaddr2.value=="...")
		form.ap_dnsaddr2.value="";
	if( check_DNS(form.ap_dnsaddr1.value,form.ap_dnsaddr2.value,wan_assign,form.hid_ap_ipaddr.value))
		return true;
	else
		return false;
}

function wlan_txctrl_tri(form, tx_power_ctrl_tri, wla_2nd_channel, country)
{
	if((netgear_region == "WW" || netgear_region == "") && (country != "3" && country != "10"))
	{
		if(tx_power_ctrl_tri == "100")
			form.wla_2nd_tx_ctrl.value="44";
		if(tx_power_ctrl_tri == "75")
			form.wla_2nd_tx_ctrl.value="15.5";
		else if(tx_power_ctrl_tri == "50")
			form.wla_2nd_tx_ctrl.value="10.5";
		else if(tx_power_ctrl_tri == "25")
			form.wla_2nd_tx_ctrl.value="5";
	}
	else
	{
		if(tx_power_ctrl_tri == "100")
			form.wla_2nd_tx_ctrl.value="44";
		if(tx_power_ctrl_tri == "75")
			form.wla_2nd_tx_ctrl.value="15.5";
		else if(tx_power_ctrl_tri == "50")
			form.wla_2nd_tx_ctrl.value="10.5";
		else if(tx_power_ctrl_tri == "25")
			form.wla_2nd_tx_ctrl.value="5";
	}

	form.wla_2nd_tx_ctrl.value = ( parseFloat(form.wla_2nd_tx_ctrl.value) + 6 ) * 2;
	if(tx_power_ctrl_tri == "super_wifi"){
		form.hid_super_wifi_tri.value = "1";
	}
}

function checkadv(form)
{
	if(form.rts.value == "" || form.rts_an.value == "" || form.rts_tri.value == "")
	{	
		alert("$rts_range");
		return false;
	}
        if(!(form.rts.value > 0 && form.rts.value <= 2347) || !(form.rts_an.value > 0 && form.rts_an.value <= 2347) || !(form.rts_tri.value > 0 && form.rts_tri.value <= 2347))
        {
                alert("$rts_range");
                return false;
        }

	if(form.frag.value == "" || form.frag_an.value == "" || form.frag_tri.value == "")
	{
		alert("$fragmentation_range");
		return false;
	}
	if(!(form.frag.value > 255 && form.frag.value < 2347) || !(form.frag_an.value > 255 && form.frag_an.value < 2347) || !(form.frag_tri.value > 255 && form.frag_tri.value < 2347))
	{
		alert("$fragmentation_range");
		return false;
	}

        if(form.wmm_enable.checked == true)
               	form.wladv_endis_wmm.value = "1";
        else
               	form.wladv_endis_wmm.value = "0";
        if(form.wmm_enable_a.checked == true)
                form.wladv_endis_wmm_a.value = "1";
        else
                form.wladv_endis_wmm_a.value = "0";
	if(form.wmm_enable_tri.checked == true)
		form.wladv_endis_wmm_tri.value = "1";
	else
		form.wladv_endis_wmm_tri.value = "0";

	if(form.enable_shortpreamble.value == "Long Preamble")
		form.wl_enable_shortpreamble.value = "1";
	else if(form.enable_shortpreamble.value == "Short Preamble")
                form.wl_enable_shortpreamble.value = "2";
	else if(form.enable_shortpreamble.value == "automatic")
		form.wl_enable_shortpreamble.value = "0";
        if(form.enable_shortpreamble_an.value == "Long Preamble")
                form.wla_enable_shortpreamble.value = "1";
        else if(form.enable_shortpreamble_an.value == "Short Preamble")
                form.wla_enable_shortpreamble.value = "2";
        else if(form.enable_shortpreamble_an.value == "automatic")
                form.wla_enable_shortpreamble.value = "0";

	if(form.enable_shortpreamble_tri.value == "Long Preamble")
		form.wla_2nd_enable_shortpreamble.value = "1";
	else if(form.enable_shortpreamble_tri.value == "Short Preamble")
		form.wla_2nd_enable_shortpreamble.value = "2";
	else if(form.enable_shortpreamble_tri.value == "automatic")
		form.wla_2nd_enable_shortpreamble.value = "0";
	//transmit power control
	wlan_txctrl(form, form.tx_power_ctrl.value, form.tx_power_ctrl_an.value, wla_channel, country);
	wlan_txctrl_tri(form, form.tx_power_ctrl_tri.value, wla_2nd_channel, country);

	if(form.enable_ap.checked == true)
		form.wl_enable_router.value="1";
	else
		form.wl_enable_router.value="0";
	if(form.enable_ap_an.checked == true)
                form.wla_enable_router.value="1";
        else
                form.wla_enable_router.value="0";
	if(form.enable_ap_tri.checked == true)
		form.wla_2nd_enable_router.value="1";
	else
		form.wla_2nd_enable_router.value="0";

	if( form.enable_coexistence.checked == true)
		form.hid_enable_coexist.value="0";
	else
		form.hid_enable_coexist.value="1";

	if(form.pin_disable.checked == true )
		form.endis_pin.value="0";
	else
		form.endis_pin.value="1";
	if(form.prevent_pin_compromise.checked == true)
		form.hid_protect_enable.value="1";
	else
		form.hid_protect_enable.value="0";
	if(form.pin_attack_count.value == "")
		form.pin_attack_count.value = "3";
	form.pin_attack_count.value = parseInt(form.pin_attack_count.value, 10);

	if(form.wsc_config.checked == true)
		form.endis_wsc_config.value="5";
	else
		form.endis_wsc_config.value="1";
	if(form.wla_wsc_config.checked == true)
		form.endis_wsc_config_a.value="5";
	else
		form.endis_wsc_config_a.value="1";
	if(form.wla_2nd_wsc_config.checked == true)
                form.endis_wsc_config_tri.value="5";
        else
                form.endis_wsc_config_tri.value="1";

	if(form.enable_implicit_beamforming.checked ==  true)
		form.hid_wla_beamforming.value = "1";
	else
		form.hid_wla_beamforming.value = "0";
	form.hid_wla_mu_mimo.value = form.enable_mu.checked? "1": "0";
	form.hid_wla_2nd_mu_mimo.value = form.enable_mu.checked? "1": "0";
	if(form.enable_mu.checked == true)
	{
		form.hid_wla_bf.value = "1";
		form.hid_wla_2nd_bf.value = "1";
	}
	else{
		if(form.enable_tx_beamforming.checked == true)
		{
			form.hid_wla_bf.value = "1";
			form.hid_wla_2nd_bf.value = "1";
		}
		else
		{
			form.hid_wla_bf.value = "0";
			form.hid_wla_2nd_bf.value = "0";
		}
	}
	if(form.enable_atf.checked == true)
		form.hid_enable_atf.value = "1";
	else
		form.hid_enable_atf.value = "0";
	if(form.enable_ht160.checked == true)
		form.hid_wla_ht160.value = "1";
	else
		form.hid_wla_ht160.value = "0";
	if(form.enable_ht160.checked == true)
		form.hid_wla_2nd_ht160.value = "1";
	else
		form.hid_wla_2nd_ht160.value = "0";
	if(form.enable_11k.checked == true)
		form.hid_11k.value = "1";
	else
		form.hid_11k.value = "0";
	if(form.disable_pmf.checked == true)
		form.hid_disable_pmf.value = "1";
	else
		form.hid_disable_pmf.value = "0";

	if ( old_endis_wl_radio =="0" && form.wl_enable_router.value == "0")
		form.wds_change_ip.value="still_lanip"
	else if( old_endis_wl_radio =="0" && form.wl_enable_router.value == "1" )
	{
		if ( old_wds_endis_fun == "1" &&  old_wds_repeater_basic == "0" )
		{
			if(pr_wds_support_wpa !=1 && (security_mode=="3" ||  security_mode=="4" || security_mode == "5"))
			{
				if(!confirm("$wds_not_wpa"))
					return false;
				else
				{
					location.href="WLG_wireless.htm";
					return false;
				}
			}
			else if( security_mode == "6")
			{
				if(!confirm("$wds_not_Enterprise"))
					return false;
				else
				{
					location.href="WLG_wireless.htm";
					return false;
				}
			}
			else
			{
				getTop(window).enable_action=0;
				form.wds_change_ip.value="to_repeatip";
			}
		}
		else
			form.wds_change_ip.value="still_lanip"	
	}
	else if ( old_endis_wl_radio =="1" && form.wl_enable_router.value == "0")
	{
		if ( old_wds_endis_fun == "1" &&  old_wds_repeater_basic == "0" )
		{
			getTop(window).enable_action=0;
			form.wds_change_ip.value="to_lanip";
		}
		else
			form.wds_change_ip.value="still_lanip";
	}
	else
	{
		if ( old_wds_endis_fun == "1" &&  old_wds_repeater_basic == "0" )
			form.wds_change_ip.value="still_repeatip"
		else
			form.wds_change_ip.value="still_lanip"	
	}
	form.rts.value=port_range_interception(form.rts.value);
	form.rts_an.value=port_range_interception(form.rts_an.value);
	form.rts_tri.value=port_range_interception(form.rts_tri.value);
	form.frag.value=port_range_interception(form.frag.value);
	form.wl_rts.value = form.rts.value;
	form.wla_rts.value = form.rts_an.value;
	form.wla_2nd_rts.value = form.rts_tri.value;
	form.wl_frag.value = form.frag.value;
	if(getTop(window).fragment_an_flag == 1){
		form.frag_an.value=port_range_interception(form.frag_an.value);
		form.wla_frag.value = form.frag_an.value;
		form.frag_tri.value=port_range_interception(form.frag_tri.value);
		form.wla_2nd_frag.value = form.frag_tri.value;
	}
	
	//wireless schedule
	if(form.wifi_onoff.checked)
		form.wladv_enable_schedule.value = "1";
	else
		form.wladv_enable_schedule.value = "0";

	if(form.wifi_onoff_an.checked)
		form.wladv_enable_schedule_a.value = "1";
	else
		form.wladv_enable_schedule_a.value = "0";
	
	if(form.wifi_onoff_tri.checked)
		form.wladv_enable_schedule_tri.value = "1";
	else
		form.wladv_enable_schedule_tri.value = "0";
	
	if(form.tx_power_ctrl_an.value == "super_wifi")
		form.tx_power_ctrl_an.value = wla_tpscale;
	if(form.tx_power_ctrl_tri.value == "super_wifi")
		form.tx_power_ctrl_tri.value = wla_2nd_tpscale;
	if(form.tx_power_ctrl.value == "super_wifi")
                form.tx_power_ctrl.value = wl_tpscale;
	form.submit();
	//return true;
}
