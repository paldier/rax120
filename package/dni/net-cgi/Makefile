# 
# Copyright (C) 2009 OpenWrt.org
#

include $(TOPDIR)/rules.mk

PKG_NAME:=net-cgi
PKG_RELEASE:=1
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

WEB_PATH:=www

include $(INCLUDE_DIR)/package.mk

PKG_GIT_TREEISH:=net-cgi-dni523

define Package/net-cgi
  SECTION:=utils
  CATEGORY:=DNI Packages
  DEPENDS:=libcurl +libiconv-full +datalib +libpthread +ntgrcrypt +d2 +dil +dniutil
  TITLE:=The mini_httpd CGI interface
endef

define Package/net-cgi/config
  source "$(SOURCE)/Config.in"
endef

define Build/Prepare
	$(CP) $(GIT_HOME)/net-cgi.git/* $(PKG_BUILD_DIR)/
endef


define Build/Configure
endef
define Package/net-cgi/install
	$(MAKE) -C $(PKG_BUILD_DIR) install INS_DIR_PRE=$(1)

	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/support_soap_list $(TOPDIR)/bin/

	$(LN) /tmp/openvpn/windows.zip $(1)/$(WEB_PATH)/windows.zip
	$(LN) /tmp/openvpn/nonwindows.zip $(1)/$(WEB_PATH)/nonwindows.zip
	$(LN) /tmp/openvpn/smart_phone.zip $(1)/$(WEB_PATH)/smart_phone.zip
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/src/* $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/inetd.init $(1)/etc/init.d/inetd
endef

$(eval $(call BuildPackage,net-cgi))
