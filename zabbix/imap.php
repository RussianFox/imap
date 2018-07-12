<?php

bindtextdomain('imap', 'locale');
bind_textdomain_codeset('imap', 'UTF-8');

require_once dirname(__FILE__).'/include/config.inc.php';
require_once dirname(__FILE__).'/imap/DB.php';

textdomain("imap");
$page['title'] = _('Interactive map');
textdomain("frontend");

$page['file'] = 'imap.php';
$page['hist_arg'] = array('groupid', 'hostid', 'show_severity','control_map','with_triggers_only');

if (function_exists('get_request')) {
	$lat = get_request('lat', null);
	$lng = get_request('lng', null);
	$with_triggers_only = get_request('with_triggers_only', 0);
	$control_map = get_request('control_map', 0);
	$showSeverity = get_request('severity_min', 0);
	$output = get_request('output', false);
	$action_ajax = get_request('action_ajax', false);
	$hostid = get_request('hostid', null);
	$thostid = get_request('thostid', null);
	$groupid = get_request('groupid', null);
	$lat = get_request('lat', null);
	$lng = get_request('lng', null);
	$hardware = ''.get_request('hardware', '');
	$linkid = get_request('linkid', null);
	$linkoptions = get_request('linkoptions', null);
	$hardwareField = get_request('hardwareField','type');
	$searchstring = get_request('searchstring','');
};

if (function_exists('getRequest')) {
	$lat = getRequest('lat', null);
	$lng = getRequest('lng', null);
	$with_triggers_only = getRequest('with_triggers_only', 0);
	$control_map = getRequest('control_map', 0);
	$showSeverity = getRequest('severity_min', 0);
	$output = getRequest('output', false);
	$action_ajax = getRequest('action_ajax', false);
	$hostid = getRequest('hostid', null);
	$thostid = getRequest('thostid', null);
	$groupid = getRequest('groupid', null);
	$lat = getRequest('lat', null);
	$lng = getRequest('lng', null);
	$hardware = ''.getRequest('hardware', '');
	$linkid = getRequest('linkid', null);
	$linkoptions = getRequest('linkoptions', null);
	$hardwareField = getRequest('hardwareField');
	$searchstring = getRequest('searchstring','');
};

if (function_exists('get_current_nodeid')) { 
    $nodeids = get_current_nodeid();
};

if (function_exists('GetCurrentNodeId')) { 
    $nodeids = getCurrentNodeId();
};

if ($output!='ajax') {
	require_once dirname(__FILE__).'/include/page_header.php';
};

$fields = array(
	'groupid' =>			array(T_ZBX_INT, O_OPT, P_SYS,	DB_ID,		null),
	'hostid' =>			array(T_ZBX_INT, O_OPT, P_SYS,	DB_ID,		null),
	'thostid' =>			array(T_ZBX_INT, O_OPT, P_SYS,	DB_ID,		null),
	'linkid' =>			array(T_ZBX_INT, O_OPT, P_SYS,	DB_ID,		null),
	'severity_min' =>		array(T_ZBX_INT, O_OPT, P_SYS,			IN('0,1,2,3,4,5'),		null),
	'fullscreen' =>			array(T_ZBX_INT, O_OPT, P_SYS,			IN('0,1'),	null),
	'control_map' =>		array(T_ZBX_INT, O_OPT, P_SYS,			IN('0,1'),	null),
	'with_triggers_only' =>		array(T_ZBX_INT, O_OPT, P_SYS,			IN('0,1'),	null),
	'output' =>			array(T_ZBX_STR, O_OPT, P_SYS,	null,		null),
	'jsscriptid' =>			array(T_ZBX_STR, O_OPT, P_SYS,	null,		null),
	// ajax
	'favobj' =>			array(T_ZBX_STR, O_OPT, P_ACT,	null,		null),
	'favref' =>			array(T_ZBX_STR, O_OPT, P_ACT,	null,		null),
	'favid' =>			array(T_ZBX_INT, O_OPT, P_ACT,	null,		null),
	'favcnt' =>			array(T_ZBX_INT, O_OPT, null,	null,		null),
	'pmasterid' =>			array(T_ZBX_STR, O_OPT, P_SYS,	null,		null),
	'favaction' =>			array(T_ZBX_STR, O_OPT, P_ACT,	IN("'add','remove','refresh','flop','sort'"), null),
	'favstate' =>			array(T_ZBX_INT, O_OPT, P_ACT,	NOT_EMPTY,	'isset({favaction})&&("flop"=={favaction})'),
	'favdata' =>			array(T_ZBX_STR, O_OPT, null,	null,		null),
	'hardwareField' =>		array(T_ZBX_STR, O_OPT, null,	null,		null),
	//стандартные
	'btnSelect' =>			[T_ZBX_STR, O_OPT, null,	null,		null],
	'filter_rst' =>			[T_ZBX_STR, O_OPT, P_SYS,	null,		null],
	'filter_set' =>			[T_ZBX_STR, O_OPT, P_SYS,	null,		null],
	'show_triggers' =>		[T_ZBX_INT, O_OPT, null,	null,		null],
	'show_events' =>		[T_ZBX_INT, O_OPT, P_SYS,	null,		null],
	'ack_status' =>			[T_ZBX_INT, O_OPT, P_SYS,	null,		null],
	'show_severity' =>		[T_ZBX_INT, O_OPT, P_SYS,	null,		null],
	'status_change_days' =>		[T_ZBX_INT, O_OPT, null,	BETWEEN(1, DAY_IN_YEAR * 2), null],
	'status_change' =>		[T_ZBX_INT, O_OPT, null,	null,		null],
	'txt_select' =>			[T_ZBX_STR, O_OPT, null,	null,		null],
	'application' =>		[T_ZBX_STR, O_OPT, null,	null,		null],
	'inventory' =>			[T_ZBX_STR, O_OPT, null,	null,		null]
);
check_fields($fields);

/*
 * Filter
 */
$config = select_config();

$pageFilter = new CPageFilter(array(
	'groups' => array(
		'monitored_hosts' => true
	),
	'hosts' => array(
		'monitored_hosts' => true,
		'withInventory' => true
	),
	'hostid' => $hostid,
	'groupid' => $groupid
));

$_REQUEST['groupid'] = $pageFilter->groupid;
$_REQUEST['hostid'] = $pageFilter->hostid;


// filter set
if (hasRequest('filter_set')) {
	CProfile::update('web.tr_status.filter.show_details', getRequest('show_details', 0), PROFILE_TYPE_INT);
	CProfile::update('web.tr_status.filter.show_maintenance', getRequest('show_maintenance', 0), PROFILE_TYPE_INT);
	CProfile::update('web.tr_status.filter.show_severity',
		getRequest('show_severity', TRIGGER_SEVERITY_NOT_CLASSIFIED), PROFILE_TYPE_INT
	);
	CProfile::update('web.tr_status.filter.txt_select', getRequest('txt_select', ''), PROFILE_TYPE_STR);
	CProfile::update('web.tr_status.filter.status_change', getRequest('status_change', 0), PROFILE_TYPE_INT);
	CProfile::update('web.tr_status.filter.status_change_days', getRequest('status_change_days', 14),
		PROFILE_TYPE_INT
	);
	CProfile::update('web.tr_status.filter.application', getRequest('application'), PROFILE_TYPE_STR);

	// show triggers
	// when this filter is set to "All" it must not be remembered in the profiles because it may render the
	// whole page inaccessible on large installations.
	if (getRequest('show_triggers') != TRIGGERS_OPTION_ALL) {
		CProfile::update('web.tr_status.filter.show_triggers', getRequest('show_triggers'), PROFILE_TYPE_INT);
	}

	// show events
	$showEvents = getRequest('show_events', EVENTS_OPTION_NOEVENT);
	if ($config['event_ack_enable'] == EVENT_ACK_ENABLED || $showEvents != EVENTS_OPTION_NOT_ACK) {
		CProfile::update('web.tr_status.filter.show_events', $showEvents, PROFILE_TYPE_INT);
	}

	// ack status
	if ($config['event_ack_enable'] == EVENT_ACK_ENABLED) {
		CProfile::update('web.tr_status.filter.ack_status', getRequest('ack_status', ZBX_ACK_STS_ANY), PROFILE_TYPE_INT);
	}

	// update host inventory filter
	$inventoryFields = [];
	$inventoryValues = [];
	foreach (getRequest('inventory', []) as $field) {
		if ($field['value'] === '') {
			continue;
		}

		$inventoryFields[] = $field['field'];
		$inventoryValues[] = $field['value'];
	}
	CProfile::updateArray('web.tr_status.filter.inventory.field', $inventoryFields, PROFILE_TYPE_STR);
	CProfile::updateArray('web.tr_status.filter.inventory.value', $inventoryValues, PROFILE_TYPE_STR);
}
elseif (hasRequest('filter_rst')) {
	DBStart();
	CProfile::delete('web.tr_status.filter.show_triggers');
	CProfile::delete('web.tr_status.filter.show_details');
	CProfile::delete('web.tr_status.filter.show_maintenance');
	CProfile::delete('web.tr_status.filter.show_events');
	CProfile::delete('web.tr_status.filter.ack_status');
	CProfile::delete('web.tr_status.filter.show_severity');
	CProfile::delete('web.tr_status.filter.txt_select');
	CProfile::delete('web.tr_status.filter.status_change');
	CProfile::delete('web.tr_status.filter.status_change_days');
	CProfile::delete('web.tr_status.filter.application');
	CProfile::deleteIdx('web.tr_status.filter.inventory.field');
	CProfile::deleteIdx('web.tr_status.filter.inventory.value');
	DBend();
}

if (hasRequest('filter_set') && getRequest('show_triggers') == TRIGGERS_OPTION_ALL) {
	$showTriggers = TRIGGERS_OPTION_ALL;
}
else {
	$showTriggers = CProfile::get('web.tr_status.filter.show_triggers', TRIGGERS_OPTION_RECENT_PROBLEM);
}
$showDetails = CProfile::get('web.tr_status.filter.show_details', 0);
$showMaintenance = CProfile::get('web.tr_status.filter.show_maintenance', 1);
$showSeverity = CProfile::get('web.tr_status.filter.show_severity', TRIGGER_SEVERITY_NOT_CLASSIFIED);
$txtSelect = CProfile::get('web.tr_status.filter.txt_select', '');
$showChange = CProfile::get('web.tr_status.filter.status_change', 0);
$statusChangeBydays = CProfile::get('web.tr_status.filter.status_change_days', 14);
$ackStatus = ($config['event_ack_enable'] == EVENT_ACK_DISABLED)
	? ZBX_ACK_STS_ANY : CProfile::get('web.tr_status.filter.ack_status', ZBX_ACK_STS_ANY);
$showEvents = CProfile::get('web.tr_status.filter.show_events', EVENTS_OPTION_NOEVENT);

// check event acknowledges
if ($config['event_ack_enable'] == EVENT_ACK_DISABLED && $showEvents == EVENTS_OPTION_NOT_ACK) {
	$showEvents = EVENTS_OPTION_NOEVENT;
}

// fetch filter from profiles
$filter = [
	'application' => CProfile::get('web.tr_status.filter.application', ''),
	'inventory' => []
];

foreach (CProfile::getArray('web.tr_status.filter.inventory.field', []) as $i => $field) {
	$filter['inventory'][] = [
		'field' => $field,
		'value' => CProfile::get('web.tr_status.filter.inventory.value', null, $i)
	];
}






function rightsErrorAjax() {
		$responseData = '{"jsonrpc": "2.0","error": {"message": "Access error. Check rights."}}';
		echo $responseData;
		exit;
};

function checkHostsIsWritable($hostsids) {
		$hosts = API::Host()->get(array('editable'=>true,'hostids'=>$hostsids));
		if (count($hosts) == count($hostsids)) return TRUE;
		return FALSE;
}

function rightsForLink($idl) {
	$glinks = DBfetchArray(DBselect(
	'SELECT host1, host2
	FROM hosts_links WHERE hosts_links.id = '.$idl
	));
	if (checkHostsIsWritable(array(1*$glinks[0]['host1'], 1*$glinks[0]['host2']))) return (true);
	return (false);
};

if ($output=='ajax') {
	
	if (!function_exists('json_encode')) {
		$responseData = '{"jsonrpc": "2.0","error": {"message": "No function `json_encode` in PHP. Look at <a target=_blank href=\'http://stackoverflow.com/questions/18239405/php-fatal-error-call-to-undefined-function-json-decode\'>link</a>"}}';
		echo $responseData;
		exit;
	};
	
	$options = array(
		'output' => API_OUTPUT_EXTEND,
		'expandDescription' => true,
		'preservekeys' => true,
		'monitored' => true
	);

	if ($pageFilter->hostsSelected) {
		if ($pageFilter->hostid > 0) {
			$options['hostids'] = $pageFilter->hostid;
		}
		elseif ($pageFilter->groupid > 0) {
			$options['groupids'] = $pageFilter->groupid;
		}
	} else {
		$options['hostids'] = array();
	};

	if ($action_ajax=='get_triggers') {
		$options['expandData'] = true;
		$options['expandDescription'] = true;
		$options['selectLastEvent'] = 'extend';
		$options['monitored'] = true;
		$options['maintenance'] = false;
		$options['skipDependent'] = true;
		$options['sortfield'] = array('lastchange');
		$options['sortorder'] = 'DESC';
		$options['filter'] = array('value' => TRIGGER_VALUE_TRUE);
		$options['selectHosts'] = array('hostid', 'name');
		if ($showSeverity > TRIGGER_SEVERITY_NOT_CLASSIFIED) {
			$options['min_severity'] = $showSeverity;
		};
		$triggers = API::Trigger()->get($options);

		$ntriggers = array();
		foreach ($triggers as $tr) {
			$ntriggers[] = $tr;
		};
		
		$responseData = json_encode($ntriggers);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='search_hosts') {
		//$options = array();
		$options['searchByAny'] = true;
		$options['output'] = 'hostid';
		$options['search'] = array(
			'host' => $searchstring,
			'name' => $searchstring,
			'dns' => $searchstring,
			'ip' => $searchstring
		 );
		
		$hosts = API::Host()->get($options);
		$responseData = json_encode($hosts, FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='get_host') {
		$options['selectInterfaces'] = 'extend';
		//$options['selectInventory'] = array('location_lat','location_lon','url_a','url_b','url_c');
		$options['selectInventory'] = 'extend';
		//if ($hardwareField) $options['selectInventory'][] = $hardwareField;
		$options['selectMaintenances'] = 'extend';
		$hosts = API::Host()->get($options);
		
		//список скриптов
		$hostids = array();
		foreach ($hosts as $host) {
			$hostids[] = $host['hostid'];
		};
		$scripts = API::Script()->getScriptsByHosts($hostids);
		foreach ($hosts as $host) {
			$hosts[$host['hostid']]['scripts'] = $scripts[$host['hostid']];
		};
		
		$responseData = json_encode($hosts, FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='get_hosts') {
	
		$options['monitored_hosts'] = true;
		$options['withInventory'] = true;
		$options['output'] = array('hostid','name','description');
		$options['selectInventory'] = array('location_lat','location_lon','url_a','url_b','url_c');
		if ($hardwareField) $options['selectInventory'][] = $hardwareField;
		$options['selectMaintenances'] = 'extend';
		$hosts = API::Host()->get($options);
		$responseData = json_encode($hosts, FALSE);
		echo $responseData;
		exit;
		
	};
	
	if ($action_ajax=='update_coords') {
	
		if (!checkHostsIsWritable(array($hostid))) rightsErrorAjax();
	
		if ((lat=='none') or ($lng=='none')) { 
			$lat=null; $lng=null;
		} else {
			$lat = 1*$lat; $lng = 1*$lng;
		};
		$options = array(
			'hostid' => $hostid,
			'inventory' => array(
				'location_lat' => $lat,
				'location_lon' => $lng
			)
		);
		
		$hosts = API::Host()->update($options);
		
		$responseData = json_encode(array('result' => $hosts), FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='get_hardware') {
		if (is_dir('imap/hardware/')) {
			$tmp = scandir('imap/hardware/');
			$responseData = array();
			for ($nn=0; $nn<count($tmp); $nn++) {
				if ((mb_strtolower(substr($tmp[$nn],-4)) == '.png') and ($tmp[$nn]!='none.png'))
					$responseData[] = $tmp[$nn];
			};
		} else {
			$responseData=false;
		};
		$responseData = json_encode(array('result' => $responseData), FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='set_hardware') {
		if (!checkHostsIsWritable(array($hostid))) rightsErrorAjax();
		$options = array(
			'hostid' => $hostid,
			'inventory' => array()
		);
		$options['inventory'][$hardwareField] = $hardware;
		$hosts = API::Host()->update($options);
		
		$responseData = json_encode(array('result' => $hosts), FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='get_graphs') {
		$options['expandName'] = true;
		$graphs = API::Graph()->get($options);
		$responseData = json_encode($graphs, FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='get_link') {
		
		$res1 = DBimap::find('hosts_links', array('id' => $linkid));
		$res2 = DBimap::find('hosts_links_settings', array('ids' => $linkid));
		
		$res = array();
		
		foreach ($res1 as $res1t) {
			foreach ($res2 as $res2t) {
				if ($res1t['id']==$res2t['ids']) {
					$res1t = $res1t+$res2t;
				};
			};
			if (!$res1t['dash']) $res1t['dash']=0;
			if (!$res1t['weight']) $res1t['weight']=0;
			if (!$res1t['color']) $res1t['color']=0;
			if (!$res1t['opacity']) $res1t['opacity']=0;
			$res[] = $res1t;
		};
		
		$responseData = json_encode($res, FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='get_links') {
		
		$res1 = DBimap::find('hosts_links');
		$res2 = DBimap::find('hosts_links_settings');
		
		$res = array();
		
		foreach ($res1 as $res1t) {
			foreach ($res2 as $res2t) {
				if ($res1t['id']==$res2t['ids']) {
					$res1t = $res1t+$res2t;
				};
			};
			if (!$res1t['dash']) $res1t['dash']=0;
			if (!$res1t['weight']) $res1t['weight']=0;
			if (!$res1t['color']) $res1t['color']=0;
			if (!$res1t['opacity']) $res1t['opacity']=0;
			$res[] = $res1t;
		};
		
		$responseData = json_encode($res, FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='add_links') {
		
		if (!checkHostsIsWritable(array($hostid))) rightsErrorAjax();
		$shost=$hostid;
			foreach ($thostid as $thost) {
				if (checkHostsIsWritable(array($hostid))) {
					$newlink = array('host1' => MIN($shost,$thost), 'host2' => MAX($shost,$thost));
					$res = DBimap::insert('hosts_links', array($newlink));
				};
			};

		$responseData = json_encode(array('result'=>$res), FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='update_link') {
		
		if (!rightsForLink($linkid)) rightsErrorAjax();
		$link=$linkid;
		
		$newlink = array( 'values' => array('name' => $linkoptions['linkname'] ), 'where' => array( 'id' => $link ) );
		$res = DBimap::update('hosts_links', array($newlink));
		
		$res = DBimap::delete('hosts_links_settings', array('ids'=>array($link)));
		
		$res = DBimap::insert('hosts_links_settings', array(array( 'ids' => $link, 'color' => $linkoptions['linkcolor'], 'weight' => $linkoptions['linkweight'], 'opacity' => $linkoptions['linkopacity'] )));
		
		$responseData = json_encode(array('result'=>htmlspecialchars($res),'linkoptions'=>$linkoptions), FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='del_link') {
		
		if (!rightsForLink($linkid)) rightsErrorAjax();
		$link=$linkid;
		$res = DBimap::delete('hosts_links_settings', array('ids'=>array($link)));
		$res = DBimap::delete('hosts_links', array('id'=>array($link)));
		
		$responseData = json_encode(array('result'=>TRUE), FALSE);
		echo $responseData;
		exit;
	};
	
};

if ($output!='block') {
	/*
	* Display
	*/
	//$displayNodes = (is_show_all_nodes() && $pageFilter->groupid == 0 && $pageFilter->hostid == 0);

	// $showTriggers = $_REQUEST['show_triggers'];
	// $showEvents = $_REQUEST['show_events'];
	// $ackStatus = $_REQUEST['ack_status'];

// 	$triggerWidget = new CWidget();
// 
// 	$rightForm = new CForm('get');
// 	$rightForm->addItem(array(_('Group').SPACE, $pageFilter->getGroupsCB(true)));
// 	$rightForm->addItem(array(SPACE._('Host').SPACE, $pageFilter->getHostsCB(true)));
// 	$severityComboBox = new CComboBox('severity_min', $showSeverity,'javascript: submit();');
// 	$severityComboBox->addItems($pageFilter->severitiesMin);
// 	$rightForm->addItem(array(SPACE._('Minimum trigger severity').SPACE, $severityComboBox));
// 
// 	textdomain("imap");
// 	$rightForm->addItem(array(SPACE.SPACE._('Control map').SPACE, new CCheckBox('control_map', $control_map, '_imap.settings.do_map_control = jQuery(\'#control_map\')[0].checked; if (_imap.settings.do_map_control) {mapBbox(_imap.bbox)};', 1)));
// 	$rightForm->addItem(array(SPACE.SPACE._('With triggers only').SPACE, new CCheckBox('with_triggers_only', $with_triggers_only, 'javascript: submit();', 1)));
// 	textdomain("frontend");
// 	
// 	$rightForm->addVar('fullscreen', $_REQUEST['fullscreen']);
// 
// 	$triggerWidget->addHeader(SPACE,$rightForm);
// 	$triggerWidget->addPageHeader(_('Interactive map'), get_icon('fullscreen', array('fullscreen' => $_REQUEST['fullscreen'])));
// 		
// 	$triggerWidget->show();


	/*
	* Display
	*/
	textdomain("imap");
	$triggerWidget = (new CWidget())->setTitle(_('Interactive map'));

	$rightForm = (new CForm('get'))
		->addVar('fullscreen', $_REQUEST['fullscreen']);

	$controls = new CList();
	$controls->addItem(array(SPACE.SPACE._('With triggers only').SPACE, new CCheckBox('with_triggers_only', $with_triggers_only, 'javascript: submit();', 1)));
	$controls->addItem(array(SPACE.SPACE._('Control map').SPACE, new CCheckBox('control_map', $control_map, '_imap.settings.do_map_control = jQuery(\'#control_map\')[0].checked; if (_imap.settings.do_map_control) {mapBbox(_imap.bbox)};', 1)));
	$controls->addItem([_('Group').SPACE, $pageFilter->getGroupsCB()]);
	$controls->addItem([_('Host').SPACE, $pageFilter->getHostsCB()]);
	$controls->addItem(get_icon('fullscreen', ['fullscreen' => $_REQUEST['fullscreen']]));

	$rightForm->addItem($controls);

	$triggerWidget->setControls($rightForm);
	
	
	// filter
	textdomain("frontend");
	$filterFormView = new CView('common.filter.trigger', [
		'overview' => false,
		'filter' => [
			'filterid' => 'web.tr_status.filter.state',
			'showTriggers' => $showTriggers,
			'ackStatus' => $ackStatus,
			'showEvents' => $showEvents,
			'showSeverity' => $showSeverity,
			'statusChange' => $showChange,
			'statusChangeDays' => $statusChangeBydays,
			'showDetails' => $showDetails,
			'txtSelect' => $txtSelect,
			'application' => $filter['application'],
			'inventory' => $filter['inventory'],
			'showMaintenance' => $showMaintenance,
			'hostId' => getRequest('hostid'),
			'groupId' => getRequest('groupid'),
			'fullScreen' => getRequest('fullscreen')
		],
		'config' => $config
	]);

	$filterForm = $filterFormView->render();
	$triggerWidget->addItem($filterForm);
	// filter end
	
	$triggerWidget->show();

};

$version=trim(file_get_contents('imap/version'));

textdomain("imap");

//проверяем наличие таблиц в БД
$check_links = true;
if (!DBselect('SELECT 1 FROM hosts_links')) {
	$check_links=false;
	clear_messages(1);
};
if (!DBselect('SELECT 1 FROM hosts_links_settings')) {
	$check_links=false;
	clear_messages(1);
};

//проверяем наличие функции json_encode
if (!function_exists('json_encode')) {
	error("No function 'json_encode' in PHP. Look this http://stackoverflow.com/questions/18239405/php-fatal-error-call-to-undefined-function-json-decode");
};

//проверяем доступ к файлам скрипта
$needThisFiles = array('imap/leaflet/leaflet.js','imap/leaflet/plugins/leaflet.markercluster.js','imap/imap.js');
foreach ($needThisFiles as $file) {
	if ( !is_readable ( $file ) ) {
		error (_('If you see this message, it means that the script had problems with access to the files. Try to set read permissions for the web-server to a folder imap.'));
		break;
	};
};

?>

<div id=imapworkarea style="display:none; position:relative;">
	<div id=mapdiv style="width:100%; height:300px;"></div>
	<div id=ajax></div>
	<div id=imapmes><div id=mesLoading><div><?php echo _('Loading...'); ?></div></div></div>
</div>

<link href="imap/jquery-ui/jquery-ui.css" rel="stylesheet">
<script src="imap/jquery-ui/jquery-ui.js"></script>

<link rel="stylesheet" href="imap/leaflet/leaflet.css" />
<script type="text/javascript" src="imap/leaflet/leaflet.js"></script>
<script type="text/javascript" src="imap/leaflet/plugins/leaflet.label.js"></script>
<link rel="stylesheet" href="imap/leaflet/plugins/leaflet.label.css" />

<link rel="stylesheet" href="imap/leaflet/plugins/MarkerCluster.css" />
<link rel="stylesheet" href="imap/leaflet/plugins/MarkerCluster.Default.css" />
<script src="imap/leaflet/plugins/leaflet.markercluster.js"></script>

<script src="imap/leaflet/plugins/layer/tile/Bing.js"></script>

<script src="https://api-maps.yandex.ru/2.1/?load=package.map&lang=<?php echo CWebUser::$data['lang']; ?>" type="text/javascript"></script>
<script src="imap/leaflet/plugins/layer/tile/Yandex.js"></script>

<script src="https://maps.google.com/maps/api/js?v=3&sensor=false&language=<?php echo CWebUser::$data['lang']; ?>"></script>
<script src="imap/leaflet/plugins/layer/tile/Google.js"></script>

<script src="imap/leaflet/plugins/jquery.fs.stepper.min.js"></script>
<link rel="stylesheet" href="imap/leaflet/plugins/jquery.fs.stepper.css" />

<script type="text/javascript" src="imap/colorpicker/colors.js"></script>
<script type="text/javascript" src="imap/colorpicker/jqColorPicker.js"></script>

<link rel="stylesheet" href="imap/leaflet/plugins/L.Control.Zoomslider.css" />
<script src="imap/leaflet/plugins/L.Control.Zoomslider.js"></script>

<script src="imap/leaflet/plugins/leaflet.measure/leaflet.measure.js"></script>
<link rel="stylesheet" href="imap/leaflet/plugins/leaflet.measure/leaflet.measure.css" />

<link rel="stylesheet" href="imap/markers.css?<?php echo rand(); ?>" />

<?php if (file_exists('imap/userstyles.css')) echo '<link rel="stylesheet" href="imap/userstyles.css" />'; ?>


<script type="text/javascript">

	var _imap = new Object;

	_imap.settings = new Object;
	_imap.settings.lang = "<?php echo CWebUser::$data['lang']; ?>";
	
	
	/* This settings changing in interactive mode */
	_imap.settings.do_map_control = <?php echo $control_map; ?>;
	_imap.settings.pause_map_control = false;
	_imap.settings.show_with_triggers_only = <?php echo $with_triggers_only; ?>;
	_imap.settings.min_status = <?php echo $showSeverity; ?>;
	_imap.mapcorners = new Object;
	_imap.version='<?php echo $version; ?>';
	_imap.zabbixversion='<?php echo ZABBIX_VERSION; ?>';

	/* This settings changing in file settings.js */
	_imap.settings.show_icons = true;
	_imap.settings.use_search = true;
	_imap.settings.use_zoom_slider = true;
	_imap.settings.links_enabled = true;
	_imap.settings.debug_enabled = false;
	_imap.settings.hardware_field = 'type';
	_imap.settings.maxMarkersSpiderfy = 50;
	_imap.settings.exluding_inventory = ['hostid','location_lat','location_lon','url_a','url_b','url_c'];
	_imap.settings.useIconsInMarkers = false;
	_imap.settings.startCoordinates = [59.95, 30.29];
	_imap.settings.startZoom = 4;
	_imap.settings.mapAnimation = true;
	_imap.settings.intervalLoadHosts = 60;
	_imap.settings.intervalLoadTriggers = 30;
	_imap.settings.intervalLoadLinks = 60;
	_imap.settings.showMarkersLabels = false;
	_imap.settings.spiderfyDistanceMultiplier = 1;
	_imap.settings.defaultbaselayer = "OpenStreetMap";
	bingAPIkey=false;
	
	_imap.mapcorners['googlesearch'] = 0;
	_imap.mapcorners['lasttriggers'] = 0;
	_imap.mapcorners['layers'] = 1;
	_imap.mapcorners['hosts'] = 1;
	_imap.mapcorners['attribution'] = 3;
	_imap.mapcorners['scale'] = 3;
	_imap.mapcorners['measure'] = 3;
	_imap.mapcorners['mylocationbutton'] = 2;
	_imap.mapcorners['zoom'] = 2;
	
	
	/* Перевод для текущего языка */
	<?php textdomain("frontend"); ?>
	locale.Search = '<?php echo _('Search'); ?>';
	
	locale.inventoryfields = new Object;
	<?php foreach (getHostInventories() as $field): ?>
		locale.inventoryfields["<?php echo $field['db_field'] ?>"] = "<?php echo $field['title'] ?>";
	<?php endforeach; ?>
	
	locale['Ack'] = '<?php echo _('Ack'); ?>';
	locale['Yes'] = '<?php echo _('Yes'); ?>';
	locale['No'] = '<?php echo _('No'); ?>';
	
	locale['Host inventory'] = '<?php echo _('Host inventory'); ?>';
	locale['Triggers'] = '<?php echo _('Triggers'); ?>';
	locale['Graphs'] = '<?php echo _('Graphs'); ?>';
	locale['Latest data'] = '<?php echo _('Latest data'); ?>';
	locale['Host'] = '<?php echo _('Host'); ?>';
	locale['Applications'] = '<?php echo _('Applications'); ?>';
	locale['Items'] = '<?php echo _('Items'); ?>';
	locale['Discovery rules'] = '<?php echo _('Discovery rules'); ?>';
	locale['Web scenarios'] = '<?php echo _('Web scenarios'); ?>';
	
	<?php textdomain("imap"); ?>
	locale['Change location'] = '<?php echo _('Change location'); ?>';
	locale['Delete location'] = '<?php echo _('Delete location'); ?>';
	locale['Add a link to another host'] = '<?php echo _('Add a link to another host'); ?>';
	locale['Select a new position'] = '<?php echo _('Select a new position'); ?>';
	locale['Failed to update data'] = '<?php echo _('Failed to update data'); ?>';
	locale['Failed to get data'] = '<?php echo _('Failed to get data'); ?>';
	locale['Error'] = '<?php echo _('Error'); ?>';
	locale['Hosts'] = '<?php echo _('Hosts'); ?>';
	locale['This host does not have coordinates'] = '<?php echo _('This host does not have coordinates'); ?>';
	locale['Set a hardware type'] = '<?php echo _('Set a hardware type'); ?>';
	locale["Host's links"] = "<?php echo _("Host\'s links"); ?>";
	locale['Show debug information'] = "<?php echo _("Show debug information"); ?>";
	locale['Debug information'] = "<?php echo _("Debug information"); ?>";
	locale['Select hosts for links'] = "<?php echo _("Select hosts for links"); ?>";
	locale['Name'] = "<?php echo _("Name"); ?>";
	locale['Delete link'] = "<?php echo _("Delete link"); ?>";
	locale['Link options'] = "<?php echo _("Link options"); ?>";
	locale['Link name'] = "<?php echo _("Link name"); ?>";
	locale['Link color'] = "<?php echo _("Link color"); ?>";
	locale['Link width'] = "<?php echo _("Link width"); ?>";
	locale['Link opacity'] = "<?php echo _("Link opacity"); ?>";
	locale['Link dash'] = "<?php echo _("Link dash"); ?>";
	locale['Delete confirm'] = "<?php echo _("Delete confirm"); ?>";
	locale['Successful'] = "<?php echo _("Successful"); ?>";
	locale['Zoom in'] = "<?php echo _("Zoom in"); ?>";
	locale['Zoom out'] = "<?php echo _("Zoom out"); ?>";
	locale['No hosts with inventory'] = "<?php echo _("No hosts with inventory"); ?>";
	locale['Keep'] = "<?php echo _("Keep"); ?>";
	locale['Tools'] = "<?php echo _("Tools"); ?>";
	locale['Sort by severity'] = "<?php echo _("Sort by severity"); ?>";
	locale['Sort by time'] = "<?php echo _("Sort by time"); ?>";
	locale['Config'] = '<?php echo _('Config'); ?>';
	locale['Host config'] = '<?php echo _('Host config'); ?>';
	locale['Host view'] = '<?php echo _('Host view'); ?>';
	locale['Wind speed'] = "<?php echo _("Wind speed"); ?>";
	locale['Wind points'] = "<?php echo _("Wind points"); ?>";
	locale['Wind type'] = "<?php echo _("Wind type"); ?>";
	locale['Wind direction'] = "<?php echo _("Wind direction"); ?>";
	locale['Temperature'] = "<?php echo _("Temperature"); ?>";
	locale['Humidity'] = "<?php echo _("Humidity"); ?>";
	locale['Pressure'] = "<?php echo _("Pressure"); ?>";
	locale['Sunset'] = "<?php echo _("Sunset"); ?>";
	locale['Sunrise'] = "<?php echo _("Sunrise"); ?>";
	locale['Data obtained'] = "<?php echo _("Data obtained"); ?>";
	locale['Show weather'] = "<?php echo _("Show weather"); ?>";
	
	/* Фильтр для отбора хостов и групп */
	_imap.filter = {
		show_severity: 0,
		hostid: <?php echo $pageFilter->hostid; ?>,
		groupid: <?php echo $pageFilter->groupid; ?>
	};
	

</script>
<script type="text/javascript" src="imap/imap.js<?php echo '?'.rand(); ?>"></script>

<?php

	if (file_exists('imap/settings.js')) echo '<script src="imap/settings.js?'.rand().'"></script>';
	if (file_exists('imap/additions.js')) echo '<script src="imap/additions.js?'.rand().'"></script>';
	if (!$check_links) echo '<script type="text/javascript"> _imap.settings.links_enabled = false; </script>';

	if (file_exists('imap/js')) {
		$files = scandir('imap/js');
		foreach($files as $file) {
			if (substr('imap/js/'.$file,-3)=='.js') echo '<script type="text/javascript" src="imap/js/'.$file.'"></script>';
		};
	};

textdomain("frontend");
if ($output!='block') {
	require_once dirname(__FILE__).'/include/page_footer.php';
};
