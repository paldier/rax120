# Copyright (c) 2014 The Linux Foundation. All rights reserved.
#
include $(TOPDIR)/rules.mk
include $(INCLUDE_DIR)/image.mk

MODULE_NAME=RAX120
HW_VERSION=RAX120
FW_VERSION=V1.0.1.128
LG_VERSION=V1.0.0.395
CLOUD_VERSION=20161026
HW_ID="29765589+0+512+1024+4x4+8x8"
ifndef FW_REGION
	FW_REGION=""
endif

# FIMWARE_SIZE = 100M = 800 blocks * 128 * 1024
# kernel blocks + rootfs blocks + reserved blocks for bad block <= firmware blocks (800)
# KERNEL_SIZE align to block size and must be precise block of true kerne size. when change kernel size, please also modify the kernel partition size patch.
KERNEL_SIZE=$(shell echo $$((44 * 128 * 1024))) # kernel blocks * 128 * 1024
ROOTFS_SIZE=$(shell echo $$((420 * 128 * 1024))) # rootfs blocks * 128 * 1024

UBIFS_OPTS = -m 2048 -e 124KiB -c 4096 -U -F
UBI_OPTS = -m 2048 -p 128KiB

E2SIZE=$(shell echo $$(($(CONFIG_TARGET_ROOTFS_PARTSIZE)*1024)))

ifeq ($(strip $(call CompareKernelPatchVer,$(KERNEL_PATCHVER),eq,3.18)),1)
IPQ806X_KERNEL_LOADADDR = 0x42008000
IPQ40XX_KERNEL_LOADADDR = 0x80008000
else
IPQ806X_KERNEL_LOADADDR = 0x42208000
IPQ40XX_KERNEL_LOADADDR = 0x80208000
endif
IPQ807X_KERNEL_LOADADDR = 0x41208000
IPQ807X_64_KERNEL_LOADADDR = 0x41080000

define Image/Prepare
	$(CP) $(LINUX_DIR)/vmlinux $(KDIR)/$(IMG_PREFIX)-vmlinux.elf
	echo "$(MODULE_NAME)" > $(TARGET_DIR)/module_name
	echo "$(HW_VERSION)" > $(TARGET_DIR)/hardware_version
	echo "$(FW_VERSION)" > $(TARGET_DIR)/firmware_version
	echo "$(CLOUD_VERSION)" > $(TARGET_DIR)/cloud_version
	echo "$(FW_REGION)" > $(TARGET_DIR)/firmware_region
	echo "$(LG_VERSION)" > $(TARGET_DIR)/default_language_version
	echo $(HW_ID) > $(TARGET_DIR)/hw_id
	echo "NAND_FLASH" > $(TARGET_DIR)/flash_type
	date > $(TARGET_DIR)/firmware_time
	echo "1" > $(TARGET_DIR)/etc/init.d/.hidden_new_features
	$(BUILD_DIR_BASE)/Host-encrypt-files.sh "$(BUILD_DIR_BASE)/deif_original.key" "$(TARGET_DIR)"
endef

ifneq ($(CONFIG_TARGET_ROOTFS_UBIFS),)
define Image/mkfs/ubifs_fit
	$(call Image/ubifs_128MB,$(1))
	$(call Image/ubifs_512MB,$(1))
	$(call Image/ubifs_1GB,$(1))
endef
endif

KERNEL_IMG:=$(IMG_PREFIX)-qcom-ipq807x-hkxx-fit-uImage.itb
ROOTFS_IMG:=$(IMG_PREFIX)-squashfs-root.img
ONE_IMAGE:=$(BIN_DIR)/oneimage.img
DNI_IMAGE:=$(BIN_DIR)/$(MODULE_NAME)-$(FW_VERSION)$(FW_REGION).img
ONE_IMAGE_FINAL:=$(BIN_DIR)/oneimage.img.final

define MkImageLzma
        mkimage -A arm64 -O linux -C lzma -T kernel -a 0x40908000 \
		-e 0x40908000 -n 'Linux-$(LINUX_VERSION)' \
		-d $(1) $(2)
endef

define Image/Build/RAX120
	echo "Generating $(2) Firmware"
#	test `cat $(BIN_DIR)/$(KERNEL_IMG) |wc -c` -le $(KERNEL_SIZE)
	$(STAGING_DIR_HOST)/../../tools/checksize $(BIN_DIR)/$(KERNEL_IMG) $(shell expr $(KERNEL_SIZE) - 64) $(shell expr $(KERNEL_SIZE) - 64 - 131072)
	test `cat $(BIN_DIR)/$(ROOTFS_IMG) |wc -c` -le $(ROOTFS_SIZE)
	rm -f $(ONE_IMAGE)
	(\
		dd if=$(BIN_DIR)/$(KERNEL_IMG) bs=$(KERNEL_SIZE) conv=sync; \
		dd if=$(BIN_DIR)/$(ROOTFS_IMG) bs=64k; \
	) > $(ONE_IMAGE)
	$(STAGING_DIR_HOST)/bin/rax120 $(BIN_DIR)/$(KERNEL_IMG) $(BIN_DIR)/$(KERNEL_IMG).normal
	dd if=$(BIN_DIR)/$(KERNEL_IMG) bs=$(shell expr $(KERNEL_SIZE) - 64) conv=sync of=$(BIN_DIR)/$(KERNEL_IMG).final
	$(call MkImageLzma,$(BIN_DIR)/$(ROOTFS_IMG),$(BIN_DIR)/$(ROOTFS_IMG).uImage)
	$(STAGING_DIR_HOST)/bin/rax120 $(BIN_DIR)/$(ROOTFS_IMG).uImage $(BIN_DIR)/$(ROOTFS_IMG).tmp
	dd if=$(BIN_DIR)/$(ROOTFS_IMG).tmp bs=64 count=1 >> $(BIN_DIR)/$(KERNEL_IMG).final
	(\
		dd if=$(BIN_DIR)/$(KERNEL_IMG).final bs=$(KERNEL_SIZE) conv=sync; \
		dd if=$(BIN_DIR)/$(ROOTFS_IMG) bs=64k; \
	) > $(ONE_IMAGE_FINAL)
	$(STAGING_DIR_HOST)/bin/mkdniimg \
		-B $(MODULE_NAME) -v $(FW_VERSION) -r $(FW_REGION) -H $(HW_ID) \
		-i $(ONE_IMAGE_FINAL) \
		-o $(DNI_IMAGE)
endef

define Image/BuildKernel/FIT
	$(CP) $(KDIR)/Image $(BIN_DIR)/$(IMG_PREFIX)-vmlinux.bin
	gzip -9 -c $(KDIR)/Image > $(KDIR)/Image.gz
	$(call CompressLzma,$(KDIR)/Image,$(KDIR)/Image.gz)
	$(call Image/BuildKernel/MkFIT,$(1), $(KDIR)/Image.gz, $(DTS_DIR)/$(1).dtb,gzip,$(2),$(2))
	$(CP) $(KDIR)/fit-$(1).itb $(BIN_DIR)/$(IMG_PREFIX)-$(1)-fit-uImage.itb
	mkdir -p $(BIN_DIR)/dtbs/
	$(CP) $(DTS_DIR)/qcom-ipq*.dtb $(BIN_DIR)/dtbs/
	$(CP) $(KDIR)/Image $(BIN_DIR)/dtbs/
endef

define Image/BuildKernel/FITInitramfs
	$(CP) $(KDIR)/Image-initramfs $(BIN_DIR)/dtbs/
	$(CP) $(KDIR)/Image-initramfs $(BIN_DIR)/$(IMG_PREFIX)-vmlinux-initramfs.bin
	$(call Image/BuildKernel/MkFIT,$(1), $(KDIR)/Image-initramfs, $(DTS_DIR)/$(1).dtb, none,$(2),$(2))
	$(CP) $(KDIR)/fit-$(1).itb $(BIN_DIR)/$(IMG_PREFIX)-$(1)-fit-uImage-initramfs.itb
endef

define Image/BuildKernel/GenericFIT
	$(CP) $(KDIR)/Image $(BIN_DIR)/$(IMG_PREFIX)-vmlinux.bin
	gzip -9 -c $(KDIR)/Image > $(KDIR)/Image.gz
	$(call CompressLzma,$(KDIR)/Image,$(KDIR)/Image.gz)
	$(call Image/BuildKernel/MkFIT,$(1), $(KDIR)/Image.gz,,gzip,$(2),$(2))
	$(CP) $(KDIR)/fit-$(1).itb $(BIN_DIR)/$(IMG_PREFIX)-$(1)-fit-uImage.itb
endef

define Image/BuildKernel/MultiDTBFIT
	$(CP) $(KDIR)/Image $(BIN_DIR)/$(IMG_PREFIX)-vmlinux.bin
	gzip -9 -c $(KDIR)/Image > $(KDIR)/Image.gz
	$(foreach dtb, $(2), gzip -9 -c $(DTS_DIR)/$(dtb).dtb > $(DTS_DIR)/$(dtb).dtb.gz;)
	$(call CompressLzma,$(KDIR)/Image,$(KDIR)/Image.gz)
	$(call Image/BuildKernel/MkFITMulti,$(1),$(KDIR)/Image.gz,$(2),gzip,$(3),$(3),$(4),$(5))
	$(CP) $(KDIR)/fit-$(1).itb $(BIN_DIR)/$(IMG_PREFIX)-$(1)-fit-uImage.itb
endef

# some tree's don't have all the device tree's so we filter out
# the ones that are not present
# $(1) is the filter to apply
FindDeviceTrees ?= $(notdir $(basename $(shell find $(DTS_DIR)/ -name $(1)*.dtb $(2) 2>/dev/null)))

define Image/BuildKernel/template
	$(CP) $(KDIR)/vmlinux$(subst openwrt-ipq$(if $(SUBTARGET),-$(SUBTARGET)),,$(IMG_PREFIX)).debug $(BIN_DIR)/$(IMG_PREFIX)-vmlinux.elf
endef

define Image/BuildKernel/ipq806x

	$(foreach device, $(call FindDeviceTrees, qcom-ipq8064-), \
		$(call Image/BuildKernel/$(1),$(device),$(IPQ806X_KERNEL_LOADADDR));)

	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq806x-akxx, \
		$(call FindDeviceTrees, qcom-ipq806?-), \
		$(IPQ806X_KERNEL_LOADADDR),gzip,0x43F00000)
	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq8064-ap148_1xx, \
		$(call FindDeviceTrees, qcom-ipq8064-*ap148_1xx), \
		$(IPQ806X_KERNEL_LOADADDR))
	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq8064-ap148, \
		$(call FindDeviceTrees, qcom-ipq8064-*ap148,-not -name *ap148_1xx* -not -name *ap148-nand*), \
		$(IPQ806X_KERNEL_LOADADDR))
	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq8064-db149, \
		$(call FindDeviceTrees, qcom-ipq8064-*db149), \
		$(IPQ806X_KERNEL_LOADADDR))
	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq8064-ak01, \
		$(call FindDeviceTrees, qcom-ipq8064-*ak01), \
		$(IPQ806X_KERNEL_LOADADDR))
	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq8064-ap145_1xx, \
		$(call FindDeviceTrees, qcom-ipq8064-*ap145_1xx), \
		$(IPQ806X_KERNEL_LOADADDR))
	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq8064-ap145, \
		$(call FindDeviceTrees, qcom-ipq8064-*ap145,-not -name *ap145_1xx*), \
		$(IPQ806X_KERNEL_LOADADDR))
	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq8064-ap160_2xx, \
		$(call FindDeviceTrees, qcom-ipq8064-*ap160_2xx), \
		$(IPQ806X_KERNEL_LOADADDR))
	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq8064-ap160, \
		$(call FindDeviceTrees, qcom-ipq8064-*ap160,-not -name *ap160_2xx*), \
		$(IPQ806X_KERNEL_LOADADDR))
	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq8064-ap161, \
		$(call FindDeviceTrees, qcom-ipq8064-*ap161), \
		$(IPQ806X_KERNEL_LOADADDR))
endef

define Image/BuildKernel/ipq40xx
	$(foreach device, $(call FindDeviceTrees, qcom-ipq40??-), \
		$(call Image/BuildKernel/$(1),$(device),$(IPQ40XX_KERNEL_LOADADDR));)

	$(call Image/BuildKernel/GenericFIT,qcom-ipq40xx,$(IPQ40XX_KERNEL_LOADADDR))
	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq40xx-ap.dkxx, \
		$(call FindDeviceTrees, qcom-ipq40??-ap) $(call FindDeviceTrees, qcom-ipq40??-db), \
		$(IPQ40XX_KERNEL_LOADADDR))
endef

define Image/BuildKernel/ipq807x
	$(foreach device, $(call FindDeviceTrees, qcom-ipq807x-), \
		$(call Image/BuildKernel/$(1),$(device),$(IPQ807X_KERNEL_LOADADDR));)

	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq807x-hkxx, \
		$(call FindDeviceTrees, qcom-ipq807x-), $(IPQ807X_KERNEL_LOADADDR))
endef

define Image/BuildKernel/ipq807x_64
	$(foreach device, $(call FindDeviceTrees, qcom-ipq807x-), \
		$(call Image/BuildKernel/$(1),$(device),$(IPQ807X_64_KERNEL_LOADADDR));)

	$(call Image/BuildKernel/MultiDTBFIT,qcom-ipq807x-hkxx, \
		$(call FindDeviceTrees, qcom-ipq807x-), $(IPQ807X_64_KERNEL_LOADADDR))
endef

define Image/BuildKernel
	$(call Image/BuildKernel/template,FIT)
	$(call Image/BuildKernel/$(SUBTARGET),FIT)
endef

define Image/BuildKernel/Initramfs
	$(CP) $(KDIR)/vmlinux-initramfs$(subst openwrt-ipq$(if $(SUBTARGET),-$(SUBTARGET)),,$(IMG_PREFIX)).debug $(BIN_DIR)/$(IMG_PREFIX)-vmlinux-initramfs.elf
	$(call Image/BuildKernel/template,FITInitramfs)
	$(call Image/BuildKernel/$(SUBTARGET),FITInitramfs)
endef

define Image/ubifs_1GB

  ifeq ($(CONFIG_TARGET_ipq_ipq40xx),y)
	$(eval UBI_OPTS:="-m 4096 -p 512KiB")
	$(call Image/mkfs/ubifs/generate,$(1))
	$(call Image/Build,ubi,$(1),-1GB)
  endif
endef

define Image/ubifs_512MB

  ifeq ($(CONFIG_TARGET_ipq_ipq40xx),y)
	$(eval UBI_OPTS:="-m 4096 -p 256KiB")
	$(call Image/mkfs/ubifs/generate,$(1))
	$(call Image/Build,ubi,$(1),-512MB)
  endif
endef

define Image/ubifs_128MB
	$(eval UBI_OPTS:="-m 2048 -p 128KiB")
	$(call Image/mkfs/ubifs/generate,$(1))
	$(call Image/Build,ubi,$(1))
endef

define Image/Build/ubifs
	$(call Image/mkfs/ubifs_fit,-$(SUBTARGET))
endef

define Image/Build/squashfs
	$(call prepare_generic_squashfs,$(KDIR)/root.squashfs)
endef

define Image/Build
	$(call Image/Build/$(1),$(1))
	dd if=$(KDIR)/root$(2).$(1) of=$(BIN_DIR)/$(IMG_PREFIX)-$(1)-root$(3).img bs=2k conv=sync
	$(call Image/Build/RAX120,$(1),rax120)
endef

$(eval $(call BuildImage))
