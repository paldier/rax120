/*
 * (C) Copyright 2000-2010
 * Wolfgang Denk, DENX Software Engineering, wd@denx.de.
 *
 * (C) Copyright 2001 Sysgo Real-Time Solutions, GmbH <www.elinos.com>
 * Andreas Heppel <aheppel@sysgo.de>

 * SPDX-License-Identifier:	GPL-2.0+
 */

#include <common.h>
#include <command.h>
#include <environment.h>
#include <linux/stddef.h>

DECLARE_GLOBAL_DATA_PTR;

extern env_t *env_ptr;

#if defined(CONFIG_HW29765589P0P256P1024P4X4P8X8) || defined(CONFIG_HW29765589P0P512P1024P4X4P8X8)
void env_relocate_spec(void)
#endif
#ifdef CONFIG_HW29765235P0P512P1024P4X4P4X4
void env_nowhere_relocate_spec(void)
#endif
{
}

/*
 * Initialize Environment use
 *
 * We are still running from ROM, so data use is limited
 */
#if defined(CONFIG_HW29765589P0P256P1024P4X4P8X8) || defined(CONFIG_HW29765589P0P512P1024P4X4P8X8)
int env_init(void)
#endif
#ifdef CONFIG_HW29765235P0P512P1024P4X4P4X4
int env_nowhere_init(void)
#endif
{
	gd->env_addr	= (ulong)&default_environment[0];
	gd->env_valid	= 0;

	return 0;
}
