CONFIG_QCA_SINGLE_IMG_TREEISH = 68140d9e7a6f8dcde08d3f172b70e5f02028f19e

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

	cp nand-ipq807x_uboot-single.img uboot-hw29765589p0p256p1024p4x4p8x8.img
endef
