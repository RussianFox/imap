<?PHP
bindtextdomain('imap', 'locale');
bind_textdomain_codeset('imap', 'UTF-8');
textdomain("imap");
$ZBX_MENU['view']['pages'][]=

			array(
				'url' => 'imap.php',
				'label' => _('Interactive map')
			);
textdomain("frontend");

?>