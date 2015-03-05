<?php

bindtextdomain('imap', 'locale');
bind_textdomain_codeset('imap', 'UTF-8');

require_once dirname(__FILE__).'/include/config.inc.php';

textdomain("imap");
$page['title'] = _('Interactive map');
textdomain("frontend");

$page['file'] = 'imap.php';
$page['hist_arg'] = array('groupid', 'hostid', 'show_severity','control_map','with_triggers_only');
//$page['scripts'] = array('class.cswitcher.js');

		if (function_exists('get_request')) { 
		    $lat = get_request('lat', null);
		    $lng = get_request('lng', null);
		};

		if (function_exists('getRequest')) { 
		    $lat = getRequest('lat', null);
		    $lng = getRequest('lng', null);
		};

if (function_exists('get_request')) { 
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
};

if (function_exists('getRequest')) { 
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
	'groupid' =>	array(T_ZBX_INT, O_OPT, P_SYS,	DB_ID,		null),
	'hostid' =>				array(T_ZBX_INT, O_OPT, P_SYS,	DB_ID,		null),
	'thostid' =>				array(T_ZBX_INT, O_OPT, P_SYS,	DB_ID,		null),
	'linkid' =>				array(T_ZBX_INT, O_OPT, P_SYS,	DB_ID,		null),
	'severity_min' =>	array(T_ZBX_INT, O_OPT, P_SYS,			IN('0,1,2,3,4,5'),		null),
	'fullscreen' =>		array(T_ZBX_INT, O_OPT, P_SYS,			IN('0,1'),	null),
	'control_map' =>		array(T_ZBX_INT, O_OPT, P_SYS,			IN('0,1'),	null),
	'with_triggers_only' =>		array(T_ZBX_INT, O_OPT, P_SYS,			IN('0,1'),	null),
	'output' =>		array(T_ZBX_STR, O_OPT, P_SYS,	null,		null),
	'jsscriptid' =>	array(T_ZBX_STR, O_OPT, P_SYS,	null,		null),
	// ajax
	'favobj' =>		array(T_ZBX_STR, O_OPT, P_ACT,	null,		null),
	'favref' =>		array(T_ZBX_STR, O_OPT, P_ACT,	null,		null),
	'favid' =>		array(T_ZBX_INT, O_OPT, P_ACT,	null,		null),
	'favcnt' =>		array(T_ZBX_INT, O_OPT, null,	null,		null),
	'pmasterid' =>	array(T_ZBX_STR, O_OPT, P_SYS,	null,		null),
	'favaction' =>	array(T_ZBX_STR, O_OPT, P_ACT,	IN("'add','remove','refresh','flop','sort'"), null),
	'favstate' =>	array(T_ZBX_INT, O_OPT, P_ACT,	NOT_EMPTY,	'isset({favaction})&&("flop"=={favaction})'),
	'favdata' =>	array(T_ZBX_STR, O_OPT, null,	null,		null)
);
check_fields($fields);


/*
 * Filter
 */
$config = select_config();

$pageFilter = new CPageFilter(array(
	'groups' => array(
		'monitored_hosts' => true,
		'with_monitored_triggers' => true
	),
	'hosts' => array(
		'monitored_hosts' => true,
		'with_monitored_triggers' => true
	),
	'hostid' => $hostid,
	'groupid' => $groupid,
	'severitiesMin' => array(
		TRIGGER_SEVERITY_NOT_CLASSIFIED => getSeverityCaption(TRIGGER_SEVERITY_NOT_CLASSIFIED),
		TRIGGER_SEVERITY_INFORMATION => getSeverityCaption(TRIGGER_SEVERITY_INFORMATION),
		TRIGGER_SEVERITY_WARNING => getSeverityCaption(TRIGGER_SEVERITY_WARNING),
		TRIGGER_SEVERITY_AVERAGE => getSeverityCaption(TRIGGER_SEVERITY_AVERAGE),
		TRIGGER_SEVERITY_HIGH => getSeverityCaption(TRIGGER_SEVERITY_HIGH),
		TRIGGER_SEVERITY_DISASTER => getSeverityCaption(TRIGGER_SEVERITY_DISASTER)
	),
	'severityMin' => $showSeverity
));

$_REQUEST['groupid'] = $pageFilter->groupid;
$_REQUEST['hostid'] = $pageFilter->hostid;

//$showSeverity = $pageFilter->severityMin;

function rightsErrorAjax() {
		$responseData = '{"jsonrpc": "2.0","error": {"message": "Access error. Check rights."}}';
		echo $responseData;
		exit;
};

function rightsForLink($idl) {
	$glinks = DBfetchArray(DBselect(
	'SELECT host1, host2
	FROM hosts_links WHERE hosts_links.id = '.$idl
	));
	if (API::Host()->isWritable(array(1*$glinks[0]['host1'])) and API::Host()->isWritable(array(1*$glinks[0]['host2']))) return (true);
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
		//$options['only_true'] = true;
		//$options['active'] = true;
		$options['monitored'] = true;
		$options['maintenance'] = false;
		$options['skipDependent'] = true;
		$options['filter'] = array('value' => TRIGGER_VALUE_TRUE);
		//$options['withUnacknowledgedEvents'] = true;
		if ($showSeverity > TRIGGER_SEVERITY_NOT_CLASSIFIED) {
			$options['min_severity'] = $showSeverity;
		};
		$hosts = API::Trigger()->get($options);
		
		$responseData = json_encode($hosts, FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='get_hosts') {
		$options['monitored_hosts'] = true;
		$options['withInventory'] = true;
		$options['selectInterfaces'] = 'extend';
		$options['selectInventory'] = array('location_lat','location_lon','type');
		$options['selectMaintenances'] = 'extend';
		$hosts = API::Host()->get($options);
		$responseData = json_encode($hosts, FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='update_coords') {
	
		if (!API::Host()->isWritable(array($hostid))) rightsErrorAjax();
	
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
		if (!API::Host()->isWritable(array($hostid))) rightsErrorAjax();
		$options = array(
			'hostid' => $hostid,
			'inventory' => array(
				'type' => $hardware
			)
		);
		
		$hosts = API::Host()->update($options);
		
		$responseData = json_encode(array('result' => $hosts), FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='get_link') {
		$glinks = DBfetchArray(DBselect(
			'SELECT hosts_links.id AS id, hosts_links.host1, hosts_links.host2, hosts_links.name, hosts_links_settings.*
			FROM hosts_links LEFT OUTER JOIN hosts_links_settings ON hosts_links.id = hosts_links_settings.ids WHERE hosts_links.id = '.$linkid
		));
		$responseData = json_encode($glinks, FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='get_links') {
		$glinks = DBfetchArray(DBselect(
			'SELECT hosts_links.id AS id, hosts_links.host1, hosts_links.host2, hosts_links.name, hosts_links_settings.*
			FROM hosts_links LEFT OUTER JOIN hosts_links_settings ON hosts_links.id = hosts_links_settings.ids'
		));
		$responseData = json_encode($glinks, FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='add_links') {
		if (!API::Host()->isWritable(array($hostid))) rightsErrorAjax();
		$shost=$hostid;
			foreach ($thostid as $thost) {
				//if ($shost==$thost) continue;
				if (API::Host()->isWritable(array($hostid))) {
					$res = 'INSERT hosts_links VALUES('.
									'NULL,'.
									'NULL,'.
									MIN($shost,$thost).','.
									MAX($shost,$thost).
						');';
					DBstart();
					DBexecute($res);
					DBend();
				};
			};

		//$res = count($thostid);
		$responseData = json_encode(array('result'=>$res), FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='update_link') {
		if (!rightsForLink($linkid)) rightsErrorAjax();
		$link=$linkid;
		$res = 'UPDATE hosts_links SET
		';
		if ($linkoptions['linkname']) $res = $res.'name = "'.$linkoptions['linkname'].'"';
		$res = $res.'
			WHERE id='.$link;
		DBstart();
		DBexecute($res);
		DBend();
		
		$res = 'REPLACE INTO hosts_links_settings SET ids='.$link.'
		';
		if ($linkoptions['linkcolor']) $res = $res.', color = "'.$linkoptions['linkcolor'].'"';
		if ($linkoptions['linkweight']) $res = $res.', weight = '.$linkoptions['linkweight'];
		if ($linkoptions['linkopacity']) $res = $res.', opacity = '.$linkoptions['linkopacity'];
		DBstart();
		DBexecute($res);
		DBend();
		
		$responseData = json_encode(array('result'=>htmlspecialchars($res),'linkoptions'=>$linkoptions), FALSE);
		echo $responseData;
		exit;
	};
	
	if ($action_ajax=='del_link') {
		if (!rightsForLink($linkid)) rightsErrorAjax();
		$link=$linkid;
		$zz = 'DELETE FROM hosts_links_settings WHERE id='.$link;
		DBstart();
		$res=DBexecute($zz);
		DBend();
		$zz = 'DELETE FROM hosts_links WHERE id='.$link;
		DBstart();
		$res=DBexecute($zz);
		DBend();
		
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

	$triggerWidget = new CWidget();

	$rightForm = new CForm('get');
	$rightForm->addItem(array(_('Group').SPACE, $pageFilter->getGroupsCB(true)));
	$rightForm->addItem(array(SPACE._('Host').SPACE, $pageFilter->getHostsCB(true)));
	$severityComboBox = new CComboBox('severity_min', $showSeverity,'javascript: submit();');
	$severityComboBox->addItems($pageFilter->severitiesMin);
	$rightForm->addItem(array(SPACE._('Minimum trigger severity').SPACE, $severityComboBox));

	textdomain("imap");
	$rightForm->addItem(array(SPACE._('Control map').SPACE, new CCheckBox('control_map', $control_map, '_imap.settings.do_map_control = jQuery(\'#control_map\')[0].checked; if (_imap.settings.do_map_control) {mapBbox(_imap.bbox)};', 1)));
	$rightForm->addItem(array(SPACE._('With triggers only').SPACE, new CCheckBox('with_triggers_only', $with_triggers_only, 'javascript: submit();', 1)));
	textdomain("frontend");
	
	$rightForm->addVar('fullscreen', $_REQUEST['fullscreen']);

	$triggerWidget->addHeader(SPACE,$rightForm);
	$triggerWidget->addPageHeader(_('Interactive map'), get_icon('fullscreen', array('fullscreen' => $_REQUEST['fullscreen'])));
		
	$triggerWidget->show();

	
	textdomain("imap");
};
//проверяем наличие таблиц в БД
$check_links = true;
$glinks = DBfetchArray(DBselect("Show tables from zabbix like 'hosts_links'"));
if (count($glinks)==0) $check_links = false;
$glinks = DBfetchArray(DBselect("Show tables from zabbix like 'hosts_links_settings'"));
if (count($glinks)==0) $check_links = false;

?>
<div id=imapworkareaError style="color:red; font-size:1.4em;">Если вы видите это сообщение, значит у скрипта возникли проблемы с доступом к файлам. Попробуйте выставить права на чтение для web-сервера на папку imap.</div>
<div id=imapworkarea style="display:none; position:relative;">
	<div id=mapdiv style="width:100%; height:300px;"></div>
	<div id=ajax></div>
	<div id=imapmes><div id=mesLoading><div><?php echo _('Loading...'); ?></div></div></div>
	<div id="out_hosts_list">
		<div id=close_hosts_list><?php echo _('Close'); ?> <b>X</b></div>
		<div id=search_hosts_list><input type=search placeholder="<?php echo _('Search'); ?>"></div>
		<div id=hosts_list class="nicescroll"></div>
	</div>
	<div id=show_hosts_list><div id=filter-indicator><img src="imap/images/filter.png"></div> <b><?php echo _('Hosts'); ?></b></div>
</div>

<link rel="stylesheet" href="imap/leaflet/leaflet.css" />
<script type="text/javascript" src="imap/leaflet/leaflet.js"></script>
<script type="text/javascript" src="imap/leaflet/plugins/leaflet.label.js"></script>
<link rel="stylesheet" href="imap/leaflet/plugins/leaflet.label.css" />
<link rel="stylesheet" href="imap/markers.css" />
<link rel="stylesheet" href="imap/leaflet/plugins/MarkerCluster.css" />
<link rel="stylesheet" href="imap/leaflet/plugins/MarkerCluster.Default.css" />
<script src="imap/leaflet/plugins/leaflet.markercluster.js"></script>
<script src="imap/leaflet/plugins/layer/tile/Bing.js"></script>
<script src="imap/leaflet/plugins/html2canvas.js"></script>

<script src="imap/leaflet/plugins/jquery.fs.stepper.min.js"></script>
<link rel="stylesheet" href="imap/leaflet/plugins/jquery.fs.stepper.css" />

<script src="imap/leaflet/plugins/jquery.minicolors.min.js"></script>
<link rel="stylesheet" href="imap/leaflet/plugins/jquery.minicolors.css" />

<link rel="stylesheet" href="imap/leaflet/plugins/L.Control.Zoomslider.css" />
<script src="imap/leaflet/plugins/L.Control.Zoomslider.js"></script>

<script src="imap/leaflet/plugins/leaflet.measure/leaflet.measure.js"></script>
<link rel="stylesheet" href="imap/leaflet/plugins/leaflet.measure/leaflet.measure.css" />

<script type="text/javascript">
	jQuery('#out_hosts_list').hide();
	jQuery('#filter-indicator').hide();
	jQuery('#show_hosts_list').click(function(){jQuery(this).hide(); jQuery('#out_hosts_list').animate({width:'toggle'},200);});
	jQuery('#close_hosts_list').click(function(){jQuery('#out_hosts_list').animate({width:'toggle'},200); jQuery('#show_hosts_list').show(); });
	jQuery( "#search_hosts_list input" ).on('input',function() {
		/*jQuery('.host_in_list').show();
		jQuery('.host_in_list').not(function(){
			return jQuery(this).attr('hostname').toLowerCase().indexOf(jQuery( "#search_hosts_list input" ).val().toLowerCase())>-1
		}).hide();*/
		getHostsFilter1T(jQuery( "#search_hosts_list input" ).val());
	});
	var _imap = new Object;

	_imap.settings = new Object;
	
	_imap.settings.do_map_control = <?php echo $control_map; ?>;
	_imap.settings.pause_map_control = false;
	_imap.settings.show_with_triggers_only = <?php echo $with_triggers_only; ?>;
	_imap.settings.min_status = <?php echo $showSeverity; ?>;

	_imap.settings.show_icons = true;
	_imap.settings.use_search = true;
	_imap.settings.use_zoom_slider = true;
	_imap.settings.links_enabled = true;
	_imap.settings.debug_enabled = false;
	
	bingAPIkey=false;
	
	locale.Search = '<?php echo _('Search'); ?>';
	
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
	
	_imap.filter = {
		show_severity: <?php echo $pageFilter->severityMin; ?>,
		hostid: <?php echo $pageFilter->hostid; ?>,
		groupid: <?php echo $pageFilter->groupid; ?>
	};
	

</script>
<script type="text/javascript" src="imap/imap.js"></script>

<?php

	if (file_exists('imap/settings.js')) echo '<script src="imap/settings.js"></script>';

?>

<?php

if (!$check_links) echo '<script type="text/javascript"> _imap.settings.links_enabled = false; </script>';

textdomain("frontend");
if ($output!='block') {
	require_once dirname(__FILE__).'/include/page_footer.php';
};
