
	jQuery('#imapworkarea').show();
	jQuery('#imapworkareaError').hide();

	_imap.links = L.layerGroup();
	
	_imap.markersList = new Object;
	_imap.map = false;
	_imap.bbox = false;
	_imap.searchpopup;
	_imap.lines = new Object;
	_imap.vars = new Object;
	_imap.vars.it_first = true;
	_imap.vars.linksVisible = false;
	_imap.hostsfilter = '';
	_imap.searchmarkers = L.layerGroup();
	_imap.googlestreetviewer = false;
	_imap.googlestreetviewer_marker = false;
	_imap.messages = {count:0, text:{}};

	_imap.settings._zoom_meters = [1000000,500000,300000,100000,50000,20000,10000,5000,2000,1000,500,300,100,50,30,20,10,5,0];
	
	function escapeHtml(text) {
		if (text == undefined) return '';
		var map = {
		  '&': '&amp;',
		  '<': '&lt;',
		  '>': '&gt;',
		  '"': '&quot;',
		  "'": '&#039;'
		};

		return text.replace(/[&<>"']/g, function(m) { return map[m]; });
	}
	
	function getLayers() {
		var osm = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {maxZoom:18, attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});
		var ocm = new L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {maxZoom:18, attribution: 'Maps &copy; <a href="http://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
		var oqm = new L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {maxZoom:18, attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'});
		
		var mapsurf = new L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', {maxZoom:18, attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Imagery © <a href="http://giscience.uni-hd.de/">GIScience Research Group @ Heidelberg University</a>'});
		var mapsurft = new L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/hybrid/x={x}&y={y}&z={z}', {maxZoom:18, attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Imagery © <a href="http://giscience.uni-hd.de/">GIScience Research Group @ Heidelberg University</a>'});
		
		var mapboxsat = new L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg', {maxZoom:17, attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'});
		
		var stamenbw = new L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {maxZoom:18, subdomains:'abcd', attribution: 'Map Data: © <a href="http://maps.stamen.com/" target="_blank">Stamen.com</a>'});
		
		var kosmosnimkiosm = new L.tileLayer('http://{s}.tile.osm.kosmosnimki.ru/kosmo/{z}/{x}/{y}.png', {maxZoom:18, subdomains:'abcdef', attribution: 'Map Data: © <a href="http://osm.kosmosnimki.ru/" target="_blank">osm.kosmosnimki.ru</a>'});
		
		var overlayMaps = {
		    "MapSurfer transparent": mapsurft
		};
		
		var baseMaps = {
		    "OpenStreetMap": osm,
		    "OpenCycleMap": ocm,
		    "MapQuest Open": oqm,
		    "Mapsurfer Roads": mapsurf,
		    "Mapbox satellite": mapboxsat,
		    "Stamen B&W": stamenbw,
		    "Kosmosnimki.ru OSM": kosmosnimkiosm
		};
		
		if (bingAPIkey) {
			baseMaps["Bing Satellite"] = new L.BingLayer(bingAPIkey, {culture: _imap.settings.lang, type: 'Aerial'});
			baseMaps["Bing Hybrid"] = new L.BingLayer(bingAPIkey, {culture: _imap.settings.lang, type: 'AerialWithLabels'});
			baseMaps["Bing"] = new L.BingLayer(bingAPIkey, {culture: _imap.settings.lang, type: 'Road'});
		};
		
		try {
			baseMaps["Yandex"] = new L.Yandex();
			baseMaps["Yandex"].options.maxZoom = 18;
			baseMaps["Yandex Satellite"] = new L.Yandex('satellite');
			baseMaps["Yandex Hybrid"] = new L.Yandex('hybrid');
		}  catch(e) {} finally {};
		
		try {
			baseMaps["Google Satellite"] = new L.Google();
			baseMaps["Google"] = new L.Google('ROAD');
			baseMaps["Google Hybrid"] = new L.Google('HYBRID');
		}  catch(e) {} finally {};		
		
		return([baseMaps,overlayMaps]);
	};
	
	
	_imap.markers = new L.MarkerClusterGroup({
		maxClusterRadius: 30,
		spiderfyDistanceMultiplier:_imap.settings.spiderfyDistanceMultiplier,
		iconCreateFunction: function (cluster) {
			var cmarkers = cluster.getAllChildMarkers();
			var chost = new Object;
			chost.ok = 0; chost.problem=0; chost.maintenance=0;
			var n = 0;
			var count = 0;
			for (var i = 0; i < cmarkers.length; i++) {
				n = Math.max(+cmarkers[i].options.status,n);
				count++;
				if (cmarkers[i].options.del) {
					count--;
				} else if ((cmarkers[i].options.nottrigger) & (cmarkers[i].options.maintenance)) {
					chost.maintenance++;
				} else if (cmarkers[i].options.status>0) {
					chost.problem++;
				} else {
					chost.ok++;
				};
			};
			return L.divIcon({className:'icon_status_cluster icon_status_'+n,html:'<span class=st_ok>'+chost.ok+'/</span><span class=st_problem>'+chost.problem+'/</span><span class=st_maintenance>'+chost.maintenance+'</span>',iconAnchor:[14, 14]});
		}
	});
	
	_imap.markers.on('clustercontextmenu',function(tt){ 
		if ( (tt.layer._childCount<_imap.settings.maxMarkersSpiderfy) | (_imap.map.getMaxZoom() === _imap.map.getZoom()) ) {
			tt.layer.spiderfy();
		} else {
			tt.layer.zoomToBounds();
		}
	});
	
	
	
	/* Изменение свойств линии связи */
	function linkOptions(hl) {
		var ttx='';
		ttx = ttx + '<div class="item"><button onClick="jQuery(\'.dellinkconfirm\').show();"><span class=delbutton>X</span> '+mlocale('Delete link')+'</button>  </div>';
		
		ttx = ttx + '<div style="display:none;" class="item dellinkconfirm"><button onClick="jQuery(\'.dellinkconfirm\').hide();">'+mlocale('Cancel')+'</button> <button style="display:none;" class=dellinkconfirm onClick="deleteLink('+hl+'); jQuery(\'#linkoptionsdialog\').dialog(\'destroy\');"><span class="delbutton">X</span> '+mlocale('Delete confirm')+'</button></div>';
		
		ttx = ttx + '<div class="item"><label>'+mlocale('Link name')+'<br><input class=linkoption value="'+_imap.lines[hl][2].options.name+'" name=linkname type=text></label></div>';
		ttx = ttx + '<div class="item"><label>'+mlocale('Link color')+'<br><input class=linkoption value="'+_imap.lines[hl][2].options.color+'" name=linkcolor type=colorpicker></label></div>';
		ttx = ttx + '<div class="item"><label>'+mlocale('Link width')+', px<br><input class=linkoption value="'+_imap.lines[hl][2].options.weight+'" name=linkweight type=number min="1" max="20" step="1"></label></div>';
		ttx = ttx + '<div class="item"><label>'+mlocale('Link opacity')+', %<br><input class=linkoption value="'+_imap.lines[hl][2].options.opacity*100+'" name=linkopacity type=number min="0" max="100" step="10"></label></div>';
		ttx = ttx + '<div class="item linkdash"><label>'+mlocale('Link dash')+'<br><input class=linkoption value="'+_imap.lines[hl][2].options.dash+'" name=linkdash type=hidden></label><span onClick="jQuery(\'.item.linkdash ul\').slideToggle(\'fast\');"><svg height="8" width="100%"><g><path stroke="#2F2F2F" stroke-dasharray="'+_imap.lines[hl][2].options.dash+'" stroke-width="5" d="M5 0 l215 0"></path></g></svg></span><ul style="display:none;">';
		
		ttx = ttx + '<li><a href="#"><svg height="8" width="100%"><g><path stroke="#2F2F2F" stroke-dasharray="5,5" stroke-width="5" d="M5 0 l215 0"></path></g></svg></a></li>';
		ttx = ttx + '<li><a href="#"><svg height="8" width="100%"><g><path stroke="#2F2F2F" stroke-dasharray="2,5" stroke-width="5" d="M5 0 l215 0"></path></g></svg></a></li>';
		ttx = ttx + '<li><a href="#"><svg height="8" width="100%"><g><path stroke="#2F2F2F" stroke-dasharray="5,15,10" stroke-width="5" d="M5 0 l215 0"></path></g></svg></a></li>';
		ttx = ttx + '<li><a href="#"><svg height="8" width="100%"><g><path stroke="#2F2F2F" stroke-dasharray="2,15" stroke-width="5" d="M5 0 l215 0"></path></g></svg></a></li>';
		
		ttx = ttx + '</ul></div>';
		
		var scriptDialog = jQuery('<div>', {
				title:mlocale('Link options'),
				id: 'linkoptionsdialog',
				css: {
					display: 'none',
					'white-space': 'normal'
				}
		}).html(ttx);
		scriptDialog.dialog({
			title:mlocale('Link options'),
			resizable: true,
			height:380,
			modal: true,
			buttons: {
				Save: function() {
					var res = new Object;
					jQuery('#linkoptionsdialog .linkoption').each(function() {
						res[this.name] = this.value;
					});
					jQuery.ajax({
						url: 'imap.php',
						type: 'POST',
						dataType: 'json',
						data: {
							output: 'ajax',
							action_ajax: 'update_link',
							linkid: hl,
							linkoptions: res
						},
						success: function(data){
							if (data.error) {
								ajaxError(data.error.message);
								return;
							};
							loadLinks(hl);
							showMes(mlocale('Successful'));
						},
						error: function(data){
							ajaxError(mlocale('Failed to update data'));
						}
					});
					jQuery( this ).dialog( "destroy" );
				},
				Cancel: function() {
					jQuery( this ).dialog( "destroy" );
				}
			}
		});
		/*jQuery("input[type='color']").minicolors();*/
		
		jQuery("input[type='colorpicker']").colorPicker();
		
		jQuery("input[type='number']").css('width','80%');
		jQuery("input[type='number']").stepper();
		
	};
	
	/* Ошибка ajax-запроса */
	function ajaxError(mmes,cr) {
		if (mmes == undefined) mmes = mlocale('Failed to update data');
		showMes('<b><font color=red>'+mlocale('Error')+'</font></b>: '+mmes,cr);
	};
	
	/* удаляем линию связи */
	function deleteLink(linkid) {
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				output: 'ajax',
				action_ajax: 'del_link',
				linkid: linkid
			},
			success: function(data){
				if (data.error) {
					ajaxError(data.error.message);
					return;
				};
				delLine(linkid);
				showMes(mlocale('Successful'));
			},
			error: function(data){
				ajaxError(mlocale('Failed to update data'));
			}
		});
	};
	
	function get_last_messages() {
		var onlymes = 1;
		if (!getCookie('countertoday')) {
			onlymes = 0;
		};
		jQuery.ajax({
			url: 'http://imapmessages.lisss.ru',
			type: 'POST',
			dataType: 'json',
			data: {
				version: _imap.version,
				zabbix: _imap.zabbixversion,
				onlymes: onlymes
			},
			success: function(data){
				if (onlymes == 0) setCookie('countertoday', '1', {expires: (3600*24), path: '/'});
				var lastmes = +getCookie('imap_messages_last_num');
				if (!lastmes) lastmes = 0;
				var newlastmes = 0;
				jQuery.each(data,function(num,text){
					_imap.messages.text[num] = text;
					if (num>lastmes) {
						_imap.messages.count++;
						newlastmes = Math.max(num,newlastmes);
					};
				});
				_imap.messages.lastnum = newlastmes;
				jQuery('.imap_messages_count').html(_imap.messages.count>0?_imap.messages.count:'');
			},
			error: function(data){
				
			}
		});
	};
	
	/* фильтр поиска хостов */
	function hostsFilter(hh,ff) {
		if (ff == undefined) return true;
		if (ff == '') return true;
		if (!_imap.markersList[hh]) return true;
		if (!_imap.markersList[hh].host_info) return true;
		var res = false;
		res = ((res) || (_imap.markersList[hh].host_info.name.toLowerCase().indexOf(ff.toLowerCase())>-1));
		res = ((res) || (_imap.markersList[hh].host_info.host.toLowerCase().indexOf(ff.toLowerCase())>-1));
		if (_imap.markersList[hh].host_info.description) res = ((res) || (_imap.markersList[hh].host_info.description.toLowerCase().indexOf(ff.toLowerCase())>-1));
		res = ((res) || (_imap.markersList[hh].host_info.inventory[_imap.settings.hardware_field].toLowerCase().indexOf(ff.toLowerCase())>-1));
		
		var ob = jQuery.makeArray( _imap.markersList[hh].host_info.interfaces );
		
		for(key in ob) {
			if (ob[key].ip) res = ((res) || (ob[key].ip.toLowerCase().indexOf(ff.toLowerCase())>-1));
		};
		return res;
	};
	
	_imap.vars.timeoutHostSearch1 = false;

	/* задержка поиска в списке хостов на карте */
	function getHostsFilter1T(tx) {
		if (_imap.vars.timeoutHostSearch1) clearTimeout(_imap.vars.timeoutHostSearch1);
		_imap.vars.timeoutHostSearch1=setTimeout(function(){ getHostsFilter1(tx) },1000);
	};

	/* поиск в списке хостов на карте */
	function getHostsFilter1(tx) {
		_imap.hostsfilter = tx.toLowerCase();

		if (_imap.hostsfilter=='') {
		  jQuery('#filter-indicator').hide();
		} else {
		  jQuery('#filter-indicator').show();
		};
		
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				hostid: _imap.filter.hostid,
				groupid: _imap.filter.groupid,
				action_ajax: 'search_hosts',
				output: 'ajax',
				searchstring: _imap.hostsfilter
			},
			success: function(data){
				for (nn in _imap.markersList) {
					if (data[nn]) {
						showMarker(+nn);
						jQuery('.host_in_list').filter('[hostid='+nn+']').show();
					} else {
						unshowMarker(+nn);
						jQuery('.host_in_list').filter('[hostid='+nn+']').hide();
					};
				};
				
			}
		});
		
	};
	
	_imap.vars.timeoutHostSearch2 = false;
	
	/* задержка поиска в списке хостов выбора связи */
	function getHostsFilter2T(tx) {
		if (_imap.vars.timeoutHostSearch2) clearTimeout(_imap.vars.timeoutHostSearch2);
		_imap.vars.timeoutHostSearch2=setTimeout(function(){ getHostsFilter2(tx) },1000);
	};
	
	/* поиск в списке хостов выбора связи */
	function getHostsFilter2() {
		var tx = jQuery('.links_filter input').val();
		if (tx==='') {
			jQuery('.links_fields table tr').show();
			return;
		};
		
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				hostid: _imap.filter.hostid,
				groupid: _imap.filter.groupid,
				action_ajax: 'search_hosts',
				output: 'ajax',
				searchstring: tx
			},
			success: function(data){
			  
				jQuery('.links_fields table tr').hide();
				jQuery('.links_fields table tr').filter(
					function(index) {
						if (data[jQuery(this).attr('hostid')]) return true;
						return false;
					}
				).show();
			  
			}
		});
		
	};
	
	/* обновляем линию связи */
	function updateLine(nn) {
		if (!_imap.settings.links_enabled) return;
		if (!_imap.vars.linksVisible) return;
		if ( (_imap.markersList[_imap.lines[nn][0]]) && (_imap.markersList[_imap.lines[nn][1]]) ) {
			if ( (_imap.markers.hasLayer(_imap.markersList[_imap.lines[nn][0]].marker)) && (_imap.markers.hasLayer(_imap.markersList[_imap.lines[nn][1]].marker)) ) {
				if ((_imap.markers.getVisibleParent(_imap.markersList[_imap.lines[nn][0]].marker)) || (_imap.markers.getVisibleParent(_imap.markersList[_imap.lines[nn][1]].marker))) {
					if (_imap.markers.getVisibleParent(_imap.markersList[_imap.lines[nn][0]].marker) != _imap.markers.getVisibleParent(_imap.markersList[_imap.lines[nn][1]].marker)) {
						_imap.lines[nn][2].spliceLatLngs(0, 2);
						_imap.lines[nn][2].addLatLng(_imap.markersList[_imap.lines[nn][0]].marker._latlng);
						_imap.lines[nn][2].addLatLng(_imap.markersList[_imap.lines[nn][1]].marker._latlng);
						
						if (_imap.markersList[_imap.lines[nn][0]].marker._latlng.distanceTo(_imap.markersList[_imap.lines[nn][1]].marker._latlng)>_imap.settings._zoom_meters[_imap.map.getZoom()]) {
							if (!_imap.links.hasLayer(_imap.lines[nn][2])) {
								_imap.links.addLayer(_imap.lines[nn][2]);
							};
							return;
						};
					};
				};
			};
		};
		_imap.links.removeLayer(_imap.lines[nn][2]);
	};
	
	function updateLines() {
		if (!_imap.settings.links_enabled) return;
		if (!_imap.vars.linksVisible) return;
		for (var nn in _imap.lines) {
			updateLine(+nn);
		};
	};
	
	function updateLinesMarker(mm) {
		if (!_imap.settings.links_enabled) return;
		if (!_imap.vars.linksVisible) return;
		for (var nn in _imap.lines) {
			if ( (mm == _imap.lines[+nn][0]) | (mm == _imap.lines[+nn][1]) ) {
				updateLine(+nn);
			};
		};
	};
	
	function getHostname(id) {
		if (!_imap.markersList[+id]) return '';
		if (!_imap.markersList[+id].marker) return '';
		return ''+_imap.markersList[+id].marker.options.host_name;
	};
	
	function loadLine(nl) {
		if (!_imap.settings.links_enabled) return;
		if (!_imap.vars.linksVisible) return;
		if (_imap.lines[nl.id]) {
			_imap.links.removeLayer(_imap.lines[nl.id][2]);
		};
		if ((nl.host1 == undefined)||(nl.host2 == undefined)||(nl.id == undefined)) return false;
		if (nl.dash == '0') nl.dash = '';
		if (nl.color == '0') nl.color = '#0034ff';
		if (nl.opacity == '0') nl.opacity = 50;
		nl.opacity = nl.opacity/100;
		if (nl.weight == '0') nl.weight = 5;
		_imap.lines[nl.id] = {0:nl.host1, 1:nl.host2, 2:L.polyline([], {color: nl.color, name:'', dashArray: nl.dash, opacity:nl.opacity, weight: nl.weight, smoothFactor:8})};
		if (nl.name == '0') nl.name = '';
		_imap.lines[nl.id][2].bindLabel('<b>' + escapeHtml(nl.name) + '</b><br>' + getHostname(_imap.lines[nl.id][0]) + '<-->' + getHostname(_imap.lines[nl.id][1]));
		_imap.lines[nl.id][2].options.name = escapeHtml(nl.name);
		
		_imap.lines[nl.id][2].on('click',function(){linkOptions(nl.id);});
		updateLine(nl.id);
		return true;
	};
	
	function delLine(nn) {
		_imap.links.removeLayer(_imap.lines[nn][2]);
		delete _imap.lines[nn];
	};
	
	function getRandomLatLng(map) {
		var bounds = map.getBounds(),
			southWest = bounds.getSouthWest(),
			northEast = bounds.getNorthEast(),
			lngSpan = northEast.lng - southWest.lng,
			latSpan = northEast.lat - southWest.lat;

		return new L.LatLng(
			southWest.lat + latSpan * Math.random(),
			southWest.lng + lngSpan * Math.random()
		);
	};

	function showMes(tt,cr,id) {
		var el;
		el = jQuery('<div/>', {
			html: '<div>'+tt+'</div>'
		});
		if (id!==undefined) el.attr("id",id);
		if (cr===0) el.append('<div class=close onClick="jQuery(this).parent().remove();">X</div>');
		el.appendTo('#imapmes');
		if (cr==undefined) el.delay(2000).slideUp('fast',function(){$(this).remove();});
		if (cr>0) el.delay(cr).slideUp('fast');
	};
	
	function getHostLocation(hh) {
		_imap.map.off('click');
		var el;
		el = jQuery('<div/>');
		el.html(mlocale('Select a new position')+' <a style="color:red;" onClick="setHostLocation();" href="#">'+mlocale('Cancel')+'</a>').attr("id",'mesGetHostLocation').appendTo('#imapmes');
		jQuery(_imap.map._container).css('cursor','crosshair');
		_imap.map.on('click',function(e){ 
			setHostLocation(hh,e.latlng.lat,e.latlng.lng);
			return false;
		});
	};
	
	function getHardware(hh,event) {
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				output: 'ajax',
				action_ajax: 'get_hardware'
			},
			success: function(data){
				if (data.result) {
					var hardwareDialog = jQuery('<ul>', {
						title:mlocale('Set a hardware type'),
						id: 'select-hardware-form',
						css: {
							display: 'none',
							'overflow-y': 'auto'
						}
					});
					
					hardwareDialog.html(hardwareDialog.html()+'<li onclick="setHardware('+hh+',\'\'); jQuery(\'#select-hardware-form\').dialog( \'destroy\' );" class="hardware-select"><img width="20px" src="imap/hardware/none.png"> none </li>');
					for (var nn=0; nn<data.result.length; nn++) {
						var tt1 = data.result[+nn].substring(0, data.result[+nn].length-4);
						var tt2 = data.result[+nn];
						hardwareDialog.html(hardwareDialog.html()+'<li onclick="setHardware('+hh+',\''+tt1+'\'); jQuery(\'#select-hardware-form\').dialog( \'destroy\' );" class="hardware-select"><img width="20px" src="imap/hardware/'+tt2+'"> '+tt1+' </li>');
					};
					
					hardwareDialog.dialog({
						title:mlocale('Set a hardware type'),
		
						resizable: true,
						height:450,
						modal: true,
						buttons: {
							Cancel: function() {
								jQuery( this ).dialog( "destroy" );
							}
						}
					});
					jQuery('#select-hardware-form .hardware-select').mouseover(function(){
						jQuery(this).addClass('active');
					  
					}).mouseout(function(){
					  jQuery(this).removeClass('active'); 
					  
					});
					
				};
			},
			error: function(data) {
				ajaxError(mlocale('Failed to update data'));
			}
		});
	};
	
	function setHardware(hh, im) {
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				action_ajax: 'set_hardware',
				output: 'ajax',
				hostid: hh,
				hardware: im,
				hardwareField: _imap.settings.hardware_field
			},
			success: function(data){
				_imap.markersList[+hh].marker.options.hardware = im;
				updateMarker(+hh);
				_imap.map.closePopup();
				openPopupHost(+hh);
			},
			error: function(data) {
				ajaxError(mlocale('Failed to update data'));
			}
		});
	};
	
	function setHostLocation(hh,lat,lng) {
		_imap.map.off('click');
		jQuery(_imap.map._container).css('cursor','');
		jQuery('#mesGetHostLocation').remove();
		if ((hh==undefined) || (lat==undefined) || (lng==undefined)) return;
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				action_ajax: 'update_coords',
				output: 'ajax',
				hostid: hh,
				lat: lat,
				lng: lng
			},
			success: function(data){
				if (data.result) {
					if (!_imap.markersList[hh].marker) {
						jQuery('.host_in_list').filter('[hostid='+hh+']').remove();
						loadHost(hh);
						return;
					};
					_imap.markers.removeLayer(_imap.markersList[hh].marker);
					_imap.markersList[hh].marker.setLatLng([lat,lng]);
					_imap.markers.addLayer(_imap.markersList[hh].marker);
				} else {
					showMes(mlocale('Error')+': '+mlocale('Failed to update data'));
				};
			},
			error: function(data) {
				ajaxError(mlocale('Failed to update data'));
			}
		});
	};
	
	function reQdelHostLocation(hh) {
		var scriptDialog = jQuery('<div>', {
				title:mlocale('Execution confirmation'),
				css: {
					display: 'none',
					'white-space': 'normal'
				}
		}).html(mlocale('Delete location')+'?');
		scriptDialog.dialog({
			title:mlocale('Execution confirmation'),
			resizable: false,
			height:140,
			modal: true,
			buttons: {
				Ok: function() {
					delHostLocation(hh);
					jQuery( this ).dialog( "destroy" );
				},
				Cancel: function() {
					jQuery( this ).dialog( "destroy" );
				}
			}
		});
	};
	
	function getDebugInfo(tt,hh,tr) {
		var txt = '';
		if (tt=='host') {
			txt = dump(_imap.markersList[hh].host_info);
		} else if (tt=='trigger') {
			txt = dump(_imap.markersList[hh].triggers[tr]);
		} else {
			txt = 'No debug info.';
		};
		var scriptDialog = jQuery('<div>', {
				title:mlocale('Debug information'),
				css: {
					display: 'none',
					'white-space': 'normal'
				}
		}).html('<pre>'+txt+'</pre>');
		scriptDialog.dialog({
			title:mlocale('Debug information'),
			resizable: true,
			modal: false,
			buttons: {
				Close: function() {
					jQuery( this ).dialog( "destroy" );
				}
			}
		});
	};
	
	function sortingHosts(){
		var elements = jQuery('#hosts_list .host_in_list');
		var target = jQuery('#hosts_list');
		
		elements.sort(function (a, b) {
			var an = jQuery(a).attr('hostname'),
			bn = jQuery(b).attr('hostname');
		    
			if (an && bn) {
				return an.toUpperCase().localeCompare(bn.toUpperCase());
			}
			
			return 0;
		});
		
		elements.detach().appendTo(target);
	};
	
	function delHostLocation(hh) {
		if (hh==undefined) return;
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				action_ajax: 'update_coords',
				output: 'ajax',
				hostid: hh,
				lat: 'none',
				lng: 'none'
			},
			success: function(data){
				if (data.result) {
					_imap.map.closePopup();
					unshowMarker(hh);
					delete _imap.markersList[hh];
					jQuery('.host_in_list').filter('[hostid='+hh+']').remove();
					loadHost(hh);
					
				} else {
					showMes(mlocale('Error')+': '+mlocale('Failed to update data'));
				};
			},
			error: function(data) {
				ajaxError(mlocale('Failed to update data'));
			}
		});
	};
	
	function mapBbox() {
		if (_imap.settings.pause_map_control) return;
		if (_imap.bbox) {
			var ll1 = L.latLng(_imap.bbox.minlat, _imap.bbox.maxlon);
			var ll2 = L.latLng(_imap.bbox.maxlat, _imap.bbox.minlon);
			var bb = L.latLngBounds(ll1,ll2);
			_imap.map.fitBounds(bb);
		};
	};

	function updateIcon(e,first) {
		vMarker = _imap.markersList[+e].marker;
		if (!vMarker) return;
		while (vMarker) {
			vMarker = vMarker.__parent;
			if (vMarker) {
				vMarker._updateIcon();
				if (vMarker.__iconObj) vMarker.setIcon(vMarker.__iconObj);
			};
		}
	};

	function setCookie(name, value, options) {
		options = options || {};
		var expires = options.expires;
		if (typeof expires == "number" && expires) {
			var d = new Date();
			d.setTime(d.getTime() + expires*1000);
			expires = options.expires = d;
		}
		if (expires && expires.toUTCString) {
			options.expires = expires.toUTCString();
		}
		value = encodeURIComponent(value);
		var updatedCookie = name + "=" + value;
		for(var propName in options) {
			updatedCookie += "; " + propName;
			var propValue = options[propName];   
			if (propValue !== true) {
			  updatedCookie += "=" + propValue;
			}
		}
	    
	      document.cookie = updatedCookie;
	};
	
	function getCookie(name) {
	    cookie_name = name + "=";
	    cookie_length = document.cookie.length;
	    cookie_begin = 0;
	    while (cookie_begin < cookie_length)
	    {
		value_begin = cookie_begin + cookie_name.length;
		if (document.cookie.substring(cookie_begin, value_begin) == cookie_name)
		{
		    var value_end = document.cookie.indexOf (";", value_begin);
		    if (value_end == -1)
		    {
			value_end = cookie_length;
		    }
		    return unescape(document.cookie.substring(value_begin, value_end));
		}
		cookie_begin = document.cookie.indexOf(" ", cookie_begin) + 1;
		if (cookie_begin == 0)
		{
		    break;
		}
	    }
	    return;
	};
	
	function addBbox(lat,lon,bbox) {
		if (bbox) {
			bbox.maxlat = Math.max(bbox.maxlat,lat);
			bbox.minlat = Math.min(bbox.minlat,lat);
			bbox.maxlon = Math.max(bbox.maxlon,lon);
			bbox.minlon = Math.min(bbox.minlon,lon);
		} else {
			bbox = new Object;
			bbox.maxlat = lat;
			bbox.minlat = lat;
			bbox.maxlon = lon;
			bbox.minlon = lon;
		};
		return bbox;
	};

	function showMarker(nn) {
	  
		for (var mm in _imap.markersList[+nn].triggers) {
			addLastTrigger(_imap.markersList[+nn].triggers[+mm]);
		};
	  
		if (!_imap.markersList[+nn].marker) return;
		if (_imap.markersList[+nn].marker.options.show) return;
		_imap.markers.addLayer(_imap.markersList[+nn].marker);
		_imap.markersList[+nn].marker.options.del = false;
		_imap.markersList[+nn].marker.options.show = true;
		updateIcon(+nn);
		updateLinesMarker(nn);
	};
	
	function unshowMarker(nn) {
	  
		for (var mm in _imap.markersList[+nn].triggers) {
			delLastTrigger(+mm);
		};
	  
		if (!_imap.markersList[+nn].marker) return;
		if (!_imap.markersList[+nn].marker.options.show) return;
		_imap.markersList[+nn].marker.options.del = true;
		updateIcon(+nn);
		_imap.markers.removeLayer(_imap.markersList[+nn].marker);
		_imap.markersList[+nn].marker.options.del = false;
		_imap.markersList[+nn].marker.options.show = false;
		updateLinesMarker(nn);
	};
	
	function dump(obj) {
		var out = "";
		if(obj && typeof(obj) == "object"){
			out += "Object { \n";
			for (var i in obj) {
				out += i + ' : ' + dump(obj[i]);
			};
			out += "} \n";
		} else {
			out = obj + " \n";
		}
		return (out);
	};
	
	
	function addLastTrigger(trigger) {
		if (trigger.priority>=_imap.filter.show_severity) _imap.Controls['lasttriggers'].addTrigger(trigger);
	};
	
	function delLastTrigger(nn) {
		_imap.Controls['lasttriggers'].removeTrigger(+nn);
	};
	
	function loadTriggers() {
		if(!_imap.loadingtriggersid) _imap.loadingtriggersid=0;
		_imap.loadingtriggersid++;
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				show_severity: _imap.filter.show_severity,
				hostid: _imap.filter.hostid,
				groupid: _imap.filter.groupid,
				action_ajax: 'get_triggers',
				output: 'ajax'
			},
			success: function(data){
				var lhi = _imap.loadingtriggersid;
				
				var luhost = new Object;
				
				/*
				for (var nn in _imap.markersList) {
					for (var mm in _imap.markersList[+nn].triggers) {
						_imap.markersList[+nn].triggers[+mm].del = true;
					};
				};
				*/
				
				for (var nn in data) {
					var trigger = data[+nn];
					if (!trigger) continue;
					if (!trigger.value==1) continue;
					if (!_imap.markersList[trigger.hostid]) continue;
					_imap.markersList[trigger.hostid].triggers[trigger.triggerid] = trigger;
					_imap.markersList[trigger.hostid].triggers[trigger.triggerid].lhi = lhi;
					addLastTrigger(trigger);
					luhost[trigger.hostid] = trigger.hostid;
				};
				
				
				
				for (var nn in _imap.markersList) {
					for (var mm in _imap.markersList[+nn].triggers) {
						if (_imap.markersList[+nn].triggers[+mm].lhi<lhi) {
							delete _imap.markersList[+nn].triggers[+mm];
							delLastTrigger(+mm);
							luhost[+nn] = +nn;
						};
					};
				};
				
				for (var nn in _imap.markersList) {
					if (!_imap.markersList[+nn].marker) continue;
					updateMarker(+nn);
					if (_imap.settings.show_with_triggers_only) {
						if (_imap.markersList[+nn].marker.options.status>=_imap.settings.min_status) {
							if (hostsFilter(+nn)) showMarker(+nn);
						} else {
							unshowMarker(+nn);
						};
					};
					if (_imap.markersList[+nn].marker.options.show) updateIcon(+nn);
					if (_imap.markersList[+nn].marker.options.status>=_imap.settings.min_status) {
						_imap.bbox = addBbox(_imap.markersList[+nn].marker._latlng.lat,_imap.markersList[+nn].marker._latlng.lng,_imap.bbox);
					};
				};
				
				if (_imap.settings.do_map_control | _imap.vars.it_first) {
					mapBbox(_imap.bbox);
				};
				
				if (_imap.vars.it_first) {
					jQuery('#mesLoading').slideUp('fast');
					_imap.vars.it_first = false;
				};
				
				
				
			},
			error: function(data){
				ajaxError(mlocale('Failed to get data'));
			}
		});
	};
	
	function addLinkHost(hh) {
		if (!_imap.settings.links_enabled) return;
		var ttx = '<div style="overflow-y:auto; height:100%;">';
		ttx = ttx+'<table class="tableinfo" cellpadding="3" cellspacing="1"';
		ttx = ttx+'<tr class="header"></tr>';
		var hhs = jQuery('.host_in_list');
		for (var nn=0; nn<hhs.length; nn++) {
			if ( ( +jQuery(hhs[nn]).attr('hostid')!==+hh ) && (_imap.markersList[+jQuery(hhs[nn]).attr('hostid')]) ) {
				ttx = ttx+'<tr class='+((nn % 2 == 0)?'even_row':'odd_row')+' hostid="'+jQuery(hhs[nn]).attr('hostid')+'"><td><label><input class="input checkbox pointer host_for_link" type="checkbox" value="'+jQuery(hhs[nn]).attr('hostid')+'">'+jQuery(hhs[nn]).text()+'</label></td></tr>';
			};
		};
		ttx = ttx+'</table>';
		ttx = ttx+'</div>';
		var scriptDialog = jQuery('<div>', {
				css: {
					display: 'none',
					'white-space': 'normal'
				}
		}).html('<div class=links_filter><input type="search" placeholder="'+mlocale('Search')+'" onInput="getHostsFilter2T();" style="width:100%"></div><div class=links_fields>'+ttx+'</div>');
		scriptDialog.dialog({
			title:mlocale('Select hosts for links'),
			resizable: true,
			height:400,
			width:550,
			modal: true,
			close: function(event, ui){ jQuery(this).dialog('destroy').remove() },
			buttons: {
				Save: function() {
					var thh = [];
					var hhs = jQuery('.host_for_link:checked');
					for (var nn=0; nn<hhs.length; nn++) {
						thh[thh.length] = hhs[nn].value;
					};
					if (thh.length>0) {
						jQuery.ajax({
							url: 'imap.php',
							type: 'POST',
							dataType: 'json',
							data: {
								hostid: hh,
								thostid: thh,
								action_ajax: 'add_links',
								output: 'ajax'
							},
							success: function(data){
								loadLinks();
							},
							error: function(data){
								ajaxError(mlocale('Failed to update data'));
							}
						});
					};
					jQuery( this ).dialog( "close" );
				},
				Cancel: function() {
					jQuery( this ).dialog( "close" );
				}
			}
		});	
	};

	function updatePopup(host_id) {
	  
		var rstr = '';
		if (!((_imap.markersList[host_id].marker.options.nottrigger) & (_imap.markersList[host_id].marker.options.maintenance))) {
			for (var nn in _imap.markersList[host_id].triggers) {
				var trigger = _imap.markersList[host_id].triggers[+nn];
				rstr = rstr + '<div id="trigger'+trigger.triggerid+'" class="trigger triggerst'+trigger.priority+'"><span class="link_menu" data-menu-popup="{&quot;type&quot;:&quot;trigger&quot;,&quot;triggerid&quot;:&quot;'+trigger.triggerid+'&quot;,&quot;showEvents&quot;:true}">'+escapeHtml(trigger.description)+'</span>';
				if (_imap.settings.debug_enabled) rstr = rstr + '<a onClick="getDebugInfo(\'trigger\','+host_id+','+trigger.triggerid+')" href="#" Title="'+mlocale('Show debug information')+'"><img src="imap/images/debug.png"></a>';

				rstr = rstr + '<div class=acknowledge>';
				if (trigger.lastEvent.eventid) rstr = rstr + mlocale('Ack')+': <a class="'+(trigger.lastEvent.acknowledged=='1'?'enabled':'disabled')+'" target="_blank" href="acknow.php?eventid='+trigger.lastEvent.eventid+'&amp;triggerid='+trigger.triggerid+'">'+(trigger.lastEvent.acknowledged=='1'?mlocale('Yes'):mlocale('No'))+'</a>';
				rstr = rstr + '<div class=lastchange lastchange='+trigger.lastchange+'></div></div></div>';
				
				status = Math.max(status,(trigger.priority>=_imap.settings.min_status?trigger.priority:0));
			};
		};
		jQuery('#hostPopup'+host_id+' .triggers').html(rstr);
	  
	  
		if (_imap.markersList[host_id].host_info) {
		  
			jQuery('#hostPopup'+host_id+' .hosterror').html('');
			if (_imap.markersList[host_id].host_info.error) jQuery('#hostPopup'+host_id+' .hosterror').html('Error: '+ _imap.markersList[host_id].host_info.error);
			
			var shh = '';
			if (_imap.markersList[host_id].host_info) jQuery(_imap.markersList[host_id].host_info.scripts).each(function() { shh=shh+'{&quot;name&quot;:&quot;'+this.name+'&quot;,&quot;scriptid&quot;:&quot;'+this.scriptid+'&quot;,&quot;confirmation&quot;:&quot;&quot;},'; });
			var hh = '<span class="link_menu" data-menu-popup="{&quot;type&quot;:&quot;host&quot;,&quot;hostid&quot;:&quot;'+host_id+'&quot;,&quot;showGraphs&quot;:true,&quot;showScreens&quot;:true,&quot;showTriggers&quot;:true,&quot;hasGoTo&quot;:true,&quot;scripts&quot;:['+shh.slice(0, -1)+']}">'+escapeHtml(_imap.markersList[host_id].marker.options.host_name)+'</span>';
			var hardware = ((_imap.markersList[host_id].marker.options.hardware && _imap.settings.show_icons)?'<img onerror="this.src=\'imap/hardware/none.png\';" title="'+_imap.markersList[host_id].marker.options.hardware+'" src=\'imap/hardware/'+_imap.markersList[host_id].marker.options.hardware+'.png\' class=hardwareIcon>':'');
			jQuery('#hostPopup'+host_id+' .hostname').html(hardware +' ' + hh);
			
			
			jQuery('#hostPopup'+host_id+' .host_interfaces').html('');
			var intftype = {'1': 'Agent', '2':'SNMP', '3':'IPMI', '4':'JMX'};
			var shh = '';
			_imap.markersList[host_id].host_info.interfaces.each(function(el) {
					shh = shh + '<div class=host_interfaces_line>';
					var addr = el.dns;
					if ( (el.useip=='1') && (el.ip!=='') ) 
						addr = el.ip;
					shh = shh + '<b>' + intftype[el.type] + '</b> ' + addr + ':' + el.port;
					shh = shh + '</div>';
			});
			jQuery('#hostPopup'+host_id+' .host_interfaces').html(shh);
			
			
			jQuery('#hostPopup'+host_id+' .hostdescription').html(''+escapeHtml(_imap.markersList[host_id].marker.options.description)+'</pre>');
			
			
			jQuery('#hostPopup'+host_id+' .host_inventory').html('');
			var shh = '';
			for (nn in _imap.markersList[host_id].host_info.inventory) {
				if (("#" + _imap.settings.exluding_inventory.join("#,#") + "#").search("#"+nn+"#") == -1)
					if (_imap.markersList[host_id].host_info.inventory[nn].length)
						shh = shh + '<div class=host_inventory_line><div class=host_inventory_line_l>'+locale.inventoryfields[nn]+':</div><div class=host_inventory_line_r>'+_imap.markersList[host_id].host_info.inventory[nn]+'</div></div>';
			};
			jQuery('#hostPopup'+host_id+' .host_inventory').html(shh);
			
			
			jQuery('#hostPopup'+host_id+' .host_links').html('');
			var shh = '';
			if (_imap.markersList[host_id].host_info) {
				if (_imap.markersList[host_id].host_info.inventory.url_a) shh = shh + '<div class=link><a href="'+_imap.markersList[host_id].host_info.inventory.url_a+'" target=_blank>URL A</a></div>';
				if (_imap.markersList[host_id].host_info.inventory.url_b) shh = shh + '<div class=link><a href="'+_imap.markersList[host_id].host_info.inventory.url_b+'" target=_blank>URL B</a></div>';
				if (_imap.markersList[host_id].host_info.inventory.url_c) shh = shh + '<div class=link><a href="'+_imap.markersList[host_id].host_info.inventory.url_c+'" target=_blank>URL C</a></div>';
			};
			jQuery('#hostPopup'+host_id+' .host_links').html(shh);
			_imap.markersList[host_id].marker._popup.setContent(jQuery('#hostPopup'+host_id)[0].outerHTML);
			createHostContextMenu(host_id);
		};
	};
	
	function createPopup(host_id) {
		var rstr = '<div id="hostPopup'+host_id+'"><div class=hosterror></div><div class=hostname>'+escapeHtml(_imap.markersList[host_id].marker.options.host_name)+'</div>';
		
		rstr = rstr + '<div class=hostcontrol>';
		rstr = rstr + '<div class="hostItems" id="hostItems'+host_id+'"></div>';
		rstr = rstr + '<a onClick="getHostLocation('+host_id+')" href="#" Title="'+mlocale('Change location')+'"><img src="imap/images/target.png"></a>';
		rstr = rstr + '<a onClick="reQdelHostLocation('+host_id+');" href="#" Title="'+mlocale('Delete location')+'"><img src="imap/images/target-del.png"></a>';
		if (_imap.settings.links_enabled) rstr = rstr + '<a href="#" Title="'+mlocale('Add a link to another host')+'" onClick="addLinkHost('+host_id+');"><img src="imap/images/link.png"></a>';
		if (_imap.settings.show_icons) rstr = rstr + '<a onClick="getHardware('+host_id+')" href="#" Title="'+mlocale('Set a hardware type')+'"><img src="imap/images/hardware.png"></a>';
		if (_imap.settings.debug_enabled) rstr = rstr + '<a onClick="getDebugInfo(\'host\','+host_id+')" href="#" Title="'+mlocale('Show debug information')+'"><img src="imap/images/debug.png"></a>';
		rstr = rstr + '</div>';
		
		rstr = rstr + '<div class=host_interfaces></div><div class=host_des><div class=hostdescription></div><div class=host_inventory></div></div><div class=host_links></div>';

		rstr = rstr + '<div class=triggers></div>';
		
		rstr = rstr + '</div>';
		
		_imap.markersList[host_id].marker.bindPopup(rstr);
	};
	
	function showImage(url,text) {
		jQuery('#showImage').remove();
		var container = jQuery('<div />').attr('id','showImage').bind('click',function(){jQuery("html,body").css('overflow', 'auto'); jQuery(this).remove();});
		jQuery(container).append('<div class=loading_indicator></div>');
		if (text) jQuery(container).append('<div class=text_for_image_div><div class=text_for_image>'+text+'</div></div>').bind('contextmenu',function(){ jQuery(this).children('.text_for_image_div').toggle(); return false; });
		var img = jQuery('<img />').attr('src',url).css('display','none').bind('load',function(){ jQuery(this).show(); }).bind('contextmenu',function(){ jQuery(this).parent().parent().children('.text_for_image_div').toggle(); return false; });
		jQuery('<div />').addClass('image_div').append(img).appendTo(container);
		
		jQuery(container).click(function(event){ 
		  event.stopPropagation();
		});
		jQuery(container).dblclick(function(event){
		  event.stopPropagation(); 
		});
		jQuery(container).mousemove(function(event){
		  event.stopPropagation(); 
		});
		jQuery(container).scroll(function(event){
		  event.stopPropagation(); 
		});
		
		jQuery(container).appendTo('body').hide().show();
		jQuery("html,body").css('overflow', 'hidden');
		
	};
	
	function updateMarker(host_id) {
		if (!_imap.markersList[host_id].marker) return;
		var status=0;
		var maintenance_t = (_imap.markersList[host_id].marker.options.maintenance?'maintenance ':'');
		var nottrigger_t = (_imap.markersList[host_id].marker.options.nottrigger?'nottrigger ':'');
		
		if (!((_imap.markersList[host_id].marker.options.nottrigger) & (_imap.markersList[host_id].marker.options.maintenance))) {
			for (var nn in _imap.markersList[host_id].triggers) {
				var trigger = _imap.markersList[host_id].triggers[+nn];
				status = Math.max(status,(trigger.priority>=_imap.settings.min_status?trigger.priority:0));
			};
		};
		
		_imap.markersList[host_id].marker.options.status = status;
		if (!_imap.markersList[host_id].marker.label) {
			_imap.markersList[host_id].marker.bindLabel('', {noHide: _imap.settings.showMarkersLabels, direction: 'auto', offset:[25,-15], className: 'leafletlabel'})
		};
		hardware = '<img style="max-height:1.5em;" onerror="this.src=\'imap/images/status'+_imap.markersList[host_id].marker.options.status+'.gif\';" src=\'imap/hardware/'+_imap.markersList[host_id].marker.options.hardware+'.png\'>';
		_imap.markersList[host_id].marker.label.setContent((_imap.settings.useIconsInMarkers ? '' : hardware+' ')+escapeHtml(_imap.markersList[host_id].marker.options.host_name));
		if (_imap.settings.useIconsInMarkers) {
			_imap.markersList[host_id].marker.setIcon(L.divIcon({className:nottrigger_t+maintenance_t+'icon_status_img icon_status_'+_imap.markersList[host_id].marker.options.status,html:'<img onerror="this.src=\'imap/images/status'+_imap.markersList[host_id].marker.options.status+'.gif\';" src=\'imap/hardware/'+_imap.markersList[host_id].marker.options.hardware+'.png\'>',iconAnchor:[8, 8]}));
		} else {
			_imap.markersList[host_id].marker.setIcon(L.divIcon({className:nottrigger_t+maintenance_t+'icon_status icon_status_smile_'+_imap.markersList[host_id].marker.options.status + ' icon_status_'+_imap.markersList[host_id].marker.options.status,html:'',iconAnchor:[8, 8]}));
		};
	};
	
	function loadLinks(hl) {
		if (!_imap.settings.links_enabled) return;
		if (!_imap.vars.linksVisible) return;
		var zdata = { hostid: _imap.filter.hostid, groupid: _imap.filter.groupid, action_ajax: 'get_links', output: 'ajax'};
		
		if (hl!==undefined) {
			zdata = { action_ajax: 'get_link', output: 'ajax', linkid: hl};
		};
		
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: zdata,
			success: function(data){
				for (var nn in data) {
					var link = data[+nn];
					if (!link) continue;
					loadLine(link);
				};
			},
			error: function(data){
				ajaxError(mlocale('Failed to get data'));
			}	   
		});
	};

	function checkUpdateCoords(host_id,host_lat,host_lng) {
		var marker = _imap.markersList[host_id].marker;
		if (marker._preSpiderfyLatlng) {
			origlat = marker._preSpiderfyLatlng.lat;
			origlng = marker._preSpiderfyLatlng.lng;
		} else {
			origlat = marker._latlng.lat;
			origlng = marker._latlng.lng;
		};
		if (!((origlat == host_lat) && (origlng == host_lng)))
			_imap.markersList[host_id].marker.setLatLng([host_lat,host_lng]);
	};
	
	function hostUpdate(host,lhi) {
		if (!lhi) lhi = _imap.loadinghostsid;
		var new_host = false;
		var host_id = host.hostid;
		var host_name = host.name;
		if (!jQuery('div.host_in_list').is('[hostid="'+host_id+'"]')) {
			jQuery('#hosts_list').append('<div class="host_in_list" hostname="'+host_name+'" hostid="'+host_id+'">'+host_name+'</div>');
			if ((host.inventory.location_lat=='') || (host.inventory.location_lat=='')) {
				jQuery('div.host_in_list').filter('[hostid="'+host_id+'"]').prepend('<img Title="'+mlocale('This host does not have coordinates')+'" onClick="getHostLocation('+host_id+')" class="host_crosschair" src="imap/images/target.png"> ');
			};
		};
		if ((host.inventory.location_lat=='') || (host.inventory.location_lat=='')) {
			var host_lat = false;
			var host_lon = false;
		} else {
			var host_lat = +(host.inventory.location_lat).replace(',', '.');
			var host_lon = +(host.inventory.location_lon).replace(',', '.');
		};

		var hardware = host.inventory[_imap.settings.hardware_field];
		var maintenance = (host.maintenance_status === '1' ? true:false);
		var maintenance_t = (maintenance?'maintenance ':'');
		var nottrigger = (host.maintenance_type === '1' ? true:false);
		var nottrigger_t = (nottrigger?'nottrigger ':'');
		
		if (!_imap.markersList[host_id]) {
			_imap.markersList[host_id] = {marker: false, triggers: new Object, lhi:lhi, clust:false};
		};
		
		if ( (host_lat) && (host_lon) ) {
			if (!_imap.markersList[host_id].marker) {
				_imap.markersList[host_id].marker = L.marker([host_lat,host_lon],{status:0, host_id:host_id});
				_imap.markersList[host_id].marker.on('move',function(){ updateLinesMarker(this.options.host_id); });
				_imap.markersList[host_id].marker.on('popupopen', function() { openPopupHost(this.options.host_id); });
				_imap.markersList[host_id].marker.on('popupclose', function() { closePopupHost(this.options.host_id); });
				new_host = true;
			} else {
				checkUpdateCoords(host_id,host_lat,host_lon);
			};
		};

		if (_imap.markersList[host_id].marker) {
			_imap.markersList[host_id].marker.options.maintenance = maintenance;
			_imap.markersList[host_id].marker.options.nottrigger = nottrigger;
			_imap.markersList[host_id].marker.options.hardware = hardware;
			_imap.markersList[host_id].marker.options.host_name = host_name;
		};
		_imap.markersList[host_id].lhi = lhi;
		
		if (new_host) {
			createPopup(host_id);
			if (!_imap.settings.show_with_triggers_only) {
				updateMarker(host_id);
				if (hostsFilter(host_id)) showMarker(host_id);
			};
		};
	};
	
	function closePopupHost(hh) {
		jQuery('#hostItems'+hh).html();
	};
	
	function getSID(textonly) {
		var sid = getCookie('zbx_sessionid');
		if (textonly) return sid.substring(16,32);
		return 'sid='+sid.substring(16,32)+'&';
	};
	
	function popupFrame(url,text) {
		container = L.DomUtil.create('span', 'graphPopupWindow');
		jQuery(container).dialog({maxWidth:'100%', maxHeight:'100%', width:800, height:650, resizable:true})
		.on('close',function(){ jQuery(this).remove(); });
		
		if (text) {
			jQuery.get( url, function( data ) {
				jQuery(container).append(data);
			},'text');
		} else {
			jQuery(container).append(
				jQuery("<iframe />").attr("src", url).prop('height','100%').prop('width','100%').css('bottom','0').css('right','0').css('top','0').css('left','0').css('position','absolute')
			);
		};
	};
	
	function openPopupHost(hh) {

		_imap.markersList[+hh].marker.openPopup();
	  
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				hostid: +hh,
				action_ajax: 'get_host',
				output: 'ajax'
			},
			success: function(data){
			  
				for (var nn in data) {
					var host = data[+nn];
					if (!host) continue;
					var host_id = +host.hostid;
					_imap.markersList[host_id].host_info = host;
					updatePopup(host_id);
				};

				
			},
			error: function(data){
				ajaxError(mlocale('Failed to get data'));
			}
		});
	  
  
		jQuery('#hostItems'+hh).html();

		return false;
	};
	
	function createHostContextMenu(hh) {
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				hostid: +hh,
				action_ajax: 'get_graphs',
				output: 'ajax'
			},
			success: function(data){
				var container = jQuery('<span/>', {class:'link_menu'});
				var graphs=[];
				for (nn in data) {
					if (data[nn].graphid) {
						graph = data[nn];
						graphs[graphs.length] = {label: escapeHtml(graph.name), url: 'charts.php?'+getSID()+'raphid='+graph.graphid, clickCallback: function(){
							var tn = jQuery(this).data('graphId');
							popupFrame('charts.php?'+getSID()+'form_refresh=1&fullscreen=1&filterState=1&graphid='+tn);
							return false;
						  
						}, data: {graphId: +graph.graphid} };
					};
				};
				
				var hscreens = { label: mlocale('Screens'), url: 'host_screen.php?'+getSID()+'hostid='+hh, clickCallback: function(){ popupFrame('host_screen.php?'+getSID()+'form_refresh=1&fullscreen=1&filterState=0&hostid='+hh); return false; } };
				
				if (_imap.zabbixversion.substr(0,3)=='2.2') {
					var lastdd = { label: mlocale('Latest data'), url: 'latest.php?'+getSID()+'form_refresh=1&groupid=0&hostid='+hh, clickCallback: function(){ popupFrame('latest.php?'+getSID()+'form_refresh=1&fullscreen=1&filterState=0&groupid=0&hostid='+hh); return false; } };
				} else {
					var lastdd = { label: mlocale('Latest data'), url: 'latest.php?'+getSID()+'hostids%5B%5D='+hh+'&filter_set=Filter', clickCallback: function(){ popupFrame('latest.php?'+getSID()+'form_refresh=1&fullscreen=1&filterState=0&&hostids%5B%5D='+hh+'&filter_set=Filter'); return false; } };
				};
				var hostinv = { label: mlocale('Host inventory'), url: 'hostinventories.php?'+getSID()+'hostid='+hh, clickCallback: function(){ popupFrame('hostinventories.php?'+getSID()+'form_refresh=1&fullscreen=1&filterState=0&hostid='+hh); return false; } };
				var ltrig = { label: mlocale('Triggers'), url: 'tr_status.php?'+getSID()+'hostid='+hh, clickCallback: function(){ popupFrame('tr_status.php?'+getSID()+'form_refresh=1&fullscreen=1&filterState=0&hostid='+hh); return false; } };
				var chost = { label: mlocale('Host config'), items: [
				  
					{ label: mlocale('Host'), url: 'hosts.php?'+getSID()+'form=update&hostid='+hh},
					{ label: mlocale('Applications'), url: 'applications.php?'+getSID()+'hostid='+hh},
					{ label: mlocale('Items'), url: 'items.php?'+getSID()+'hostid='+hh},
					{ label: mlocale('Triggers'), url: 'triggers.php?'+getSID()+'hostid='+hh},
					{ label: mlocale('Graphs'), url: 'graphs.php?'+getSID()+'hostid='+hh},
					{ label: mlocale('Discovery rules'), url: 'host_discovery.php?'+getSID()+'hostid='+hh},
					{ label: mlocale('Web scenarios'), url: 'httpconf.php?'+getSID()+'hostid='+hh}
				    ]
				};
				
				jQuery(container).bind('click',function(event){ datas = [{label:mlocale('Host view')}, {label: mlocale('Graphs'), items: graphs}, lastdd, hostinv, ltrig, hscreens, {label:'Config'}, chost]; menuPopup2(datas, event); });
				jQuery(container).html(mlocale('Tools'));
				jQuery('.link_menu', '#hostItems'+hh).remove();
				jQuery('#hostItems'+hh).append(container);
			}
		});
	};
	
	function menuPopup2Transform(data) {
		var container = jQuery('<ul/>');
		if (data.length==0) {
			var item = jQuery('<li/>').addClass('ui-state-disabled').html('<a>none</a>').appendTo(container);
		};
		for (var nn=0; nn<data.length; nn++) {
			el = data[nn];
			var item = jQuery('<li/>');
			if (el.data) {
				jQuery(item).data(el.data);
			};
			
			if (el.items) {
				if (el.items.length==0) {
					
				}
			};
			
			if (!el.url) {
				el.url='';
			};
			
			if ( (!el.url) && (!el.clickCallback) && (!el.items) ) {
				jQuery(item).addClass('ui-widget-header').html(el.label);
				
			} else {
				if (el.clickCallback) {
					jQuery(item).click(el.clickCallback);
				};
				
				var link = jQuery('<a/>');
				jQuery(link).html(el.label);
				jQuery(link).attr('href','#');
				if ( (el.url!=='') && (el.url!==undefined) && (el.url!=='#') && (el.clickCallback) ) {
					var inlink = jQuery('<a/>').attr('target','_blank').html('+').attr('href',el.url).prependTo(link).click(function(event){event.stopPropagation();});
					jQuery('<span/>').addClass('ui-icon-document ui-icon ui-menu-icon').append(inlink).prependTo(link);
				};
				if ( (el.url!=='') && (el.url!==undefined) && (el.url!=='#') && (!el.clickCallback) ) {
					jQuery(link).attr('href',el.url);
				};
				if (!el.onpage) jQuery(link).attr('target','_blank');
				
				jQuery(item).append(link);
			};
			if (el.items) {
				
					var addEl = menuPopup2Transform(el.items);
					jQuery(item).append(addEl);
				
			};
			jQuery(container).append(item);
		};
		return container;
	};
	
	function menuPopup2(data, event) {
		jQuery('#menuPopup2').remove();
		var container = jQuery(menuPopup2Transform(data)).menu();
		jQuery('<div/>',{id:'menuPopup2'}).append(container).addClass('menuPopup').css('position','fixed').css('top',event.pageY-2).css('left',event.pageX-2)
		.mouseleave(function(){
			jQuery(this).delay(1000).hide(0, function(){ jQuery(this).remove(); });
		})
		.mouseover(function(){ 
			jQuery(this).stop(true,true);
		})
		.appendTo('body').show();
	};
	
	function loadHost(id) {
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				hostid: id,
				action_ajax: 'get_hosts',
				output: 'ajax',
				hardwareField: _imap.settings.hardware_field
			},
			success: function(data){
			  
				if (data.error) {
					ajaxError(data.error.message,1);
					exit();
				};
			  
				for (var nn in data) {
					var host = data[+nn];
					if (!host) continue;
					hostUpdate(host);
				};

				sortingHosts();
				jQuery('.host_in_list').click(function(){viewHostOnMap(+jQuery(this).attr('hostid'))});
				
			},
			error: function(data){
				ajaxError(mlocale('Failed to get data'));
			}
		});
	};
	
	function googlestreetviewresize() {
		if (_imap.googlestreetviewer) {
			setCookie('imap_googlestreetview_size',jQuery(_imap.googlestreetviewer.S).width()+','+jQuery(_imap.googlestreetviewer.S).height(), {expires: 36000000, path: '/'});
			google.maps.event.trigger(_imap.googlestreetviewer, 'resize');
		};
	};
	
	function googlestreetviewmove() {
		if (_imap.googlestreetviewer) {
			_imap.googlestreetviewer_marker.setLatLng([_imap.googlestreetviewer.getPosition().lat(),_imap.googlestreetviewer.getPosition().lng()]);
		};
	};
	
	function googlestreetviewrotate() {
		if (_imap.googlestreetviewer) {
			var heading = _imap.googlestreetviewer.getPov().heading;
			heading = heading-24;
			heading = heading % 360;
			if (heading<0) headhing = 360+heading;
			heading = 360 - heading;
			var sm = 52*(Math.round(heading/24));
			jQuery(_imap.googlestreetviewer_marker._icon).css('background-position','0px '+sm+'px');
		};
	};
	
	function creategooglestreetview(latlng) {
		var googlestreetviewer = jQuery('<div/>', {id:'googlestreetview'});
		
		var panoramaOptions = {
			pov: {
				heading: 0,
				pitch: 0
			}
		};
		var width = 500;
		var height = 300;
		var sizestr = getCookie('imap_googlestreetview_size');
		if (sizestr) {
			sizestr = sizestr.split(',');
			width = +sizestr[0];
			height = +sizestr[1];
		};
		jQuery(googlestreetviewer).dialog({title: 'Google Street View', maxWidth:'100%', maxHeight:'100%', width:width, height:height, position: {at:'center bottom+10px', of:'#imapworkarea'}, resizable:true, beforeClose:function(){ 
				_imap.googlestreetviewer=false;
				_imap.map.removeLayer(_imap.googlestreetviewer_marker);
				_imap.googlestreetviewer_marker = false;
				jQuery(this).remove();
			}, resizeStop: function() { googlestreetviewresize(); }
		});
		_imap.googlestreetviewer = new google.maps.StreetViewPanorama(document.getElementById('googlestreetview'),panoramaOptions);
		google.maps.event.addListener(_imap.googlestreetviewer, 'position_changed', function() { googlestreetviewmove(); });
		google.maps.event.addListener(_imap.googlestreetviewer, 'pov_changed', function() { googlestreetviewrotate(); });
		
		var icon = L.divIcon({className:'googlestreetview_marker',html:'',iconSize:[50,50], iconAnchor:[25, 31]});
		_imap.googlestreetviewer_marker = L.marker(_imap.map.getCenter(), {draggable:true, icon:icon}).addTo(_imap.map);
		_imap.googlestreetviewer_marker.on('dragend',function(event){ 
			var latlng = event.target.getLatLng();
			googlestreetview(latlng);
			return false;
		});
	};
	
	function googlestreetview(latlng) {
		if (!google) return;
		var sv = new google.maps.StreetViewService();
		var fenway = new google.maps.LatLng(latlng.lat,latlng.lng);
		
		sv.getPanoramaByLocation(fenway, 50, function(data,status){
			if (status !== google.maps.StreetViewStatus.OK) {
				if ( (!_imap.googlestreetviewer) && (_imap.googlestreetviewer_marker) ) _imap.googlestreetviewer_marker.setLatLng([_imap.googlestreetviewer.getPosition().lat(),_imap.googlestreetviewer.getPosition().lng()]);
				return;
			};
			if (!_imap.googlestreetviewer) {
				creategooglestreetview(data.location.latLng);
			};
			_imap.googlestreetviewer.setPosition(data.location.latLng);
		});
		
	};
	
	function sect(gr,sc) {
		var heading = gr;
		
		sgr = 360/sc;

		heading = heading+(sgr/2);
		heading = heading % 360;
		if (heading<0) {
		  heading = 360+heading;
		};
		heading = Math.floor(heading/sgr);		
		return heading;
		
	};
	
	function openweathermap(latlng) {
		if (!_imap.weatherrequestid) _imap.weatherrequestid=0;
		_imap.weatherrequestid++;
		var popup = L.popup().setLatLng([latlng.lat,latlng.lng]);
		popup.setContent('<div id=weatherdiv><img width=50px src="imap/images/image-loading.gif"></div>');
		popup.addTo(_imap.map);
		var reqid = _imap.weatherrequestid;
		
		jQuery.ajax({
			url: 'http://api.openweathermap.org/data/2.5/weather',
			type: 'GET',
			dataType: 'jsonp',
			data: {
				units: 'metric',
				lang: _imap.settings.lang.substring(0,2),
				lat: latlng.lat,
				lon: latlng.lng
			},
			success: function(data){
				container = openweathermapreturn(data);
				if (container) {
					popup.setContent(container[0]);
				};
			},
			error: function(data){
				jQuery("weatherdiv").html('Error request');
			}
		});

	};
	
	function vednul(val) {
	  if (val>9) return val;
	  return '0'+val;
	};
		
	function convert_data(val,ed,ms,nools) {
			if (ed=='time') {
				if (isNaN(val)) return '---';
				H=Math.floor(val / 3600);
				M=Math.floor(val / 60) - (Math.floor(val / 3600) * 60); if (M<10) M='0'+M;
				S=Math.round(1000*(val % 60))/1000;
				SS=''+S;
				if (nools) SS = ''+S.toFixed(3);
				if (S<10) SS='0'+SS;
				
				return H+':'+M+':'+SS;
			};
			if (ed=='hpa') {
				if (isNaN(+val)) return '---';
				return +val+'hPa';
			};
			if (ed=='mmhg') {
				if (isNaN(+val)) return '---';
				return (+val*100/133.3).toFixed(2)+'mmHg';
			};
			if (ed=='date') {
				if (isNaN(val)) return '---';
				bb=val-Math.round(val);
				aa=new Date(+val*1000);
				return (vednul(1900+aa.getYear())+'-'+vednul(1+aa.getMonth())+'-'+vednul(aa.getDate())+' '+vednul(aa.getHours())+':'+vednul(aa.getMinutes())+':'+vednul(aa.getSeconds()));
			};
			if (ed=='timeonly') {
				if (isNaN(val)) return '---';
				bb=val-Math.round(val);
				aa=new Date(+val*1000);
				return (vednul(aa.getHours())+':'+vednul(aa.getMinutes())+':'+vednul(aa.getSeconds()));
			};
			if (ed=='') {
				return val;
			};
	};

	function windType(bals) {
		var typew = new Object;
		typew['ru']=['отсутствует','тихий','лёгкий','слабый','умеренный','свежий', 'сильный','крепкий','очень крепкий','штормовой', 'сильный штормовой','жестокий штормовой','ураганный'];
		typew['en']=['none','light air','light breeze','gentle breeze','moderate breeze','fresh breeze', 'strong breeze','whole breeze','fresh gale','strong gale', 'whole gale','storm','нurricane'];
		var lang = _imap.settings.lang.substring(0,2);
		if (!typew[lang]) {
			lang = 'en';
		};
		return typew[lang][bals];
	};
	
	function openweathermapreturn(weather,reqid) {
		var nkw=['N','NNE','NE','ENE','E','ESE','SE','SSE','S', 'SSW','SW','WSW','W','WNW','NW','NNW'];
		if (!weather.base) return;
		if (_imap.weatherrequestid>reqid) return false;

		if (weather.wind.deg>180) weather.wind.deg=weather.wind.deg-360;
	  
		var windDeg = Math.round(weather.wind.deg);
		var windImage = -50*sect(windDeg,12);
		var windDirection = nkw[sect(weather.wind.deg,16)];
		
		var windSpeed = Math.round(weather.wind.speed*100)/100+'m/s'
		
		var windBals = 12;
		if (weather.wind.speed<32.6) windBals=11;
		if (weather.wind.speed<28.4) windBals=10;
		if (weather.wind.speed<24.4) windBals=9;
		if (weather.wind.speed<20.7) windBals=8;
		if (weather.wind.speed<17.1) windBals=7;
		if (weather.wind.speed<13.8) windBals=6;
		if (weather.wind.speed<10.7) windBals=5;
		if (weather.wind.speed<7.9) windBals=4;
		if (weather.wind.speed<5.4) windBals=3;
		if (weather.wind.speed<3.3) windBals=2;
		if (weather.wind.speed<1.5) windBals=1;
		if (weather.wind.speed<0.2) windBals=0;
		
		var tempCur = Math.round(weather.main.temp*10)/10+'°C';
		var tempMin = Math.round(weather.main.temp_min*10)/10+'°C';
		var tempMax = Math.round(weather.main.temp_max*10)/10+'°C';
		
		var wcontainer = jQuery('<div/>').css('width','280px');
		
		var bcontainer = jQuery('<div/>').css('display','table-row');
		
		jQuery(bcontainer).append('<div style="display:table-cell; vertical-align: middle; padding:5px;"><div style="display:block; width:50px; height:50px; background-image:url(http://openweathermap.org/img/w/'+weather.weather[0].icon+'.png);">'+tempCur+'</div></div>');
		
		var ocontainer = jQuery('<div/>').css('display','block').css('width','50px').css('height','50px').css('background-image','url("imap/images/wind_arrow_x1.png")').css('background-position','0px 50px');
		var container = jQuery('<div/>').append(windDeg+'°<br>'+windDirection)
		.css('display','inline-block').css('width','50px').css('height','50px').css('background-image','url("imap/images/wind_arrow_x1.png")').css('background-position','0px '+windImage+'px')
		.css('vertical-align','middle').css('text-align','center').css('font-weight','bold').css('line-height','25px').css('font-size','14px');
		jQuery(ocontainer).append(container);
		
		jQuery('<div/>').css('display','table-cell').css('vertical-align','middle').append(ocontainer).appendTo(bcontainer);
		
		jQuery(bcontainer).append('<div style="display:table-cell; vertical-align: middle; padding:5px;">'+weather.weather[0].description+'<br>'+mlocale('Wind type')+' '+windType(windBals)+'<br>'+mlocale('Humidity')+' '+weather.main.humidity+'%</div><br>');
		
		jQuery('<div/>').css('display','table').append(bcontainer).appendTo(wcontainer);
		
		jQuery(wcontainer).append(mlocale('Temperature')+": "+tempMin+' - '+tempMax+' <br>');
		jQuery(wcontainer).append(mlocale('Wind speed')+': '+windSpeed+', '+mlocale('Wind points')+': '+windBals+' ('+windType(windBals)+')<br>');
		jQuery(wcontainer).append(mlocale('Wind direction')+': '+windDeg+'° ('+windDirection+')<br>');
		jQuery(wcontainer).append(mlocale('Humidity')+": "+weather.main.humidity+'% <br>');
		jQuery(wcontainer).append(mlocale('Pressure')+": "+convert_data(weather.main.pressure,'mmhg')+'('+convert_data(weather.main.pressure,'hpa')+') <br>');
		jQuery(wcontainer).append(mlocale('Sunrise')+": "+convert_data(weather.sys.sunrise,'timeonly')+' '+mlocale('Sunset')+': '+convert_data(weather.sys.sunset,'timeonly')+' <br>');
		jQuery(wcontainer).append(mlocale('Data obtained')+": "+convert_data(weather.dt,'date')+' <br>');
		
		jQuery(wcontainer).append('<div style="text-align:right; margin-top:5px; font-size:0.9em;">Powered by <a href="http://openweathermap.org/terms" title="Free Weather API" target="_blank">OpenWeatherMap</a></div>');
		
		return wcontainer;
	};
	
	function worldweatheronline(latlng) {
	  
		var tempMax = 23;
		var tempMin = 10;
	  
		var weatherImage = 'http://www.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png';
		var weatherDesk = 'sunny';
		var weatherCode = '113';
		
		var windDirection = 'WSW';
		var windDeg = 241;
		var windImage = -50*sect(windDeg);
		var windSpeed = 15;
		
		var linkback = 'Powered by <a href="http://www.worldweatheronline.com/" title="Free Weather API" target="_blank">World Weather Online</a>';
		
		var wcontainer = jQuery('<div/>');
		jQuery(wcontainer).append('<div style="display:inline-block; margin-right:10px; text-align: center;"><img src="'+weatherImage+'"><br>'+weatherDesk+' </div>');
		
		var ocontainer = jQuery('<div/>').css('display','inline-block').css('width','50px').css('height','50px').css('background-image','url("imap/images/wind_arrow_x1.png")').css('background-position','0px 50px');
		var container = jQuery('<div/>').append(windDeg+'\'<br>'+windDirection)
		.css('display','inline-block').css('width','50px').css('height','50px').css('background-image','url("imap/images/wind_arrow_x1.png")').css('background-position','0px '+windImage+'px')
		.css('vertical-align','middle').css('text-align','center').css('font-weight','bold').css('line-height','25px').css('font-size','14px');
		jQuery(ocontainer).append(container);
		
		jQuery(wcontainer).append(ocontainer);
		
		jQuery(wcontainer).append('<div class=weathersection><div class=weathersectiondesc>Temperature</div>'+tempMin+' - '+tempMax+'</div>');
		
		jQuery(wcontainer).append('<div class=weathersection><div class=weathersectiondesc>Wind</div>Speed '+windSpeed+'<br>Direction '+windDirection+' '+windDeg+'</div>');
		
		jQuery(wcontainer).append('<div class=weatherlinkback>'+linkback+'</div>');
		

	};
	
	function mapcontextmenu(e,latlng) {
		var gstreetview = { label: 'Google street view', data: {latlng:latlng}, clickCallback: function(){ 
			var latlng = jQuery(this).data()['latlng'];
			googlestreetview({lat:latlng.lat,lng:latlng.lng}); return false; }
		};
		
		var gweather = { label: mlocale('Show weather'), data: {latlng:latlng}, clickCallback: function(){ 
			var latlng = jQuery(this).data()['latlng'];
			openweathermap({lat:latlng.lat,lng:latlng.lng}); return false; }
		};
		
		menuPopup2([{label:''+latlng.lat.toFixed(5)+', '+latlng.lng.toFixed(5)},gstreetview,gweather], e);
	};
	
	function loadHosts() {
		if (!_imap.loadinghostsid) _imap.loadinghostsid=0;
		_imap.loadinghostsid++;
		jQuery.ajax({
			url: 'imap.php',
			type: 'POST',
			dataType: 'json',
			data: {
				hostid: _imap.filter.hostid,
				groupid: _imap.filter.groupid,
				action_ajax: 'get_hosts',
				output: 'ajax',
				hardwareField: _imap.settings.hardware_field
			},
			success: function(data){
				var lhi = _imap.loadinghostsid;
				if (data.error) {
					ajaxError(data.error.message,1);
					exit();
				};
				
				/*
				for (var nn in _imap.markersList) {
					_imap.markersList[+nn].del = true;
				};
				*/
				
				for (var nn in data) {
					var host = data[+nn];
					if (!host) continue;
					hostUpdate(host,lhi);
				};

				
				for (var nn in _imap.markersList) {
					if ((_imap.markersList[+nn].lhi < lhi)) {
						unshowMarker(nn);
						delete _imap.markersList[+nn];
					};
				};

				sortingHosts();
				jQuery('.host_in_list').click(function(){viewHostOnMap(+jQuery(this).attr('hostid'))});
				
				if (_imap.vars.it_first) {
					loadLinks();
					loadTriggers();
					if (data.length==0) showMes(mlocale('No hosts with inventory'),0);
				};
				
			},
			error: function(data){
				ajaxError(mlocale('Failed to get data'));
			}
		});
	};

	function mlocale(np) {
		if (locale[np]) return locale[np];
		return np;
	};
	
	function viewHostOnMap(hh, op) {
		if (_imap.markersList[hh].marker)
			_imap.map.setView(_imap.markersList[hh].marker._latlng,_imap.map.getMaxZoom());
		if (op!==undefined) openPopupHost(+hh);
	};
	
	/* TimerSearchGoogle(jQuery('#search-control-text').val()); */
	
	_imap.searchtimer=false;
	
	function TimerSearchGoogle(searchval) {
		if (_imap.searchtimer) {
			clearTimeout(_imap.searchtimer);
		};
		_imap.searchtimer = setTimeout(function(){ searchGoogle(searchval); },1000);
	};
	
	function searchGoogle(searchval) {
		_imap.searchtimer=false;
		_imap.searchmarkers.clearLayers();
		jQuery('#search-control-list').html('');
		jQuery.get(
		  "https://maps.googleapis.com/maps/api/geocode/json",
		  {
		    sensor: 'true',
		    language: _imap.settings.lang.split('_')[0],
		    region: _imap.settings.lang.split('_')[1],
		    bounds: ''+_imap.map.getBounds()._northEast.lat+','+_imap.map.getBounds()._northEast.lng+'|'+_imap.map.getBounds()._southWest.lat+','+_imap.map.getBounds()._southWest.lng,
		    address: searchval
		  },
		  function(text) {
			if (text.status=='OK') {
				jQuery('#search-control-list').html('');
				var sbbox = new Array;
				sbbox['lat'] = new Array;
				sbbox['lng'] = new Array;
				
				for (i=0; i<text.results.length; i++) {
					var smarker = L.marker([text.results[i].geometry.location.lat,text.results[i].geometry.location.lng],{search:'' }).bindPopup('<span class=coordinates>'+text.results[i].geometry.location.lat+', '+text.results[i].geometry.location.lng+'</span><br>'+text.results[i].formatted_address+'<br><a href=# onClick="_imap.map.setView(['+text.results[i].geometry.location.lat+', '+text.results[i].geometry.location.lng+'],_imap.map.getMaxZoom()); return false;">'+mlocale('Zoom in')+'</a>');
					_imap.searchmarkers.addLayer(smarker);
					var smarkerID = _imap.searchmarkers.getLayerId(smarker);
					jQuery('#search-control-list').append('<div class="result"> <a class="link google" layerid="'+smarkerID+'"><span class=searchname>'+text.results[i].formatted_address+'</span></a></div>');
					sbbox['lat'].push(+text.results[i].geometry.location.lat);
					sbbox['lng'].push(+text.results[i].geometry.location.lng);
				};
				_imap.map.fitBounds(L.latLngBounds(L.latLng(Math.min.apply(null, sbbox['lat']), Math.max.apply(null, sbbox['lng'])), L.latLng(Math.max.apply(null, sbbox['lat']), Math.min.apply(null, sbbox['lng']))));
				jQuery('#search-control-list').show();
				jQuery('#search-control-list .link').bind('click',function(event){
					event.stopPropagation();
					_imap.map.setView(_imap.searchmarkers.getLayer(jQuery(this).attr('layerid'))._latlng,_imap.map.getMaxZoom(),{animate:false,pan:{animate:false},zoom:{animate:false}});
					_imap.searchmarkers.getLayer(jQuery(this).attr('layerid')).openPopup();
				});
			};
		  }
		);
	};

	function getPosition() {
		navigator.geolocation.getCurrentPosition(showPosition); // Запрашиваем местоположение, и в случае успеха вызываем функцию showPosition
	};

	function showPosition(position) {
		_imap.map.setView([position.coords.latitude, position.coords.longitude], _imap.map.getMaxZoom());
	};
	
	function setMapCorner(nn) {
		var mapcorners = {0: 'topleft', 1: 'topright', 2: 'bottomright', 3: 'bottomleft'};
		var df = mapcorners[+nn];
		if (df) return df;
		return 'topright';
	};
	
	function iniMap() {
		_imap.map = new L.Map('mapdiv',{ maxZoom:18, fadeAnimation:_imap.settings.mapAnimation, zoomAnimation:_imap.settings.mapAnimation, markerZoomAnimation:_imap.settings.mapAnimation, zoomControl:false, attributionControl:false }).setView(_imap.settings.startCoordinates, _imap.settings.startZoom);
		
		_imap.map.on('contextmenu',function(e){
		    mapcontextmenu(e.originalEvent,e.latlng);
		});
		
		_imap.Controls = new Object;
		
		_imap.Controls['attribution'] = L.control.attribution({position:setMapCorner(_imap.mapcorners['attribution'])});
		
		_imap.Controls['scale'] = L.control.scale({position:setMapCorner(_imap.mapcorners['scale']),metric:true});
		_imap.Controls['measure'] = L.control.measure({position:setMapCorner(_imap.mapcorners['measure'])})
	
		get_last_messages();
		
		var imapMenu = L.Control.extend({
			options: {
				position: 'topleft'
			},

			onAdd: function (map) {
				// create the control container with a particular class name
				var container = L.DomUtil.create('div', 'imenu-control');
				

				
				jQuery('<a/>',{class:'gp-ui icon197 button',href:'#'}).appendTo(jQuery(container)).click(function(){
					mapBbox();
					return false;				  
				});
				
				jQuery('<a/>',{class:'gp-ui icon113 button',href:'#'}).appendTo(jQuery(container)).click(function(){
					
					var tabs = jQuery('<div/>',{id:'imap_information'});
					
					jQuery('<ul/>')
					.append('<li><a href="#imap_information-1">About</a></li>')
					.append('<li><a href="#imap_information-2">Components</a></li>')
					.appendTo(tabs);
					
					jQuery('<div/>',{id:'imap_information-1'})
					.html('<h2>Zabbix Interactive Map</h2> Version '+_imap.version+' <br><a href="http://zabbiximap.lisss.ru" target=_blank>zabbiximap.lisss.ru</a> <h2>Zabbix</h2> Version '+_imap.zabbixversion+'<br> <a href="http://zabbix.com" target=_blank>zabbix.com</a>')
					.appendTo(tabs);
					
					jQuery('<div/>',{id:'imap_information-2'})
					.html(_imap.thirdtoolsinformation)
					.appendTo(tabs);
					
					jQuery(tabs)
					.tabs()
					.dialog({ closeOnEscape: true, modal:true, title:mlocale('Information') });
					jQuery('#imap_information').css('padding','0px');
					
					return false;				  
				});
				
				jQuery('<a/>',{class:'gp-ui icon125 button',href:'#'}).append(jQuery('<span/>',{class:'imap_messages_count'}).html(_imap.messages.count>0?_imap.messages.count:'')).appendTo(jQuery(container)).click(function(){
					var text = '';
					jQuery.each(_imap.messages.text,function(num){
						text = '<div class="imap_dev_mes">'+this+'</div>'+text;
					});
					jQuery('<div/>')
					.html(text)
					.dialog({ closeOnEscape: true, modal:true, title:mlocale('Messages') });
					jQuery('.imap_messages_count').html('');
					var lastmesnum = getCookie('imap_messages_last_num');
					if (!lastmesnum) lastmesnum=0;
					if (lastmesnum<_imap.messages.lastnum) setCookie('imap_messages_last_num', _imap.messages.lastnum, {expires: (3600*24*90), path: '/'});
					return false;				  
				});
				
				jQuery(container).click(function(event){ event.stopPropagation(); });
				jQuery(container).dblclick(function(event){ event.stopPropagation(); });
				jQuery(container).mousemove(function(event){ event.stopPropagation(); });
				jQuery(container).scroll(function(event){ event.stopPropagation(); });
				jQuery(container).contextmenu(function(event){ event.stopPropagation(); });
				return container;
			}
		});
		
		var SearchControl = L.Control.extend({
			options: {
				position: setMapCorner(_imap.mapcorners['googlesearch'])
			},

			onAdd: function (map) {
				// create the control container with a particular class name
				var container = L.DomUtil.create('div', 'search-control');
				container.innerHTML = '<div id=search-control-input><img class="middle" src="imap/images/logo-google.png"> <input oninput="TimerSearchGoogle(event.target.value);" id=search-control-text placeholder="'+locale.Search+'" type=search></div><div id=search-control-list></div>';
				jQuery(container).mouseleave(function(){
					  jQuery('#search-control-list').animate({height: 'hide'}, 'fast');
					  _imap.map.scrollWheelZoom.enable();
				});
				jQuery(container).mouseenter(function(){
					  jQuery('#search-control-list').animate({height: 'show'}, 'fast');
					  _imap.map.scrollWheelZoom.disable();
				});
				jQuery(container).click(function(event){ event.stopPropagation(); });
				jQuery(container).dblclick(function(event){ event.stopPropagation(); });
				jQuery(container).mousemove(function(event){ event.stopPropagation(); });
				jQuery(container).scroll(function(event){ event.stopPropagation(); });
				
				return container;
			}
		});
		_imap.Controls['googlesearch'] = new SearchControl();
	
		
		var HostsControl = L.Control.extend({
			options: {
				position: setMapCorner(_imap.mapcorners['hosts'])
			},

			onAdd: function (map) {
				// create the control container with a particular class name
				var container = L.DomUtil.create('div', 'hosts_list');
				jQuery(container).attr('aria-haspopup','true');
				jQuery(container).append(
				'<div id=show_hosts_list><div id=filter-indicator style="display:none;"><img src="imap/images/filter.png"></div> <b>'+mlocale("Hosts")+'</b></div><div id=under_hosts_list style="display:none;"><div id=search_hosts_list><input oninput="getHostsFilter1T(event.target.value);" type=search placeholder="'+mlocale('Search')+'"></div><div id=hosts_list class="nicescroll"></div></div>'
				);
				
				jQuery(container).mouseleave(function(){ jQuery('#under_hosts_list').delay(500).hide(0); _imap.map.scrollWheelZoom.enable(); });
				jQuery(container).mouseover(function(){ jQuery('#under_hosts_list').stop().show(); _imap.map.scrollWheelZoom.disable(); });
				
				jQuery(container).click(function(event){ 
				  event.stopPropagation();
				  
				});
				jQuery(container).dblclick(function(event){
				  event.stopPropagation(); 
				  
				});
				jQuery(container).mousemove(function(event){
				  event.stopPropagation(); 
				  
				});
				jQuery(container).scroll(function(event){
				  event.stopPropagation(); 
				  
				});
				
				return container;
			}
		});
		
		_imap.Controls['hosts'] = new HostsControl;
		
		
		var PanoramioControl = L.Control.extend({
		  
			options: {
				position: setMapCorner(_imap.mapcorners['panoramio'])
				
			},
			onAdd: function (map) {
				this.enabled = false;
				this.requestid = 0;
				this.layer = new L.MarkerClusterGroup({
					maxClusterRadius: 30,
					iconCreateFunction: function (cluster) {
						var cmarkers = cluster.getAllChildMarkers();
						return L.divIcon({iconSize:[18, 18], iconAnchor:[9, 9], popupAnchor:[0, -9], className:'panoramio-cluster', html:'<div style="font-weight:bold;width:18px;height:18px;text-align: center;">'+cmarkers.length+'</div>',iconAnchor:[9, 9]});
					}
				});
				this.layer.on('clustercontextmenu',function(tt){ 
					tt.layer.spiderfy();
				});
				/*this.layer = new L.layerGroup();*/
				var container = L.DomUtil.create('div', 'panoramio');
				jQuery(container).attr('aria-haspopup','true');
				jQuery(container).append('<img src="imap/images/panoramio-cluster.png"> <b>Panoramio</b>');
				this.mas = new Object;
				this.options.count = 100;
				this.start = 0;
				L.DomEvent.on(container, 'click', this._switch, this);
				map.on('moveend', this._update, this);
				this.container = container;
				this._update();
				return container;
			},
			_switch: function() {
				if (this.enabled) {
					this.enabled = false;
					this._map.removeLayer(this.layer);
					jQuery(this.container).children('img').attr('src','imap/images/panoramio-cluster.png');
				} else {
					this.enabled = true;
					this._update();
					this._map.addLayer(this.layer);
					jQuery(this.container).children('img').attr('src','imap/images/panoramio-marker.png');
				};
			},
			_update: function() {
				if (!this.enabled) return;
				this.start = 0;
				this.requestid++;
				this.loadData();
			},
			loadData: function () {
				if (!this.enabled) return;
				var set = 'full'; /*full, public, userId*/
				if (_imap.panoramiouserid) set = _imap.panoramiouserid;
				var size = 'small'; /* original, medium (default value), small, thumbnail, square, mini_square */
				var bounds = this._map.getBounds();
				var maxlat = bounds.getNorth();
				var minlat = bounds.getSouth();
				var maxlng = bounds.getEast();
				var minlng = bounds.getWest();
				var url = 'http://www.panoramio.com/map/get_panoramas.php?set='+set+'&from=0&to=20&minx='+minlng+'&miny='+minlat+'&maxx='+maxlng+'&maxy='+maxlat+'&size='+size+'&mapfilter=true&callback=?';
				var cor = this;
				var requestid = this.requestid;
				jQuery.ajax({
					url: 'http://www.panoramio.com/map/get_panoramas.php',
					type: 'GET',
					dataType: 'jsonp',
					data: {
						set:set,
						from:cor.start,
						to:(cor.start+cor.options.count-1),
						minx:minlng,
						miny:minlat,
						maxx:maxlng,
						maxy:maxlat,
						size:size,
						mapfilter:true
					},
					success: function(data){
						cor.showMarkers(data, requestid);
					},
					error: function(data){
						
					}
				});
			},
			showMarkers: function (data,requestid) {
				/*alert('Markers!');*/
				if (this.requestid!==requestid) return;
				if (this.start==0) {
					for (var nn in this.mas) {
						if (this.mas[nn]) {
							this.mas[nn].need=0;
						};
					};
				};
				var tt=0;
				for (var nn=0; nn<data.count; nn++) {
					var photo = data.photos[nn];
					if (photo) {
						tt++;
						if (!this.mas[photo.photo_id]) {
							var icon = L.icon({
								iconUrl: 'imap/images/panoramio-marker.png',

								iconSize:     [18, 18], // size of the icon
								shadowSize:   [50, 64], // size of the shadow
								iconAnchor:   [9, 9], // point of the icon which will correspond to marker's location
								shadowAnchor: [4, 62],  // the same for the shadow
								popupAnchor:  [0, -9] // point from which the popup should open relative to the iconAnchor
							});
							var marker = L.marker([photo.latitude,photo.longitude],{icon:icon}).bindPopup('<div style="text-align:center;"><h3>'+photo.photo_title+'</h3></div><div style="text-align:center;"><a style="text-align:center; display:block;" onClick="showImage(\'http://static.panoramio.com/photos/original/'+photo.photo_id+'.jpg\',jQuery(this).attr(\'comment\')); return false;" href="#" comment="Added '+photo.upload_date+' by '+photo.owner_name+'"><img style="width:'+photo.width+'px; height:'+photo.height+'px" src="'+photo.photo_file_url+'"></a></div><div>Added '+photo.upload_date+' by <a target=_blank href="'+photo.owner_url+'">'+photo.owner_name+'</a></div><div><a target=_blank href="http://www.panoramio.com/photo/'+photo.photo_id+'">View on Panaramio</a></div>',{minWidth:photo.width+10, minHeight:photo.height+30, keepInView:false, autoPan:true, closeButton:true}).bindLabel(photo.photo_title);
							this.layer.addLayer(marker);
							this.mas[photo.photo_id] = {marker:marker};
							var pcont = jQuery('<div />');
							if (this.options.photocontainer) {
								jQuery(pcont).attr('id','panoramio_pcont_'+photo.photo_id).attr('data-tooltip',photo.photo_title);
								jQuery(pcont).addClass('panoramio_photo_container').width(photo.width).height(photo.height).html('<img alt="'+photo.photo_title+'" title="'+photo.photo_title+'" src="'+photo.photo_file_url+'">').attr('originurl','http://static.panoramio.com/photos/original/'+photo.photo_id+'.jpg');
								jQuery(pcont).mouseout(function(){jQuery(this).removeClass('hover');}).mouseover(function(){jQuery(this).addClass('hover');}).bind('click',function(){showImage(jQuery(this).attr('originurl'));});
								jQuery('#'+this.options.photocontainer).append(pcont);
							};
						};
						this.mas[photo.photo_id].need=1;
					};
				};
				if (data.has_more) {
					this.start = this.start + tt;
					this.loadData();
				} else {
					/*удалить старые*/
					for (var nn in this.mas) {
						var el = this.mas[nn];
						if (el) {
							if (el.need==0) {
								this.layer.removeLayer(el.marker);
								jQuery('#panoramio_pcont_'+nn).remove();
							};
						};
					};
				};
			}		  
		})
		_imap.Controls['panoramio'] = new PanoramioControl;
		
		
		var LastTriggers = L.Control.extend({
			container: undefined,
			options: {
				position: setMapCorner(_imap.mapcorners['lasttriggers'])
			},
			onAdd: function (map) {
				// create the control container with a particular class name
				var container = L.DomUtil.create('div', 'last_triggers');
				jQuery(container).attr('aria-haspopup','true');
				jQuery(container).append(
					'<div class="last_triggers_cap">'+mlocale('Triggers')+'</div><div class="nicescroll last_triggers_div"></div>'
				);
				
				L.DomEvent.on(container, 'mouseleave', this.mouseLeave, this)
					  .on(container, 'mouseover', this.mouseOver, this);
				
				var sortselect = L.DomUtil.create('select', 'last_triggers_sort_type', container);
				sortselect.innerHTML = '<option value="status">'+mlocale('Sort by severity')+'</option><option value="time">'+mlocale('Sort by time')+'</option>';
				
				jQuery(sortselect).val(getCookie('imap_lasttriggers_sorttype'));
				
				L.DomEvent.on(sortselect, 'change', this.sorting, this);
					  
				var keepdiv = L.DomUtil.create('div', 'last_triggers_keep', container);
				keepdiv.innerHTML = '<label>'+mlocale('Keep')+' ';
				var keepselect = L.DomUtil.create('input', 'last_triggers_keep_input', keepdiv);
				jQuery(keepdiv).append('</label>');
				keepselect.type = 'checkbox';
				keepselect.checked = getCookie('imap_lasttriggers_keep') === 'true';
				L.DomEvent.on(keepselect, 'change', this.keep, this);
				
				jQuery(container).click(function(event){ 
				  event.stopPropagation();
				  
				});
				jQuery(container).dblclick(function(event){
				  event.stopPropagation(); 
				  
				});
				jQuery(container).mousemove(function(event){
				  event.stopPropagation(); 
				  
				});
				jQuery(container).scroll(function(event){
				  event.stopPropagation(); 
				  
				});
				
				this.container = container;
				this.mouseLeave();
				return container;
			},
			
			keep: function(e) {
				setCookie('imap_lasttriggers_keep', e.currentTarget.checked, {expires: 36000000, path: '/'});
			},
			
			mouseLeave: function(e) {
				jQuery(this.container).children('.last_triggers_cap').hide();
				if (!jQuery(this.container).children('.last_triggers_keep').children('input' ).prop( "checked" )) {
					jQuery(this.container).children('.last_triggers_cap').show();
					jQuery(this.container).children('.last_triggers_div').hide(); 
					jQuery(this.container).children('.last_triggers_keep').hide(); 
					jQuery(this.container).children('.last_triggers_sort_type').hide(); 
				}; 
				this._map.scrollWheelZoom.enable(); 
			},
			
			mouseOver: function(e) {
				jQuery(this.container).children('.last_triggers_div').show(); 
				jQuery(this.container).children('.last_triggers_cap').hide();  
				jQuery(this.container).children('.last_triggers_keep').show();  
				jQuery(this.container).children('.last_triggers_sort_type').show(); 
				this._map.scrollWheelZoom.disable();
			},
			
			addTrigger: function(trigger) {
				if (jQuery('#lasttrigger'+trigger.triggerid).length) return;
				var container = jQuery('<div/>',{'id':'lasttrigger'+trigger.triggerid, 'class':'trigger triggerst'+trigger.priority, 'status':trigger.priority, 'time':trigger.lastchange});

				rstr = '' + '<div><span class="link_menu" onClick="viewHostOnMap('+trigger.hostid+',true);">'+trigger.hostname+'<span></div><span>'+escapeHtml(trigger.description)+'</span> <div class=acknowledge>';
				if (trigger.lastEvent.eventid) rstr = rstr + mlocale('Ack')+': <a class="'+(trigger.lastEvent.acknowledged=='1'?'enabled':'disabled')+'" target="_blank" href="acknow.php?eventid='+trigger.lastEvent.eventid+'&amp;triggerid='+trigger.triggerid+'">'+(trigger.lastEvent.acknowledged=='1'?mlocale('Yes'):mlocale('No'))+'</a>';
				rstr = rstr + '<div class=lastchange lastchange='+trigger.lastchange+'></div></div>';
				
				jQuery(container).append(rstr);
			  
				jQuery(this.container).children('.last_triggers_div').append(container);
				this.sorting();
			},
			
			removeTrigger: function(nn) {
				jQuery('#lasttrigger'+nn).remove();
			},
			
			sorting: function (e) {
					var elements = jQuery(this.container).children('.last_triggers_div').children('.trigger');
					var target = jQuery(this.container).children('.last_triggers_div');
					
					var attr = jQuery(this.container).children('.last_triggers_sort_type').val();
					setCookie('imap_lasttriggers_sorttype', attr, {expires: 36000000, path: '/'});
					
					elements.sort(function (a, b) {
						if ( (a==undefined) || (b==undefined) ) return 0;
						var an = +jQuery(a).attr(attr),
						bn = +jQuery(b).attr(attr);
					    
						return -1*(an - bn);
					});
					elements.detach().appendTo(target);
			}
		});
		
		_imap.Controls['lasttriggers'] = new LastTriggers;
		
		var MyLocationControl = L.Control.extend({
			options: {
				position: setMapCorner(_imap.mapcorners['mylocationbutton'])
			},

			onAdd: function (map) {
				// create the control container with a particular class name
				var container = L.DomUtil.create('div', 'my-location-control leaflet-control-layers');
				container.innerHTML = '<a onClick="getPosition();" href="#" Title="My location"></a>';
				return container;
			}
		});
		
		_imap.Controls['mylocationbutton'] = new MyLocationControl();

		if (_imap.settings.use_zoom_slider) {
			_imap.Controls['zoom'] = new L.Control.Zoomslider({position:setMapCorner(_imap.mapcorners['zoom'])});
		} else {
			_imap.Controls['zoom'] = L.control.zoom({position:setMapCorner(_imap.mapcorners['zoom'])});
		};
		
		
		var _layers = getLayers();
		baseMaps = _layers[0];
		overlayMaps = _layers[1];		
		
		_imap.Controls['layers'] = L.control.layers(baseMaps, overlayMaps, {position: setMapCorner(_imap.mapcorners['layers'])});

		_imap.map.on('moveend',function(){ updateLines(); });
		_imap.map.on('zoomend',function(){ updateLines(); });
		_imap.map.on('layerremove',function(event){ 
			if (event.layer.options) {
				if (event.layer.options.host_id) {
					updateLinesMarker(event.layer.options.host_id);
				};
			};
		});
		
		_imap.map.on('layeradd',function(event){ 
			if (event.layer.options) {
				if (event.layer.options.host_id) {
					updateLinesMarker(event.layer.options.host_id);
				};
			};
		});
		
		_imap.map.addControl(new imapMenu);
		
		for (var nn in _imap.mapcorners) {
			if (_imap.Controls[nn]) _imap.Controls[nn].addTo(_imap.map);
		};
		
		jQuery('.leaflet-control-layers-selector').bind('change',function(){saveLayersMap()});
		
		_imap.map.on('overlayremove',function(event,obj){ checkLinksLayer(); saveLayersMap(); });
		_imap.map.on('overlayadd',function(event,obj){ checkLinksLayer(); saveLayersMap(); });
		_imap.map.on('baselayerchange',function(event,obj){ 
			/*_imap.map.options.maxZoom=event.layer.options.maxZoom;*/
			saveLayersMap(event.name);
		});
	};
	
	function setLayersMap() {
		var lays=''+getCookie('imap_layer');
		var isBaseLayer=false;
		lays=lays.split('|*|');

		if (_imap.settings.startbaselayer) {
			for (layerid in _imap.Controls['layers']._layers) {
				layer = _imap.Controls['layers']._layers[+layerid];
				if (layer.name == _imap.settings.startbaselayer) {
					_imap.map.addLayer(layer.layer);
					isBaseLayer=true;
					break;
				};
			};
		};
		
		for (lay in lays) {
			for (layerid in _imap.Controls['layers']._layers) {
				layer = _imap.Controls['layers']._layers[+layerid];
				if (lays[lay] == layer.name) {
					if (layer.overlay!==true) {
						if (isBaseLayer) continue;
						isBaseLayer=true;
					}
					_imap.map.addLayer(layer.layer);
					
				};
			};
		};
		
		if (!isBaseLayer) {
			for (layerid in _imap.Controls['layers']._layers) {
				layer = _imap.Controls['layers']._layers[+layerid];
				if (layer.name == _imap.settings.defaultbaselayer) {
					_imap.map.addLayer(layer.layer);
					isBaseLayer=true;
					break;
				};
			};
		};
		
		if (!isBaseLayer) {
			for (layerid in _imap.Controls['layers']._layers) {
				layer = _imap.Controls['layers']._layers[+layerid];
				if (layer.overlay!==true) {
					_imap.map.addLayer(layer.layer);
					isBaseLayer=true;
					break;
				};
			};
		};
		_imap.map.addLayer(_imap.markers);
		_imap.map.addLayer(_imap.links);
		_imap.map.addLayer(_imap.searchmarkers);
		_imap.vars.linksVisible=true;
		
		_imap.Controls['layers'].addOverlay(_imap.markers,mlocale("Hosts"));
		
		if (_imap.settings.links_enabled) {
			_imap.Controls['layers'].addOverlay(_imap.links,mlocale("Host's links"));
		};
		
	};

	function checkLinksLayer() {
		if ( (!_imap.vars.linksVisible) && (_imap.map.hasLayer(_imap.links)) ) {
		  /* включили */
			_imap.vars.linksVisible = true;
			loadLinks();
			updateLines();
		};
		if ( (_imap.vars.linksVisible) && (!_imap.map.hasLayer(_imap.links)) ) {
		  /* выключили */
			_imap.vars.linksVisible = false;
		};
	};
	
	function saveLayersMap(bl) {
		var text = '';

		baselayer = '';
		
		for (layerid in _imap.Controls['layers']._layers) {
				layer = _imap.Controls['layers']._layers[+layerid];
				if (_imap.map.hasLayer(layer.layer)) {
					if (layer.overlay!==true) {
						baselayer = layer.name;
					} else {
						text = text+layer.name+'|*|'; 
					};
				};
		};
		
		if (bl!==undefined) baselayer=bl;
		text = text+baselayer+'|*|';
		
		setCookie('imap_layer', text, {expires: 36000000, path: '/'});
	};
	
	function mapSize() {
		nheight = jQuery(window).innerHeight() - jQuery('.page_footer').outerHeight(true) - jQuery('#mapdiv').offset().top - 2;
		
		jQuery('.last_triggers.leaflet-control .last_triggers_div').css('max-height',+nheight*0.7);
		jQuery('#hosts_list').css('max-height',+nheight*0.7);
		
		jQuery('#mapdiv').height(nheight);
		_imap.map.invalidateSize();
		if (_imap.settings.do_map_control) mapBbox();
	};

	function fuptime(val) {
		var D=Math.floor(val / 3600 / 24);
		val = val - (D*3600*24);
		if (D>0) {
			D = D+'d ';
		} else {
			D='';
		};
		var H=Math.floor(val / 3600);
		var M=Math.floor(val / 60) - (Math.floor(val / 3600) * 60); if (M<10) M='0'+M;
		var S=Math.round(val % 60);
		var SS=''+S;
		if (S<10) SS='0'+SS;
		
		zt= D+H+':'+M+':'+SS;
		return zt;
	};
	
	function timeUpdate() {
		var ct = new Date().getTime() / 1000;
		jQuery('[lastchange]').each(function() {
			var val = ct- (+jQuery(this).attr('lastchange'));
			jQuery(this).html(fuptime(val));
		});
	};
	
	jQuery(document).ready(function() {
		iniMap();
		mapSize();
		try { userAdditions(); } catch(e) {} finally {};
		setLayersMap();
		_imap.settings.exluding_inventory[_imap.settings.exluding_inventory.length] = 'inventory_mode';
		setInterval(function() { timeUpdate(); },1000);
		loadHosts();
		_imap.vars.intervalHostsID = window.setInterval(function(){loadHosts();}, _imap.settings.intervalLoadHosts*1000);
		_imap.vars.intervalTriggersID = window.setInterval(function(){ loadLinks(); }, _imap.settings.intervalLoadLinks*1000);
		_imap.vars.intervalTriggersID = window.setInterval(function(){ loadTriggers(); }, _imap.settings.intervalLoadTriggers*1000);
	});

	jQuery(window).resize(function(){if (document.readyState=='complete') setInterval(function() { mapSize(); },1000);});

	
