# 
# Copyright (C) 2006-2009 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=dnibusybox
PKG_VERSION:=1.24.1
PKG_RELEASE:=2
PKG_FLAGS:=essential

CONFIG_DNIBUSYBOX_GIT_TREEISH=busybox-v1.24.1-dni3
CONFIG_DNIBUSYBOX_GIT_REPOSITORY="busybox.git"

PKG_GIT_TREEISH:=$(CONFIG_DNIBUSYBOX_GIT_TREEISH)
BUSYBOX_HOME:=$(GIT_HOME)/$(CONFIG_DNIBUSYBOX_GIT_REPOSITORY)
PKG_LICENSE:=GPL-2.0
PKG_LICENSE_FILES:=LICENSE archival/libarchive/bz/LICENSE

include $(INCLUDE_DIR)/package.mk

ifeq ($(DUMP),)
  STAMP_CONFIGURED:=$(strip $(STAMP_CONFIGURED))_$(shell grep '^CONFIG_DNIBUSYBOX_' $(TOPDIR)/.config | md5s)
endif

init-y :=
init-$(CONFIG_DNIBUSYBOX_CONFIG_HTTPD) += httpd
init-$(CONFIG_DNIBUSYBOX_CONFIG_CROND) += cron
init-$(CONFIG_DNIBUSYBOX_CONFIG_TELNETD) += telnet

ifneq ($(findstring c,$(OPENWRT_VERBOSE)),)
  BB_MAKE_VERBOSE := V=1
else
  BB_MAKE_VERBOSE :=
endif
define Package/dnibusybox
  SECTION:=base
  CATEGORY:=Base system
  TITLE:=Core utilities for embedded Linux
  URL:=http://busybox.net/
  DEPENDS:=+DNIBUSYBOX_USE_LIBRPC:librpc +DNIBUSYBOX_CONFIG_PAM:libpam
  MENU:=1
endef

define Package/dnibusybox/description
 The Swiss Army Knife of embedded Linux.
 It slices, it dices, it makes Julian Fries.
endef

define Build/Prepare
	$(CP) $(GIT_HOME)/busybox.git/* $(PKG_BUILD_DIR)/
endef

BUSYBOX_SYM=$(if $(CONFIG_BUSYBOX_CUSTOM),CONFIG,DEFAULT)
define Package/dnibusybox/config
	menu "Configuration"
		depends on PACKAGE_dnibusybox
		source "$(SOURCE)/target-config.in"
		source "$(SOURCE)/config/Config.in"
	endmenu
endef

define Build/Configure
	rm -f $(PKG_BUILD_DIR)/.configured*
	grep 'CONFIG_DNIBUSYBOX_' $(TOPDIR)/.config | sed -e "s,\\(# \)\\?CONFIG_DNIBUSYBOX_\\(.*\\),\\1\\2,g" > $(PKG_BUILD_DIR)/.config
	yes '' | $(MAKE) -C $(PKG_BUILD_DIR) \
		CC="$(TARGET_CC)" \
		CROSS_COMPILE="$(TARGET_CROSS)" \
		KBUILD_HAVE_NLS=no \
		ARCH="$(ARCH)" \
		$(BB_MAKE_VERBOSE) \
		oldconfig
endef

LDLIBS:=m crypt
ifdef CONFIG_DNIBUSYBOX_USE_LIBRPC
  TARGET_CFLAGS += -I$(STAGING_DIR)/usr/include
  export LDFLAGS=$(TARGET_LDFLAGS)
  LDLIBS += rpc
endif

ifdef CONFIG_DNIBUSYBOX_CONFIG_PAM
  TARGET_CFLAGS += -I$(STAGING_DIR)/usr/include
  export LDFLAGS=$(TARGET_LDFLAGS)
  LDLIBS += pam pam_misc pthread
endif
define Build/Compile
	$(MAKE) -C $(PKG_BUILD_DIR) \
		CC="$(TARGET_CC)" \
		CROSS_COMPILE="$(TARGET_CROSS)" \
		EXTRA_CFLAGS="$(TARGET_CFLAGS)" \
		ARCH="$(ARCH)" \
		SKIP_STRIP=y \
		LDLIBS="$(LDLIBS) -D_GNU_SOURCE" \
		LDFLAGS="$(TARGET_LDFLAGS)" \
		IPKG_ARCH="$(ARCH)" \
		all
endef

define Package/dnibusybox/install
	find $(PKG_BUILD_DIR) -lname "*busybox" -exec rm \{\} \;
	$(MAKE) -C $(PKG_BUILD_DIR) \
		CC="$(TARGET_CC)" \
		CROSS_COMPILE="$(TARGET_CROSS)" \
		EXTRA_CFLAGS="$(TARGET_CFLAGS)" \
		ARCH="$(ARCH)" \
		CONFIG_PREFIX="$(PKG_INSTALL_DIR)" \
		LDLIBS="$(LDLIBS)" \
		LDFLAGS="$(TARGET_LDFLAGS) " \
		$(BB_MAKE_VERBOSE) \
		IPKG_ARCH="$(ARCH)" \
		CONFIG_PREFIX="$(1)" \
		install
	$(INSTALL_DIR) $(1)/etc/init.d
	for tmp in $(init-y); do \
		$(INSTALL_BIN) $(PKG_BUILD_DIR)/dni-examples/$$$$tmp $(1)/etc/init.d/$$$$tmp; \
	done

	$(INSTALL_DIR) $(1)/usr/sbin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/dni-examples/dsyslog $(1)/usr/sbin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/dni-examples/dsyslog $(1)/etc/init.d/syslogd
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/dni-examples/cmd_cron $(1)/usr/sbin/
	$(INSTALL_BIN) ./files/cron $(1)/etc/init.d/
	$(INSTALL_DIR) $(1)/etc/bandcheck
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/dni-examples/band-check $(1)/etc/bandcheck/band-check
	-rm -rf $(1)/lib64
endef

$(eval $(call BuildPackage,dnibusybox))
