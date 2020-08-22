# 
#  Copyright (C) 2007-2008 Delta Networks Inc.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=net-wall
PKG_RELEASE:=2
PKG_BUILD_DEPENDS:=datalib
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

PKG_GIT_TREEISH:=net-wall-v2.0-dni97

include $(INCLUDE_DIR)/package.mk

define Package/net-wall
  SECTION:=utils
  CATEGORY:=DNI Packages
  DEPENDS:=+datalib
  TITLE:=Mini Firewall for Embedded Router.
endef

define Build/Prepare
	$(CP) $(GIT_HOME)/net-wall.git/* $(PKG_BUILD_DIR)/
endef

define Build/Compile
endef

define Package/net-wall/install
	install -d -m0755 $(1)/usr/sbin
	install -m0755 $(PKG_BUILD_DIR)/net-wall $(1)/usr/sbin/
	install -d -m0755 $(1)/etc
	$(CP) ./files/l7_patten.dat $(1)/etc
	$(CP) ./files/etc/* $(1)/etc
	install -d -m0755 $(1)/etc/scripts/firewall
	#$(CP) ./files/orange_isp_iptv_firewall.rule $(1)/etc/scripts/firewall
endef

$(eval $(call BuildPackage,net-wall))
