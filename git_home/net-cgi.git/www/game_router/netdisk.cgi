<% http_header("style/form2.css","style/formframe_wait.css") %>
<body onLoad=loadvalue(); bgcolor="black">
<style>
.err_block{background-color:#F7D9D7;width:450px;height:100px; margin-left:150px;margin-top:150px}
.err_msg{padding-top:40px; color:#CA5137;font-size:16;}
</style>
<script>
var cloud_url="<% cat_file("/etc/drive_login_link") %>";
var local_url="<% cfg_get("cloud_url") %>";

function goto_newurl()
{
	var newurl= local_url+'netdisk_scan.htm';
	top.location.href=newurl;
}

function try_again()
{
	top.location.href=cloud_url;
}

function loadvalue()
{
	var hrefstr = window.location.href;
	var pos = hrefstr.indexOf("code=");
	if( hrefstr.indexOf("access_denied") > 0){
		try_again();
	}
	else if(pos > 0)
	{
		document.getElementById("error_div").style.display="none";
		document.getElementById("auth_div").style.display="";
		setTimeout("goto_newurl();",3000);
	}
	else
	{
		document.getElementById("error_div").style.display="";
		document.getElementById("auth_div").style.display="none";
		setTimeout("try_again();",3000);
	}
}
</script>

<div id="error_div" style="display:none">
<div class="big-corner-all err_block" align="center">
<div class="err_msg">Oops, we could not find an account with the email and password you've entered.</div>
</div>
</div>

<div id="auth_div" style="display:none">
<div id="pls_wait_div" style="width:100%;height:500px;">
<div>$amz_auth
<div class="loader">
<svg class="spinner" width="28px" height="28px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
<circle class="path" fill="none" stroke-width="5" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
</svg></div></div></div>
</div>
</body>
</html>
