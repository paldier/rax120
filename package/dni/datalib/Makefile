#
# Copyright (C) 2007-2008 Delta Networks Inc.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=datalib
PKG_VERSION:=1.0
PKG_RELEASE:=1

PKG_GIT_TREEISH:=datalib-dni43
CONFIG_MAGIC=0x20170711
RAND_MAGIC=0x20170712
SPACE_SIZE=0x60000

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/datalib
  SECTION:=utils
  CATEGORY:=DNI Packages
  DEPENDS:=+dni-libmtd
  TITLE:=Small application for saving data on embedded system
endef

define Build/Prepare
	$(CP) $(GIT_HOME)/datalib.git/* $(PKG_BUILD_DIR)/
endef

define Build/Configure
endef

define Build/Compile
endef

define Build/InstallDev
	mkdir -p $(STAGING_DIR)/usr/lib
	$(CP) $(PKG_BUILD_DIR)/libconfig.so $(STAGING_DIR)/usr/lib/
endef

define Build/UninstallDev
	rm -f $(STAGING_DIR)/usr/lib/libconfig.so
endef

define Package/datalib/install
	install -d -m0755 $(1)/usr/lib
	$(CP) $(PKG_BUILD_DIR)/libconfig.so $(1)/usr/lib/
	install -d -m0755 $(1)/bin
	install -m0755 $(PKG_BUILD_DIR)/datalib $(1)/bin/
	install -m0755 $(PKG_BUILD_DIR)/config $(1)/bin/
	install -m0755 $(PKG_BUILD_DIR)/nvram $(1)/bin/
	install -m0755 $(PKG_BUILD_DIR)/readycloud_nvram $(1)/bin/
	install -d -m0755 $(1)/sbin
	install -m0755 $(PKG_BUILD_DIR)/factory_default $(1)/sbin/
endef

$(eval $(call BuildPackage,datalib))
