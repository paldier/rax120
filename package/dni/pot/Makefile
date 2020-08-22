# 
# Copyright (C) 2006 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#
# $Id: Makefile,v 1.1.2.3 2007/03/11 05:08:58 agui Exp $

include $(TOPDIR)/rules.mk

PKG_NAME:=pot
PKG_RELEASE:=4

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

PKG_GIT_TREEISH=pot-v1.0.9

include $(INCLUDE_DIR)/package.mk

define Package/pot
  SECTION:=net
  CATEGORY:=DNI Packages
  DEPENDS:=+datalib
  TITLE:=POT
endef

define Build/Prepare
	$(CP) $(GIT_HOME)/pot.git/* $(PKG_BUILD_DIR)/
endef

define Package/pot/install
	$(MAKE) -C $(PKG_BUILD_DIR) install INS_DIR_PRE=$(1)
	$(INSTALL_DIR) $(1)/sbin
	install -m0755 ./files/netconn.sh $(1)/sbin/
	install -m0755 ./files/netconn.init $(1)/etc/init.d/netconn_detect
endef

$(eval $(call BuildPackage,pot))
