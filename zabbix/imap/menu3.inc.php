<?PHP
bindtextdomain('imap', 'locale');
bind_textdomain_codeset('imap', 'UTF-8');
textdomain("imap");
$zbx_menu['view']['pages'][]=

			array(
				'url' => 'imap.php',
				'label' => _('Interactive map')
			);
textdomain("frontend");

if (function_exists('get_request')) {
	$_REQUEST['ispopup'] = get_request('ispopup', 0);
};

if (function_exists('getRequest')) {
	$_REQUEST['ispopup'] = getRequest('ispopup', 0);
};

if ($_REQUEST['ispopup'] === '1') {
	define('ZBX_PAGE_NO_MENU', true);
	define('ZBX_PAGE_NO_HEADER', true);
	//define('ZBX_PAGE_NO_THEME', true);
};
?>