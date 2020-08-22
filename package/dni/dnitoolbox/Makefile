#
# Copyright (C) 2015 Delta Networks Inc.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=dnitoolbox
PKG_VERSION:=0.1
PKG_RELEASE:=1

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/$(PKG_NAME)
  SECTION:=utils
  CATEGORY:=DNI Packages
  TITLE:=a set of dni common tools
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

define Build/Compile
endef

define Package/$(PKG_NAME)/install
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/part_dev/part_dev $(1)/usr/sbin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/firmware/firmware_update $(1)/usr/sbin/
	$(INSTALL_DIR) $(1)/usr/etc/firmware_update
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/firmware/do_action.sh $(1)/usr/etc/firmware_update/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/firmware/post_action.sh $(1)/usr/etc/firmware_update/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/firmware/pre_action.sh $(1)/usr/etc/firmware_update/
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) ./files/fw_upg.sh $(1)/usr/sbin/
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
