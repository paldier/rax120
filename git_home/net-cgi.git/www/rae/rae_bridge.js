function check_static_ip_mask_gtw()
{
	form=document.forms[0];
	form.hid_bridge_ipaddr.value=form.SPethr1.value+'.'+form.SPethr2.value+'.'+form.SPethr3.value+'.'+form.SPethr4.value;
    form.hid_bridge_subnet.value=form.SMask1.value+'.'+form.SMask2.value+'.'+form.SMask3.value+'.'+form.SMask4.value;
    form.hid_bridge_gateway.value=form.SGateway1.value+'.'+form.SGateway2.value+'.'+form.SGateway3.value+'.'+form.SGateway4.value;
	
	if(checkipaddr(form.hid_bridge_ipaddr.value)==false || is_sub_or_broad(form.hid_bridge_ipaddr.value, form.hid_bridge_ipaddr.value, form.hid_bridge_subnet.value) == false)
	{
		alert("$invalid_ip");
		return false;
	}
	if(checksubnet(form.hid_bridge_subnet.value, 0)==false)
	{
		alert("$invalid_mask");
		return false;
	}
	if(checkgateway(form.hid_bridge_gateway.value)==false)
	{
		alert("$invalid_gateway");
		return false;
	}
	if(isGateway(form.hid_bridge_ipaddr.value,form.hid_bridge_subnet.value,form.hid_bridge_gateway.value)==false)
	{
		alert("$invalid_gateway");
		return false;		
	}
	if( isSameIp(form.hid_bridge_ipaddr.value, form.hid_bridge_gateway.value) == true )
	{
		alert("$invalid_gateway");
		return false;
	}
	if(isSameSubNet(form.hid_bridge_ipaddr.value,form.hid_bridge_subnet.value,form.hid_bridge_gateway.value,form.hid_bridge_subnet.value) == false)
	{
		alert("$same_subnet_ip_gtw");
		return false;
	}
	return true;
}

function check_static_dns( wan_assign )
{
	var form=document.forms[0];
	form.bridge_dnsaddr1.value=form.SDAddr1.value+'.'+form.SDAddr2.value+'.'+form.SDAddr3.value+'.'+form.SDAddr4.value;
    form.bridge_dnsaddr2.value=form.SPDAddr1.value+'.'+form.SPDAddr2.value+'.'+form.SPDAddr3.value+'.'+form.SPDAddr4.value;
	form.hid_bridge_ipaddr.value=form.SPethr1.value+'.'+form.SPethr2.value+'.'+form.SPethr3.value+'.'+form.SPethr4.value;

	if(form.bridge_dnsaddr1.value=="...")
		form.bridge_dnsaddr1.value="";

	if(form.bridge_dnsaddr2.value=="...")
		form.bridge_dnsaddr2.value="";
	if( check_DNS(form.bridge_dnsaddr1.value,form.bridge_dnsaddr2.value,wan_assign,form.hid_bridge_ipaddr.value))
		return true;
	else
		return false;
}

function checkbridge(form) //for bug 30286
{
	if(form.dyn_bridge_get_ip.checked == false)
	{
		if(check_static_ip_mask_gtw()==false)
			return false;
		form.hid_dyn_ip.value="0";
	}
	else
		form.hid_dyn_ip.value="1";
	if(form.dyn_dns.checked == false)
	{
		if(check_static_dns(form.dyn_dns.checked == true) == false)
			return false;
		form.hid_dyn_dns.value="0";
	}
	else
		form.hid_dyn_dns.value="1";
	form.submit();
}


