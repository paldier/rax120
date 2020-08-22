function goto_next(cf, wl_login)
{
	if(cf.choose[0].checked)
	{	
		var ssid_bgn = document.getElementById("ESSID").value;
		var ssid_an = document.getElementById("ESSID_an").value;

		if(!brs_check_ssid(ssid_bgn) || !brs_check_ssid(ssid_an))
			return false;
		
		
		if(checkpsk(cf.passphrase_an, cf.wla_sec_wpaphrase_len)== false)
			return;
		if( checkpsk(cf.passphrase, cf.wl_sec_wpaphrase_len)== false)
			return;
		if( ad_router_flag == "1" && !validate_ad(cf))
			return;
		
		cf.wl_hidden_wpa_psk.value = cf.passphrase.value;
		cf.wla_hidden_wpa_psk.value = cf.passphrase_an.value;
		cf.method="post";
		if(wl_login == 1)
			cf.action="/apply.cgi?/BRS_ap_detect_01_04.html timestamp="+ts;
		else
			cf.action="/apply.cgi?/BRS_01_checkNet_ping.html timestamp="+ts;
		cf.submit_flag.value="wl_ssid_password";
	
		cf.submit();
	}
	else if(cf.choose[1].checked)
		this.location.href="BRS_01_checkNet_ping.html";
	else
	{
		alert(bh_warning_info);
		return false;
	}	
}

function goback()
{	
	var pre_url = document.referrer;
	var pre_url_info = pre_url.split("/");
	
	if(pre_url_info[3] == "BRS_ap_detect_01_router_01.html")
		this.location.href = "BRS_ap_detect_01_router_01.html";
	else if(pre_url_info[3] == "BRS_00_02_ap_select.html")
		this.location.href = "BRS_00_02_ap_select.html";
	else if(typeof top.brs_pre_url != "undefined")
		this.location.href = top.brs_pre_url;
	else
		return false;
}

