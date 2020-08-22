/*
 *	Copied from Linux Monitor (LiMon) - Networking.
 *
 *	Copyright 1994 - 2000 Neil Russell.
 *	(See License)
 *	Copyright 2000 Roland Borde
 *	Copyright 2000 Paolo Scaffardi
 *	Copyright 2000-2002 Wolfgang Denk, wd@denx.de
 *	SPDX-License-Identifier:	GPL-2.0
 */

/*
 * General Desription:
 *
 * The user interface supports commands for BOOTP, RARP, and TFTP.
 * Also, we support ARP internally. Depending on available data,
 * these interact as follows:
 *
 * BOOTP:
 *
 *	Prerequisites:	- own ethernet address
 *	We want:	- own IP address
 *			- TFTP server IP address
 *			- name of bootfile
 *	Next step:	ARP
 *
 * LINK_LOCAL:
 *
 *	Prerequisites:	- own ethernet address
 *	We want:	- own IP address
 *	Next step:	ARP
 *
 * RARP:
 *
 *	Prerequisites:	- own ethernet address
 *	We want:	- own IP address
 *			- TFTP server IP address
 *	Next step:	ARP
 *
 * ARP:
 *
 *	Prerequisites:	- own ethernet address
 *			- own IP address
 *			- TFTP server IP address
 *	We want:	- TFTP server ethernet address
 *	Next step:	TFTP
 *
 * DHCP:
 *
 *     Prerequisites:	- own ethernet address
 *     We want:		- IP, Netmask, ServerIP, Gateway IP
 *			- bootfilename, lease time
 *     Next step:	- TFTP
 *
 * TFTP:
 *
 *	Prerequisites:	- own ethernet address
 *			- own IP address
 *			- TFTP server IP address
 *			- TFTP server ethernet address
 *			- name of bootfile (if unknown, we use a default name
 *			  derived from our own IP address)
 *	We want:	- load the boot file
 *	Next step:	none
 *
 * NFS:
 *
 *	Prerequisites:	- own ethernet address
 *			- own IP address
 *			- name of bootfile (if unknown, we use a default name
 *			  derived from our own IP address)
 *	We want:	- load the boot file
 *	Next step:	none
 *
 * SNTP:
 *
 *	Prerequisites:	- own ethernet address
 *			- own IP address
 *	We want:	- network time
 *	Next step:	none
 */


#include <common.h>
#include <command.h>
#include <console.h>
#include <environment.h>
#include <errno.h>
#include <net.h>
#include <net/tftp.h>
#if defined(CONFIG_STATUS_LED)
#include <miiphy.h>
#include <status_led.h>
#endif
#include <watchdog.h>
#include <linux/compiler.h>
#include "arp.h"
#include "bootp.h"
#include "cdp.h"
#if defined(CONFIG_CMD_DNS)
#include "dns.h"
#endif
#include "link_local.h"
#include "nfs.h"
#if defined(CONFIG_SYS_NMRP)
#include "nmrp.h"
#endif
#include "ping.h"
#include "rarp.h"
#if defined(CONFIG_CMD_SNTP)
#include "sntp.h"
#endif
#include <errno.h>

#ifdef FIRMWARE_RECOVER_FROM_TFTP_SERVER
uchar NetOurTftpIP[4] = { 192, 168, 1, 1 };
int NetRunTftpServer = 0;
uchar TftpClientEther[6] = { 0, 0, 0, 0, 0, 0};
struct in_addr TftpClientIP = {0} ;
#ifdef DNI_NAND
#include <nand.h>
#else
extern flash_info_t flash_info[];
#endif
#endif
#ifdef FIRMWARE_RECOVER_FROM_TFTP_SERVER
#include <dni_common.h>
#endif

/* Current timeout handler */
extern thand_f *time_handler;

#ifdef FIRMWARE_RECOVER_FROM_TFTP_SERVER
extern int flash_sect_erase (ulong, ulong);

/* Check if Alive-timer expires? */
void CheckNmrpAliveTimerExpire(int send_nmrp_alive)
{
	ulong passed;

	passed = get_timer(NmrpAliveTimerStart);
	if ((passed / CONFIG_SYS_HZ) + NmrpAliveTimerBase > NMRP_TIMEOUT_ACTIVE) {
		printf("Active-timer expires\n");
		if (send_nmrp_alive) NmrpSend();
		NmrpAliveTimerBase = NMRP_TIMEOUT_ACTIVE / 4;
		NmrpAliveTimerStart = get_timer(0);
	} else {
		printf("Alive-timer %u\n", (passed / CONFIG_SYS_HZ) + NmrpAliveTimerBase);
		/* If passed 1/4 NMRP_TIMEOUT_ACTIVE,
		 * add 1/4 NMRP_TIMEOUT_ACTIVE to NmrpAliveTimerBase.
		 * This is for avoiding "passed" overflow.
		 */
		if ((passed / CONFIG_SYS_HZ) >= (NMRP_TIMEOUT_ACTIVE / 4)) {
			NmrpAliveTimerBase += NMRP_TIMEOUT_ACTIVE / 4;
			NmrpAliveTimerStart = get_timer(0);
			printf("NmrpAliveTimerBase %u\n", NmrpAliveTimerBase);
		}
	}
}

#ifdef DNI_NAND
/**
 * handle_nand_modify_error:
 *
 * Handle erase or write error occured in a NAND erase block.
 *
 * For now, following method is adopted:
 *
 *     * Read the block again. If error, mark the block as bad and reset
 *       board.
 *
 *     * Optionally, if original data which is supposed to be written into the
 *       block is provided, compare read data with it. If 2 data are
 *       different, mark the block as bad and reset board.
 *
 *     * "mark the block as bad and reset board" above takes effect only when
 *       markbad function is implemented in NAND flash driver. If markbad is
 *       not implemented, nothing happens so that behaviors in old version of
 *       code are preserved.
 *
 * @param nand       NAND device
 * @param offset     offset in flash
 * @param orig_data  buffer containing data before being written.
 *                   pass NULL if you do not want to verify written data.
 * @return           never return if block is being tried to be marked as bad
 */
static void handle_nand_modify_error(nand_info_t *nand, ulong offset,
                                     uchar *orig_data)
{
	int rval;
	size_t read_length = CONFIG_SYS_FLASH_SECTOR_SIZE;
	uchar buffer[CONFIG_SYS_FLASH_SECTOR_SIZE];

	printf("Try to read block 0x%lx ... ", offset);
	rval = nand_read(nand, offset, &read_length, buffer);

	/* ECC-correctable block */
	if (rval == -EUCLEAN) {
		rval = 0;
	}
	printf("%s\n", rval ? "ERROR" : "OK");

	if (rval == 0 && orig_data != NULL) {
		puts("Compare written data with original data ... ");
		rval = memcmp(orig_data, buffer,
		              CONFIG_SYS_FLASH_SECTOR_SIZE);
		printf("%s\n", rval ? "DIFFERENT" : "SAME");
	}
}

void update_data(ulong addr, int data_size, ulong target_addr_begin, size_t target_addr_len, int send_nmrp_alive, int mark_bad_reset)
{
	int offset_num;
	uchar *src_addr;
	ulong target_addr;

	if (data_size <= 1) {
		printf("Incorrect data size\n");
		return;
	}

	target_addr = target_addr_begin;
	for (offset_num = 0;
	     offset_num < (((data_size - 1) / CONFIG_SYS_FLASH_SECTOR_SIZE) + 1);
	     offset_num++) {
		nand_erase_options_t nand_erase_options;
		size_t write_size;
		int ret = 0;

		/* erase 64K */
		while (nand_block_isbad(&nand_info[0], target_addr)) {
			printf("Skipping erasing bad block at 0x%08lx\n", target_addr);
			target_addr += CONFIG_SYS_FLASH_SECTOR_SIZE;
		}
		if (target_addr >= target_addr_begin + target_addr_len)
			goto bad_nand;

		printf("Erasing: off %x, size %x\n", target_addr, CONFIG_SYS_FLASH_SECTOR_SIZE);
		memset(&nand_erase_options, 0, sizeof(nand_erase_options));
		nand_erase_options.length = CONFIG_SYS_FLASH_SECTOR_SIZE;
		nand_erase_options.quiet = 0;
		nand_erase_options.jffs2 = 1;
		nand_erase_options.scrub = 0;
		nand_erase_options.offset = target_addr;
		ret = nand_erase_opts(&nand_info[0], &nand_erase_options);
		printf("%s\n", ret ? "ERROR" : "OK");

		if (mark_bad_reset && ret) {
			handle_nand_modify_error(
				&nand_info[0], target_addr, NULL);
		}

		src_addr = addr + offset_num * CONFIG_SYS_FLASH_SECTOR_SIZE;

		printf("Writing: from RAM addr %x, to NAND off %x, size %x\n", src_addr, target_addr, CONFIG_SYS_FLASH_SECTOR_SIZE);
		write_size = CONFIG_SYS_FLASH_SECTOR_SIZE;
		{
			char runcmd[256];
			int rval = 0;

			printf("Run nand write 0x%lx 0x%lx 0x%lx\n", src_addr, target_addr, write_size);
			rval= nand_write(&nand_info[0], target_addr, &write_size, (u_char *)src_addr);

			if (rval != 0) {
				printf("NAND write to offset %llx failed %d\n",	target_addr, rval);
				ret = 1;
			}
		}
		if (mark_bad_reset && ret) {
			handle_nand_modify_error(
				&nand_info[0], target_addr, src_addr);
		}

		CheckNmrpAliveTimerExpire(send_nmrp_alive);
		target_addr += CONFIG_SYS_FLASH_SECTOR_SIZE;
	}
	return;
bad_nand:
	printf("** FAIL !! too many bad blocks, no enough space for data.\n");
}

void update_firmware(ulong addr, int firmware_size)
{
	if (get_len_incl_bad(&nand_info[0], (loff_t)CONFIG_SYS_IMAGE_ADDR_BEGIN,
	    (size_t)firmware_size) > ((size_t)CONFIG_SYS_IMAGE_LEN +
	                              (size_t)board_image_reserved_length()))
	{
		printf("** FAIL !! too many bad blocks, no enough space for firmware image.\n");
		return;
	}

	update_data(addr, firmware_size, CONFIG_SYS_IMAGE_ADDR_BEGIN,
	            CONFIG_SYS_IMAGE_LEN +
		    (size_t)board_image_reserved_length(), 1, 1);

#ifdef CONFIG_DUAL_FIRMWARE
	printf ("boot_partition_set 1\n");
	run_command("boot_partition_set 1", 0);
#endif

#ifdef CONFIG_SYS_NMRP
	if(NmrpState != 0)
		return;
#endif
	printf ("Done\nRebooting...\n");

	do_reset(NULL,0,0,NULL);
}

#ifdef CONFIG_DUAL_FIRMWARE
void update_firmware_second(ulong addr, int firmware_size)
{
	if (get_len_incl_bad(&nand_info[0], (loff_t)CONFIG_SYS_IMAGE_2_ADDR_BEGIN,
	    (size_t)firmware_size) > ((size_t)CONFIG_SYS_IMAGE_LEN +
	                              (size_t)board_image_reserved_length()))
	{
		printf("** FAIL !! too many bad blocks, no enough space for firmware image.\n");
		return;
	}

	update_data(addr, firmware_size, CONFIG_SYS_IMAGE_2_ADDR_BEGIN,
	            CONFIG_SYS_IMAGE_LEN +
		    (size_t)board_image_reserved_length(), 1, 1);

	printf ("boot_partition_set 2\n");
	run_command("boot_partition_set 2", 0);

#ifdef CONFIG_SYS_NMRP
	if(NmrpState != 0)
		return;
#endif
	printf ("Done\nRebooting...\n");

	do_reset(NULL,0,0,NULL);
}
#endif  /*CONFIG_DUAL_FIRMWARE*/

#endif

#ifndef DNI_NAND
void update_firmware(ulong addr, int firmware_size)
{
	if (firmware_size <= 0) {
		printf("Incorrect firmware size\n");
		return;
	}
	int offset_num;
	uchar *src_addr;
	ulong target_addr;

	target_addr = CONFIG_SYS_IMAGE_ADDR_BEGIN;
	for (offset_num = 0;
	     offset_num < ((firmware_size / CONFIG_SYS_FLASH_SECTOR_SIZE) + 1);
	     offset_num++) {

		/* erase 64K */
		flash_sect_erase(CONFIG_SYS_IMAGE_ADDR_BEGIN +
				 offset_num * CONFIG_SYS_FLASH_SECTOR_SIZE,
				 CONFIG_SYS_IMAGE_ADDR_BEGIN +
				 ((offset_num + 1) * CONFIG_SYS_FLASH_SECTOR_SIZE) - 1);

		CheckNmrpAliveTimerExpire(1);
		target_addr += CONFIG_SYS_FLASH_SECTOR_SIZE;
	}
	printf ("Copy image to Flash... ");
	target_addr = CONFIG_SYS_IMAGE_ADDR_BEGIN;
	for (offset_num = 0;
	     offset_num < ((firmware_size / CONFIG_SYS_FLASH_SECTOR_SIZE) + 1);
	     offset_num++) {

		src_addr = addr + offset_num * CONFIG_SYS_FLASH_SECTOR_SIZE;
		flash_write(src_addr, target_addr, CONFIG_SYS_FLASH_SECTOR_SIZE);

		CheckNmrpAliveTimerExpire(1);
		target_addr += CONFIG_SYS_FLASH_SECTOR_SIZE;
	}
#ifdef CONFIG_SYS_NMRP
	if(NmrpState != 0)
		return;
#endif
	printf ("Done\nRebooting...\n");

	do_reset(NULL,0,0,NULL);
}
#endif

void StartTftpServerToRecoveFirmware (void)
{
	NetRunTftpServer = 1;
	ulong addr;
	image_header_t *hdr;
	int file_size;
	char *s;

	/* pre-set load_addr from CONFIG_SYS_LOAD_ADDR */
	load_addr = CONFIG_SYS_LOAD_ADDR;

	/* pre-set load_addr from $loadaddr */
	if ((s = getenv("loadaddr")) != NULL) {
		load_addr = simple_strtoul(s, NULL, 16);
	}

tftpstart:
	addr = load_addr;
	file_size = net_loop(TFTPGET);
	if (file_size < 1)
	{
		printf ("\nFirmware recovering from TFTP server is stopped or failed! :( \n");
		NetRunTftpServer = 0;
		return;
	}

	//  copy Image to flash

#ifdef CONFIG_SYS_NMRP
	if (NmrpState == STATE_CLOSED)
		return;
	else if ( NmrpState !=0 )
		NmrpState = STATE_CLOSING;
#endif
#if defined(CONFIG_EXTRA_FOUR_BYTE_KERNEL_LENGTH)
	hdr = (image_header_t *)(addr + HEADER_LEN + 4);
#else
	hdr = (image_header_t *)(addr + HEADER_LEN);
#endif
	if (!board_model_id_match_open_source_id() &&
	    !image_match_open_source_fw_id(addr) &&
#ifdef CONFIG_FIT
	    ntohl(hdr->ih_magic) != FDT_MAGIC){
#else
        ntohl(hdr->ih_magic) != IH_MAGIC){
#endif
		puts ("Bad Magic Number,it is forbidden to be written to flash!!\n");
		ResetTftpServer();
		goto tftpstart;
	}
#ifdef NETGEAR_BOARD_ID_SUPPORT
	if (!board_match_image_hw_id(addr)) {
		puts ("Board HW ID mismatch,it is forbidden to be written to flash!!\n");
		ResetTftpServer();
		goto tftpstart;
	}
	if (!board_model_id_match_open_source_id() &&
	    (!board_match_image_model_id(addr) &&
	     !image_match_open_source_fw_id(addr))) {
		puts ("Board MODEL ID mismatch,it is forbidden to be written to flash!!\n");
		ResetTftpServer();
		goto tftpstart;
	}
	if (!board_match_image_model_id(addr)) {
		printf("board model id mismatch with image id, updating board ID\n");
		board_update_image_model_id(addr);
	}
#endif

	update_firmware(addr + HEADER_LEN, file_size - HEADER_LEN);
#ifdef CONFIG_SYS_NMRP
	if (NmrpState == STATE_CLOSING)
	{
		net_set_udp_handler(NmrpHandler);
		NmrpSend();
	}
#endif
	/*
	 *  It indicates that tftp server would leave running state when
	 *  this function returns.
	 */
	NetRunTftpServer = 0;
}

int do_fw_recovery (cmd_tbl_t *cmdtp, int flag, int argc, char *argv[])
{
	StartTftpServerToRecoveFirmware();
	return 0;
}

U_BOOT_CMD(
	fw_recovery,	1,	0,	do_fw_recovery,
	"start tftp server to recovery dni firmware image.",
	"- start tftp server to recovery dni firmware image."
);

#ifdef CONFIG_DUAL_FIRMWARE

void StartTftpServerToRecoveFirmware_second (void)
{
	NetRunTftpServer = 1;
	ulong addr;
	image_header_t *hdr;
	int file_size;
	char *s;

	/* pre-set load_addr from CONFIG_SYS_LOAD_ADDR */
	load_addr = CONFIG_SYS_LOAD_ADDR;

	/* pre-set load_addr from $loadaddr */
	if ((s = getenv("loadaddr")) != NULL) {
		load_addr = simple_strtoul(s, NULL, 16);
	}

tftpstart:
	addr = load_addr;
	file_size = net_loop(TFTPGET);
	if (file_size < 1)
	{
		printf ("\nFirmware recovering from TFTP server is stopped or failed! :( \n");
		NetRunTftpServer = 0;
		return;
	}

	//  copy Image to flash

#ifdef CONFIG_SYS_NMRP
	if (NmrpState == STATE_CLOSED)
		return;
	else if ( NmrpState !=0 )
		NmrpState = STATE_CLOSING;
#endif
#if defined(CONFIG_EXTRA_FOUR_BYTE_KERNEL_LENGTH)
	hdr = (image_header_t *)(addr + HEADER_LEN + 4);
#else
	hdr = (image_header_t *)(addr + HEADER_LEN);
#endif
	if (!board_model_id_match_open_source_id() &&
	    !image_match_open_source_fw_id(addr) &&
#ifdef CONFIG_FIT
	    ntohl(hdr->ih_magic) != FDT_MAGIC){
#else
        ntohl(hdr->ih_magic) != IH_MAGIC){
#endif
		puts ("Bad Magic Number,it is forbidden to be written to flash!!\n");
		ResetTftpServer();
		goto tftpstart;
	}
#ifdef NETGEAR_BOARD_ID_SUPPORT
	if (!board_match_image_hw_id(addr)) {
		puts ("Board HW ID mismatch,it is forbidden to be written to flash!!\n");
		ResetTftpServer();
		goto tftpstart;
	}
	if (!board_model_id_match_open_source_id() &&
	    (!board_match_image_model_id(addr) &&
	     !image_match_open_source_fw_id(addr))) {
		puts ("Board MODEL ID mismatch,it is forbidden to be written to flash!!\n");
		ResetTftpServer();
		goto tftpstart;
	}
	if (!board_match_image_model_id(addr)) {
		printf("board model id mismatch with image id, updating board ID\n");
		board_update_image_model_id(addr);
	}
#endif

	update_firmware_second(addr + HEADER_LEN, file_size - HEADER_LEN);
#ifdef CONFIG_SYS_NMRP
	if (NmrpState == STATE_CLOSING)
	{
		net_set_udp_handler(NmrpHandler);
		NmrpSend();
	}
#endif
	/*
	 *  It indicates that tftp server would leave running state when
	 *  this function returns.
	 */
	NetRunTftpServer = 0;
}

int do_fw_recovery_second (cmd_tbl_t *cmdtp, int flag, int argc, char *argv[])
{
	StartTftpServerToRecoveFirmware_second();
	return 0;
}

U_BOOT_CMD(
	fw_recovery_second,	1,	0,	do_fw_recovery_second,
	"start tftp server to recovery 2nd dni firmware image.",
	"- start tftp server to recovery 2nd dni firmware image."
);

#endif /* CONFIG_DUAL_FIRMWARE */

#if defined(CONFIG_SYS_NMRP)
void UpgradeFirmwareFromNmrpServer(void)
{
	NetRunTftpServer = 1;
	ulong addr;
	image_header_t *hdr;
	int file_size;
	char *s;

	/* pre-set load_addr from CONFIG_SYS_LOAD_ADDR */
	load_addr = CONFIG_SYS_LOAD_ADDR;

	/* pre-set load_addr from $loadaddr */
	if ((s = getenv("loadaddr")) != NULL) {
		load_addr = simple_strtoul(s, NULL, 16);
	}

	addr = load_addr;
	file_size = net_loop(TFTPGET);
	if (file_size < 1)
	{
		printf ("\nFirmware recovering from TFTP server is stopped or failed! :( \n");
		NetRunTftpServer = 0;
		return;
	}

	NmrpState = STATE_TFTPUPLOADING;
	net_set_udp_handler(NmrpHandler);
	NmrpSend();

	printf("Ignore Magic number checking when upgrade via NMRP,Magic number is %x!\n", IH_MAGIC);
	//  copy Image to flash
#ifdef NETGEAR_BOARD_ID_SUPPORT
	if (board_match_image_hw_id(addr)) {
		update_firmware(addr + HEADER_LEN, file_size - HEADER_LEN);
		board_update_image_model_id(addr);
	}
	else {
		puts ("Board HW ID mismatch,it is forbidden to be written to flash!!\n");
	}
#else
	update_firmware(addr + HEADER_LEN, file_size - HEADER_LEN);
#endif

	/* firmware write to flash done */
	NmrpFwUPOption = 0;
	if (NmrpSTUPOption == 1) {
		NmrpState = STATE_CONFIGING;
	} else {
		NmrpState = STATE_CLOSING;
	}
	net_set_udp_handler(NmrpHandler);
	NmrpSend();
	NetRunTftpServer = 0;
}
#endif

#if defined(CONFIG_SYS_NMRP)
void UpgradeStringTableFromNmrpServer(int table_num)
{
	NetRunTftpServer = 1;
	ulong addr;
	image_header_t *hdr;
	int file_size;
	char *s;

	/* pre-set load_addr from CONFIG_SYS_LOAD_ADDR */
	load_addr = CONFIG_SYS_LOAD_ADDR;

	/* pre-set load_addr from $loadaddr */
	if ((s = getenv("loadaddr")) != NULL) {
		load_addr = simple_strtoul(s, NULL, 16);
	}

	addr = load_addr;
	memset(addr, 0, CONFIG_SYS_STRING_TABLE_LEN);
	file_size = net_loop(TFTPGET);
	if (file_size < 1)
	{
		printf ("\nUpdating string table %d from TFTP server \
			is stopped or failed! :( \n", table_num);
		NetRunTftpServer = 0;
		return;
	}

	/* TFTP Uploading done */
	NmrpState = STATE_TFTPUPLOADING;
	net_set_udp_handler(NmrpHandler);
	NmrpSend();

	/* Write String Table to flash */
	board_upgrade_string_table((uchar *)addr, table_num, file_size);

	/* upgrade string table done, check if more files */
	NmrpStringTableUpdateIndex++;
	if (NmrpStringTableUpdateIndex == NmrpStringTableUpdateCount)
		NmrpSTUPOption = 0;
	if (NmrpFwUPOption == 0 && NmrpSTUPOption == 0) {
		workaround_qca8337_gmac_nmrp_hang_action();
		printf("Upgrading all done\n");
		NmrpState = STATE_CLOSING;
		net_set_udp_handler(NmrpHandler);
		NmrpSend();
	} else {
		printf("More files to be upgrading\n");
		workaround_qca8337_gmac_nmrp_hang_action();
		workaround_annapurna_al314_gmac_nmrp_hang_action();
		NmrpState = STATE_CONFIGING;
		net_set_udp_handler(NmrpHandler);
		NmrpSend();
	}
	NetRunTftpServer = 0;
}
#endif

void ResetTftpServer(void)
{
	time_handler = 0;
#ifdef CONFIG_SYS_NMRP
	if(NmrpState != 0)
	{
		NmrpState = STATE_CONFIGING;
		NmrpSend();
	}
	else
#endif
	net_set_state(NETLOOP_RESTART);
}
#endif

#ifdef CONFIG_SYS_NMRP
void StartNmrpClient(void)
{
        if( net_loop(NMRP) < 1)
        {
                printf("\n nmrp server is stopped or failed !\n");
                return;
        }
}
void ResetBootup_usual(void)
{
        time_handler = 0;
        net_set_state(NETLOOP_SUCCESS);
}

#if defined(CONFIG_SYS_NMRP) && defined(CONFIG_CMD_NMRP)
int do_nmrp (cmd_tbl_t *cmdtp, int flag, int argc, char *argv[])
{
	StartNmrpClient();
	return 0;
}

U_BOOT_CMD(
	nmrp,	1,	0,	do_nmrp,
	"start nmrp mechanism to upgrade firmware-image or string-table.",
	"- start nmrp mechanism to upgrade firmware-image or string-table."
);
#endif
#endif
