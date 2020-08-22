# 
#  Copyright (C) 2007-2009 Delta Networks Inc.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=attached-devices
PKG_RELEASE:=1

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)
CONFIG_NETSCAN_GIT_REPOSITORY:=attached-devices.git

PKG_GIT_TREEISH="a0ede1acf216a5bbd548f8716da81c3596779501"

include $(INCLUDE_DIR)/package.mk

define Package/attached-devices
  	SECTION:=dni
  	CATEGORY:=DNI Packages
  	DEPENDS:= +datalib +d2 +dil +ntgdal +dniutil
	TITLE:=Scanning the attached devices according to NETGEAR's spec.
endef

TARGET_CFLAGS += -DCONFIG_USE_MUSL -D_GNU_SOURCE -ld2lib -ld2dil -lpthread -ldniutil -ld2dynlog

define Build/Prepare
	$(CP) $(GIT_HOME)/attached-devices.git/* $(PKG_BUILD_DIR)/
endef

define Build/Compile
endef

define Package/attached-devices/install
	install -d -m0755 $(1)/etc/init.d
	install -d -m0755 $(1)/usr/sbin
	install -m0755 $(PKG_BUILD_DIR)/files/attached-devices.init $(1)/etc/init.d/netscan
	install -m0755 $(PKG_BUILD_DIR)/files/netscan_if.init $(1)/etc/init.d/netscan_if.init
	install -m0755 $(PKG_BUILD_DIR)/attached-devices $(1)/usr/sbin/net-scan
	install -m0755 $(PKG_BUILD_DIR)/fing-devices $(1)/usr/sbin/
	install -m0755 $(PKG_BUILD_DIR)/dal-scan $(1)/usr/sbin/
	install -m0755 $(PKG_BUILD_DIR)/dev-scan $(1)/usr/sbin/
	install -m0755 $(PKG_BUILD_DIR)/UA_Parser $(1)/usr/sbin/
	install -m0755 $(PKG_BUILD_DIR)/devices_info $(1)/usr/sbin/
	install -d -m0755 $(1)/etc
	install -m0755 $(PKG_BUILD_DIR)/files/oui.csv $(1)/etc/oui.csv
	install -m0755 $(PKG_BUILD_DIR)/files/mam.csv $(1)/etc/mam.csv
	install -m0755 $(PKG_BUILD_DIR)/files/oui36.csv $(1)/etc/oui36.csv
	install -m0755 $(PKG_BUILD_DIR)/files/UA_String_Match_Table.txt $(1)/etc/UA_String_Match_Table.txt
	install -m0755 $(PKG_BUILD_DIR)/files/device_type_table.json $(1)/etc/device_type_table.json
endef

$(eval $(call BuildPackage,attached-devices))
