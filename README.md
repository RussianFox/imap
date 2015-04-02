# imap
## Interactive map for Zabbix

Screenshots: http://zabbiximap.lisss.ru/

This version is designed for Zabbix versions 2.2 and 2.4

In old versions of efficiency is not guaranteed and will not be further developed.

For new versions the development will be output as the official release.


## Installation

For install copy the contents of a folder zabbix in the directory of your Zabbix Server (Example, /usr/share/zabbix for Debian).

Edit include/menu.inc.php to connect Interactive Map at standard interface
Add this to the end of file:

	require_once dirname(__FILE__).'/../imap/menu.inc.php';

Now, the basic functionality is efficient. Go to your Zabbix and you'll see a new menu item.

For additional settings, locate file settings.js.template in the folder imap, rename it in settings.js and change settings to your liking.

To get an API key for Bing you need to get a Microsoft account and create a new key. Look it for details: http://msdn.microsoft.com/ru-ru/library/ff428642.aspx

For work hardware icons, put png-images in folder imap/hardware. Look at file imap/hardware/readme.md for details.


## BD-additions

For working host's links, we need to add two tables in the database Zabbix.

Look at file imap/tables-xxx.sql

### For MySQL:

You can open phpmyadmin, select the database Zabbix, and select this file in the Import section

The second way for fans of the command line:

`mysql -u user -p zabbixbd < /usr/share/zabbix/imap/tables-mysql.sql`

Replace zabbixbd the name of the table with the data zabbix, username for a user with the addition of tables in the database and enter the password.


### For PostgreSQL 

run under root:

`sudo -u zabbix psql -U zabbix -W -d zabbix < table-postgresql.sql`

where

sudo -u zabbix - act as system user 'zabbix' (otherwise PosgreSQL will not authenticate user),

-U zabbix - database owner,

-d zabbix - database name.
