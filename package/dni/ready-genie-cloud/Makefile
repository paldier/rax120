# 
# Copyright (C) 2014 Delta Networks Inc.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=ready-genie-cloud
PKG_RELEASE:=1

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/ready-genie-cloud
  CATEGORY:=Bigfoot
  TITLE:=ready-genie-cloud
  DEPENDS:=+datalib +libcurl +libopenssl +libstdcpp +libpolarssl
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

define Build/Compile
endef

define Package/ready-genie-cloud/install
	install -d -m0755 $(1)/etc/init.d/
	install -d -m0755 $(1)/www/
	install -d -m0755 $(1)/www/cgi-bin
	install -d -m0755 $(1)/opt/
	install -d -m0755 $(1)/sbin
	install -d -m0755 $(1)/usr
	install -m0755 $(PKG_BUILD_DIR)/readygeniecloud_init $(1)/etc/init.d/
	install -m0755 $(PKG_BUILD_DIR)/run_readycloud.sh $(1)/sbin/
	install -m0755 $(PKG_BUILD_DIR)/www/cgi-bin/genie.cgi $(1)/www/cgi-bin/
	install -m0755 $(PKG_BUILD_DIR)/www/cgi-bin/readycloud_control.cgi $(1)/www/cgi-bin/
	$(CP) -r $(PKG_BUILD_DIR)/opt/* $(1)/opt/
	$(CP) -r $(PKG_BUILD_DIR)/usr/* $(1)/usr/
endef

$(eval $(call BuildPackage,ready-genie-cloud))
