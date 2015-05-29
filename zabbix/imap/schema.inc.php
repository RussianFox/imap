<?php
return array(
	'imap_hosts_links' => array(
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
	'imap_hosts_links_settings' => array(
		'fields' => array(
			'ids' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 10,
			),
			'color' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_CHAR,
				'length' => 30,
				'default' => '#0000FF',
			),
			'alertcolor' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_CHAR,
				'length' => 30,
				'default' => '#FF0000',
			),
			'weight' => array(
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
	'imap_triggers_links' => array(
		'key' => 'id',
		'fields' => array(
			'id' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 20,
			),
			'triggerid' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 20,
			),
			'objectid' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 20,
			),
			'objecttype' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_CHAR,
				'length' => 50,
			),
		),
	),
	'imap_items_links' => array(
		'key' => 'id',
		'fields' => array(
			'id' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 20,
			),
			'itemid' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 20,
			),
			'objectid' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 20,
			),
			'objecttype' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_CHAR,
				'length' => 50,
			),
			'max_value' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_FLOAT,
				'length' => 16
			),
			'min_value' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_FLOAT,
				'length' => 16
			),
			'gradient' => array(
				'null' => false,
				'type' => DB::FIELD_TYPE_INT,
				'length' => 20,
				'default' => 0,
			),
		),
	),
);
?>
