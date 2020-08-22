CONFIG_QCA_SINGLE_IMG_TREEISH = e17cf9120f5a1ac719b5fc3f7ac5c7003f6ff8cf

export CONFIG_QCA_SINGLE_IMG_TREEISH

single_img_dep = u-boot

define BuildSingleImg
	cp u-boot openwrt-ipq807x-u-boot.elf

	board/"$(BOARDDIR)"/gen-single-img.sh --force-remove \
			--git-repo "$(CONFIG_QCA_SINGLE_IMG_GIT)" \
			--treeish $(CONFIG_QCA_SINGLE_IMG_TREEISH) \
			-w "qsdk-chipcode" \
			-b "32" \
			-o . \
			openwrt-ipq807x-u-boot.elf

	cp nand-ipq807x_uboot-single.img uboot-hw29765589p0p512p1024p4x4p8x8.img
endef
