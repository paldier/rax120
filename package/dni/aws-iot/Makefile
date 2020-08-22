#
# Copyright (C) 2007-2008 Delta Networks Inc.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=aws-iot
PKG_VERSION:=36.0
PKG_RELEASE:=36
PKG_BUILD_DEPENDS:=datalib

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

CONFIG_AWS_IOT_GIT_TREEISH:="f48d861972edecd92b01c7303df09939b80c8da1"
CONFIG_AWS_IOT_GIT_REPOSITORY:="aws-iot.git"

PKG_GIT_TREEISH:=$(CONFIG_AWS_IOT_GIT_TREEISH)

LOCAL_PKG_NAME_EXT:=aws-iot

include $(INCLUDE_DIR)/package.mk

define Package/aws-iot
  SECTION:=utils
  CATEGORY:=Utilities
  DEPENDS:=+datalib +libcurl +libjson-c
  TITLE:=The AWS IoT to Publish Topic
endef

EXTRA_LDFLAGS := $(EXTRA_CFLAGS) $(call qstrip,$(CONFIG_AWSIOT_EXTRA_FLAGS))

ifdef CONFIG_USE_MUSL
  TARGET_CFLAGS += -DCONFIG_USE_MUSL
endif

define Package/aws-iot/config
	menu "Configuration"
	depends on PACKAGE_dniacl
	source "$(SOURCE)/Config.in"
	endmenu
endef

define Build/Prepare
	$(CP) $(GIT_HOME)/aws-iot.git/* $(PKG_BUILD_DIR)/
endef

define Build/Compile
endef

define Build/Configure
endef

define Package/aws-iot/install
	install -d -m0755 $(1)/usr/sbin
	install -d -m0755 $(1)/sbin
	install -d -m0755 $(1)/etc/init.d
	install -d -m0755 $(1)/etc/router_analytics
	install -d -m0755 $(1)/etc/router_analytics/beta
	install -d -m0755 $(1)/etc/router_analytics/debug
	install -d -m0755 $(1)/etc/rc.d
	install -m0755 $(PKG_BUILD_DIR)/files/aws-iot.init $(1)/etc/init.d/aws
	install -m0755 $(PKG_BUILD_DIR)/files/certs/certificate.pem.crt  $(1)/etc/router_analytics/
	install -m0755 $(PKG_BUILD_DIR)/files/certs/rootCA.crt $(1)/etc/router_analytics
	install -m0755 $(PKG_BUILD_DIR)/files/certs/beta/certificate.pem.crt  $(1)/etc/router_analytics/beta/
	install -m0755 $(PKG_BUILD_DIR)/files/certs/beta/rootCA.crt $(1)/etc/router_analytics/beta/
	install -m0755 $(PKG_BUILD_DIR)/files/certs/debug/certificate.pem.crt  $(1)/etc/router_analytics/debug/
	install -m0755 $(PKG_BUILD_DIR)/files/certs/debug/rootCA.crt $(1)/etc/router_analytics/debug/
	install -m0755 $(PKG_BUILD_DIR)/ra_check  $(1)/usr/sbin
	install -m0755 $(PKG_BUILD_DIR)/aws-iot  $(1)/usr/sbin
	install -m0755 $(PKG_BUILD_DIR)/data_collector  $(1)/usr/sbin
	install -m0755 $(PKG_BUILD_DIR)/icqm  $(1)/usr/sbin
	ln -sv ../init.d/aws $(1)/etc/rc.d/S99aws
	$(call Dni_Install_Ext,$(LOCAL_PKG_NAME_EXT),$(1))
endef

$(eval $(call BuildPackage,aws-iot))
