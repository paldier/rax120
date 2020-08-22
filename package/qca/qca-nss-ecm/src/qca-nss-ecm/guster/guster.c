#include "linux/module.h"
#include "net/netfilter/nf_conntrack.h"
#include "sfe_cm.h"

#define MARK_MASK            0xf
#define MARK_WHITELIST       0x3
#define MARK_WHITELIST_REPLY 0x6

static int mark_shift = 20;
module_param(mark_shift, int, S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH);
MODULE_PARM_DESC(mark_shift, "Guster mark shift");

static int guster_accel_cb(struct nf_conn *ct)
{
    enum ip_conntrack_info ctinfo;
    enum ip_conntrack_dir dir;
    uint32_t mark;

    if (unlikely(!ct))
        return true;
    if (unlikely(nf_ct_is_untracked(ct)))
        return true;
    if (nf_ct_protonum(ct) != IPPROTO_TCP)
        return true;

    dir = CTINFO2DIR(ctinfo);
    mark = ct->mark & (MARK_MASK << mark_shift);
    if (!mark || mark == (MARK_WHITELIST << mark_shift) ||
        (mark == (MARK_WHITELIST_REPLY << mark_shift) && dir == IP_CT_DIR_REPLY))
        return true;
    return false;
}

static __init int guster_init(void)
{
    bd_register_accel_cb(guster_accel_cb);
    pr_info("guster accel_cb registered; mark shift %d\n", mark_shift);
    return 0;
}

static __exit void guster_exit(void)
{
    bd_register_accel_cb(NULL);
    pr_info("guster accel_cb unregistered\n");
}

MODULE_LICENSE("PROPRIETARY");

module_init(guster_init);
module_exit(guster_exit);
