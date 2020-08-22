/************
 *
 * Filename:	dyn_log.h
 * Purpose:		logging functionality for the  ALL the DAL subsytems
 *				It can be configured to log to console and to log file 
 * Copyright:	(c) Netgear Inc.
 *				2019 All rights reserved 
 * Author:		@VVDN TECHNOLOGIES
 *
 ************/

/* Define to prevent recursive inclusion---------------------*/

#ifndef _INTF_LOG_H_
#define _INTF_LOG_H_

#include <stdio.h>
#include <stdbool.h>
#define BUFFER_SIZE_16 16
#define BUFFER_SIZE_32 32
#define BUFFER_SIZE_64 64
#define BUFFER_SIZE_256 256
/*
 *  debug output levels.
 *  One of them has to be set to __log_level
 */
#define LOG_DEBUG	1
#define LOG_INFO	2
#define LOG_WARNING	3
#define LOG_ERROR	4
#define LOG_SILENT	5 /** only for declaring __log_level - no debug output */


#define SUCCESS 0
#define FAILURE 1

#define DEBUG 0
/** define which adds filename, line number to log */
#define log(log_level, ...)                                                    \
  log_printf(log_level, __FILE__, __LINE__, __VA_ARGS__)

/* define functions which have to be used for debug messages ,
 * Always call these functions for logging!
 * developer needs to be careful to define the levels
 */
#define log_debug(...) log(LOG_DEBUG, __VA_ARGS__)
#define log_info(...) log(LOG_INFO, __VA_ARGS__)
#define log_warning(...) log(LOG_WARNING, __VA_ARGS__)
#define log_error(...) log(LOG_ERROR, __VA_ARGS__)

/** log function - NOT to be called directly, internally used */
void __attribute__((format(printf, 4, 5)))
log_printf(int log_level, const char *fname, int lineno, const char *fmt, ...);

extern void set_log_level(_Bool checkForConfiguration, char *moduleName, char *exec_binaryName);

/** default log level have to be declared somewhere: LOG_DEBUG, LOG_INFO,
 * LOG_WARNING, LOG_ERROR, LOG_SILIENT */
//int __log_level = LOG_SILENT;
extern int  __log_level;

/** variable which have to be declared somewhere to output debug to stdin: 0 -
 * no, 1 - yes */
//int __log_to_console = 1;
extern int __log_to_console;
/** variable which have to be declared somewhere to output debug to log file: 0
 * - no, 1 - yes */
//int __log_to_file = 1;
extern int __log_to_file;
/*Default set to Silent and to console*/
//char __log_file_name[32] = {0};
extern char __log_file_name[32];
#endif /* _INTF_LOG_H_ */
