# datalib

This module is a mini databae of DNI product use on embedded system.

## License

This software is a proprietary software, it's strictly forbidden to distribute part or full source code out of Delta.

## How to compile and install?

Normally, this module could be build and install with 3 steps:

```
1. ./configure ***
2. make
3. make install
```

you can run `./configure -h` to check all options could be used when config it.

## How to use datalib on system?

1. compiled all targets success.
2. install libconfig.so to system library path, like `/usr/lib/libconfig.so`.
3. install compiled file datalib, config (and extra tools, like nvram) to one folder of `$PATH`.
4. start `datalib` during system boot up.
5. after system booted up, you can run `config get|set|***` to operation with datalib, run `config` without option to view help message of command **config**.

## How to integrate libconfig to other module?

1. compiled all targets success.
2. install libconfig.so to library folder where toolchain may use, like `openwrt.git/starging_dir/target-***/usr/lib/libconfig.so`.
3. install datalib.h to header folder where toolchain may use, like `openwrt.git/starging_dir/target-***/usr/include/datalib.h`.
4. in ohter module, add `#include <datalib.h>` to your source file which may call functions of libconfig, and link libconfig (add `-lconfig` to link command) to your executable file.

## How to integrate to OpenWrt?

First, trace customized default.c file in your project, like `package/dni/datalib/files/default.c`, add name and value of all your project's default configs. Please use this default.c to replace original one in this module when prepare code.

> Please note should define a defatuls_config_extender[] in your customized default.c even it's not include valid members.

Then, edit package's Makefile, like `package/dni/datalib/Makefile`, to follow build steps in above section to compile and install it.

Below is a sample of `package/dni/datalib/Makefile`:

``` makefile
#
# Copyright (C) 2020 Delta Networks Inc.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=datalib
PKG_VERSION:=1.0
PKG_RELEASE:=1

PKG_GIT_TREEISH:=HEAD

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/datalib
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Small application for saving data on embedded system
endef

define Build/Prepare
	test x$(GIT_HOME) != x
	test -d $(GIT_HOME)/datalib.git
	(cd $(GIT_HOME)/datalib.git; git-cat-file -e $(PKG_GIT_TREEISH))
	(cd $(BUILD_DIR); git-archive --format=tar --prefix=$(PKG_NAME)/ \
		--remote=$(GIT_HOME)/datalib.git $(PKG_GIT_TREEISH) | tar -xvf -)
	$(call Build/Patch/Default)
	$(CP) ./files/defaults.c $(PKG_BUILD_DIR)/
endef

define Build/Configure
	(cd $(PKG_BUILD_DIR) && \
		./configure --with-config-magic-value=0x20200102 \
		--with-random-magic-value=0x20200304 \
		--with-partition-path="/dev/mtd10" \
		--enable-create-extra-tools
	)
endef

define Build/InstallDev
	$(MAKE) -C $(PKG_BUILD_DIR) install-dev PREFIX=$(STAGING_DIR)/usr
endef

define Build/UninstallDev
	rm -f $(STAGING_DIR)/usr/lib/libconfig.so
	rm -f $(STAGING_DIR)/usr/include/datalib.h
endef

define Package/datalib/install
	$(MAKE) -C $(PKG_BUILD_DIR) install PREFIX=$(1)
endef

$(eval $(call BuildPackage,datalib))
```
