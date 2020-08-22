/*
 * Copyright (c) 2016-2017 The Linux Foundation. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 and
 * only version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

#ifndef _HW29765589P0P256P1024P4X4P8X8_H
#define _HW29765589P0P256P1024P4X4P8X8_H

#ifndef DO_DEPS_ONLY
#include <generated/asm-offsets.h>
#endif
#include <linux/sizes.h>
#include <dt-bindings/qcom/gpio-ipq807x.h>

/*
 * Support for IPQ807X RUMI
 */
#define CONFIG_IPQ_RUMI

/*
 * Disabled for actual chip.
 * #define CONFIG_RUMI
 */

#define CONFIG_BOARD_EARLY_INIT_F
#define CONFIG_BOARD_LATE_INIT
#define CONFIG_SYS_NO_FLASH
#define CONFIG_SYS_CACHELINE_SIZE   64
#define CONFIG_SYS_VSNPRINTF

#define CONFIG_IPQ807X_UART
#define CONFIG_NR_DRAM_BANKS            1
#define CONFIG_SKIP_LOWLEVEL_INIT

#define CONFIG_SYS_BOOTM_LEN            (64 << 20)
#define HAVE_BLOCK_DEVICE
/*
 * Size of malloc() pool
 */

/*
 * select serial console configuration
 */
#define CONFIG_CONS_INDEX               1
#define CONFIG_SYS_DEVICE_NULLDEV

/* allow to overwrite serial and ethaddr */
#define CONFIG_BAUDRATE                 115200
#define CONFIG_SYS_BAUDRATE_TABLE       {4800, 9600, 19200, 38400, 57600,\
								115200}

#define CONFIG_SYS_CBSIZE               (512 * 2) /* Console I/O Buffer Size */

/*

          svc_sp     --> --------------
          irq_sp     --> |            |
	  fiq_sp     --> |            |
	  bd         --> |            |
          gd         --> |            |
          pgt        --> |            |
          malloc     --> |            |
          text_base  --> |------------|
*/

#define CONFIG_IPQ807x_I2C	1
#ifdef CONFIG_IPQ807x_I2C
#define CONFIG_SYS_I2C_QUP
#define CONFIG_CMD_I2C
#define CONFIG_DM_I2C
#endif

#define CONFIG_SYS_INIT_SP_ADDR 	(CONFIG_SYS_TEXT_BASE -\
			CONFIG_SYS_MALLOC_LEN - CONFIG_ENV_SIZE -\
			GENERATED_BD_INFO_SIZE)

#define CONFIG_SYS_MAXARGS              16
#define CONFIG_SYS_PBSIZE               (CONFIG_SYS_CBSIZE + \
						sizeof(CONFIG_SYS_PROMPT) + 16)

#define TLMM_BASE			0x01000000
#define GPIO_CONFIG_ADDR(x)		(TLMM_BASE + (x)*0x1000)
#define GPIO_IN_OUT_ADDR(x)		(TLMM_BASE + 0x4 + (x)*0x1000)

#define CONFIG_SYS_SDRAM_BASE           0x40000000
#define CONFIG_SYS_TEXT_BASE            0x4A900000
#define CONFIG_SYS_SDRAM_SIZE           0x10000000
#define CONFIG_MAX_RAM_BANK_SIZE        CONFIG_SYS_SDRAM_SIZE
#define CONFIG_SYS_LOAD_ADDR            (CONFIG_SYS_SDRAM_BASE + (64 << 20))

#define QCA_KERNEL_START_ADDR		CONFIG_SYS_SDRAM_BASE
#define QCA_DRAM_KERNEL_SIZE		CONFIG_SYS_SDRAM_SIZE
#define QCA_BOOT_PARAMS_ADDR		(QCA_KERNEL_START_ADDR + 0x100)

#define CONFIG_OF_COMBINE		1

#define CONFIG_QCA_SMEM_BASE		0x4AB00000

#define CONFIG_IPQ_FDT_HIGH		0x4A400000
#define CONFIG_IPQ_NO_MACS		6
#define CONFIG_ENV_IS_IN_SPI_FLASH	1
#define CONFIG_ENV_SECT_SIZE        	(64 * 1024)

#define CONFIG_SMP_PSCI_CMD

#ifdef CONFIG_SMP_PSCI_CMD
#define NR_CPUS				4
#endif
/*
 * IPQ_TFTP_MIN_ADDR: Starting address of Linux HLOS region.
 * CONFIG_TZ_END_ADDR: Ending address of Trust Zone and starting
 * address of WLAN Area.
 * TFTP file can only be written in Linux HLOS region and WLAN AREA.
 */
#define IPQ_TFTP_MIN_ADDR		(CONFIG_SYS_SDRAM_BASE + (16 << 20))
#define CONFIG_TZ_END_ADDR		(CONFIG_SYS_SDRAM_BASE + (88 << 21))
#define CONFIG_SYS_SDRAM_END	((long long)CONFIG_SYS_SDRAM_BASE + gd->ram_size)

#ifndef __ASSEMBLY__
#include <compiler.h>
extern loff_t board_env_offset;
extern loff_t board_env_range;
extern loff_t board_env_size;
#endif

#define CONFIG_IPQ807X_ENV		1
#define CONFIG_ENV_OFFSET		board_env_offset
#define CONFIG_ENV_SIZE			CONFIG_ENV_SIZE_MAX
#define CONFIG_ENV_RANGE		board_env_range
#define CONFIG_ENV_SIZE_MAX		(256 << 10) /* 256 KB */
#define CONFIG_SYS_MALLOC_LEN		(CONFIG_ENV_SIZE_MAX + (1024 << 10))

#define CONFIG_ENV_IS_IN_NAND		1

/* Allow to overwrite serial and ethaddr */
#define CONFIG_ENV_OVERWRITE

/*
* SPI Flash Configs
*/
#define CONFIG_QCA_SPI
#define CONFIG_SPI_FLASH
#define CONFIG_CMD_SF
#define CONFIG_SPI_FLASH_STMICRO
#define CONFIG_SPI_FLASH_WINBOND
#define CONFIG_SPI_FLASH_MACRONIX
#define CONFIG_SPI_FLASH_GIGADEVICE
#define CONFIG_SF_DEFAULT_BUS	0
#define CONFIG_SF_DEFAULT_CS	0
#define CONFIG_SF_DEFAULT_MODE	SPI_MODE_0
#define CONFIG_SF_DEFAULT_SPEED	(48 * 1000 * 1000)
#define CONFIG_SPI_FLASH_BAR	1
#define CONFIG_SPI_FLASH_USE_4K_SECTORS
#define CONFIG_IPQ_4B_ADDR_SWITCH_REQD

#define CONFIG_EFI_PARTITION
#define CONFIG_QCA_BAM			1

/*
 * MMC configs
 */
#define CONFIG_QCA_MMC

#ifdef CONFIG_QCA_MMC
#define CONFIG_MMC
#define CONFIG_CMD_MMC
#define CONFIG_GENERIC_MMC
#define CONFIG_SDHCI
#define CONFIG_SDHCI_QCA
#define CONFIG_EFI_PARTITION
#define CONFIG_ENV_IS_IN_MMC
#define CONFIG_SYS_MMC_ENV_DEV	0
#endif

/*
 * NAND Flash Configs
 */

/* CONFIG_QPIC_NAND: QPIC NAND in BAM mode
 * CONFIG_IPQ_NAND: QPIC NAND in FIFO/block mode.
 * BAM is enabled by default.
 */
#define CONFIG_QPIC_NAND
#define CONFIG_CMD_NAND
#define CONFIG_CMD_NAND_YAFFS
#define CONFIG_SYS_NAND_SELF_INIT
#define CONFIG_SYS_NAND_ONFI_DETECTION

/*
 * Expose SPI driver as a pseudo NAND driver to make use
 * of U-Boot's MTD framework.
 */
#define CONFIG_SYS_MAX_NAND_DEVICE	CONFIG_IPQ_MAX_NAND_DEVICE + \
					CONFIG_IPQ_MAX_SPI_DEVICE

#define CONFIG_IPQ_MAX_NAND_DEVICE	1
#define CONFIG_IPQ_MAX_SPI_DEVICE	1

#define CONFIG_QPIC_NAND_NAND_INFO_IDX	0
#define CONFIG_IPQ_SPI_NOR_INFO_IDX	1

#define CONFIG_NAND_FLASH_INFO_IDX	CONFIG_QPIC_NAND_NAND_INFO_IDX
#define CONFIG_SPI_FLASH_INFO_IDX	CONFIG_IPQ_SPI_NOR_INFO_IDX

#define QCA_SPI_NOR_DEVICE		"spi0.0"
#define CONFIG_QUP_SPI_USE_DMA		1

/*
 * U-Boot Env Configs
 */
#define CONFIG_OF_LIBFDT	1
#define CONFIG_SYS_HUSH_PARSER
#define CONFIG_CMD_XIMG

/* MTEST */
#define CONFIG_CMD_MEMTEST
#define CONFIG_SYS_MEMTEST_START	CONFIG_SYS_SDRAM_BASE + 0x1300000
#define CONFIG_SYS_MEMTEST_END		CONFIG_SYS_MEMTEST_START + 0x100

/* NSS firmware loaded using bootm */
#define CONFIG_BOOTCOMMAND  	"mii write 0x4 0x0 0x800; " \
				"sleep 1; nmrp; " \
				"echo Loading DNI firmware for checking...; " \
				"loadn_dniimg 0 0x1980000 0x44000000; " \
				"calc_rootadd 0x1980000 0x44000000; " \
				"iminfo 0x44000000; " \
				"if test $? -ne 0; then echo linux checksum error; fw_recovery; fi;iminfo $rootfs_addr_for_fw_checking; " \
				"if test $? -ne 0; then echo rootfs checksum error; fw_recovery; fi;nand read 0x44000000 0x1980000 0x04600000; " \
				"dnibootm"
#define CONFIG_BOOTARGS "console=ttyMSM0,115200n8"
#define QCA_ROOT_FS_PART_NAME "rootfs"

#define CONFIG_BOOTDELAY	2

#define CONFIG_MTD_DEVICE
#define CONFIG_CMD_MTDPARTS
#define CONFIG_MTD_PARTITIONS
#define NUM_ALT_PARTITION	16

#define CONFIG_CMD_UBI
#define CONFIG_RBTREE

#define CONFIG_CMD_BOOTZ

#define CONFIG_OF_BOARD_SETUP

#ifdef CONFIG_OF_BOARD_SETUP
#define DLOAD_DISABLE		0x1
#define RESERVE_ADDRESS_START	0x4AB00000 /*TZAPPS, SMEM and TZ Regions */
#define RESERVE_ADDRESS_SIZE	0x5500000

/*
 * Below Configs need to be updated after enabling reset_crashdump
 * Included now to avoid build failure
 */
#define SET_MAGIC				0x1
#define CLEAR_MAGIC				0x0
#define SCM_CMD_TZ_CONFIG_HW_FOR_RAM_DUMP_ID	0x9
#define SCM_CMD_TZ_FORCE_DLOAD_ID		0x10
#define SCM_CMD_TZ_PSHOLD			0x15
#define BOOT_VERSION				0
#define TZ_VERSION				1
#define RPM_VERSION				3
#endif

#define CONFIG_FDT_FIXUP_PARTITIONS

/*
 * USB Support
 */
#define CONFIG_USB_XHCI_IPQ
#ifdef CONFIG_USB_XHCI_IPQ
#define CONFIG_USB_XHCI
#define CONFIG_USB_XHCI_DWC3
#define CONFIG_CMD_USB
#define CONFIG_DOS_PARTITION
#define CONFIG_USB_STORAGE
#define CONFIG_SYS_USB_XHCI_MAX_ROOT_PORTS      2
#define CONFIG_USB_MAX_CONTROLLER_COUNT         2
#endif

#define CONFIG_PCI_IPQ
#define PCI_MAX_DEVICES	2
#ifdef CONFIG_PCI_IPQ
#define CONFIG_PCI
#define CONFIG_CMD_PCI
#define CONFIG_PCI_SCAN_SHOW
#endif

#define CONFIG_IPQ807X_EDMA		1
#define CONFIG_IPQ807X_BRIDGED_MODE	1
#define CONFIG_NET_RETRY_COUNT		5
#define CONFIG_SYS_RX_ETH_BUFFER	16
#define CONFIG_CMD_PING
#define CONFIG_CMD_DHCP
#define CONFIG_MII
#define CONFIG_CMD_MII
#define CONFIG_CMD_TFTPPUT
#define CONFIG_IPQ_MDIO			1
#define CONFIG_QCA8075_PHY		1
#define CONFIG_QCA8033_PHY		1
#define CONFIG_QCA_AQUANTIA_PHY		1
/*#define CONFIG_IPQ_ETH_INIT_DEFER*/

/*
 * CRASH DUMP ENABLE
 */
#define CONFIG_QCA_APPSBL_DLOAD

#ifdef CONFIG_QCA_APPSBL_DLOAD
/* We will be uploading very big files */
#undef CONFIG_NET_RETRY_COUNT
#define CONFIG_NET_RETRY_COUNT  500

#endif

#define CONFIG_QCA_KERNEL_CRASHDUMP_ADDRESS	*((unsigned int *)0x08600658)
#define CONFIG_CPU_CONTEXT_DUMP_SIZE		4096
#define CONFIG_TLV_DUMP_SIZE			2048

/* L1 cache line size is 64 bytes, L2 cache line size is 128 bytes
 * Cache flush and invalidation based on L1 cache, so the cache line
 * size is configured to 64 */
#define CONFIG_SYS_CACHELINE_SIZE  64

/* Enabling this flag will report any L2 errors.
 * By default we are disabling it */
/*#define CONFIG_IPQ_REPORT_L2ERR*/

/*
 * Other commands
 */

#define CONFIG_CMD_RUN

#define CONFIG_QCA_SINGLE_IMG
#define CONFIG_DISPLAY_BOARDINFO
#define CONFIG_HW29765589P0P256P1024P4X4P8X8
#define CONFIG_MISC_INIT_R
#define CONFIG_SYS_LONGHELP
#define CONFIG_CMD_IMI
#define NETGEAR_BOARD_ID_SUPPORT
#define CONFIG_CMD_DNI

#define CONFIG_SYS_THUMB_BUILD
#define CONFIG_IPADDR    192.168.1.1
#define CONFIG_NETMASK   255.255.255.0
#define CONFIG_SERVERIP  192.168.1.10

#define DNI_NAND
#define CONFIG_SYS_FLASH_SECTOR_SIZE 0x20000

#define FIRMWARE_RECOVER_FROM_TFTP_SERVER 1
#define CONFIG_SYS_IMAGE_LEN   0x04600000
#define CONFIG_SYS_IMAGE_BASE_ADDR  0x1980000
#define CONFIG_SYS_IMAGE_ADDR_BEGIN (CONFIG_SYS_IMAGE_BASE_ADDR)
#define CONFIG_SYS_IMAGE_ADDR_END   (CONFIG_SYS_IMAGE_BASE_ADDR + CONFIG_SYS_IMAGE_LEN)
#define CONFIG_SYS_STRING_TABLE_BASE_ADDR          0x5f80000
#define CONFIG_SYS_STRING_TABLE_LEN                0x32000
#define CONFIG_SYS_STRING_TABLE_NUMBER 10
#define CONFIG_SYS_STRING_TABLE_TOTAL_LEN          0x380000
#define CONFIG_SYS_STRING_TABLE_PARTITION_NAME     "language"
#define CONFIG_SYS_FLASH_CONFIG_BASE  0x001080000
#define CONFIG_SYS_FLASH_CONFIG_PARTITION_SIZE  0x100000
#define CONFIG_SYS_VPN_BASE_ADDR	0x06300000
#define CONFIG_SYS_MTDOOPS_BASE_ADDR	0x06400000
#define CONFIG_SYS_MTDOOPS_LEN			0x80000

#define CONFIG_SYS_NMRP                1
#define CONFIG_CMD_NMRP                1
#define DNI_NMRP_work_around_eth_hang

#define CONFIG_DNI_BOARDDATA2

/*
 * Manufacturing Data
 */
#define CONFIG_CMD_BOARD_PARAMETERS

#define BOARDCAL                0x1180000
#define BOARDCAL_LEN            0x100000

#define CONFIG_QUADRUPLE_MAC_ADDRESS 1

#define LAN_MAC_OFFSET          0x00
#define WAN_MAC_OFFSET          0x06
#define WLAN_MAC_OFFSET         0x0c
#define WLAN_MAC_LENGTH         6
#define BLUETOOTH_MAC_OFFSET    0x12
#define BLUETOOTH_MAC_LENGTH    6

#define WPSPIN_OFFSET           0x18
#define WPSPIN_LENGTH           8

/* 12(lan/wan) + 6(wlan5g) + 6(bluetooth) + 8(wpspin) = 32 (0x20)*/
#define SERIAL_NUMBER_OFFSET        0x20
#define SERIAL_NUMBER_LENGTH        13

#define REGION_NUMBER_OFFSET        0x2d
#define REGION_NUMBER_LENGTH        2

#define BOARD_HW_ID_OFFSET          (REGION_NUMBER_OFFSET + REGION_NUMBER_LENGTH)
#define BOARD_HW_ID_LENGTH          32
#define BOARD_HW_ID_REAL_LENGTH     29

#define BOARD_MODEL_ID_OFFSET       (BOARD_HW_ID_OFFSET + BOARD_HW_ID_LENGTH)
#define BOARD_MODEL_ID_LENGTH       16

#define BOARD_SSID_OFFSET           (BOARD_MODEL_ID_OFFSET + BOARD_MODEL_ID_LENGTH)
#define BOARD_SSID_LENGTH           32

#define BOARD_PASSPHRASE_OFFSET     (BOARD_SSID_OFFSET + BOARD_SSID_LENGTH)
#define BOARD_PASSPHRASE_LENGTH     64

/* boarddata2 used to store board data that may be modified during device operation */
#ifdef CONFIG_DNI_BOARDDATA2
#define DNI_BDATA2_flash_sector_size      0x20000
#define BOARDDATA2_ADDR             0x1280000
#define BOARDDATA2_LEN              0x0100000
#define BOARD_DATA_OFFSET           0
#define BOARD_DATA_LENGTH           1
#define BOARD_BOOT_PARTITION_OFFSET           0
#define BOARD_BOOT_PARTITION_LENGTH           1
#endif

#define CHECK_DNI_FIRMWARE_INTEGRITY
#define CHECK_DNI_FIRMWARE_ROOTFS_INTEGRITY
#define DNI_FW_fast_flash_rw

#define CONFIG_SYS_UPDATE_DATA
#define CONFIG_CMD_TFTPSRV

#define LED_CLK_GPIO 18
#define LED_DATA_GPIO 19
#define LED_CLR_GPIO 20

#define ALL_LED_SIPO_GPIO_MASK         \
               (1 << LED_CLK_GPIO)     \
               | (1 << LED_DATA_GPIO)

/* delay before LED_CLK triggers LEDs. Unit: micro second */
#define LED_CLK_DELAY_USEC              1
#define LED_NUM 9

#define PWR_LED         8
#define WAN_LED         7
#define WLAN_24G_LED    6
#define WLAN_5G_LED     5
#define USB_LED1        4
#define USB_LED2        3
#define AQR_10_LED	2
#define AQR_25G_LED	1
#define AQR_1G_LED	0

/*
* FAT FS commands
*/
#define        CONFIG_FS_FAT
#define        CONFIG_CMD_FAT

#define CONFIG_ARMV7_PSCI

#define CONFIG_LATE_ETHERNET_CALBE_PLUGGING_UGLY_HACK

#define WORKAROUND_IPQ807X_GMAC_NMRP_HANG 1

/*TFTPPUT command*/
#define CONFIG_CMD_TFTPPUT
#define IPQ_TEMP_DUMP_ADDR 0x44000000

#define RESET_BUTTON 54
#define WPS_BUTTON 57

#define CONFIG_SMP_PSCI_CMD

#ifdef CONFIG_SMP_PSCI_CMD
#define NR_CPUS                                4
#endif
#define LED_CURRENT  GPIO_4MA

#endif /* _HW29765589P0P256P1024P4X4P8X8_H */

