/************
 *
 * Filename:    dil_log.h
 * Purpose:     logging functionality of the DIL:
 *		 		It can be configured to log to console and to
 *log file Copyright:   (c) Netgear Inc. 2018 All rights reserved Author:      @
 *VVDN TECHNOLOGIES
 *
 ************/

/* Define to prevent recursive inclusion---------------------*/

#ifndef _INTF_LOG_H_
#define _INTF_LOG_H_

#include <stdio.h>

/*
 *  debug output levels.
 *  One of them has to be set to __log_level
 */
#define LOG_DEBUG 1
#define LOG_INFO 2
#define LOG_WARNING 3
#define LOG_ERROR 4
#define LOG_SILENT 5 /** only for declaring __log_level - no debug output */

#define BUFFER_SIZE_256 256
#define DIL_VERSION "1.0.0"
#define DIL_VERSION_SUFFIX ""

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
extern void __attribute__((format(printf, 4, 5)))
log_printf(int log_level, const char *fname, int lineno, const char *fmt, ...);

int __log_level = LOG_DEBUG;
int __log_to_console = 1;
int __log_to_file = 0;
const char *__log_file_name = "/tmp/dillog";

#endif /* _INTF_LOG_H_ */
