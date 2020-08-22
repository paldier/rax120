include $(TOPDIR)/rules.mk

PKG_NAME=qsdk-wifi-script
PKG_VERSION=1
PKG_RELEASE=1

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/qsdk-wifi-script
  SECTION:=net
  CATEGORY:=Network
  TITLE:=qca-wifi scripts
  MAINTAINER:=Matthew McClintock <mmcclint@qca.qualcomm.com>
endef

define Package/qsdk-wifi-script/config
	source "$(SOURCE)/Config.in"
endef

define Build/Prepare
	$(CP) $(GIT_HOME)/qsdk-wifi-script.git/* $(PKG_BUILD_DIR)/
endef

define Build/Compile
endef

define Package/$(PKG_NAME)/install
	$(INSTALL_DIR) $(1)/lib/wifi/
	$(INSTALL_DIR) $(1)/usr/lib/
	$(INSTALL_DIR) $(1)/etc/hotplug.d/button
	cp -af $(PKG_BUILD_DIR)/etc/* $(1)/etc/
	cp -af $(PKG_BUILD_DIR)/lib/wifi/* $(1)/lib/wifi
	cp -af $(PKG_BUILD_DIR)/usr/lib/* $(1)/usr/lib
	#mv $(1)/lib/wifi/wps-hotplug.sh $(1)/etc/hotplug.d/button/50-wps
	#mv $(1)/lib/wifi/wps-extender-hotplug.sh $(1)/etc/hotplug.d/button/54-wps-extender
	#mv $(1)/lib/wifi/wps-reset-hotplug.sh $(1)/etc/hotplug.d/button/51-wps-reset
	#mv $(1)/lib/wifi/wps-supplicant-hotplug.sh $(1)/etc/hotplug.d/button/52-wps-supplicant
	rm -f $(1)/lib/wifi/wps-hotplug.sh $(1)/lib/wifi/wps-extender-hotplug.sh $(1)/lib/wifi/wps-supplicant-hotplug.sh $(1)/lib/wifi/wps-supplicant-hotplug.sh 

	mv $(1)/lib/wifi/wps-hostapd-update-uci.sh $(1)/lib/wifi/wps-hostapd-update-uci
	mv $(1)/lib/wifi/wps-hostapd-nbh-update.sh $(1)/lib/wifi/wps-hostapd-nbh-update
	mv $(1)/lib/wifi/wps-supplicant-update-uci.sh $(1)/lib/wifi/wps-supplicant-update-uci

endef

$(eval $(call BuildPackage,qsdk-wifi-script))
