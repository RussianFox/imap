CREATE TABLE IF NOT EXISTS `hosts_links_settings` (
  `ids` bigint(20) NOT NULL,
  `color` varchar(30) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `opacity` int(11) DEFAULT NULL,
  `dash` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ids`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS `hosts_links` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(300) DEFAULT NULL,
  `host1` bigint(20) NOT NULL,
  `host2` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hosts` (`host1`,`host2`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
