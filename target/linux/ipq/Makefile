# Copyright (c) 2013 The Linux Foundation. All rights reserved.
#
include $(TOPDIR)/rules.mk

ARCH:=arm
BOARD:=ipq
BOARDNAME:=Qualcomm Atheros IPQ
FEATURES:=ubifs squashfs pcie usbgadget
CPU_TYPE:=cortex-a7
SUBTARGETS:=ipq806x ipq40xx ipq807x ipq807x_64
MAINTAINER:=John Crispin <blogic@openwrt.org>

KERNELNAME=Image dtbs
LINUX_VERSION:=4.4.60

CUSTOMER:=dni
LINUX_TREEISH:=9fe64e16ab56e28fe3b06c533f84ca0f1d7df9b1
NETFILTER_TREEISH:=8c0c64843e05a918ecad7c5d77fab9069640c94e

# Kernel clone path and local repository reference can be done through menu config, else we we
# can hardcode it as below, this is just for a reference
CONFIG_KERNEL_GIT_CLONE_URI:=$(GIT_HOME)/linux-$(LINUX_VERSION).git
CONFIG_KERNEL_GIT_BRANCH:=""
CONFIG_KERNEL_GIT_LOCAL_REPOSITORY:=""

include $(INCLUDE_DIR)/target.mk
DEFAULT_PACKAGES += \
	uboot-envtools kmod-leds-gpio kmod-gpio-button-hotplug kmod-button-hotplug \
	kmod-ata-core kmod-ata-ahci kmod-ata-ahci-platform kmod-usb2 kmod-usb3 \
	kmod-usb-dwc3-qcom kmod-usb-phy-qcom-dwc3 kmod-usb-dwc3-of-simple swconfig

$(eval $(call BuildTarget))
