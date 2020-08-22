function initPage()
{
	/*//head text
	var head_tag = document.getElementsByTagName("h1");
	var head_text = document.createTextNode(bh_apply_connection);
	head_tag[0].appendChild(head_text);
	
	//paragraph
	var paragraph = document.getElementsByTagName("p");
	
	var paragraph_text = document.createTextNode(bh_plz_waite_apply_connection);
	paragraph[0].appendChild(paragraph_text);*/

	//show Fireware Version
	showFirmVersion("none");

	loadValue();
}

function loadValue()
{
   if(getTop(window).dsl_enable_flag == 0){
	if( apmode_flag == "1" && ap_mode == "1" && ap_mode_detection_flag == "1" )
	{
		if(ping_result == "success")
			this.location.href = "BRS_security.html";
		else if(ping_result == "failed")
			this.location.href = "BRS_05_networkIssue.html";
	}
	if(wan_proto == "3g") //3g
	{
		if(ping_result == "success")
			this.location.href = "BRS_security.html";
		else if(ping_result == "failed")
			this.location.href = "BRS_05_networkIssue.html";
	}
	else if(select_basic == "0" && select_type == "0")//pppoe
	{
		if(ping_result == "failed")
			this.location.href = "BRS_03A_B_pppoe_reenter.html";
		else if(ping_result == "success")
			this.location.href = "BRS_04_applySettings_wget.html";
	}
	else if(select_basic == "0" && select_type == "1")//pptp
	{
		if(ping_result == "failed")
			this.location.href = "BRS_03A_C_pptp_reenter.html";
		else if(ping_result == "success")
			this.location.href = "BRS_04_applySettings_wget.html";
	}
	else if(select_basic == "0" && select_type == "4")//l2tp
	{
		if(ping_result == "failed")
			this.location.href = "BRS_03A_F_l2tp_reenter.html";
		else if(ping_result == "success")
			this.location.href = "BRS_04_applySettings_wget.html";
	}
	else if((top.support_orange_flag ==1 || top.support_singapore_isp_flag == 1 || top.support_malaysia_isp_flag == 1 || top.support_spain_isp_flag == 1 || top.support_malaysia_pppoe_isp_flag == 1) && select_basic == "0" && (select_type == "6" || select_type == "7" || select_type == "8" || select_type == "9" || select_type == "10" || select_type == "11" || select_type == "12" || select_type == "13" || select_type == "14" || select_type == "15"))
		{
			if(ping_result == "success")
               	        	this.location.href = "BRS_success.html";
              		else if(ping_result == "failed")
               	        	this.location.href = "BRS_05_networkIssue.html";
	}
	else
	{
		if(ping_result == "success")
			this.location.href = "BRS_security.html";
		else if(ping_result == "failed")
			this.location.href = "BRS_05_networkIssue.html";
	}
    }else if(getTop(window).dsl_enable_flag == 1)
    {
	if( debug == "1")
		return;
	if(((curr_country == "Italy" && curr_isp =="Fastweb") || (curr_country == "Switzerland" && curr_isp =="Swisscom") || (curr_country == "Switzerland" && curr_isp =="Swisscom All IP(with phone)")) && (wan_type == "vdsl"))
	{
		this.location.href = "BRS_01_obtain_ip_lift_hijack.html";
	}else{
		//alert("04_applySettings_ping ip:" + ping_ip_result + " gateway:" + ping_gate_result + "  "+ping_result);
		if(ping_result == "success"){
			if(ping_ip_result == "success" && ping_gate_result == "success"){
				this.location.href = "BRS_log11_ping_success.html";
			}
			else if(ping_ip_result == "success" && ping_gate_result == "failed")
				this.location.href = "BRS_log11_ping_successi_ip_success_gate_fail.html";
			else if(ping_ip_result == "failed" && ping_gate_result == "success")
				this.location.href = "BRS_log11_ping_success_ip_fail_gate_success.html";
			else
				this.location.href = "BRS_log11_ping_success_ip_fail.html";
		}
		else{
			if(ping_ip_result == "success" && ping_gate_result == "success")
				this.location.href = "BRS_log11_ping_fail.html";
			else if(ping_ip_result == "success" && ping_gate_result == "failed")
				this.location.href = "BRS_log11_ping_fail_ip_sucess_gate_fail.html";
			else if(ping_ip_result == "failed" && ping_gate_result == "success")
				this.location.href = "BRS_log11_ping_faili_ip_fail_gate_success.html";
			else
				this.location.href = "BRS_log11_ping_fail_ip_fail.html";
		   }
		}
   }
}
addLoadEvent(initPage);
