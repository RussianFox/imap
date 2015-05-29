RENAME TABLE  `hosts_links` TO  `imap_hosts_links` ;
RENAME TABLE  `hosts_links_settings` TO  `imap_hosts_links_settings` ;

ALTER TABLE  `imap_hosts_links_settings` CHANGE  `color`  `color` VARCHAR( 30 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT  '#0000FF' ;
ALTER TABLE  `imap_hosts_links_settings` DROP  `opacity` ;
ALTER TABLE  `imap_hosts_links_settings` ADD  `alertcolor` VARCHAR( 30 ) NOT NULL DEFAULT  '#FF0000' AFTER  `color` ;

CREATE TABLE IF NOT EXISTS `imap_triggers_links` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `triggerid` bigint(20) NOT NULL,
  `objectid` bigint(20) NOT NULL,
  `objecttype` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=0 ;

CREATE TABLE IF NOT EXISTS `imap_items_links` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `itemid` bigint(20) NOT NULL,
  `objectid` bigint(20) NOT NULL,
  `objecttype` varchar(50) NOT NULL,
  `maxvalue` double(16,4) NOT NULL,
  `minvalue` double(16,4) NOT NULL,
  `gradient` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hosts` (`objectid`,`objecttype`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=0 ;

CREATE TABLE IF NOT EXISTS `imap_items_links` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `itemid` bigint(20) NOT NULL,
  `objectid` bigint(20) NOT NULL,
  `objecttype` varchar(50) NOT NULL,
  `max_value` double(16,4) NOT NULL,
  `min_value` double(16,4) NOT NULL,
  `gradient` bigint(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hosts` (`objectid`,`objecttype`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=0 ;