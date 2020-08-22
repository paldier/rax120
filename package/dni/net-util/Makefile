# 
# Copyright (C) 2008 Delta Networks Inc.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=net-util
PKG_VERSION:=1
PKG_RELEASE:=1
PKG_BUILD_DEPENDS:=datalib
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)
PKG_GIT_TREEISH=net-util-dni53

GET_CFLAGS+=-DORBI_DETWAN6_CRASH

include $(INCLUDE_DIR)/package.mk

define Package/net-util
  SECTION:=utils
  CATEGORY:=Utilities
  DEPENDS:= +datalib
  TITLE:=Tiny utils for configuring the Router.
endef

define Package/net-util/description
	This package contains an utility for configuring Home Router.
endef

config-$(CONFIG_net-util_WLAN_COMMON) += "--with_wlan_common"
config-$(CONFIG_net-util_RFC3442_249) += "--with_rfc3442_249"
config-$(CONFIG_net-util_DNI_WAN_DNS3) += "--with_dni_wan_dns3"
config-$(CONFIG_net-util_DETWANV6) += "--with_detwanv6"

#ccfalgs-$(CONFIG_wide-dhcpv6_KERNEL_NO_IN6_PKTINFO) += -DKERNEL_NO_IN6_PKTINFO
#EXTRA_CFLAGS += $(ccflags-y)

define Package/net-util/config
        source "$(SOURCE)/Config.in"
endef

define Build/Prepare
	$(CP) $(GIT_HOME)/net-util.git/* $(PKG_BUILD_DIR)/
endef

define Build/Compile
endef

define Build/Configure
endef

define Package/net-util/install
	install -d -m0755  $(1)/sbin
	install -m0755  $(PKG_BUILD_DIR)/src/net-util $(1)/sbin/
	ln -sf /sbin/net-util $(1)/sbin/ipconflict
	ln -sf /sbin/net-util $(1)/sbin/cmdsched
	ln -sf /sbin/net-util $(1)/sbin/apsched
	ln -sf /sbin/net-util $(1)/sbin/cmdsched_wlan_status
	ln -sf /sbin/net-util $(1)/sbin/cmdroute
	ln -sf /sbin/net-util $(1)/sbin/detwanv6
	ln -sf /sbin/net-util $(1)/sbin/daemonv6
	ln -sf /sbin/net-util $(1)/sbin/rs_send
	install -d -m0755  $(1)/usr/sbin
	install -m0755  $(PKG_BUILD_DIR)/scripts/sched_block.sh $(1)/usr/sbin/
endef

$(eval $(call BuildPackage,net-util))
