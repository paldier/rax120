function getTop(frameWindow)
{
	try
	{
		var parentWindow = frameWindow.parent;
		if (frameWindow.netgear_version !== undefined)
		{
			return frameWindow;
		}
		if (parentWindow === frameWindow)
		{
			return frameWindow;
		}
		if (parentWindow.origin !== frameWindow.origin)
		{
			return frameWindow;
		}

		return getTop(parentWindow);
	} catch (e)
	{
		return top;
	}
}

function IsGameRouter()
{
  	/*var result=0;
	if(window.location.href.indexOf("desktop")==-1)
		result = 0;
	else 
		result = 1;
	return result;*/
	return getTop(window).game_router_flag;
}
