# 
# Copyright (C) 2006 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#
# $Id: Makefile,v 1.1.2.2 2007/01/31 06:23:51 ronger Exp $

include $(TOPDIR)/rules.mk

PKG_NAME:=minidlna
PKG_VERSION:=latest
PKG_RELEASE:=3

PKG_GIT_DIR:=minidlna.git
#PKG_FIXUP:=autoreconf
#PKG_REMOVE_FILES:=autogen.sh

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)
PKG_BUILD_DEPENDS:=libsqlite3 ffmpeg libexif libflac libid3tag libjpeg libogg libvorbis zlib libiconv

include $(INCLUDE_DIR)/package.mk

config-y					+= --with-model_name=$(CONFIG_MINIDLNA_MODELNAME)

define Package/dni-minidlna
  SECTION:=net
  CATEGORY:=DNI Packages
  TITLE:=minidlna server
  DEPENDS:= +datalib +libsqlite3 +ffmpeg +libexif +libflac +libid3tag +libjpeg +libogg +libvorbis +zlib +libiconv +libffmpeg-full
  URL:=http://sourceforge.net/projects/minidlna/
endef

define Package/dni-minidlna/config
	menu "Configuration"
		depends on PACKAGE_dni-minidlna
		source "$(SOURCE)/Config.in"
	endmenu
endef

define Build/Prepare
	$(CP) $(GIT_HOME)/minidlna.git/* $(PKG_BUILD_DIR)/
endef


TARGET_CPPFLAGS += \
	-I$(STAGING_DIR)/usr/include \
	-I$(STAGING_DIR)/usr/include/FLAC \
	-I$(STAGING_DIR)/usr/include/libexif \
	-I$(STAGING_DIR)/usr/include/uuid \
	-I$(STAGING_DIR)/usr/include/vorbis \
	-I$(ICONV_PREFIX)/include \
	-I$(INTL_PREFIX)/include \
	-D_GNU_SOURCE -D_FILE_OFFSET_BITS=64 \

TARGET_LDFLAGS += \
	-L$(ICONV_PREFIX)/lib \
	-L$(INTL_PREFIX)/lib \
	-Wl,-rpath-link=$(STAGING_DIR)/usr/lib \

MAKE_FLAGS +=\
	CFLAGS="$(TARGET_CFLAGS) $(TARGET_CPPFLAGS)" \
	LDFLAGS="$(TARGET_LDFLAGS) -D_GNU_SOURCE " \
	ICONV_LIBS="-liconv $(if $(INTL_FULL),-lintl)" \

CONFIGURE_ARGS +=\
	--with-libiconv-prefix="$(ICONV_PREFIX)" \
	--with-libintl-prefix="$(INTL_PREFIX)" \
	--with-os-name="OpenWrt Linux" \
	--with-os-version="$(LINUX_VERSION)" \
	--with-os-url="http://openwrt.org/" \
	--with-db-path="/var/run/minidlna" \
	--enable-tivo \
	--enable-netgear \
	--with-log-path="/var/log" \

define Build/Configure
	@test x$(CONFIG_MINIDLNA_MODELNAME) != x \
		|| (echo "Compile $(PKG_NAME) failed: Some necessary configuration option is invalid, please run "make menuconfig" to specify"; false)
	(cd $(PKG_BUILD_DIR); \
		$(TARGET_CONFIGURE_OPTS) \
		CFLAGS="$(TARGET_CFLAGS) $(EXTRA_CFLAGS)" \
		CXXFLAGS="$(TARGET_CFLAGS) $(EXTRA_CFLAGS)" \
		CPPFLAGS="$(TARGET_CPPFLAGS) $(EXTRA_CPPFLAGS)" \
		LDFLAGS="$(TARGET_LDFLAGS)" \
		./configure \
			--target=$(GNU_TARGET_NAME) \
			--host=$(GNU_HOST_NAME) \
			--build=$(GNU_BUILD_NAME) \
			--with-libiconv-prefix="$(ICONV_PREFIX)" \
			--with-libintl-prefix="$(INTL_PREFIX)" \
			--with-os-name="OpenWrt Linux" \
			--with-os-version="$(LINUX_VERSION)" \
			--with-os-url="http://openwrt.org/" \
			--with-db-path="/var/run/minidlna" \
			--enable-tivo \
			--enable-netgear \
			--with-log-path="/var/log" \
	);
endef


define Package/dni-minidlna/install
	install -d -m0755 $(1)/usr/sbin
	install -m0755 $(PKG_BUILD_DIR)/minidlna $(1)/usr/sbin/
	install -d -m0755 $(1)/sbin
	install -m0755 $(PKG_BUILD_DIR)/cmddlna  $(1)/sbin/
endef

$(eval $(call BuildPackage,dni-minidlna))
