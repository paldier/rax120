copyright (C) 2018-2020 Delta Networks Inc.

the files in ntgrcrypt/files are the initial files which need put into security storage
	1. Makefile  -  will copy these file from files/* into /etc/ntgrcrypt folder on Router.
	2. when router boot and run ntgrcrypt init - 
		this command will copy these file from /etc/ntgrcrypt/ into /tmp/secure folder. 
		/tmp/secure will save into security storage.

how to open the files in security storage
	add "-lntgrcrypt" for C code or run shell command "ntgrcrypt"

	1. run ntgrcrypt_open() or "ntgrcrypt open" - open security storage, mount /tmp/secure
	2. find the file in /tmp/secure/
	2. run ntgrcrypt_close() or "ntgrcrypt close" - umount /tmp/secure, close security storage



	
