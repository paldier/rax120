#
# Copyright (C) 2018-2020 Delta Networks Inc.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=ntgrcrypt
PKG_VERSION:=1.0
PKG_RELEASE:=1

PKG_GIT_TREEISH:="ntgrcrypt-dni041"

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/ntgrcrypt
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=ntgrcrypt for security sotrage libntgrcrypt.so
endef

define Build/Prepare
	$(CP) $(GIT_HOME)/ntgrcrypt.git/* $(PKG_BUILD_DIR)/
endef

define Build/Configure
	openssl rand -base64 2048 >  $(PKG_BUILD_DIR)/files/deif_original.key
	$(PKG_BUILD_DIR)/src/Host-interleave -y -i $(PKG_BUILD_DIR)/files/deif_original.key -o $(PKG_BUILD_DIR)/files/deif.key
endef

define Build/Compile
endef

define Package/ntgrcrypt/install
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/Host-encrypt-files.sh $(BUILD_DIR_BASE)/
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/files/deif_original.key $(BUILD_DIR_BASE)/
	mkdir -p $(STAGING_DIR)/usr/lib
	$(CP) $(PKG_BUILD_DIR)/src/libntgrcrypt.so $(STAGING_DIR)/usr/lib/
	$(INSTALL_DIR) $(1)/usr/lib/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/src/libntgrcrypt.so $(1)/usr/lib
	$(INSTALL_DIR) $(1)/sbin/	
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/src/ntgrcryptwd $(1)/sbin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/src/Nencmgr $(1)/sbin/
	$(INSTALL_DIR) $(1)/etc/init.d/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/ntgrcrypt $(1)/etc/init.d/
	$(INSTALL_DIR) $(1)/usr/share/deif/
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/files/deif.list $(1)/usr/share/deif/
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/files/deif.key $(1)/usr/share/deif/
endef

$(eval $(call BuildPackage,ntgrcrypt))
