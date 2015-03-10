# imap
Interactive map for Zabbix

Для установки скопируйте содержимое папки zabbix в директорию вашего zabbix (/usr/share/zabbix для Debian, например).

Чтобы подключить imap в стандартный интерфейс, отредактируйте include/menu.inc.php
Пример правки:

	array(
		'url' => 'srv_status.php',
		'label' => _('IT services'),
		'force_disable_all_nodes' => true,
		'sub_pages' => array('report3.php', 'chart5.php')
	),
	array(
		'url'=>'imap.php',
		'label'=>_('Interactive map')
	),
	array(

		'url' => 'chart3.php'
	),

Теперь основной функционал работоспособен. Зайдите в ваш Zabbix и вы увидите новый пункт меню.

Для дополнительных настроек найдите в папке imap файл settings.js.template, переименуйте в settings.js и поменяйте настройки по своему вкусу.

Для получения ключа API для Bing вам надо получить учетную запись Microsoft и создать новый ключ. Подробности тут http://msdn.microsoft.com/ru-ru/library/ff428642.aspx

Для того, чтобы работали иконки оборудования, вам надо набросать в папку imap/hardware картинок в формате png. Названием будет тип оборудования (modem.png, server.png). Не забудьте дать права на чтение этих файлов веб-сервером. Не удаляйте и не заменяйте файл none.png

Для работы связей между хостами нам нужно добавить две таблицы в базу данных Zabbix.

В папке imap лежит файл tables.sql Вы можете открыть phpmyadmin, выбрать базу данных Zabbix, и выбрать этот файл в разделе Import

Второй способ для любителей командной строки:

`mysql -u user -p zabbixbd < /usr/share/zabbix/imap/tables.sql`

Замените zabbixbd на название таблицы с данными zabbix, user на имя пользователя с правами добавления таблиц в базу и введите пароль.

Теперь надо добавить схему таблиц в файл в директории установки zabbix include/schema.inc.php

	'hosts_links' => array(
		'key' => 'host1,host2',
		'fields' => array(
			'id' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 10,
			),
			'name' => array(
				'null' => true,
				'type' => DB::FIELD_TYPE_CHAR,
				'length' => 255,
				'default' => '',
			),
			'host1' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 10,
			),
			'host2' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 10,
			),
		),
	),
	'hosts_links_settings' => array(
		'key' => 'host1,host2',
		'fields' => array(
			'ids' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 10,
			),
			'color' => array(
				'null' => true,
				'type' => DB::FIELD_TYPE_CHAR,
				'length' => 30,
			),
			'weight' => array(
				'null' => true,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 10,
			),
			'opacity' => array(
				'null' => true,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 10,
			),
			'dash' => array(
				'null' => true,
				'type' => DB::FIELD_TYPE_CHAR,
				'length' => 100,
			),
		),
	),
