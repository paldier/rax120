/*
 * CopyRight (C) 2008 Delta Networks, Inc.
 */

#include <linux/init.h>
#include <linux/fs.h>
/* #include <linux/devfs_fs_kernel.h> */
#include <linux/proc_fs.h>
#include <linux/major.h>
#include <linux/blkdev.h>
#include <linux/module.h>
#include <linux/raw.h>
#include <linux/capability.h>
#include <linux/uio.h>
#include <linux/cdev.h>
#include <linux/device.h>
#include <linux/sysctl.h>

#include <linux/seq_file.h>
#include <linux/kdev_t.h>
#include <linux/spinlock.h>
#include <linux/of_gpio.h>
#include <linux/module.h>
#include <asm/uaccess.h>
#include <linux/delay.h>
#include <linux/gpio.h>
#include <linux/irq.h>
#include <linux/slab.h>

#ifndef EXPORT_SYMTAB
#define EXPORT_SYMTAB
#endif

void shift_serial_led_output(int val);
void set_shift_led_state(int led_no, int val);
static unsigned int shift_serial_led_flag = 0xffff7fff;
static void inline led_option_action(int option);
static void data_blink_led_shot(unsigned long val);
typedef irqreturn_t (*sc_callback_t) (int, void *, void *, void *);

typedef struct {
        char            *name;
        sc_callback_t   registered_cb;
        void            *cb_arg1;
        void            *cb_arg2;
} multi_callback_t;

/*
 * Specific instance of the callback structure
 */
static multi_callback_t sccallback[2];

#define ATHEROSGPIO_MAJOR	        240
#define ATHEROSGPIO_MAX_MINORS    3

/*************************************************************
 *			Ioctl-commands
 *************************************************************/

#define LED_IOCTL      0x5311
#define ROUTER_MODE    0
#define AP_MODE        1
#define BRIDGE_MODE    2

static struct timer_list data_blink_led_timer;
static struct timer_list os_butdet_t; /* Button detect */
static struct timer_list os_staled_t; /* Status LED blinking */
static struct timer_list os_clickap_t; /* 1-Click AP mode LED blinking */
static struct timer_list os_diswps_t; /* WPS LED blinking while WPS error occured,
                            like push button is pressed if WPS was disabled */
static struct timer_list os_rstled_t; /* Status LED blinking */
static struct timer_list os_bootled_t;
static struct timer_list os_upgled_t;

#define DNI_SIMPLE_CONFIG_SET 1
#if DNI_SIMPLE_CONFIG_SET
static struct proc_dir_entry *scset_entry; /* simple config set entry, configure all GPIOs */
#endif

/* AR9580 GPIOs */
#define USB_5V_GPIO             0

#define LED_ON_INV 	1
#define LED_OFF_INV	0

#define POLL_INTERVAL           100     /* millisecond */
#define TIME_5SECONDS           5000    /* 5second */
#define TIME_1SECOND            1000    /* 1second */
#define COUNT_5SECONDS          50      /* (TIME_5SECONDS / POLL_INTERVAL) */
#define COUNT_2SECONDS          20      /* (TIME_2SECONDS / POLL_INTERVAL) */
#define TIME_500MSECONDS        500     /* 500msecond */
#define TIME_750MSECONDS        750     /* 750msecond */
#define TIME_250MSECONDS        250     /* 250msecond */
#define WPS_LED_ERR_INTERVAL    100     /* millisecond */
#define DATA_BLINK_TIMEVAL      100

/* LED Number define */
#define PWR_LED         1
#define WAN_LED         2
#define WLAN_5G_LED     3
#define WLAN_24G_LED    4
#define USB_LED0        5
#define USB_LED1        6
#define WAN_25G_LED     7
#define UPG_LED         8 
#define WPS_LED         9
#define WIFI_LED        10
#define OPT_BLINK       11
#define OPT_ON          12
#define OPT_OFF         13
#define ALL_LED         14
#define USB_EN0         17
#define USB_EN1         18

typedef enum {
        free = 0,       /* release button, pop up */
        push = 1,       /* press button */
        hold = 2,       /* press button and hold pushed state */
}but_state_t;

static but_state_t wifibut = free;      /* WLAN switch */
static but_state_t pushbut = free;      /* Push button */
static but_state_t resetbut = free;     /* Reset button */
static but_state_t wifibut_push_state = free;

static int rstbut_count = 0;
static int wpsbut_count = 0;
static int wlan_count = 0;
static int click_apmode_flag = 0;
static int boot_led_status = 1;

static int staled_s = 0;
static int wifibut_s = 0;
static int pushbut_s = 0;
static int reset_push = 0;
static int wps_push = 0;
static int wlan_push = 0;

static int led_option = OPT_OFF;
static int led_factory = 0;
EXPORT_SYMBOL(led_factory);

static int wan_data_detected = 0;
static int wifi2g_data_detected = 0;
static int wifi5g_data_detected = 0;
static int port5g_data_detected = 0;
static int usb0_data_detected = 0;
static int usb1_data_detected = 0;

#define OS_TIMER_FUNC(_fn)      \
        void _fn(unsigned long timer_arg)

#define OS_INIT_TIMER(_osdev, _timer, _fn, _arg)        \
do {                                                    \
        init_timer(_timer);                             \
        (_timer)->function = (_fn);                     \
        (_timer)->data = (unsigned long)(_arg);         \
} while (0)

#define OS_SET_TIMER(_timer, _ms)       \
        mod_timer(_timer, jiffies + ((_ms)*HZ)/1000)

#define OS_CANCEL_TIMER(_timer)         del_timer_sync(_timer)

/* ledcontrol define */
#define LED_ON     0
#define LED_OFF    1

#define WAN25G_OFF		0
#define WAN25G_AMBER	1
#define WAN25G_GREEN	2
#define WAN25G_BLUE	3

static int wan_staystate = LED_OFF;
static int wifi2g_staystate = LED_OFF;
static int wifi5g_staystate = LED_OFF;
static int usb0_staystate = LED_OFF;
static int usb1_staystate = LED_OFF;
static int wifi_staystate = LED_OFF_INV;
static int wps_staystate = LED_OFF_INV;
static int wan25g_staystate = WAN25G_OFF;

/* LED color */
#define LED_AMBER   0
#define LED_GREEN   1
#define LED_BLUE    2
#define LED_RED     3
#define LED_ALL     4

//There're six option-leds need to check

static spinlock_t serial_led_lock;

struct led_priv_t
{
	int led_num;
	int led_color;
	int led_status;
};

/* Define Used_GPIOs */
struct gpio_priv_t
{
    int usb_0_5v_gpio;
    int usb_1_5v_gpio;
    int wps_led_gpio;
    int wifi_led_gpio;
    int led_clk_gpio;
    int led_data_gpio;
    int led_clr_gpio;
    int button_wlan_gpio;
    int button_reset_gpio;
    int button_wps_gpio;
} gpio_priv_project;

/* LED_Board LED number */
#define LED_25G_1G_STATE        0
#define LED_25G_10V100_STATE    1
#define LED_25G_25G_STATE       2
#define LED_INTERNET_STATE      3
#define LED_USB1_STATE          4
#define LED_USB2_STATE          5
#define LED_WIFI_5G_STATE       6
#define LED_WIFI_24G_STATE      7
#define LED_POWER_STATE         8
#define LED_SHIFT_BOARD_SIZE    16
static int led_shift_board[] = {4, 5, 9, 10, 11, 12, 13, 14, 15};

static volatile int ignore_pushbutton = 0;

static struct proc_dir_entry *simple_config_entry = NULL;
static struct proc_dir_entry *simulate_push_button_entry = NULL;
static struct proc_dir_entry *tricolor_led_entry  = NULL;
static struct proc_dir_entry *wps_entry  = NULL;
static struct proc_dir_entry *button_state = NULL;
static struct proc_dir_entry *button_test = NULL;
static struct proc_dir_entry *disable_wps = NULL; /* WPS is disabled? write into: 1 => disable, 0 => enable */
static struct proc_dir_entry *op_mode = NULL; /* Get opmode info */
static struct proc_dir_entry *usb5v_en0 = NULL;
static struct proc_dir_entry *usb5v_en1 = NULL;

static struct proc_dir_entry *red_led = NULL;
static struct proc_dir_entry *green_led = NULL;
static struct proc_dir_entry *blue_led = NULL;
#ifdef CONFIG_DNI_TRAFFIC_BLINK
static struct proc_dir_entry *wan_preference = NULL;
#endif

static int reset_count = 0;
static int wps_count = 0;
static int wireless_count = 0;
static int diswps = 0;  /* 0 => WPS is enabled, 1 => WPS is disabled */
static int opmode = 0;	/* 0 => Router Mode, 1 => AP Mode, 2 => Bridge Mode, 3 => Others */
static int diswps_blink_count = 0; /* max value: 50, blinking 5 seconds */

/**************************************************************/

#define UPG_LED_ONTIME    250
#define UPG_LED_OFFTIME   750

static unsigned int upg_status = 1;

/******************  Enable and Disable USB  ********************/

static void dni_ap_usb_en0_on(void)
{
	__gpio_set_value(gpio_priv_project.usb_0_5v_gpio, LED_ON_INV);
}

static void dni_ap_usb_en0_off(void)
{
	__gpio_set_value(gpio_priv_project.usb_0_5v_gpio, LED_OFF_INV);
}

static void dni_ap_usb_en1_on(void)
{
	__gpio_set_value(gpio_priv_project.usb_1_5v_gpio, LED_ON_INV);
}

static void dni_ap_usb_en1_off(void)
{
	__gpio_set_value(gpio_priv_project.usb_1_5v_gpio, LED_OFF_INV);
}

/********************  Proc File System Setup  **********************/
static ssize_t push_button_read(struct file *file, char __user *buf,
                                        size_t count, loff_t *ppos)
{
        return 0;
}

static ssize_t push_button_write(struct file *file, const char *buf,
                                unsigned long count, loff_t *data)
{
        if (sccallback[0].registered_cb) {
                sccallback[0].registered_cb (0, sccallback[0].cb_arg1, 0, sccallback[0].cb_arg2);
        }
        if (sccallback[1].registered_cb) {
                sccallback[1].registered_cb (0, sccallback[1].cb_arg1, 0, sccallback[1].cb_arg2);
        }
        return count;
}

static  struct file_operations push_button_ops = {
        .read	= push_button_read,
        .write  = push_button_write,
};
/************************* GPIO tricolor ******************************/
typedef enum {
	LED_STATE_OFF 	=	0,
	LED_STATE_GREEN =	1,
	LED_STATE_AMBER =	2,
	LED_STATE_ORANGE =  3,
	LED_STATE_MAX	=	4
} led_state_e;

static led_state_e gpio_tricolorled = LED_STATE_OFF;

static ssize_t gpio_tricolor_led_read(struct file *file, char __user *buf,
                                        size_t count, loff_t *ppos)
{
	char buffer[16];
	int len;

	len = snprintf(buffer, sizeof(buffer), "%d\n", gpio_tricolorled);
	return simple_read_from_buffer(buf, count, ppos, buffer, len);
}

static ssize_t gpio_tricolor_led_write(struct file *file, const char *buf,
					unsigned long count, loff_t *data)
{
	u_int32_t val, green_led_onoff = 0;

	if (sscanf(buf, "%d", &val) != 1)
		return -ENOENT;

	if (val >= LED_STATE_MAX)
		return -ENOENT;

	switch (val){
	    case LED_STATE_OFF:
	    		green_led_onoff = LED_OFF;
			break;
	    case LED_STATE_GREEN:
	    		green_led_onoff = LED_ON;
			break;
	    case LED_STATE_AMBER:
	    		green_led_onoff = LED_ON;
                	break;
	    case LED_STATE_ORANGE:
	    		green_led_onoff = LED_ON;
                	break;
	}

	gpio_tricolorled = val;
	__gpio_set_value(gpio_priv_project.wps_led_gpio, green_led_onoff);
	return count;

}

static  struct file_operations tricolor_led_ops = {
  .read           = gpio_tricolor_led_read,
  .write          = gpio_tricolor_led_write,
};

/************************* WPS  ******************************/
static ssize_t wps_read(struct file *file, char __user *buf,
                                        size_t count, loff_t *ppos)
{
        if (sccallback[0].registered_cb) {
                if (sccallback[0].cb_arg2) {
                        *(u_int32_t *)sccallback[0].cb_arg2 = 0;
                }
				sccallback[0].registered_cb (0, sccallback[0].cb_arg1, (struct pt_regs *)"info",  \
					sccallback[0].cb_arg2);
        }
        if (sccallback[1].registered_cb) {
                if (sccallback[1].cb_arg2) {
                        *(u_int32_t *)sccallback[1].cb_arg2 = 0;
				}
				sccallback[1].registered_cb (0, sccallback[1].cb_arg1, (struct pt_regs *)"info",  \
					sccallback[1].cb_arg2);
        }
        return 0;
}

static ssize_t wps_write(struct file *file, const char *buf,
                                        unsigned long count, loff_t *data)
{
        if (0 != strncmp(buf,"pin=",4) && 0 != strncmp(buf,"stop",4))
                return count;

        if (sccallback[0].registered_cb) {
                if (sccallback[0].cb_arg2) {
                        *(u_int32_t *)sccallback[0].cb_arg2 = 0;
                }
                sccallback[0].registered_cb (0, sccallback[0].cb_arg1, (struct pt_regs *)buf,  \
                        sccallback[0].cb_arg2);
        }
        if (sccallback[1].registered_cb) {
                if (sccallback[1].cb_arg2) {
                        *(u_int32_t *)sccallback[1].cb_arg2 = 0;
                }
                sccallback[1].registered_cb (0, sccallback[1].cb_arg1, (struct pt_regs *)buf,  \
                        sccallback[1].cb_arg2);
        }
        return count;
}

static  struct file_operations wps_ops = {
  .read           = wps_read,
  .write          = wps_write,
};
/************************* Button Setup ******************************/

static ssize_t button_state_read(struct file *file, char __user *buf, size_t count, loff_t *ppos)
{
	/**
	* return AX6000 states of all buttons.
	* return value: <PUSHBUTTONstate><WIFIBUTTONstate><RESETBUTTONstate>
	*   <PUSHBUTTONstate>=1x       #'x' value: 0 - free, 1 - pressed
	*   <WIFIBUTTONstate>=2x       #'x' value: 0 - free, 1 - pressed
	*   <RESETBUTTONstate>=3x      #'x' value: 0 - free, 1 - pressed(time<5s), 2 - pressed(time>5s)
	**/
	char buffer[16];
	int len;

	len = snprintf(buffer, sizeof(buffer), "1%u2%u3%u\n", (u_int32_t)pushbut, (u_int32_t)wifibut, (u_int32_t)resetbut);
	return simple_read_from_buffer(buf, count, ppos, buffer, len);
}

static ssize_t button_state_write (struct file *file, const char *buf,
                                        unsigned long count, loff_t *data)
{
	/**
	* set state of button.
	* valid value: <Button number><value>
	*   <Button number>: 1 - Push button, 2 - WiFi button, 3 - Reset button
	*   <value>: should be 0, that indicate the event of button pressed is handled by upper process.
	**/
	u_int32_t num, val;
	char *msg = "Error: valid value inputted into /proc/simple_config/button_state should as below.\n" \
			"  <Button number><value>\n" \
			"\t<Button number>: 1 - Push button, 2 - WiFi button, 3 - Reset button.\n" \
			"\t<value> should be 0.\n";

	num = (u_int32_t)(*buf - '0');
	val = (u_int32_t)(*(buf + 1) - '0');

	if (val != 0) {
		printk("%s", msg);
		return count;
	}

	switch (num) {
	case 1:
		pushbut = free;
		break;
	case 2:
		wifibut = free;
		break;
	case 3:
		resetbut = free;
		break;
	default:
		printk("%s", msg);
		break;
	}

        return count;
}

static  struct file_operations button_ops = {
        .read           = button_state_read,
        .write          = button_state_write,
};

/************************* WPS Disabled  ******************************/

static ssize_t disable_wps_read(struct file *file, char __user *buf,
					size_t count, loff_t *ppos)
{
        return 0;
}

static ssize_t disable_wps_write(struct file *file, const char *buf,
                                        unsigned long count, loff_t *data)
{
        u_int32_t val;

        if (sscanf(buf, "%d", &val) != 1)
                return -EINVAL;

        if (val == 1) { /* WPS was disabled */
                diswps = 1;
        } else if (val == 0) { /* WPS was enabled */
                diswps = 0;
                OS_CANCEL_TIMER(&os_diswps_t);
        }

        return count;
}

static  struct file_operations disable_wps_ops = {
        .read           = disable_wps_read,
        .write          = disable_wps_write,
};

/************************ Get opmode ******************************/
static ssize_t opmode_read(struct file *file, char __user *buf,
					size_t count, loff_t *ppos)
{
		printk("Opmode = %d", opmode);
		return 0;
}

static ssize_t opmode_write(struct file *file, const char *buf,
                                        unsigned long count, loff_t *data)
{
        u_int32_t val;
        if (sscanf(buf, "%d", &val) != 1)
                return -EINVAL;
		if (val == opmode)
				return count;
		if (val == 0){
			printk("==== normal mode ====\n");
			opmode = 0;
		}
		else if (val == 1){
			printk("==== AP mode ====\n");
			opmode = 1;
		}
		else if (val == 2){
			printk("==== BR mode ====\n");
			opmode = 2;
		}
		else 
			opmode = 3;
		return count;
}
static  struct file_operations opmode_ops = {
        .read           = opmode_read,
        .write          = opmode_write,
};
/************************* USB Enable ******************************/

static ssize_t usb5v_0_enable_read(struct file *file, char __user *buf,
					size_t count, loff_t *ppos)
{
        return 0;
}

static ssize_t usb5v_0_enable_write(struct file *file, const char *buf,
                                        unsigned long count, loff_t *data)
{
        u_int32_t val;
        if (sscanf(buf, "%d", &val) != 1)
                return -EINVAL;
        if (!val) {
                __gpio_set_value(gpio_priv_project.usb_0_5v_gpio, 0);
        } else {
                __gpio_set_value(gpio_priv_project.usb_0_5v_gpio, 1);
        }
        return count;
}

static  struct file_operations usb5v_en0_ops = {
        .read           = usb5v_0_enable_read,
        .write          = usb5v_0_enable_write,
};

static ssize_t usb5v_1_enable_read(struct file *file, char __user *buf,
                                        size_t count, loff_t *ppos)
{
        return 0;
}

static ssize_t usb5v_1_enable_write(struct file *file, const char *buf,
                                        unsigned long count, loff_t *data)
{
        u_int32_t val;
        if (sscanf(buf, "%d", &val) != 1)
                return -EINVAL;
        if (!val) {
                __gpio_set_value(gpio_priv_project.usb_1_5v_gpio, 0);
        } else {
                __gpio_set_value(gpio_priv_project.usb_1_5v_gpio, 1);
        }
        return count;
}

static  struct file_operations usb5v_en1_ops = {
        .read           = usb5v_1_enable_read,
        .write          = usb5v_1_enable_write,
};
/********************** LED Proc Operation *************************/
static void turn_off_all_color_led(void)
{
	unsigned int ledoff = 0xffff7fff;
	__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_OFF_INV);
	__gpio_set_value(gpio_priv_project.wifi_led_gpio, LED_OFF_INV);
	shift_serial_led_output(ledoff);
}

static ssize_t red_led_read(struct file *file, char __user *buf,
                                        size_t count, loff_t *ppos)
{
        return 0;
}

static ssize_t red_led_write(struct file *file, const char *buf,
                                unsigned long count, loff_t *data)
{
	if (0 != strncmp(buf,"on",2) && 0 != strncmp(buf,"off",3))
		return count;

	if (strncmp(buf,"on",2) == 0) {
		led_factory = 1;
		led_option_action(OPT_ON);
		set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_ON);
	} else if (strncmp(buf,"off",3) == 0) {
		led_factory = 1;
		led_option_action(OPT_ON);
		set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_OFF);
	}
	return count;

}

static  struct file_operations red_led_ops = {
        .read           = red_led_read,
        .write          = red_led_write,
};

static ssize_t green_led_read(struct file *file, char __user *buf,
                                        size_t count, loff_t *ppos)
{
	return 0;
}

static ssize_t green_led_write(struct file *file, const char *buf,
                                unsigned long count, loff_t *data)
{
	if (0 != strncmp(buf,"on",2) && 0 != strncmp(buf,"off",3))
		return count;

	if (strncmp(buf,"on",2) == 0) {
		led_factory = 1;
		led_option_action(OPT_ON);
		set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_ON);
        } else if (strncmp(buf,"off",3) == 0) {
		led_factory = 1;
		led_option_action(OPT_ON);
		set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_OFF);
	}
	return count;

}

static  struct file_operations green_led_ops = {
        .read           = green_led_read,
        .write          = green_led_write,
};

static ssize_t blue_led_read(struct file *file, char __user *buf,
                                        size_t count, loff_t *ppos)
{
        return 0;
}

static ssize_t blue_led_write(struct file *file, const char *buf,
                                unsigned long count, loff_t *data)
{
	if (0 != strncmp(buf,"on",2) && 0 != strncmp(buf,"off",3))
		return count;
	
	if (strncmp(buf,"on",2) == 0) {
		led_factory = 1;
		led_option_action(OPT_ON);
		set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_ON);
		set_shift_led_state(led_shift_board[LED_INTERNET_STATE], LED_ON);
		set_shift_led_state(led_shift_board[LED_USB1_STATE], LED_ON);
		set_shift_led_state(led_shift_board[LED_USB2_STATE], LED_ON);
		set_shift_led_state(led_shift_board[LED_WIFI_5G_STATE], LED_ON);
		set_shift_led_state(led_shift_board[LED_WIFI_24G_STATE], LED_ON);
		set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
		__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_ON_INV);
		__gpio_set_value(gpio_priv_project.wifi_led_gpio, LED_ON_INV);
		
	} else if (strncmp(buf,"off",3) == 0) {
		led_factory = 1;
		led_option_action(OPT_OFF);
		set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_INTERNET_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_USB1_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_USB2_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_WIFI_5G_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_WIFI_24G_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
		__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_OFF_INV);
		__gpio_set_value(gpio_priv_project.wifi_led_gpio, LED_OFF_INV);
	}
	return count;

}
static  struct file_operations blue_led_ops = {
        .read           = blue_led_read,
        .write          = blue_led_write,
};

#ifdef CONFIG_DNI_TRAFFIC_BLINK
static ssize_t wan_preference_read(struct file *file, char __user *buf,
				   size_t count, loff_t *ppos)
{
	return 0;
}

extern void set_wan_preference(int val);

/* Set wan preference to the value which gets from userspace */
static ssize_t wan_preference_write(struct file *file, const char __user *buf,
				    size_t count, loff_t *ppos)
{
	char pref;

	if (copy_from_user(&pref, buf, sizeof(pref)))
		return -EFAULT;

	set_wan_preference(pref - '0');

	return count;
}

static const struct file_operations wan_preference_ops = {
	.read  = wan_preference_read,
	.write = wan_preference_write,
};
#endif

static ssize_t button_test_read(struct file *file, char __user *buf,
                                        size_t count, loff_t *ppos)
{
	char buffer[16];
	int len;

	len = snprintf(buffer, sizeof(buffer), "%d:%d:%d\n", reset_count, wps_count, wireless_count);
	return simple_read_from_buffer(buf, count, ppos, buffer, len);
}

static ssize_t button_test_write(struct file *file, const char *buf,
                                unsigned long count, loff_t *data)
{
        if (strncmp(buf, "reset", 5) == 0) {
                reset_count = 0;
                wps_count = 0;
                wireless_count = 0;
                led_factory = 1;
        }

        return count;

}

static  struct file_operations button_test_ops = {
        .read           = button_test_read,
        .write          = button_test_write,
};
/************************ Timer Function ****************************/
static OS_TIMER_FUNC(diswps_led_blink)
{
        static int onoff = 0;

        if (!diswps ||  diswps_blink_count <= 0)
                return;

        if (onoff) {
			
			__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_OFF_INV);
        } else {
			__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_ON_INV);
        }
        onoff = 1 - onoff;
        diswps_blink_count--;
        if (diswps_blink_count == 0) {
			__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_ON_INV);
			return;
        }
        OS_SET_TIMER(&os_diswps_t, WPS_LED_ERR_INTERVAL);
}

 
static OS_TIMER_FUNC(resetled_blink)
{
		static int rstonoff = 0;
		OS_CANCEL_TIMER(&os_bootled_t);
		if (rstonoff){
				set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
				OS_SET_TIMER(&os_rstled_t, TIME_1SECOND);
		} else {
				set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
				OS_SET_TIMER(&os_rstled_t, TIME_1SECOND);
		}
		rstonoff = 1 - rstonoff;
}

static OS_TIMER_FUNC(statusled_blink)
{
        static int onoff = 0;
        OS_CANCEL_TIMER(&os_rstled_t);
        if (onoff) {
				set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
				printk("Factory Reset Mode\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b");
				OS_SET_TIMER(&os_staled_t, TIME_750MSECONDS);
        } else {
				set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
				printk("                  \b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b");
				OS_SET_TIMER(&os_staled_t, TIME_250MSECONDS);
        }
        onoff = 1 - onoff;
}

static OS_TIMER_FUNC(click_ap_blink)
{
        static int onoff = 0;
        if (onoff) {
				set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
				OS_SET_TIMER(&os_clickap_t, TIME_500MSECONDS);
        } else {
				set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
				OS_SET_TIMER(&os_clickap_t, TIME_500MSECONDS);
        }
        onoff = 1 - onoff;
}

static OS_TIMER_FUNC(boot_led_blink)
{
		if (boot_led_status){
				set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
				OS_SET_TIMER(&os_bootled_t, TIME_1SECOND);
				boot_led_status = 0;
		} else {	
				set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
				OS_SET_TIMER(&os_bootled_t, TIME_1SECOND);
				boot_led_status = 1;
		}
}
static OS_TIMER_FUNC(upg_led_shot)
{
	if (upg_status) {
		set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
		upg_status = 0;
		OS_SET_TIMER(&os_upgled_t, UPG_LED_OFFTIME);
	} else {
		set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
		upg_status = 1;
		OS_SET_TIMER(&os_upgled_t, UPG_LED_ONTIME);
	}
}
static OS_TIMER_FUNC(button_detect)
{
		int wifi_gpio_status;
		int wps_gpio_status;
		int reset_gpio_status;
	
	/* AX6000 Main Board GPIO25: WIRELESS ON/OFF(Input Pin / Active HIGH) */
	wifi_gpio_status = __gpio_get_value(gpio_priv_project.button_wlan_gpio);
	wps_gpio_status = __gpio_get_value(gpio_priv_project.button_wps_gpio);
	reset_gpio_status = __gpio_get_value(gpio_priv_project.button_reset_gpio);

	if (!wifi_gpio_status) {
		wlan_push = 1;
		wlan_count++;
	/* [Bug 24969]According to NTGR's requirement, it should only trigger enabling or
	 * disabling the wireless radio after the WLAN switch button is pressed and held
	 * for more than 1 second.
	 * Frequency of GPIO state detecting is 100 milliseconds, so if detect that WLAN
	 * switch button is pressed and held more than 9 times, just trigger the
	 * functionality to trun on/off WLAN.
	 */
		if (wlan_count >= 10 && !wifibut_s) {
			wifibut_s = 1;
			wifibut_push_state = push; /* wifi button state is push*/
			OS_CANCEL_TIMER(&os_diswps_t);
			}
		if (wifibut_push_state == push && !wps_gpio_status && !pushbut_s){
			if (opmode == ROUTER_MODE){
				set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
				OS_SET_TIMER(&os_clickap_t, TIME_500MSECONDS);
			}
			pushbut_s = 1;
			click_apmode_flag = 1;
			wifibut_push_state = hold; /* wifi button state is hold*/
		}
	} else {
		wlan_count = 0;
		if(wifibut_push_state == push){
			wifibut = push;
		}else if( wifibut_push_state == hold){
			wifibut = hold;
		}

		wifibut_push_state = free;
		if (click_apmode_flag && wps_gpio_status){
			click_apmode_flag = 0;
			OS_CANCEL_TIMER(&os_clickap_t);
			set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
		}
		if (wifibut_s) {
			wifibut_s = 0;
			wifibut_push_state = free;
		}
		if (pushbut_s) {
			pushbut_s = 0;
		}
		if (wlan_push) {
			wireless_count++;
			wlan_push = 0;
		}
	}

	/* AX6000 Main Board GPIO57: WPS SWITCH (Input Pin / Active HIGH) */
	if (!wps_gpio_status) {
		wps_push = 1;
		wpsbut_count++;
		if (wpsbut_count >= 5 && !pushbut_s && !click_apmode_flag) {
			pushbut_s = 1;
			pushbut = push;
			/* blink WPS LED more than 5 seconds if WPS is disable */
			if (diswps) {
				diswps_blink_count = 50;
				__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_OFF_INV);
				OS_SET_TIMER(&os_diswps_t, WPS_LED_ERR_INTERVAL);
			}
		}
		/* if WPS was disabled, and push button is pressed and hold, just blink WPS LED
		* until push button is free, and then continue blink WPS LED 5 seconds */
		if (diswps)
			diswps_blink_count = 50;
	} else {
		wpsbut_count = 0;

		if (pushbut_s) {
			pushbut_s = 0;
		}
		if (wps_push) {
			wps_count++;
			wps_push = 0;
		}
	}

        /* AX6000 Main Board GPIO54: RESET SWITCH (Input Pin/Active HIGH) */
        if (!reset_gpio_status) {
				reset_push = 1;
                rstbut_count++;
                if (!staled_s && !led_factory) {
                        OS_CANCEL_TIMER(&os_bootled_t);
                        set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
                        OS_SET_TIMER(&os_rstled_t, TIME_1SECOND);
                        OS_SET_TIMER(&os_staled_t, TIME_5SECONDS);
                        staled_s = 1;
                }
        } else {
                if (COUNT_5SECONDS <= rstbut_count)
                        resetbut = hold;
                else if (0 < rstbut_count && COUNT_5SECONDS > rstbut_count)
                        resetbut = push;
                /* turn off POWER & STATUS LEDs, cancel timer */
                if (staled_s) {
                        OS_CANCEL_TIMER(&os_rstled_t);
                        OS_CANCEL_TIMER(&os_staled_t);
                        set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
                        staled_s = 0;
                }
                rstbut_count = 0;
                if (reset_push) {
                        reset_count++;
                        reset_push = 0;
                }
        }

        OS_SET_TIMER(&os_butdet_t, POLL_INTERVAL);
}

static void init_project_gpio_define(void)
{
        /* AX6000 main board gpio define */
        /* Button*/
        gpio_priv_project.button_wps_gpio=57;
        gpio_priv_project.button_reset_gpio=54;
        gpio_priv_project.button_wlan_gpio=25;
        /* USB enabled */
        gpio_priv_project.usb_0_5v_gpio=30;
        gpio_priv_project.usb_1_5v_gpio=31;
        /* LED drive by 74HC164 in Main Board*/
        gpio_priv_project.wps_led_gpio=40;
        gpio_priv_project.wifi_led_gpio=41;
        /* LED drive by 74HC164 in Shift Board*/
        gpio_priv_project.led_clk_gpio=18;
        gpio_priv_project.led_data_gpio=19;
        gpio_priv_project.led_clr_gpio=20;

}

#if DNI_SIMPLE_CONFIG_SET
static ssize_t simple_config_set_read(struct file *file, char __user *buf,
                                        size_t count, loff_t *ppos)
{
        printk("Read from scset is not support :(\n");
        return 0;
}

static int get_word(char *p, char *ret, int len)
{
        static char word[256];
        int count = 0, index = 0;

        if (!p || *p == '\0')
                return 0;

        /* skip all space in head of the string */
        while (*p == ' ')
                count++, p++;

        while (*p != ' ' && *p != '\0' && *p != '\n' && *p != '\r')
                count++, word[index++] = *p++;
        word[index] = '\0';

        memcpy(ret, word, len);
        /* avoid overflow */
        ret[len - 1] = '\0';

        return count;
}

static int word2int(char *word)
{
        int val = 0;

        if (!word || *word == '\0')
                return -1;

        while (*word != '\0') {
                if (*word > '9' || *word < '0')
                        return -1;

                val = val * 10 + (int)(*word++ - '0');
        }

        return val;
}

static ssize_t simple_config_set_write (struct file *file, const char *buf,
                               unsigned long count, loff_t *data)
{
        /* buf format:
         *      "set 9344|9580 <pin> in|out <value>"
         *      "get 9344|9580 <pin>"
         *  <pin> is the GPIO pin number on chip
         *  <value> must be 0 or 1, set the GPIO's value
         **/
        int val = -1, pin = -1, chip, offset = 0;
        char method[8], mode[8], field[8];
        char *p = (char *)buf;

        offset = get_word(p, method, sizeof(method));
        p += offset;
        offset = get_word(p, field, sizeof(field));
        chip = word2int(field);
        p += offset;
        offset = get_word(p, field, sizeof(field));
        pin = word2int(field);
        p += offset;
        offset = get_word(p, mode, sizeof(mode));
        p += offset;
        offset = get_word(p, field, sizeof(field));
        val = word2int(field);

        printk("\n*Info* input is: %s\n", buf);
        printk("*Info*\tmethod: %s\n"
                "\tchip: %d\n"
                "\tpin: %d\n"
                "\tmode: %s\n"
                "\tvalue: %d\n",
                method, chip, pin, mode, val);

        switch (chip) {
        case 9344:
                if (pin > 22 || pin < 0)
                       goto SCSET_ERR;

                if (!strcmp(method, "get")) {
                        printk("value is: %u\n", (__gpio_get_value(pin) != 0));
                } else if (!strcmp(method, "set")) {
                        if (!strcmp(mode, "in")) {
                                //ath_gpio_config_input(pin);
                        } else if (!strcmp(mode, "out")) {
                                if ((val >> 1) != 0)
                                        goto SCSET_ERR;

                               // set_serial_led(pin, val);
                        } else
                                goto SCSET_ERR;
                } else
                        goto SCSET_ERR;
                break;
        case 9580:
                if (pin > 16 || pin < 0)
                        goto SCSET_ERR;

                if (!strcmp(method, "get")) {
                        printk("value is: %u\n", (__gpio_get_value(pin) != 0));
                } else if (!strcmp(method, "set")) {
                        if (!strcmp(mode, "in")) {
                                //ar9580GpioCfgInput(pin);
                        } else if (!strcmp(mode, "out")) {
                                if ((val >> 1) != 0)
                                        goto SCSET_ERR;

                                //ar9580GpioCfgOutput(pin);
                                //ar9580GpioSet(pin, val);
                        } else
                                goto SCSET_ERR;
                } else
                        goto SCSET_ERR;
                break;
        default:
                goto SCSET_ERR;
        }

        return count;

SCSET_ERR:
        printk("Usage:\n"
                "  echo \"set 9344|9580 <pin> in|out <value>\" > scset\n"
                "  echo \"get 9344|9580 <pin>\" > scset\n"
                "    9344|9580 specify the chip you want configure.\n"
                "    <pin> is the GPIO pin number on chip, [0~22] for 9344 and [0~16] for 9580.\n"
                "    in|out configure GPIO as input or output mode, invalid for get method..\n"
                "    <value> must be 0 or 1, set the GPIO's value, it's invalid for input mode or get method.\n");
        return count;
}

static  struct file_operations scset_ops = {
        .read           = simple_config_set_read,
        .write          = simple_config_set_write,
};
#endif

static void remove_simple_config_proc_entry(void)
{
	remove_proc_entry("push_button", simple_config_entry);
	remove_proc_entry("tricolor_led", simple_config_entry);
	remove_proc_entry("wps", simple_config_entry);
	remove_proc_entry("button_state", simple_config_entry);
	remove_proc_entry("diswps", simple_config_entry);
	remove_proc_entry("usb5v_0", simple_config_entry);
	remove_proc_entry("usb5v_1", simple_config_entry);
	remove_proc_entry("red_led", simple_config_entry);
	remove_proc_entry("green_led", simple_config_entry);
	remove_proc_entry("blue_led", simple_config_entry);
#ifdef CONFIG_DNI_TRAFFIC_BLINK
	remove_proc_entry("wan_preference", simple_config_entry);
#endif
	remove_proc_entry("button_test", simple_config_entry);	
#if DNI_SIMPLE_CONFIG_SET
	remove_proc_entry("scset", simple_config_entry);
#endif
	remove_proc_entry("simple_config", NULL);
    
	OS_CANCEL_TIMER(&os_butdet_t);
	OS_CANCEL_TIMER(&os_staled_t);
	OS_CANCEL_TIMER(&os_diswps_t);
	OS_CANCEL_TIMER(&os_clickap_t);
	OS_CANCEL_TIMER(&os_rstled_t);
	OS_CANCEL_TIMER(&os_bootled_t);
	OS_CANCEL_TIMER(&os_upgled_t);
}
static int create_simple_config_led_proc_entry(void)
{
        if (simple_config_entry != NULL) {
                printk("Already have a proc entry for /proc/simple_config!\n");
                return -ENOENT;
        }

        simple_config_entry = proc_mkdir("simple_config", NULL);
        if (!simple_config_entry)
                return -ENOENT;

        simulate_push_button_entry = proc_create("push_button", 0644, simple_config_entry, &push_button_ops);
        if (!simulate_push_button_entry)
                return -ENOENT;

        tricolor_led_entry = proc_create("tricolor_led", 0644, simple_config_entry, &tricolor_led_ops);
        if(!tricolor_led_entry)
        return -ENOENT;

        wps_entry = proc_create("wps", 0644, simple_config_entry, &wps_ops);
        if (!wps_entry)
                return -ENOENT;

        button_state = proc_create("button_state", 0644, simple_config_entry, &button_ops);
        if (!button_state)
                return -ENOENT;

        disable_wps = proc_create("diswps", 0644, simple_config_entry, &disable_wps_ops);
        if (!disable_wps)
                return -ENOENT;

        op_mode = proc_create("opmode", 0644, simple_config_entry, &opmode_ops);
        if (!op_mode)
                return -ENOENT;

#if DNI_SIMPLE_CONFIG_SET
        scset_entry = proc_create("scset", 0644, simple_config_entry, &scset_ops);
        if (!scset_entry)
                return -ENOENT;
#endif
        usb5v_en0 = proc_create("usb5v_0", 0644, simple_config_entry, &usb5v_en0_ops);
        if (!usb5v_en0)
                return -ENOENT;

        usb5v_en1 = proc_create("usb5v_1", 0644, simple_config_entry, &usb5v_en1_ops);
        if (!usb5v_en1)
                return -ENOENT;

        red_led = proc_create("red_led", 0644, simple_config_entry, &red_led_ops);
        if (!red_led)
        return -ENOENT;

        green_led = proc_create("green_led", 0644, simple_config_entry, &green_led_ops);
        if (!green_led)
        return -ENOENT;

        blue_led = proc_create("blue_led", 0644, simple_config_entry, &blue_led_ops);
        if (!blue_led)
        return -ENOENT;

#ifdef CONFIG_DNI_TRAFFIC_BLINK
	/*
	 * Create proc node "wan_preference" under "/proc/simple_config"
	 * for passing config value "wan_preference" from userspace to kernel
	 */
	wan_preference = proc_create("wan_preference", 0644, simple_config_entry,
				     &wan_preference_ops);
	if (!wan_preference)
		return -ENOENT;
#endif

        button_test = proc_create("button_test", 0644, simple_config_entry, &button_test_ops);
        if (!button_test)
        return -ENOENT;

	 /* configure gpios'direction */
        gpio_direction_output(gpio_priv_project.usb_0_5v_gpio, 1);
        gpio_direction_output(gpio_priv_project.usb_1_5v_gpio, 1);
        gpio_direction_output(gpio_priv_project.wps_led_gpio, 1);
        gpio_direction_output(gpio_priv_project.wifi_led_gpio, 1);
        gpio_direction_output(gpio_priv_project.led_clk_gpio, 1);
        gpio_direction_output(gpio_priv_project.led_data_gpio, 1);
        gpio_direction_output(gpio_priv_project.led_clr_gpio, 0);
        gpio_direction_input(gpio_priv_project.button_wps_gpio);
        gpio_direction_input(gpio_priv_project.button_reset_gpio);
        gpio_direction_input(gpio_priv_project.button_wlan_gpio);
	
	/* inital timer */
        OS_INIT_TIMER(NULL, &os_butdet_t, button_detect, &os_butdet_t);
        OS_INIT_TIMER(NULL, &os_staled_t, statusled_blink, &os_staled_t);
        OS_INIT_TIMER(NULL, &os_diswps_t, diswps_led_blink, &os_diswps_t);
        OS_INIT_TIMER(NULL, &os_clickap_t, click_ap_blink, &os_clickap_t);
        OS_INIT_TIMER(NULL, &data_blink_led_timer, data_blink_led_shot, &data_blink_led_timer);
        OS_INIT_TIMER(NULL, &os_rstled_t, resetled_blink, &os_rstled_t);
        OS_INIT_TIMER(NULL, &os_bootled_t, boot_led_blink, &os_bootled_t);
        OS_INIT_TIMER(NULL, &os_upgled_t, upg_led_shot, &os_upgled_t);

        /* enable timer */
        OS_SET_TIMER(&os_butdet_t, POLL_INTERVAL);
        OS_SET_TIMER(&os_bootled_t, TIME_1SECOND);

        return 0;
}

/*********************** 74HC164 Driver ************************/
void serial_led_init(void)
{
	/* ShiftBoard LED State Clear */
	__gpio_set_value(gpio_priv_project.led_clr_gpio, 1);
	__gpio_set_value(gpio_priv_project.led_clk_gpio, 0);
	__gpio_set_value(gpio_priv_project.led_data_gpio, 0);
	
	printk("Turn Off All LED\n");

	__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_OFF_INV);
	__gpio_set_value(gpio_priv_project.wifi_led_gpio, LED_OFF_INV);
	shift_serial_led_output(shift_serial_led_flag);
}
#if 0
void mb_serial_led_output(int val)
{

       int i;
       int bit_end;

       spin_lock(&serial_led_lock);
       for(i = 0; i < LED_MAIN_BOARD_SIZE; i++)
       {
               bit_end = ((val>>i) & 1)?1:0;
               __gpio_set_value(gpio_priv_project.led_data_opt_gpio, bit_end);
               __gpio_set_value(gpio_priv_project.led_clk_opt_gpio,1);
               __gpio_set_value(gpio_priv_project.led_clk_opt_gpio,0);
       }
       spin_unlock(&serial_led_lock);
 
}
#endif
void shift_serial_led_output(int val)
{

       int i;
       int bit_end;
       spin_lock_bh(&serial_led_lock);
       for(i = 0; i < LED_SHIFT_BOARD_SIZE; i++)
       {
               bit_end = ((val>>i) & 1)?1:0;
			    __gpio_set_value(gpio_priv_project.led_data_gpio, bit_end);
               __gpio_set_value(gpio_priv_project.led_clk_gpio,1);
               __gpio_set_value(gpio_priv_project.led_clk_gpio,0);
		}

       spin_unlock_bh(&serial_led_lock);

}

void set_shift_led_state(int led_no, int val)
{
        if(val)
                shift_serial_led_flag |= (1<<led_no);
        else
                shift_serial_led_flag &= ~(1<<led_no);

        __gpio_set_value(gpio_priv_project.led_clk_gpio,0);

        shift_serial_led_output(shift_serial_led_flag);
}

int get_shift_serial_led_val(int led_no)
{
        return (shift_serial_led_flag & (1<<led_no))?1:0;
}


void wifi_led_shot(int radio_type)
{
	set_shift_led_state(led_shift_board[radio_type], LED_OFF);
	set_shift_led_state(led_shift_board[radio_type], LED_ON);
}
EXPORT_SYMBOL(wifi_led_shot);

/*****************************************************************
 * @ status:	LED_ON / LED_OFF
 * @ color:	LED_AMBER / LED_GREEN
 *
 * These parameters SHOULD be verified well by `/sbin/ledcontrol`!!! ^_^
 *****************************************************************/
static void inline pwr_led_action(int status)
{
	OS_CANCEL_TIMER(&os_bootled_t);
	if (status == LED_OFF) {
		set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
	}else{	
		set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
	}
}

static void inline upg_led_action(int status)
{
	if (status == LED_ON) {
		set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
		upg_status = 1;
		OS_SET_TIMER(&os_upgled_t, TIME_1SECOND);
	} else {
		OS_CANCEL_TIMER(&os_upgled_t);
		set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
	}
}
static void inline usb_led0_action(int status)
{
	if (status == LED_ON) {
		usb0_staystate = LED_ON;
		if(led_option == OPT_OFF)
			return;
		set_shift_led_state(led_shift_board[LED_USB1_STATE], LED_ON);
	} else {
		usb0_staystate = LED_OFF;
		if(led_option == OPT_OFF)
			return;
		set_shift_led_state(led_shift_board[LED_USB1_STATE], LED_OFF);
	}
}
static void inline usb_led1_action(int status)
{
	if (status == LED_ON) {
		usb1_staystate = LED_ON;
		if(led_option == OPT_OFF)
			return;
		set_shift_led_state(led_shift_board[LED_USB2_STATE], LED_ON);
	} else {
		usb1_staystate = LED_OFF;
		if(led_option == OPT_OFF)
			return;
		set_shift_led_state(led_shift_board[LED_USB2_STATE], LED_OFF);
	}
}
static void inline wps_led_action(int color, int status)
{
	if (status == LED_ON) {
		wps_staystate = LED_ON_INV;
		if(led_option == OPT_OFF)
			return;
		__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_ON_INV);
	} else {
		wps_staystate = LED_OFF_INV;
		if(led_option == OPT_OFF){
			if(color == LED_RED) 
				wps_staystate = LED_ON_INV;
		}
		__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_OFF_INV);
	}
}
static void inline wan_led_action(int color, int status)
{
	if( led_factory == 1 && color != LED_BLUE)
		return;
	if (status == LED_OFF) {
		wan_staystate =  LED_OFF;
		if(led_option == OPT_OFF)
			return;
		set_shift_led_state(led_shift_board[LED_INTERNET_STATE], LED_OFF);
	} else {
		wan_staystate =  LED_ON;
		if(led_option == OPT_OFF)
			return;
		set_shift_led_state(led_shift_board[LED_INTERNET_STATE], LED_ON );
    }
}

static void inline wifi_led_action(int color, int status)
{
	if (status == LED_OFF) {
		wifi_staystate = LED_OFF_INV;
		if(led_option == OPT_OFF){
			if(color == LED_RED) 
				wifi_staystate = LED_ON_INV;
			return;
		}
		__gpio_set_value(gpio_priv_project.wifi_led_gpio, LED_OFF_INV);
	} else {
		wifi_staystate = LED_ON_INV;
		if(led_option == OPT_OFF)
			return;
		__gpio_set_value(gpio_priv_project.wifi_led_gpio, LED_ON_INV);
	}
}

static void inline wlan_24g_led_action(int color, int status)
{
    if (status == LED_ON) {
        wifi2g_staystate = LED_ON;
		if(led_option == OPT_OFF)
			return;
        set_shift_led_state(led_shift_board[LED_WIFI_24G_STATE], LED_ON);
    } else {
        wifi2g_staystate = LED_OFF;
		if(led_option == OPT_OFF){
			if(color == LED_RED) 
				wifi2g_staystate = LED_ON;
			return;
		}
        set_shift_led_state(led_shift_board[LED_WIFI_24G_STATE], LED_OFF);
    }
}
static void inline wlan_5g_led_action(int color, int status)
{
    if (status == LED_ON) {
        wifi5g_staystate = LED_ON;
		if(led_option == OPT_OFF)
			return;
        set_shift_led_state(led_shift_board[LED_WIFI_5G_STATE], LED_ON);
    } else {
        wifi5g_staystate = LED_OFF;
		if(led_option == OPT_OFF){
			if(color == LED_RED) 
				wifi5g_staystate = LED_ON;
			return;
		}
        set_shift_led_state(led_shift_board[LED_WIFI_5G_STATE], LED_OFF);
    }
}

static void inline wan_25g_led_action(int color, int status)
{
  if (status == LED_OFF) {
		wan25g_staystate = WAN25G_OFF;
		if(led_option == OPT_OFF)
			return;
		set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_OFF);
		return;
        }

  if (color == LED_AMBER) {
		wan25g_staystate = WAN25G_AMBER;
		if(led_option == OPT_OFF)
			return;
		set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_ON);
		set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_ON);
  } else if (color == LED_GREEN){
		wan25g_staystate = WAN25G_GREEN;
		if(led_option == OPT_OFF)
			return;
		set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_ON);
  } else if (color == LED_BLUE){
		wan25g_staystate = WAN25G_BLUE;
		if(led_option == OPT_OFF)
			return;
		set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_OFF);
		set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_ON);
		set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_OFF);
	}
}

static void inline usb_en0_action(int status)
{
	if (status == LED_ON) {
		dni_ap_usb_en0_on();
	} else {
		dni_ap_usb_en0_off();
	}
}
static void inline usb_en1_action(int status)
{
	if (status == LED_ON) {
		dni_ap_usb_en1_on();
	} else {
		dni_ap_usb_en1_off();
	}
}

void detect_wan_data(void)
{
	if ( led_factory == 1 )
		return;
	wan_data_detected = 1;
}
void detect_port5g_data(void)
{
	if ( led_factory == 1 )
		return;
	port5g_data_detected = 1;
}
void detect_wifi2g_data(void)
{
	if ( led_factory == 1 )
		return;
	wifi2g_data_detected = 1;
}

void detect_wifi5g_data(void)
{
	if ( led_factory == 1 )
		return;
	wifi5g_data_detected = 1;
}
void detect_usb0_data(void)
{
	if ( led_factory == 1 )
		return;
	usb0_data_detected = 1;
}

void detect_usb1_data(void)
{
	if ( led_factory == 1 )
		return;
	usb1_data_detected = 1;
}
EXPORT_SYMBOL(detect_wan_data);
EXPORT_SYMBOL(detect_port5g_data);
EXPORT_SYMBOL(detect_wifi2g_data);
EXPORT_SYMBOL(detect_wifi5g_data);
EXPORT_SYMBOL(detect_usb0_data);
EXPORT_SYMBOL(detect_usb1_data);

static void data_blink_led_shot(unsigned long val)
{
	int wan_led_state, wifi2g_led_state, wifi5g_led_state, usb0_led_state, usb1_led_state, wan25g_led_state;
	if (led_option == OPT_OFF)
		return;

	wan_led_state =	get_shift_serial_led_val(led_shift_board[LED_INTERNET_STATE]);
	wifi2g_led_state =	get_shift_serial_led_val(led_shift_board[LED_WIFI_24G_STATE]);
	wifi5g_led_state =	get_shift_serial_led_val(led_shift_board[LED_WIFI_5G_STATE]);
	usb0_led_state = get_shift_serial_led_val(led_shift_board[LED_USB1_STATE]);
	usb1_led_state = get_shift_serial_led_val(led_shift_board[LED_USB2_STATE]);

	if( get_shift_serial_led_val(led_shift_board[LED_25G_25G_STATE]) == LED_ON){
		if(get_shift_serial_led_val(led_shift_board[LED_25G_10V100_STATE]) == LED_ON)
			wan25g_led_state = WAN25G_AMBER;
		else
			wan25g_led_state = WAN25G_GREEN;
	}else{
		if (get_shift_serial_led_val(led_shift_board[LED_25G_1G_STATE]) == LED_ON)
			wan25g_led_state = WAN25G_BLUE;
		else
			wan25g_led_state = WAN25G_OFF;
	}

	if (wan_data_detected == 1){
		set_shift_led_state(led_shift_board[LED_INTERNET_STATE], wan_led_state == LED_OFF ? LED_ON : LED_OFF );
		wan_data_detected = 0;
	}else{
		if(wan_led_state != wan_staystate)
		set_shift_led_state(led_shift_board[LED_INTERNET_STATE], wan_staystate);
	}

	if (port5g_data_detected == 1){
		if (wan25g_staystate == WAN25G_BLUE){
			set_shift_led_state(led_shift_board[LED_25G_1G_STATE], wan25g_led_state == WAN25G_BLUE ? LED_OFF : LED_ON);
		}
		else if (wan25g_staystate == WAN25G_AMBER){
			set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], wan25g_led_state == WAN25G_AMBER ? LED_OFF : LED_ON);
			set_shift_led_state(led_shift_board[LED_25G_25G_STATE], wan25g_led_state == WAN25G_AMBER ? LED_OFF : LED_ON);
		}
		else if (wan25g_staystate == WAN25G_GREEN){
			set_shift_led_state(led_shift_board[LED_25G_25G_STATE], wan25g_led_state == WAN25G_GREEN ? LED_OFF : LED_ON);
		}
		port5g_data_detected = 0;
	}else{
		if (wan25g_staystate == WAN25G_BLUE){
			set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_ON);
			set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_OFF);
		}else if (wan25g_staystate == WAN25G_AMBER){
			set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_ON);
			set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_ON);
		}else if (wan25g_staystate == WAN25G_GREEN){
			set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_ON);
		}else if (wan25g_staystate == WAN25G_OFF){
			set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_OFF);
		}
	}

	if (wifi2g_data_detected == 1){
		set_shift_led_state(led_shift_board[LED_WIFI_24G_STATE], wifi2g_led_state == LED_OFF ? LED_ON : LED_OFF );
		wifi2g_data_detected = 0;
	}else{
		if(wifi2g_led_state != wifi2g_staystate)
		set_shift_led_state(led_shift_board[LED_WIFI_24G_STATE], wifi2g_staystate);
	}
	
	if (wifi5g_data_detected == 1){
		set_shift_led_state(led_shift_board[LED_WIFI_5G_STATE], wifi5g_led_state == LED_OFF ? LED_ON : LED_OFF );
		wifi5g_data_detected = 0;
	}else{
		if(wifi5g_led_state != wifi5g_staystate)
		set_shift_led_state(led_shift_board[LED_WIFI_5G_STATE], wifi5g_staystate);
	}
	if (usb0_data_detected == 1){
		set_shift_led_state(led_shift_board[LED_USB1_STATE], usb0_led_state == LED_OFF ? LED_ON : LED_OFF );
		usb0_data_detected = 0;
	}else{
		if(usb0_led_state != usb0_staystate)
		set_shift_led_state(led_shift_board[LED_USB1_STATE], usb0_staystate);
	}
	if (usb1_data_detected == 1){
		set_shift_led_state(led_shift_board[LED_USB2_STATE], usb1_led_state == LED_OFF ? LED_ON : LED_OFF );
		usb1_data_detected = 0;
	}else{
		if(usb1_led_state != usb1_staystate)
		set_shift_led_state(led_shift_board[LED_USB2_STATE], usb1_staystate);
	}
	OS_SET_TIMER(&data_blink_led_timer, DATA_BLINK_TIMEVAL);
}

static void inline led_option_action(int option)
{
	if (led_option == option)
		return;
	if (option == OPT_BLINK){
		led_factory = 0;

		OS_SET_TIMER(&data_blink_led_timer, DATA_BLINK_TIMEVAL);
	}

	if (led_option == OPT_BLINK)
		OS_CANCEL_TIMER(&data_blink_led_timer);

	led_option = option;

	if(option == OPT_OFF){
		turn_off_all_color_led();
	}else {
		set_shift_led_state(led_shift_board[LED_INTERNET_STATE], wan_staystate);
		set_shift_led_state(led_shift_board[LED_WIFI_24G_STATE], wifi2g_staystate);
		set_shift_led_state(led_shift_board[LED_WIFI_5G_STATE], wifi5g_staystate);
		set_shift_led_state(led_shift_board[LED_USB1_STATE], usb0_staystate);
		set_shift_led_state(led_shift_board[LED_USB2_STATE], usb1_staystate);
		__gpio_set_value(gpio_priv_project.wifi_led_gpio, wifi_staystate);
		__gpio_set_value(gpio_priv_project.wps_led_gpio, wps_staystate);
		wan_25g_led_action(wan25g_staystate == WAN25G_BLUE ? LED_BLUE : (wan25g_staystate == WAN25G_AMBER ? LED_AMBER : LED_GREEN), 
				wan25g_staystate == WAN25G_OFF ? LED_OFF : LED_ON);
	}
}

static void inline all_led_action(int color, int status)
{
	led_factory = 1;
	led_option_action(OPT_ON);

	if(color == LED_AMBER)	
	{
		if(status == LED_ON){
        	set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_ON);
		    set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_ON);
		}
		else{ 
		    set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_OFF);
        	set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_OFF);
		}
	}
	if(color == LED_BLUE)
	{
		if(status == LED_ON){
			set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_ON);
			set_shift_led_state(led_shift_board[LED_INTERNET_STATE], LED_ON);
			set_shift_led_state(led_shift_board[LED_USB1_STATE], LED_ON);
			set_shift_led_state(led_shift_board[LED_USB2_STATE], LED_ON);
			set_shift_led_state(led_shift_board[LED_WIFI_5G_STATE], LED_ON);
			set_shift_led_state(led_shift_board[LED_WIFI_24G_STATE], LED_ON);
			set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_ON);
			__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_ON_INV);
			__gpio_set_value(gpio_priv_project.wifi_led_gpio, LED_ON_INV);
		}else{
			set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_INTERNET_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_USB1_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_USB2_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_WIFI_5G_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_WIFI_24G_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
			__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_OFF_INV);
			__gpio_set_value(gpio_priv_project.wifi_led_gpio, LED_OFF_INV);
		}
	}
	if(color == LED_GREEN)
	{
		if(status == LED_ON)
		    set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_ON);
		else
		    set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_OFF);
	}
	if(color == LED_RED)
	{
		if(status == LED_ON)
		    set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_ON);
		else
		    set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_OFF);
	}
	if(color == LED_ALL)
	{
		if(status == LED_OFF){
		    set_shift_led_state(led_shift_board[LED_25G_25G_STATE], LED_OFF);
        	set_shift_led_state(led_shift_board[LED_25G_10V100_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_25G_1G_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_INTERNET_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_USB1_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_USB2_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_WIFI_5G_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_WIFI_24G_STATE], LED_OFF);
			set_shift_led_state(led_shift_board[LED_POWER_STATE], LED_OFF);
			__gpio_set_value(gpio_priv_project.wps_led_gpio, LED_OFF_INV);
			__gpio_set_value(gpio_priv_project.wifi_led_gpio, LED_OFF_INV);
		}
	}
}

/******************************************************************/
static int atherosgpio_open(struct inode *inode, struct file *file)
{
        return 0;
}

static ssize_t atherosgpio_read(struct file *file, char __user *buf,
                size_t count, loff_t *ppos)
{
        unsigned int val;
        char buffer[16];
        int len;

        if (*ppos > 4)
                return 0;

        //val = ath_reg_rd(ATH_GPIO_IN);
        //if (count >= 4) {
        //      copy_to_user(buf, &val, 4);
        //      *ppos += 4;
        //}

        //printk("GPIO Value = 0x%X\n", val);

        len = snprintf(buffer, sizeof(unsigned int), "%d", val);
        return simple_read_from_buffer(buf, count, ppos, buffer, len);
}

static ssize_t atherosgpio_write(struct file *file, const char __user *buf,
                size_t count, loff_t *ppos)
{
        return count;
}

static int atherosgpio_release(struct inode *inode, struct file *file)
{
        return 0;
}

static long atherosgpio_ioctl(struct file *file,
		unsigned int cmd, unsigned long arg)
{
	struct led_priv_t led_conf;

	if (cmd != LED_IOCTL) {
		printk("The LED command is NOT matched!!!(cmd=%d)\n",cmd);
		return -EFAULT;
	}

	if (copy_from_user(&led_conf, (void *)arg, sizeof(struct led_priv_t)))
		{
		return -EFAULT;
		}
	if (led_conf.led_num == PWR_LED)
		pwr_led_action(led_conf.led_status);
	else if (led_conf.led_num == UPG_LED)
		upg_led_action(led_conf.led_status);
	else if (led_conf.led_num == USB_LED0)
		usb_led0_action(led_conf.led_status);
	else if (led_conf.led_num == USB_LED1)
		usb_led1_action(led_conf.led_status);
	else if (led_conf.led_num == WPS_LED)
		wps_led_action(led_conf.led_color, led_conf.led_status);
	else if (led_conf.led_num == WIFI_LED)
		wifi_led_action(led_conf.led_color, led_conf.led_status);
	else if (led_conf.led_num == WAN_LED)
		wan_led_action(led_conf.led_color, led_conf.led_status);
	else if (led_conf.led_num == WLAN_24G_LED)
		wlan_24g_led_action(led_conf.led_color, led_conf.led_status);
	else if (led_conf.led_num == WLAN_5G_LED)
		wlan_5g_led_action(led_conf.led_color, led_conf.led_status);
	else if (led_conf.led_num == WAN_25G_LED)
		wan_25g_led_action(led_conf.led_color, led_conf.led_status);
	else if (led_conf.led_num == USB_EN0)
		usb_en0_action(led_conf.led_status);
	else if (led_conf.led_num == USB_EN1)
		usb_en1_action(led_conf.led_status);
	else if (led_conf.led_num == OPT_BLINK || led_conf.led_num == OPT_ON)
		led_option_action(led_conf.led_num);
	else if (led_conf.led_num == OPT_OFF)
		led_option_action(led_conf.led_num);
	else if (led_conf.led_num == ALL_LED)
		all_led_action(led_conf.led_color, led_conf.led_status);	
	return 0;
}

static struct file_operations atherosgpio_fops = {
	.owner		= THIS_MODULE,
	.unlocked_ioctl	= atherosgpio_ioctl,
	.open		= atherosgpio_open,
	.read		= atherosgpio_read,
	.write		= atherosgpio_write,
	.release	= atherosgpio_release,
};

static struct cdev atherosgpio_cdev = {
	.kobj		= {.name = "atherosgpio", },
	.owner		= THIS_MODULE,
};

int __init atherosgpio_init(void)
{
	dev_t dev = MKDEV(ATHEROSGPIO_MAJOR, 0);

	if (register_chrdev_region(dev, ATHEROSGPIO_MAX_MINORS, "atherosgpio"))
		goto error;

	cdev_init(&atherosgpio_cdev, &atherosgpio_fops);
	if (cdev_add(&atherosgpio_cdev, dev, ATHEROSGPIO_MAX_MINORS)) {
		unregister_chrdev_region(dev, ATHEROSGPIO_MAX_MINORS);
		goto error;
	}
	
	init_project_gpio_define();
	
	spin_lock_init(&serial_led_lock);	

	create_simple_config_led_proc_entry();
	
	serial_led_init();		

	return 0;

error:
	printk(KERN_ERR "error register atherosgpio device\n");
	return 1;
}

void __exit atherosgpio_exit(void)
{
	cdev_del(&atherosgpio_cdev);
	unregister_chrdev_region(MKDEV(ATHEROSGPIO_MAJOR, 0), ATHEROSGPIO_MAX_MINORS);
	remove_simple_config_proc_entry();
}

module_init(atherosgpio_init);
module_exit(atherosgpio_exit);

MODULE_LICENSE("GPL");

