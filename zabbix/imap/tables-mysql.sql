CREATE TABLE IF NOT EXISTS `imap_hosts_links` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(300) DEFAULT NULL,
  `host1` bigint(20) NOT NULL,
  `host2` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hosts` (`host1`,`host2`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `imap_hosts_links_settings` (
  `ids` bigint(20) NOT NULL,
  `color` varchar(30) NOT NULL DEFAULT '#0000FF',
  `alertcolor` varchar(50) NOT NULL DEFAULT '#FF0000',
  `weight` int(11) DEFAULT NULL,
  `dash` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ids`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `imap_triggers_links` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `triggerid` bigint(20) NOT NULL,
  `objectid` bigint(20) NOT NULL,
  `objecttype` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=29 ;

