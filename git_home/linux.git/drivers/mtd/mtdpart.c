/*
 * Simple MTD partitioning layer
 *
 * Copyright © 2000 Nicolas Pitre <nico@fluxnic.net>
 * Copyright © 2002 Thomas Gleixner <gleixner@linutronix.de>
 * Copyright © 2000-2010 David Woodhouse <dwmw2@infradead.org>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 */

#include <linux/module.h>
#include <linux/types.h>
#include <linux/kernel.h>
#include <linux/slab.h>
#include <linux/list.h>
#include <linux/kmod.h>
#include <linux/mtd/mtd.h>
#include <linux/mtd/partitions.h>
#include <linux/magic.h>
#include <linux/of.h>
#include <linux/err.h>
#include <linux/kconfig.h>
#ifdef CONFIG_DNI_SUPPORT_DUAL_FIRMWARE
#include <linux/root_dev.h>
#endif

#include "mtdcore.h"
#include "mtdsplit/mtdsplit.h"

#define MTD_ERASE_PARTIAL	0x8000 /* partition only covers parts of an erase block */

#define DNI_PARTITION_MAPPING
#ifdef DNI_PARTITION_MAPPING
#define MAX_COUNT_OF_MAPPING_PARTITION	1
#define NAME_OF_MAPPING_PARTITION_1	"rootfs"
//#define NAME_OF_MAPPING_PARTITION_2	"rootfs2"

struct logic_phys_map {
	struct mtd_info *part_mtd;  /* Mapping partition mtd */
	unsigned *map_table;        /* Mapping from logic block to phys block */
	unsigned nBlock;            /* Logic block number */
};

static struct logic_phys_map *lp_mapping_chain[MAX_COUNT_OF_MAPPING_PARTITION];
static int lp_mapping_count = -1;
#endif

#ifdef CONFIG_DNI_SUPPORT_DUAL_FIRMWARE
#define NAME_OF_MAPPING_PARTITION_1 "rootfs"
#define NAME_OF_MAPPING_PARTITION_2 "rootfs2"
#endif

/* Our partition linked list */
static LIST_HEAD(mtd_partitions);
static DEFINE_MUTEX(mtd_partitions_mutex);

/* Our partition node structure */
struct mtd_part {
	struct mtd_info mtd;
	struct mtd_info *master;
	uint64_t offset;
	struct list_head list;
};

static void mtd_partition_split(struct mtd_info *master, struct mtd_part *part);

static int part_block_markbad(struct mtd_info *mtd, loff_t ofs);

/*
 * Given a pointer to the MTD object in the mtd_part structure, we can retrieve
 * the pointer to that structure with this macro.
 */
#define PART(x)  ((struct mtd_part *)(x))

#ifdef DNI_PARTITION_MAPPING

#ifdef CONFIG_MTD_SPLIT
#define mtd_check_rootfs_magic_dni mtd_check_rootfs_magic
#else
#define mtd_check_rootfs_magic_dni mtd_check_rootfs_magic_tmp

/* Copy from drivers/mtd/mtdsplit/mtdsplit.c */
int mtd_check_rootfs_magic_tmp(struct mtd_info *mtd, size_t offset)
{
	u32 magic;
	size_t retlen;
	int ret;

	ret = mtd_read(mtd, offset, sizeof(magic), &retlen,
			(unsigned char *) &magic);
	if (ret)
		return ret;

	if (retlen != sizeof(magic))
		return -EIO;

	if (le32_to_cpu(magic) != SQUASHFS_MAGIC &&
			magic != 0x19852003)
		return -EINVAL;

	return 0;
}
#endif

/* scan and find header or rootfs (squashfs) */
static int scan_rootfs_header(struct mtd_info *master, struct mtd_info *mtd, uint64_t *offset, int *bad_blk_count)
{
	struct mtd_part *part = PART(mtd);

	while (*offset < mtd->size) {
		if (mtd->_block_isbad && mtd->_block_isbad(mtd, *offset)) {
			*bad_blk_count++;
			*offset += mtd->erasesize;
			continue;
		}

		if (!mtd_check_rootfs_magic_dni(mtd, (size_t)*offset)) {
			printk(KERN_INFO "mtd: find squashfs magic at 0x%llx of %s\n",
					*offset + part->offset, master->name);
			printk(KERN_INFO "mtd: find squashfs magic at 0x%llx of %s\n",
					*offset, mtd->name);
			break;
		}

		*offset += mtd->erasesize;
	}

	if (*offset >= mtd->size) {
		printk(KERN_ALERT "%s: no squashfs found in partition %s of %s\n",
				__func__, mtd->name, master->name);
		return -1;
	}

	return 0;
}

static int create_block_mapping(struct mtd_info *mtd)
{
	struct logic_phys_map *map;
	loff_t offset;
	unsigned l_blk, p_blk;

	if (!mtd) {
		printk(KERN_ALERT "null mtd or it's no nand chip!\n");
		return -1;
	}

	printk(KERN_INFO "%s: create logic to physic blocks mapping for %s\n", __func__, mtd->name);

	if (lp_mapping_count >= MAX_COUNT_OF_MAPPING_PARTITION) {
		printk(KERN_ALERT "%s: block mapping chain is full!\n", __func__);
		return -1;
	}

	map = kmalloc(sizeof(struct logic_phys_map), GFP_KERNEL);
	if (!map) {
		printk(KERN_ALERT "%s: memory alloc error for map!\n", __func__);
		return -1;
	}

	map->map_table = kmalloc(sizeof(unsigned) * (mtd->size >> mtd->erasesize_shift), GFP_KERNEL);
	if (!map->map_table) {
		printk(KERN_ALERT "%s: memory alloc error for map->map_table!\n", __func__);
		return -1;
	}
	memset(map->map_table, 0xFF, sizeof(unsigned) * (mtd->size >> mtd->erasesize_shift));

	l_blk = 0;
	for (offset = 0; offset < mtd->size; offset += mtd->erasesize) {
		if (mtd->_block_isbad && mtd->_block_isbad(mtd, offset))
			continue;
		p_blk = offset >> mtd->erasesize_shift;
		map->map_table[l_blk++] = p_blk;
	}

	if (lp_mapping_count < 0) {
		memset(lp_mapping_chain, 0, sizeof(struct logic_phys_map *) * MAX_COUNT_OF_MAPPING_PARTITION);
		lp_mapping_count = 0;
	}

	map->nBlock = l_blk;
	map->part_mtd = mtd;
	lp_mapping_chain[lp_mapping_count++] = map;

	return 0;
}

static void remap_blocks_in_rootfs_partition(struct mtd_part *slave)
{
	uint64_t rootfs_offset = 0;
	int bad_blocks = 0;

	if (slave->mtd.name &&
		(!strcmp(slave->mtd.name, NAME_OF_MAPPING_PARTITION_1)) &&
		!scan_rootfs_header(slave->master, &slave->mtd, &rootfs_offset, &bad_blocks)) {
		slave->offset += rootfs_offset;	/* valid squashfs data begin from rootfs_offset */
		slave->mtd.size -= rootfs_offset;
		if (slave->master->_block_isbad)
			slave->mtd.ecc_stats.badblocks -= bad_blocks;

		printk(KERN_INFO "%s: remapped partition %s: 0x%012llx-0x%012llx\n",
			__func__, slave->mtd.name, (uint64_t)slave->offset, (uint64_t)(slave->offset + slave->mtd.size));

		create_block_mapping(&slave->mtd);
	}
}

static void delete_block_mapping(struct mtd_info *mtd)
{
	int index;
	struct logic_phys_map *map;

	for (index = 0; index < lp_mapping_count; index++) {
		map = lp_mapping_chain[index];
		if (map && map->part_mtd == mtd) {
			kfree(map->map_table);
			kfree(map);
			lp_mapping_chain[index] = NULL;
		}
	}

	lp_mapping_count = -1;
}

static loff_t convert_block_logic_to_physic(struct mtd_info *mtd, loff_t from)
{
	unsigned l_blk, p_blk;
	int index;
	loff_t ret = from;

	for (index = 0; index < lp_mapping_count; index++) {
		if (lp_mapping_chain[index] && lp_mapping_chain[index]->part_mtd == mtd) {
			l_blk = from >> mtd->erasesize_shift;
			if (l_blk < lp_mapping_chain[index]->nBlock) {
				p_blk = lp_mapping_chain[index]->map_table[l_blk];
				ret = (p_blk << mtd->erasesize_shift) | (from & (mtd->erasesize - 1));
				break;
			} else
				return -1;
		}
	}

	return ret;
}
#endif

/*
 * MTD methods which simply translate the effective address and pass through
 * to the _real_ device.
 */

static int part_read(struct mtd_info *mtd, loff_t from, size_t len,
		size_t *retlen, u_char *buf)
{
	struct mtd_part *part = PART(mtd);
	struct mtd_ecc_stats stats;
	int res;

#ifdef DNI_PARTITION_MAPPING
	loff_t new_from = convert_block_logic_to_physic(mtd, from);
	if (new_from == -1) {
		*retlen = 0;
		return -EINVAL;
	} else
		from = new_from;
#endif

	stats = part->master->ecc_stats;
	res = part->master->_read(part->master, from + part->offset, len,
				  retlen, buf);

	if (unlikely(mtd_is_eccerr(res)))
	{
		mtd->ecc_stats.failed +=
			part->master->ecc_stats.failed - stats.failed;
		pr_err("[part_read] failed to read from=0x%08Lx, part->offset=%08Lx, len=%d !!!!!!! \n", (long long)from, part->offset, len);
		part_block_markbad(mtd, from & (~mtd->erasesize + 1));
	}
	else
		mtd->ecc_stats.corrected +=
			part->master->ecc_stats.corrected - stats.corrected;
	return res;
}

static int part_point(struct mtd_info *mtd, loff_t from, size_t len,
		size_t *retlen, void **virt, resource_size_t *phys)
{
	struct mtd_part *part = PART(mtd);

	return part->master->_point(part->master, from + part->offset, len,
				    retlen, virt, phys);
}

static int part_unpoint(struct mtd_info *mtd, loff_t from, size_t len)
{
	struct mtd_part *part = PART(mtd);

	return part->master->_unpoint(part->master, from + part->offset, len);
}

static unsigned long part_get_unmapped_area(struct mtd_info *mtd,
					    unsigned long len,
					    unsigned long offset,
					    unsigned long flags)
{
	struct mtd_part *part = PART(mtd);

	offset += part->offset;
	return part->master->_get_unmapped_area(part->master, len, offset,
						flags);
}

static int part_read_oob(struct mtd_info *mtd, loff_t from,
		struct mtd_oob_ops *ops)
{
	struct mtd_part *part = PART(mtd);
	int res;

	if (from >= mtd->size)
		return -EINVAL;
	if (ops->datbuf && from + ops->len > mtd->size)
		return -EINVAL;

	/*
	 * If OOB is also requested, make sure that we do not read past the end
	 * of this partition.
	 */
	if (ops->oobbuf) {
		size_t len, pages;

		if (ops->mode == MTD_OPS_AUTO_OOB)
			len = mtd->oobavail;
		else
			len = mtd->oobsize;
		pages = mtd_div_by_ws(mtd->size, mtd);
		pages -= mtd_div_by_ws(from, mtd);
		if (ops->ooboffs + ops->ooblen > pages * len)
			return -EINVAL;
	}

	res = part->master->_read_oob(part->master, from + part->offset, ops);
	if (unlikely(res)) {
		if (mtd_is_bitflip(res))
			mtd->ecc_stats.corrected++;
		if (mtd_is_eccerr(res))
        {
            pr_err("[part_read_oob] failed to read from=0x%08Lx, part->offset=%08Lx !!!!! \n", (long long)from, part->offset);
            part_block_markbad(mtd, from & (~mtd->erasesize + 1));

			mtd->ecc_stats.failed++;
        }
	}
	return res;
}

static int part_read_user_prot_reg(struct mtd_info *mtd, loff_t from,
		size_t len, size_t *retlen, u_char *buf)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_read_user_prot_reg(part->master, from, len,
						 retlen, buf);
}

static int part_get_user_prot_info(struct mtd_info *mtd, size_t len,
				   size_t *retlen, struct otp_info *buf)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_get_user_prot_info(part->master, len, retlen,
						 buf);
}

static int part_read_fact_prot_reg(struct mtd_info *mtd, loff_t from,
		size_t len, size_t *retlen, u_char *buf)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_read_fact_prot_reg(part->master, from, len,
						 retlen, buf);
}

static int part_get_fact_prot_info(struct mtd_info *mtd, size_t len,
				   size_t *retlen, struct otp_info *buf)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_get_fact_prot_info(part->master, len, retlen,
						 buf);
}

static int part_write(struct mtd_info *mtd, loff_t to, size_t len,
		size_t *retlen, const u_char *buf)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_write(part->master, to + part->offset, len,
				    retlen, buf);
}

static int part_panic_write(struct mtd_info *mtd, loff_t to, size_t len,
		size_t *retlen, const u_char *buf)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_panic_write(part->master, to + part->offset, len,
					  retlen, buf);
}

static int part_write_oob(struct mtd_info *mtd, loff_t to,
		struct mtd_oob_ops *ops)
{
	struct mtd_part *part = PART(mtd);

	if (to >= mtd->size)
		return -EINVAL;
	if (ops->datbuf && to + ops->len > mtd->size)
		return -EINVAL;
	return part->master->_write_oob(part->master, to + part->offset, ops);
}

static int part_write_user_prot_reg(struct mtd_info *mtd, loff_t from,
		size_t len, size_t *retlen, u_char *buf)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_write_user_prot_reg(part->master, from, len,
						  retlen, buf);
}

static int part_lock_user_prot_reg(struct mtd_info *mtd, loff_t from,
		size_t len)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_lock_user_prot_reg(part->master, from, len);
}

static int part_writev(struct mtd_info *mtd, const struct kvec *vecs,
		unsigned long count, loff_t to, size_t *retlen)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_writev(part->master, vecs, count,
				     to + part->offset, retlen);
}

static int part_erase(struct mtd_info *mtd, struct erase_info *instr)
{
	struct mtd_part *part = PART(mtd);
	int ret;


	instr->partial_start = false;
	if (mtd->flags & MTD_ERASE_PARTIAL) {
		size_t readlen = 0;
		u64 mtd_ofs;

		instr->erase_buf = kmalloc(part->master->erasesize, GFP_ATOMIC);
		if (!instr->erase_buf)
			return -ENOMEM;

		mtd_ofs = part->offset + instr->addr;
		instr->erase_buf_ofs = do_div(mtd_ofs, part->master->erasesize);

		if (instr->erase_buf_ofs > 0) {
			instr->addr -= instr->erase_buf_ofs;
			ret = mtd_read(part->master,
				instr->addr + part->offset,
				part->master->erasesize,
				&readlen, instr->erase_buf);

			instr->len += instr->erase_buf_ofs;
			instr->partial_start = true;
		} else {
			mtd_ofs = part->offset + part->mtd.size;
			instr->erase_buf_ofs = part->master->erasesize -
				do_div(mtd_ofs, part->master->erasesize);

			if (instr->erase_buf_ofs > 0) {
				instr->len += instr->erase_buf_ofs;
				ret = mtd_read(part->master,
					part->offset + instr->addr +
					instr->len - part->master->erasesize,
					part->master->erasesize, &readlen,
					instr->erase_buf);
			} else {
				ret = 0;
			}
		}
		if (ret < 0) {
			kfree(instr->erase_buf);
			return ret;
		}

	}

	instr->addr += part->offset;
	ret = part->master->_erase(part->master, instr);
	if (ret) {
		if (instr->fail_addr != MTD_FAIL_ADDR_UNKNOWN)
			instr->fail_addr -= part->offset;
		instr->addr -= part->offset;
		if (mtd->flags & MTD_ERASE_PARTIAL)
			kfree(instr->erase_buf);
	}

	return ret;
}

void mtd_erase_callback(struct erase_info *instr)
{
	if (instr->mtd->_erase == part_erase) {
		struct mtd_part *part = PART(instr->mtd);
		size_t wrlen = 0;

		if (instr->mtd->flags & MTD_ERASE_PARTIAL) {
			if (instr->partial_start) {
				part->master->_write(part->master,
					instr->addr, instr->erase_buf_ofs,
					&wrlen, instr->erase_buf);
				instr->addr += instr->erase_buf_ofs;
			} else {
				instr->len -= instr->erase_buf_ofs;
				part->master->_write(part->master,
					instr->addr + instr->len,
					instr->erase_buf_ofs, &wrlen,
					instr->erase_buf +
					part->master->erasesize -
					instr->erase_buf_ofs);
			}
			kfree(instr->erase_buf);
		}
		if (instr->fail_addr != MTD_FAIL_ADDR_UNKNOWN)
			instr->fail_addr -= part->offset;
		instr->addr -= part->offset;
	}
	if (instr->callback)
		instr->callback(instr);
}
EXPORT_SYMBOL_GPL(mtd_erase_callback);

static int part_lock(struct mtd_info *mtd, loff_t ofs, uint64_t len)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_lock(part->master, ofs + part->offset, len);
}

static int part_unlock(struct mtd_info *mtd, loff_t ofs, uint64_t len)
{
	struct mtd_part *part = PART(mtd);

	ofs += part->offset;
	if (mtd->flags & MTD_ERASE_PARTIAL) {
		/* round up len to next erasesize and round down offset to prev block */
		len = (mtd_div_by_eb(len, part->master) + 1) * part->master->erasesize;
		ofs &= ~(part->master->erasesize - 1);
	}
	return part->master->_unlock(part->master, ofs, len);
}

static int part_is_locked(struct mtd_info *mtd, loff_t ofs, uint64_t len)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_is_locked(part->master, ofs + part->offset, len);
}

static void part_sync(struct mtd_info *mtd)
{
	struct mtd_part *part = PART(mtd);
	part->master->_sync(part->master);
}

static int part_suspend(struct mtd_info *mtd)
{
	struct mtd_part *part = PART(mtd);
	return part->master->_suspend(part->master);
}

static void part_resume(struct mtd_info *mtd)
{
	struct mtd_part *part = PART(mtd);
	part->master->_resume(part->master);
}

static int part_block_isreserved(struct mtd_info *mtd, loff_t ofs)
{
	struct mtd_part *part = PART(mtd);
	ofs += part->offset;
	return part->master->_block_isreserved(part->master, ofs);
}

static int part_block_isbad(struct mtd_info *mtd, loff_t ofs)
{
	struct mtd_part *part = PART(mtd);
	ofs += part->offset;
	return part->master->_block_isbad(part->master, ofs);
}

static int part_block_markbad(struct mtd_info *mtd, loff_t ofs)
{
	struct mtd_part *part = PART(mtd);
	int res;

	ofs += part->offset;
	res = part->master->_block_markbad(part->master, ofs);
	if (!res)
		mtd->ecc_stats.badblocks++;
	return res;
}

static inline void free_partition(struct mtd_part *p)
{
	kfree(p->mtd.name);
	kfree(p);
}

/*
 * This function unregisters and destroy all slave MTD objects which are
 * attached to the given master MTD object.
 */

int del_mtd_partitions(struct mtd_info *master)
{
	struct mtd_part *slave, *next;
	int ret, err = 0;

	mutex_lock(&mtd_partitions_mutex);
	list_for_each_entry_safe(slave, next, &mtd_partitions, list)
		if (slave->master == master) {
#ifdef DNI_PARTITION_MAPPING
			delete_block_mapping(&slave->mtd);
#endif
			ret = del_mtd_device(&slave->mtd);
			if (ret < 0) {
				err = ret;
				continue;
			}
			list_del(&slave->list);
			free_partition(slave);
		}
	mutex_unlock(&mtd_partitions_mutex);

	return err;
}

static struct mtd_part *allocate_partition(struct mtd_info *master,
			const struct mtd_partition *part, int partno,
			uint64_t cur_offset)
{
	struct mtd_part *slave;
	char *name;

	/* allocate the partition structure */
	slave = kzalloc(sizeof(*slave), GFP_KERNEL);
	name = kstrdup(part->name, GFP_KERNEL);
	if (!name || !slave) {
		printk(KERN_ERR"memory allocation error while creating partitions for \"%s\"\n",
		       master->name);
		kfree(name);
		kfree(slave);
		return ERR_PTR(-ENOMEM);
	}

	/* set up the MTD object for this partition */
	slave->mtd.type = master->type;
	slave->mtd.flags = master->flags & ~part->mask_flags;
	slave->mtd.size = part->size;
	slave->mtd.writesize = master->writesize;
	slave->mtd.writebufsize = master->writebufsize;
	slave->mtd.oobsize = master->oobsize;
	slave->mtd.oobavail = master->oobavail;
	slave->mtd.subpage_sft = master->subpage_sft;

	slave->mtd.name = name;
	slave->mtd.owner = master->owner;

	/* NOTE: Historically, we didn't arrange MTDs as a tree out of
	 * concern for showing the same data in multiple partitions.
	 * However, it is very useful to have the master node present,
	 * so the MTD_PARTITIONED_MASTER option allows that. The master
	 * will have device nodes etc only if this is set, so make the
	 * parent conditional on that option. Note, this is a way to
	 * distinguish between the master and the partition in sysfs.
	 */
	slave->mtd.dev.parent = IS_ENABLED(CONFIG_MTD_PARTITIONED_MASTER) ?
				&master->dev :
				master->dev.parent;

	slave->mtd._read = part_read;
	slave->mtd._write = part_write;

	if (master->_panic_write)
		slave->mtd._panic_write = part_panic_write;

	if (master->_point && master->_unpoint) {
		slave->mtd._point = part_point;
		slave->mtd._unpoint = part_unpoint;
	}

	if (master->_get_unmapped_area)
		slave->mtd._get_unmapped_area = part_get_unmapped_area;
	if (master->_read_oob)
		slave->mtd._read_oob = part_read_oob;
	if (master->_write_oob)
		slave->mtd._write_oob = part_write_oob;
	if (master->_read_user_prot_reg)
		slave->mtd._read_user_prot_reg = part_read_user_prot_reg;
	if (master->_read_fact_prot_reg)
		slave->mtd._read_fact_prot_reg = part_read_fact_prot_reg;
	if (master->_write_user_prot_reg)
		slave->mtd._write_user_prot_reg = part_write_user_prot_reg;
	if (master->_lock_user_prot_reg)
		slave->mtd._lock_user_prot_reg = part_lock_user_prot_reg;
	if (master->_get_user_prot_info)
		slave->mtd._get_user_prot_info = part_get_user_prot_info;
	if (master->_get_fact_prot_info)
		slave->mtd._get_fact_prot_info = part_get_fact_prot_info;
	if (master->_sync)
		slave->mtd._sync = part_sync;
	if (!partno && !master->dev.class && master->_suspend &&
	    master->_resume) {
			slave->mtd._suspend = part_suspend;
			slave->mtd._resume = part_resume;
	}
	if (master->_writev)
		slave->mtd._writev = part_writev;
	if (master->_lock)
		slave->mtd._lock = part_lock;
	if (master->_unlock)
		slave->mtd._unlock = part_unlock;
	if (master->_is_locked)
		slave->mtd._is_locked = part_is_locked;
	if (master->_block_isreserved)
		slave->mtd._block_isreserved = part_block_isreserved;
	if (master->_block_isbad)
		slave->mtd._block_isbad = part_block_isbad;
	if (master->_block_markbad)
		slave->mtd._block_markbad = part_block_markbad;
	slave->mtd._erase = part_erase;
	slave->master = master;
	slave->offset = part->offset;

	if (slave->offset == MTDPART_OFS_APPEND)
		slave->offset = cur_offset;
	if (slave->offset == MTDPART_OFS_NXTBLK) {
		/* Round up to next erasesize */
		slave->offset = mtd_roundup_to_eb(cur_offset, master);
		if (slave->offset != cur_offset)
			printk(KERN_NOTICE "Moving partition %d: "
			       "0x%012llx -> 0x%012llx\n", partno,
			       (unsigned long long)cur_offset, (unsigned long long)slave->offset);
	}
	if (slave->offset == MTDPART_OFS_RETAIN) {
		slave->offset = cur_offset;
		if (master->size - slave->offset >= slave->mtd.size) {
			slave->mtd.size = master->size - slave->offset
							- slave->mtd.size;
		} else {
			printk(KERN_ERR "mtd partition \"%s\" doesn't have enough space: %#llx < %#llx, disabled\n",
				part->name, master->size - slave->offset,
				slave->mtd.size);
			/* register to preserve ordering */
			goto out_register;
		}
	}
	if (slave->mtd.size == MTDPART_SIZ_FULL)
		slave->mtd.size = master->size - slave->offset;

	printk(KERN_NOTICE "0x%012llx-0x%012llx : \"%s\"\n", (unsigned long long)slave->offset,
		(unsigned long long)(slave->offset + slave->mtd.size), slave->mtd.name);

	/* let's do some sanity checks */
	if (slave->offset >= master->size) {
		/* let's register it anyway to preserve ordering */
		slave->offset = 0;
		slave->mtd.size = 0;
		printk(KERN_ERR"mtd: partition \"%s\" is out of reach -- disabled\n",
			part->name);
		goto out_register;
	}
	if (slave->offset + slave->mtd.size > master->size) {
		slave->mtd.size = master->size - slave->offset;
		printk(KERN_WARNING"mtd: partition \"%s\" extends beyond the end of device \"%s\" -- size truncated to %#llx\n",
			part->name, master->name, (unsigned long long)slave->mtd.size);
	}
	if (master->numeraseregions > 1) {
		/* Deal with variable erase size stuff */
		int i, max = master->numeraseregions;
		u64 end = slave->offset + slave->mtd.size;
		struct mtd_erase_region_info *regions = master->eraseregions;

		/* Find the first erase regions which is part of this
		 * partition. */
		for (i = 0; i < max && regions[i].offset <= slave->offset; i++)
			;
		/* The loop searched for the region _behind_ the first one */
		if (i > 0)
			i--;

		/* Pick biggest erasesize */
		for (; i < max && regions[i].offset < end; i++) {
			if (slave->mtd.erasesize < regions[i].erasesize) {
				slave->mtd.erasesize = regions[i].erasesize;
			}
		}
		BUG_ON(slave->mtd.erasesize == 0);
	} else {
		/* Single erase size */
		slave->mtd.erasesize = master->erasesize;
	}

	if ((slave->mtd.flags & MTD_WRITEABLE) &&
	    mtd_mod_by_eb(slave->offset, &slave->mtd)) {
		/* Doesn't start on a boundary of major erase size */
		slave->mtd.flags |= MTD_ERASE_PARTIAL;
		if (((u32) slave->mtd.size) > master->erasesize)
			slave->mtd.flags &= ~MTD_WRITEABLE;
		else
			slave->mtd.erasesize = slave->mtd.size;
	}
	if ((slave->mtd.flags & MTD_WRITEABLE) &&
	    mtd_mod_by_eb(slave->offset + slave->mtd.size, &slave->mtd)) {
		slave->mtd.flags |= MTD_ERASE_PARTIAL;

		if ((u32) slave->mtd.size > master->erasesize)
			slave->mtd.flags &= ~MTD_WRITEABLE;
		else
			slave->mtd.erasesize = slave->mtd.size;
	}

	slave->mtd.ecclayout = master->ecclayout;
	slave->mtd.ecc_step_size = master->ecc_step_size;
	slave->mtd.ecc_strength = master->ecc_strength;
	slave->mtd.bitflip_threshold = master->bitflip_threshold;

	if (master->_block_isbad) {
		uint64_t offs = 0;

		while (offs < slave->mtd.size) {
			if (mtd_block_isreserved(master, offs + slave->offset))
				slave->mtd.ecc_stats.bbtblocks++;
			else if (mtd_block_isbad(master, offs + slave->offset))
				slave->mtd.ecc_stats.badblocks++;
			offs += slave->mtd.erasesize;
		}
	}

out_register:
	return slave;
}

static ssize_t mtd_partition_offset_show(struct device *dev,
		struct device_attribute *attr, char *buf)
{
	struct mtd_info *mtd = dev_get_drvdata(dev);
	struct mtd_part *part = PART(mtd);
	return snprintf(buf, PAGE_SIZE, "%lld\n", part->offset);
}

static DEVICE_ATTR(offset, S_IRUGO, mtd_partition_offset_show, NULL);

static const struct attribute *mtd_partition_attrs[] = {
	&dev_attr_offset.attr,
	NULL
};

static int mtd_add_partition_attrs(struct mtd_part *new)
{
	int ret = sysfs_create_files(&new->mtd.dev.kobj, mtd_partition_attrs);
	if (ret)
		printk(KERN_WARNING
		       "mtd: failed to create partition attrs, err=%d\n", ret);
	return ret;
}

int mtd_add_partition(struct mtd_info *master, const char *name,
		      long long offset, long long length)
{
	struct mtd_partition part;
	struct mtd_part *new;
	int ret = 0;

	/* the direct offset is expected */
	if (offset == MTDPART_OFS_APPEND ||
	    offset == MTDPART_OFS_NXTBLK)
		return -EINVAL;

	if (length == MTDPART_SIZ_FULL)
		length = master->size - offset;

	if (length <= 0)
		return -EINVAL;

	part.name = name;
	part.size = length;
	part.offset = offset;
	part.mask_flags = 0;
	part.ecclayout = NULL;

	new = allocate_partition(master, &part, -1, offset);
	if (IS_ERR(new))
		return PTR_ERR(new);

	mutex_lock(&mtd_partitions_mutex);
	list_add(&new->list, &mtd_partitions);
	mutex_unlock(&mtd_partitions_mutex);

	add_mtd_device(&new->mtd);
	mtd_partition_split(master, new);
#ifdef DNI_PARTITION_MAPPING
	remap_blocks_in_rootfs_partition(new);
#endif

	mtd_add_partition_attrs(new);

	return ret;
}
EXPORT_SYMBOL_GPL(mtd_add_partition);

int mtd_del_partition(struct mtd_info *master, int partno)
{
	struct mtd_part *slave, *next;
	int ret = -EINVAL;

	mutex_lock(&mtd_partitions_mutex);
	list_for_each_entry_safe(slave, next, &mtd_partitions, list)
		if ((slave->master == master) &&
		    (slave->mtd.index == partno)) {
			sysfs_remove_files(&slave->mtd.dev.kobj,
					   mtd_partition_attrs);
			ret = del_mtd_device(&slave->mtd);
			if (ret < 0)
				break;

			list_del(&slave->list);
			free_partition(slave);
			break;
		}
	mutex_unlock(&mtd_partitions_mutex);

	return ret;
}
EXPORT_SYMBOL_GPL(mtd_del_partition);

static int
run_parsers_by_type(struct mtd_part *slave, enum mtd_parser_type type)
{
	struct mtd_partition *parts;
	int nr_parts;
	int i;

	nr_parts = parse_mtd_partitions_by_type(&slave->mtd, type, &parts,
						NULL);
	if (nr_parts <= 0)
		return nr_parts;

	if (WARN_ON(!parts))
		return 0;

	for (i = 0; i < nr_parts; i++) {
		/* adjust partition offsets */
		parts[i].offset += slave->offset;

		mtd_add_partition(slave->master,
				  parts[i].name,
				  parts[i].offset,
				  parts[i].size);
	}

	kfree(parts);

	return nr_parts;
}

static inline unsigned long
mtd_pad_erasesize(struct mtd_info *mtd, int offset, int len)
{
	unsigned long mask = mtd->erasesize - 1;

	len += offset & mask;
	len = (len + mask) & ~mask;
	len -= offset & mask;
	return len;
}

#ifdef CONFIG_MTD_SPLIT_FIRMWARE_NAME
#define SPLIT_FIRMWARE_NAME	CONFIG_MTD_SPLIT_FIRMWARE_NAME
#else
#define SPLIT_FIRMWARE_NAME	"unused"
#endif

static void split_firmware(struct mtd_info *master, struct mtd_part *part)
{
	run_parsers_by_type(part, MTD_PARSER_TYPE_FIRMWARE);
}

void __weak arch_split_mtd_part(struct mtd_info *master, const char *name,
                                int offset, int size)
{
}

static void mtd_partition_split(struct mtd_info *master, struct mtd_part *part)
{
	static int rootfs_found = 0;

	if (rootfs_found)
		return;

#ifdef CONFIG_DNI_SUPPORT_DUAL_FIRMWARE
	if ((!strcmp(part->mtd.name, "rootfs2")) || (!strcmp(part->mtd.name, "rootfs")))
	{
		if (boot_from_dni_dual_firmware(master) == 2)
		{
			if (!strcmp(part->mtd.name, "rootfs2")) {
				run_parsers_by_type(part, MTD_PARSER_TYPE_ROOTFS);

				if (config_enabled(CONFIG_MTD_ROOTFS_ROOT_DEV) && ROOT_DEV == 0) {
					pr_notice("mtd: device %d (%s) set to be root filesystem\n", part->mtd.index, part->mtd.name);
					ROOT_DEV = MKDEV(MTD_BLOCK_MAJOR, part->mtd.index);
				}

				rootfs_found = 1;
			}
		}
		else
		{
			if (!strcmp(part->mtd.name, "rootfs")) {
				run_parsers_by_type(part, MTD_PARSER_TYPE_ROOTFS);

				if (config_enabled(CONFIG_MTD_ROOTFS_ROOT_DEV) && ROOT_DEV == 0) {
					pr_notice("mtd: device %d (%s) set to be root filesystem\n", part->mtd.index, part->mtd.name);
					ROOT_DEV = MKDEV(MTD_BLOCK_MAJOR, part->mtd.index);
				}

				rootfs_found = 1;
			}
		}
	}
#else
	if (!strcmp(part->mtd.name, "rootfs")) {
		run_parsers_by_type(part, MTD_PARSER_TYPE_ROOTFS);

		rootfs_found = 1;
	}
#endif

	if (!strcmp(part->mtd.name, SPLIT_FIRMWARE_NAME) &&
	    config_enabled(CONFIG_MTD_SPLIT_FIRMWARE))
		split_firmware(master, part);

	arch_split_mtd_part(master, part->mtd.name, part->offset,
			    part->mtd.size);
}

/*
 * support dni dual firmware booting
 */
#ifdef CONFIG_DNI_SUPPORT_DUAL_FIRMWARE

/* definition in uboot
#define BOARD_BOOT_PARTITION_PARAMETER_OFFSET   0   // "1" or "2"
#define BOARD_BOOT_PARTITIOM_PARAMETER_LENGTH   1
*/

#define DNI_BOARD_DATA2_PARTITION_OFFSET 0x01280000 /* must same as dni_nand_partition in drivers/mtd/ofpart.c */

int boot_from_dni_dual_firmware(struct mtd_info *master)
{
	char boot_index;
	int ret_len;
	int rootfs_mtd_index = -1;

	mtd_read(master, DNI_BOARD_DATA2_PARTITION_OFFSET, sizeof(boot_index), &ret_len, (void *)&boot_index);

	printk(KERN_NOTICE "%s: boot partition index in boarddata2 is 0x%02X\n", __func__, boot_index);

	if (boot_index != 0x31 && boot_index != 0x32)
	{
		boot_index = 0x31;
		printk(KERN_NOTICE "%s: no valid boot index on boarddata2 partition, default boot firmware1!\n", __func__);
	}

	if (boot_index == 0x31)
	{
		rootfs_mtd_index = 1;
		printk(KERN_NOTICE "%s: booting rootfs from rootfs\n", __func__);
	}
	else
	{
		rootfs_mtd_index = 2;
		printk(KERN_NOTICE "%s: booting rootfs from rootfs%d\n", __func__, rootfs_mtd_index);
	}

	return rootfs_mtd_index;
}
EXPORT_SYMBOL_GPL(boot_from_dni_dual_firmware);
#endif

/*
 * This function, given a master MTD object and a partition table, creates
 * and registers slave MTD objects which are bound to the master according to
 * the partition definitions.
 *
 * For historical reasons, this function's caller only registers the master
 * if the MTD_PARTITIONED_MASTER config option is set.
 */

int add_mtd_partitions(struct mtd_info *master,
		       const struct mtd_partition *parts,
		       int nbparts)
{
	struct mtd_part *slave;
	uint64_t cur_offset = 0;
	int i;

	printk(KERN_NOTICE "Creating %d MTD partitions on \"%s\":\n", nbparts, master->name);

	for (i = 0; i < nbparts; i++) {
		slave = allocate_partition(master, parts + i, i, cur_offset);
		if (IS_ERR(slave)) {
			del_mtd_partitions(master);
			return PTR_ERR(slave);
		}

		mutex_lock(&mtd_partitions_mutex);
		list_add(&slave->list, &mtd_partitions);
		mutex_unlock(&mtd_partitions_mutex);

		add_mtd_device(&slave->mtd);
		mtd_partition_split(master, slave);
#ifdef DNI_PARTITION_MAPPING
		remap_blocks_in_rootfs_partition(slave);
#endif
		mtd_add_partition_attrs(slave);

		cur_offset = slave->offset + slave->mtd.size;
	}

	return 0;
}

static DEFINE_SPINLOCK(part_parser_lock);
static LIST_HEAD(part_parsers);

static struct mtd_part_parser *get_partition_parser(const char *name)
{
	struct mtd_part_parser *p, *ret = NULL;

	spin_lock(&part_parser_lock);

	list_for_each_entry(p, &part_parsers, list)
		if (!strcmp(p->name, name) && try_module_get(p->owner)) {
			ret = p;
			break;
		}

	spin_unlock(&part_parser_lock);

	return ret;
}

#define put_partition_parser(p) do { module_put((p)->owner); } while (0)

static struct mtd_part_parser *
get_partition_parser_by_type(enum mtd_parser_type type,
			     struct mtd_part_parser *start)
{
	struct mtd_part_parser *p, *ret = NULL;

	spin_lock(&part_parser_lock);

	p = list_prepare_entry(start, &part_parsers, list);
	if (start)
		put_partition_parser(start);

	list_for_each_entry_continue(p, &part_parsers, list) {
		if (p->type == type && try_module_get(p->owner)) {
			ret = p;
			break;
		}
	}

	spin_unlock(&part_parser_lock);

	return ret;
}

void register_mtd_parser(struct mtd_part_parser *p)
{
	spin_lock(&part_parser_lock);
	list_add(&p->list, &part_parsers);
	spin_unlock(&part_parser_lock);
}
EXPORT_SYMBOL_GPL(register_mtd_parser);

void deregister_mtd_parser(struct mtd_part_parser *p)
{
	spin_lock(&part_parser_lock);
	list_del(&p->list);
	spin_unlock(&part_parser_lock);
}
EXPORT_SYMBOL_GPL(deregister_mtd_parser);

/*
 * Parses the linux,part-probe device tree property.
 * When a non null value is returned it has to be freed with kfree() by
 * the caller.
 */
static const char * const *of_get_probes(struct device_node *dp)
{
	const char *cp;
	int cplen;
	unsigned int l;
	unsigned int count;
	const char **res;

	cp = of_get_property(dp, "linux,part-probe", &cplen);
	if (cp == NULL)
		return NULL;

	count = 0;
	for (l = 0; l != cplen; l++)
		if (cp[l] == 0)
			count++;

	res = kzalloc((count + 1) * sizeof(*res), GFP_KERNEL);
	if (!res)
		return NULL;
	count = 0;
	while (cplen > 0) {
		res[count] = cp;
		l = strlen(cp) + 1;
		cp += l;
		cplen -= l;
		count++;
	}
	return res;
}

/*
 * Do not forget to update 'parse_mtd_partitions()' kerneldoc comment if you
 * are changing this array!
 */
static const char * const default_mtd_part_types[] = {
	"cmdlinepart",
	"ofpart",
	NULL
};

/**
 * parse_mtd_partitions - parse MTD partitions
 * @master: the master partition (describes whole MTD device)
 * @types: names of partition parsers to try or %NULL
 * @pparts: array of partitions found is returned here
 * @data: MTD partition parser-specific data
 *
 * This function tries to find partition on MTD device @master. It uses MTD
 * partition parsers, specified in @types. However, if @types is %NULL, then
 * the default list of parsers is used. The default list contains only the
 * "cmdlinepart" and "ofpart" parsers ATM.
 * Note: If there are more then one parser in @types, the kernel only takes the
 * partitions parsed out by the first parser.
 *
 * This function may return:
 * o a negative error code in case of failure
 * o zero if no partitions were found
 * o a positive number of found partitions, in which case on exit @pparts will
 *   point to an array containing this number of &struct mtd_info objects.
 */
int parse_mtd_partitions(struct mtd_info *master, const char *const *types,
			 struct mtd_partition **pparts,
			 struct mtd_part_parser_data *data)
{
	struct mtd_part_parser *parser;
	int ret, err = 0;
	const char *const *types_of = NULL;

	if (data && data->of_node) {
		types_of = of_get_probes(data->of_node);
		if (types_of != NULL)
			types = types_of;
	}

	if (!types)
		types = default_mtd_part_types;

	for ( ; *types; types++) {
		pr_debug("%s: parsing partitions %s\n", master->name, *types);
		parser = get_partition_parser(*types);
		if (!parser && !request_module("%s", *types))
			parser = get_partition_parser(*types);
		pr_debug("%s: got parser %s\n", master->name,
			 parser ? parser->name : NULL);
		if (!parser)
			continue;
		ret = (*parser->parse_fn)(master, pparts, data);
		pr_debug("%s: parser %s: %i\n",
			 master->name, parser->name, ret);
		put_partition_parser(parser);
		if (ret > 0) {
			printk(KERN_NOTICE "%d %s partitions found on MTD device %s\n",
			       ret, parser->name, master->name);
			return ret;
		}
		/*
		 * Stash the first error we see; only report it if no parser
		 * succeeds
		 */
		if (ret < 0 && !err)
			err = ret;
	}
	kfree(types_of);
	return err;
}

int parse_mtd_partitions_by_type(struct mtd_info *master,
				 enum mtd_parser_type type,
				 struct mtd_partition **pparts,
				 struct mtd_part_parser_data *data)
{
	struct mtd_part_parser *prev = NULL;
	int ret = 0;

	while (1) {
		struct mtd_part_parser *parser;

		parser = get_partition_parser_by_type(type, prev);
		if (!parser)
			break;

		ret = (*parser->parse_fn)(master, pparts, data);

		if (ret > 0) {
			put_partition_parser(parser);
			printk(KERN_NOTICE
			       "%d %s partitions found on MTD device %s\n",
			       ret, parser->name, master->name);
			break;
		}

		prev = parser;
	}

	return ret;
}
EXPORT_SYMBOL_GPL(parse_mtd_partitions_by_type);

int mtd_is_partition(const struct mtd_info *mtd)
{
	struct mtd_part *part;
	int ispart = 0;

	mutex_lock(&mtd_partitions_mutex);
	list_for_each_entry(part, &mtd_partitions, list)
		if (&part->mtd == mtd) {
			ispart = 1;
			break;
		}
	mutex_unlock(&mtd_partitions_mutex);

	return ispart;
}
EXPORT_SYMBOL_GPL(mtd_is_partition);

struct mtd_info *mtdpart_get_master(const struct mtd_info *mtd)
{
	if (!mtd_is_partition(mtd))
		return (struct mtd_info *)mtd;

	return PART(mtd)->master;
}
EXPORT_SYMBOL_GPL(mtdpart_get_master);

uint64_t mtdpart_get_offset(const struct mtd_info *mtd)
{
	if (!mtd_is_partition(mtd))
		return 0;

	return PART(mtd)->offset;
}
EXPORT_SYMBOL_GPL(mtdpart_get_offset);

/* Returns the size of the entire flash chip */
uint64_t mtd_get_device_size(const struct mtd_info *mtd)
{
	if (!mtd_is_partition(mtd))
		return mtd->size;

	return PART(mtd)->master->size;
}
EXPORT_SYMBOL_GPL(mtd_get_device_size);