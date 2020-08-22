include $(TOPDIR)/rules.mk
#include $(INCLUDE_DIR)/nls.mk
#include $(INCLUDE_DIR)/target.mk

PKG_NAME:=dil
PKG_VERSION:=0.1.0
PKG_RELEASE:=1

#PKG_BUILD_DIR:=./files/

include $(INCLUDE_DIR)/package.mk

define Package/dil
  SECTION:=dil
  CATEGORY:=Netgear
  TITLE:=Dil
  DEPENDS:=+libpthread +librt +libc +d2 +libcrypt0 +libssl +libcurl  +ld2dynlog
endef


define Package/dil/description
 Netgear Data Abstraction Layer 2
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Compile
endef

define Build/InstallDev
	mkdir -p $(STAGING_DIR)/usr/lib
	mkdir -p $(STAGING_DIR)/usr/include
	$(CP) -rp ./files/include/*.h $(STAGING_DIR)/usr/include
	$(CP) ./files/lib/* $(STAGING_DIR)/usr/lib/
endef

define Package/dil/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/bin/fing_dil $(1)/usr/bin 
	$(INSTALL_BIN) ./files/bin/diltest $(1)/usr/bin
	$(INSTALL_BIN) ./files/bin/jsontest $(1)/usr/bin
	
	$(INSTALL_DIR) $(1)/usr/lib
	$(INSTALL_BIN) ./files/lib/libd2dil.so $(1)/usr/lib
	$(INSTALL_BIN) ./files/lib/libdalcjson.so $(1)/usr/lib
	
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/dil.init $(1)/etc/init.d/dil
	$(INSTALL_BIN) ./files/bin/dilboot $(1)/etc/init.d/

	$(INSTALL_DIR) $(1)/etc/dil
	$(INSTALL_BIN) ./files/etc/file1.txt $(1)/etc/dil
	$(INSTALL_BIN) ./files/etc/file2.txt $(1)/etc/dil
	
endef


$(eval $(call BuildPackage,dil))
