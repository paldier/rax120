#
# Copyright (C) 2009-2012 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=transmission
PKG_VERSION:=2.76
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.bz2
PKG_SOURCE_URL:=http://mirrors.m0k.org/transmission/files
PKG_MD5SUM:=bbe6fb5c9e8a0f8d970defb1d80a28df

PKG_FIXUP:=autoreconf
PKG_INSTALL:=1
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk

define Package/dni-transmission/template
  SUBMENU:=BitTorrent
  SECTION:=net
  CATEGORY:=DNI Packages
  TITLE:=A free, lightweight BitTorrent client
  URL:=http://www.transmissionbt.com
  MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
endef

define Package/dni-transmission-daemon
  $(call Package/dni-transmission/template)
  DEPENDS:=+libcurl +libopenssl +libpthread +libevent2 +librt +libminiupnpc
  MENU:=1
endef

define Package/dni-transmission-cli
  $(call Package/dni-transmission/template)
  DEPENDS:=transmission-daemon
endef

define Package/dni-transmission-remote
  $(call Package/dni-transmission/template)
  DEPENDS:=+libcurl +libopenssl +libpthread +libevent2 +librt +libminiupnpc
endef

define Package/dni-transmission-web
  $(call Package/dni-transmission/template)
  DEPENDS:=transmission-daemon
endef


define Package/dni-transmission-daemon/description
 Transmission is a simple BitTorrent client.
 It features a very simple, intuitive interface
 on top on an efficient, cross-platform back-end.
 This package contains the daemon itself.
endef

define Package/dni-transmission-cli/description
 CLI utilities for transmission.
endef

define Package/dni-transmission-remote/description
 CLI remote interface for transmission.
endef

define Package/dni-transmission-web/description
 Webinterface resources for transmission.
endef

define Package/dni-transmission-daemon/conffiles
/etc/config/transmission
endef

CONFIGURE_VARS += \
	LIBEVENT_LIBS="$(STAGING_DIR)/usr/lib/libevent-2.0.so.5"

CONFIGURE_ARGS += \
	--enable-daemon \
	--enable-cli \
	--disable-gtk \
	--enable-largefile \
	--enable-lightweight

MAKE_FLAGS += \
	CFLAGS="$(TARGET_CFLAGS) -D_GNU_SOURCE -I$(STAGING_DIR)/usr/include/libevent2/"

define Package/dni-transmission-daemon/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/usr/bin/transmission-daemon $(1)/usr/bin/
	$(INSTALL_BIN) files/transbt.sh $(1)/usr/bin
	$(INSTALL_BIN) files/WhenDone.sh $(1)/usr/bin
	$(INSTALL_BIN) files/transbt-poptsk.sh $(1)/usr/bin
endef

define Package/dni-transmission-cli/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/usr/bin/transmission-cli \
			$(PKG_INSTALL_DIR)/usr/bin/transmission-create \
			$(PKG_INSTALL_DIR)/usr/bin/transmission-edit \
			$(PKG_INSTALL_DIR)/usr/bin/transmission-show \
			$(1)/usr/bin/
endef

define Package/dni-transmission-remote/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/usr/bin/transmission-remote $(1)/usr/bin/
endef

define Package/transmission-web/install
	$(INSTALL_DIR) $(1)/usr/share/transmission
	$(CP) $(PKG_INSTALL_DIR)/usr/share/transmission/web $(1)/usr/share/transmission/
endef

$(eval $(call BuildPackage,dni-transmission-daemon))
$(eval $(call BuildPackage,dni-transmission-cli))
$(eval $(call BuildPackage,dni-transmission-remote))
$(eval $(call BuildPackage,dni-transmission-web))
