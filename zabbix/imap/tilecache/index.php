<?php
//папка, куда будут сохраняться тайлы
$dircache = 'cache'; //without "/" in end
//url до папки, указанной выше. Если установить значение в false, то php будет сам создавать изображения, что потребует больше ресурсов 
$dircacheurl = 'cache'; //without "/" in end
//время действия кэша, по истечению будет попытка обновить кэш. ВНИМАНИЕ! В случае неудачи обновления, все-равно будет исползован кэш
$cachetime = 3; //in days

$url = $_SERVER['QUERY_STRING'];
$parsurl = parse_url($url);
$path = $parsurl['host'].$parsurl['path'];
if ($parsurl['query']) $path = $path.'$$'.$parsurl['query'];
if ($parsurl['anchor']) $path = $path.'$$$'.$parsurl['anchor'];

$file = $dircache.'/'.$path;
$fileurl = $dircacheurl.'/'.$path;

function redirect() {
	global $fileurl, $dircacheurl;
	if (!$dircacheurl) showimage();
	header('Location: '.$fileurl ); exit;
};

function showimage() {
	global $file;
	$text=file_get_contents($file);
	$thumb = imagecreatefromstring($text);
	header('Content-type: image/png'); 
	imagepng($thumb,NULL);
	exit;
};

function cachefile($text) {
	global $file;

	//получаем путь
	$dir = explode("/", $file);
	array_pop($dir);
	$dir = implode('/',$dir);
	//создаем директорию
	mkdir($dir, 0777, true);
	
	//открываем файл
	$fp = fopen($file, "w+");
	// записываем в файл текст
	fwrite($fp, $text);
	// закрываем
	fclose($fp);
};


//проверяем наличие файла в кеше
if (file_exists($file)) {
	//проверяем дату создания
	if (filemtime($file)>(time()-3600*24*$cachetime)) {
		//обновлять кэш время не пришло
		//выводим закэшированный файл
		redirect();
	} else {
		//если кэш истек
		//получаем файл
		$text=file_get_contents($url);
		if ($text) {
			//если удалось получить файл, кэшируем и выводим
			cachefile($text);
			redirect();
		} else {
			//если не удалось, то выводим кэшированный
			redirect();
		};
	};
};

$text=file_get_contents($url);
if ($text) cachefile($text);
redirect();
?>