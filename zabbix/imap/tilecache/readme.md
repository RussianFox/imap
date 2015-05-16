This is script for caching images on web-server

You can use it for cache tiles.

For working change caching-directory in script, create this directory and change permission for full privileges of webserver


----------------------------------------------------------------------
Usage example
----------------------

Path to Openstreetmap tile:

http://{s}.tile.osm.org/{z}/{x}/{y}.png


Path to this tile with caching:

http://your.web.site/zabbix/imap/tilecache/index.php?http://{s}.tile.osm.org/{z}/{x}/{y}.png