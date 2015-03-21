<?php
return array(
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
);
?>
