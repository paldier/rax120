#
# (C) Copyright 2000-2007
# Wolfgang Denk, DENX Software Engineering, wd@denx.de.
#
# SPDX-License-Identifier:	GPL-2.0+
#
ifeq ($(CONFIG_AL_I2C),y)
-include $(HAL_TOP)/file_list_base.mk
ccflags-$(CONFIG_ALPINE) += $(HAL_PLATFORM_INCLUDE_PATH_ALPINE_V1)
ccflags-$(CONFIG_ALPINE_V2_32) += $(HAL_PLATFORM_INCLUDE_PATH_ALPINE_V2)
ccflags-$(CONFIG_ALPINE_HW29765235P0P512P1024P4X4P4X4_32) += $(HAL_PLATFORM_INCLUDE_PATH_ALPINE_HW29765235P0P512P1024P4X4P4X4)
ccflags-$(CONFIG_ALPINE_V2_64) += $(HAL_PLATFORM_INCLUDE_PATH_ALPINE_V2)
endif

obj-$(CONFIG_DM_I2C) += i2c-uclass.o
obj-$(CONFIG_DM_I2C_COMPAT) += i2c-uclass-compat.o
obj-$(CONFIG_DM_I2C_GPIO) += i2c-gpio.o
obj-$(CONFIG_I2C_CROS_EC_TUNNEL) += cros_ec_tunnel.o
obj-$(CONFIG_I2C_CROS_EC_LDO) += cros_ec_ldo.o

obj-$(CONFIG_SYS_I2C_ADI) += adi_i2c.o
obj-$(CONFIG_I2C_MV) += mv_i2c.o
obj-$(CONFIG_PCA9564_I2C) += pca9564_i2c.o
obj-$(CONFIG_TSI108_I2C) += tsi108_i2c.o
obj-$(CONFIG_SH_SH7734_I2C) += sh_sh7734_i2c.o
obj-$(CONFIG_SYS_I2C) += i2c_core.o
obj-$(CONFIG_SYS_I2C_DAVINCI) += davinci_i2c.o
obj-$(CONFIG_SYS_I2C_DW) += designware_i2c.o
obj-$(CONFIG_SYS_I2C_FSL) += fsl_i2c.o
obj-$(CONFIG_SYS_I2C_FTI2C010) += fti2c010.o
obj-$(CONFIG_SYS_I2C_IHS) += ihs_i2c.o
obj-$(CONFIG_SYS_I2C_KONA) += kona_i2c.o
obj-$(CONFIG_SYS_I2C_LPC32XX) += lpc32xx_i2c.o
obj-$(CONFIG_SYS_I2C_MVTWSI) += mvtwsi.o
obj-$(CONFIG_SYS_I2C_MXC) += mxc_i2c.o
obj-$(CONFIG_SYS_I2C_MXS) += mxs_i2c.o
obj-$(CONFIG_SYS_I2C_OMAP24XX) += omap24xx_i2c.o
obj-$(CONFIG_SYS_I2C_OMAP34XX) += omap24xx_i2c.o
obj-$(CONFIG_SYS_I2C_PPC4XX) += ppc4xx_i2c.o
obj-$(CONFIG_SYS_I2C_RCAR) += rcar_i2c.o
obj-$(CONFIG_SYS_I2C_ROCKCHIP) += rk_i2c.o
obj-$(CONFIG_SYS_I2C_S3C24X0) += s3c24x0_i2c.o
obj-$(CONFIG_SYS_I2C_SANDBOX) += sandbox_i2c.o i2c-emul-uclass.o
obj-$(CONFIG_SYS_I2C_SH) += sh_i2c.o
obj-$(CONFIG_SYS_I2C_SOFT) += soft_i2c.o
obj-$(CONFIG_SYS_I2C_TEGRA) += tegra_i2c.o
obj-$(CONFIG_SYS_I2C_UNIPHIER) += i2c-uniphier.o
obj-$(CONFIG_SYS_I2C_UNIPHIER_F) += i2c-uniphier-f.o
obj-$(CONFIG_SYS_I2C_ZYNQ) += zynq_i2c.o
ifdef CONFIG_HW29765589P0P256P1024P4X4P8X8
obj-$(CONFIG_SYS_I2C_QUP) += qup_i2c_hw29765589p0p256p1024p4x4p8x8.o
endif
ifdef CONFIG_HW29765589P0P512P1024P4X4P8X8
obj-$(CONFIG_SYS_I2C_QUP) += qup_i2c_hw29765589p0p512p1024p4x4p8x8.o
endif
ifdef CONFIG_HW29765235P0P512P1024P4X4P4X4
obj-$(CONFIG_SYS_I2C_QUP) += qup_i2c.o
endif
ifdef CONFIG_AM33XX
obj-$(CONFIG_SYS_I2C_QUP) += qup_i2c.o
endif

obj-$(CONFIG_I2C_MUX) += muxes/
