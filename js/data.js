/*
				Copyright 2018 Edoardo Grassi.
			*/
			(function() {var originalOnTouch = L.Draw.Polyline.prototype._onTouch;L.Draw.Polyline.prototype._onTouch = function( e ) {if( e.originalEvent.pointerType != 'mouse' ) {return originalOnTouch.call(this, e);}}})();
			// VARIABLES
			var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			var wanttofollow = [false,"",0];
			var flagslayer =  L.layerGroup();
			var playerslayer = L.layerGroup();
			var chooselist = "";
			var map = L.map('mapts', {
				crs: L.CRS.Simple
			});
			var bounds = L.latLngBounds(map.unproject([0,192512], 8), map.unproject([173568,0], 8));
			var uncoloured = L.tileLayer('https://mapcdn.auroravtc.com/ets2/Tiles/{z}/{x}_{y}.png', {
				maxZoom: 5,
				minZoom: 0,
				bounds: bounds,
				tileSize: 512,
				reuseTiles : true
			}).addTo(map);
			var coloured = L.tileLayer('ets2map/coloured/{z}/{x}_{y}.png', {
				maxZoom: 5,
				minZoom: 0,
				bounds: bounds,
				tileSize: 512,
				reuseTiles : true
			}).addTo(map);
			var drawnItems = new L.FeatureGroup();
		    var drawControl = new L.Control.Draw({
		    	draw: {
		    		polyline: {
						shapeOptions: {
							color: 'red',
							opacity: '0.6',
							weight: '5',
							clickable: false
						},
						icon: new L.DivIcon({
				            iconSize: new L.Point(7.5, 7.5)
				        })
					},
					polygon: {
						showArea: true,
						shapeOptions: {
							color: 'red',
							opacity: '0.6',
							weight: '3',
							clickable: false
						},
						icon: new L.DivIcon({
				            iconSize: new L.Point(7.5, 7.5)
				        })
					},
					rectangle: false,
					circle: false,
		    	},
		        edit: {
		            featureGroup: drawnItems
		        },
		        position: 'topright'
		    });
			// SETTINGS
			map.zoomControl.setPosition('bottomright');
			map.setMaxBounds(bounds);
			map.setView(map.unproject([312,312], 0), 1);
			L.control.layers({
				"Uncoloured": uncoloured,
				"Coloured":coloured
			}, {
			    "Flags":flagslayer,
			    "Players":playerslayer
			}).addTo(map);
		    drawnItems.addTo(map);
		    map.addControl(drawControl);

			// INITIALIZATION

			// INPUT SELECT A CITY...
			Object.keys(g_cities_json).sort().forEach(function(city) {
				chooselist += "<option value='"+city+"'>"+city+"</option>"; 
			});
			document.getElementById("inputtype").innerHTML += chooselist;

			// ADDING FLAGS LAYERS...
			Object.keys(g_countries_json).forEach(function(country) {
				var pos = game_coord_to_image(g_countries_json[country].pos[0], g_countries_json[country].pos[1]);
				temp = new L.Marker(map.unproject(pos, 8), {icon: new L.DivIcon({className: 'flags',html:'<img src="flags/' + g_countries_json[country].country_code.toLowerCase() + '.svg" ><br>' + g_countries_json[country].name})}).addTo(map);
				flagslayer.addLayer(temp);
			});
			flagslayer.addTo(map);

			// ADDING CITY NAMES LAYERS
			Object.keys(g_cities_json).forEach(function(city) {
				coords = game_coord_to_image(g_cities_json[city].x, g_cities_json[city].z);
				new L.Marker(map.unproject([coords[0],coords[1]], 8), {icon: new L.DivIcon({className: 'citiesnames',html:'<h2>'+ city +'</h2>'})}).addTo(map);
			});
			playerslayer.addTo(map);
			

			// Checking all these things...
			// CHECK IF THE USER WANT TO FOLLOW SOMEBODY
			// CHECK IF THE USER WANT TO USE SAVED DRAWINGS
			// CHECK IF THE USER USES FRAME

			for (var i = 0; i < url.length; i++) {
				if (url[i].substring(0,7) === "follow=") {
					url[i] = decodeURI(url[i].replace("follow=",""));
					try {
						wanttofollow[0] = true;
						wanttofollow[1] = url[i];
						map.setZoom(7);
					} catch (TypeError) {};
				} else if (url[i].substring(0,7) === "export=") {
					settings = decodeURI(url[i].replace("export=","")).split(",");
					counter = 0;
					middle = [0,0,0];
					while (counter < settings.length - 1) {
						type = settings[counter];
						if (type === "polyline" || type === "polygon") {
							counter++;
							colorsh = settings[counter];
							counter++;
							offset = (parseInt(settings[counter])*2) + counter;
							counter++;
							points = [];
							while (counter <= offset) {
								lat = (parseFloat(settings[counter]));
								counter++;
								lng = (parseInt(settings[counter]));
								middle[0] += lat;
								middle[1] += lng;
								points.push(new L.LatLng(lat, lng));
								middle[2] += 1;
								counter++;
							}
							if (type === "polyline") {
								drawnItems.addLayer(new L.Polyline(points, {color: colorsh,weight: 5,opacity: 0.6,clickable:false}));
							} else {
								drawnItems.addLayer(new L.Polygon(points, {color: colorsh,opacity: 0.6,weight: 3,clickable: false}));
							}
						} else {
							counter++;
							lat = settings[counter];
							counter++;
							lng = settings[counter];
							counter++;
							middle[0] += lat;
							middle[1] += lng;
							middle[2] += 1;
							if (settings[counter] === "" || settings[counter] === "Click here to change text") {
								drawnItems.addLayer(new L.marker([lat,lng]));
							} else {
								drawnItems.addLayer(new L.marker([lat,lng]).bindPopup(settings[counter].replace("(^)",",")));
							}
							counter++;
						}
					}
					middle[0] = middle[0] / middle[2];
					middle[1] = middle[1] / middle[2];
					map.setView(middle,4);
				} else if (url[i].substring(0,5) === "mode=") {
					if (url[i].replace("mode=","") == "frame") {
						document.getElementsByClassName('leaflet-draw')[0].style.display = "none";
						document.getElementById("toolmapinfo").style.display = "none";
					} else if (url[i].replace("mode=","") == "minimal") {
						document.getElementsByClassName('leaflet-draw')[0].style.display = "none";
						document.getElementById("toolmapinfo").style.display = "none";
						document.getElementById("search").style.display = "none";
						document.getElementById("infopl").style.display = "none";
						map.removeControl(map.zoomControl);
					}
				} else if (url[i].substring(0,5) === "zoom=") {
					map.setZoom(url[i].replace("zoom=",""));
				} else if (url[i].substring(0,10) === "draggable=" && url[i].replace("draggable=","") == "false") {
					map.dragging.disable();
				} else if (url[i].substring(0,9) === "zoomable=" && url[i].replace("zoomable=","") == "false") {
				    map.touchZoom.disable();
				    map.doubleClickZoom.disable();
				    map.scrollWheelZoom.disable();
				}
			};

			// EVENT HANDLERS 
			map.on("zoom",function (){
				for (var i = 0; i < document.getElementsByClassName('citiesnames').length; i++) {
					document.getElementsByClassName('citiesnames')[i].style.opacity = String((map.getZoom() - 2) / 4);
				};
				for (var i = 0; i < document.getElementsByClassName('flags').length; i++) {
					document.getElementsByClassName('flags')[i].style.opacity = String(map.getZoom());
				};
			});
			map.on('drag', function() {
				wanttofollow[0] = false;
				document.getElementById("infopl").style.bottom = "-150px";
			});
			document.getElementsByClassName("leaflet-draw-draw-polyline")[0].addEventListener("mouseover", function() {document.getElementById("colorpolyline").style.width = '210px'});
			document.getElementsByClassName("leaflet-draw-draw-polyline")[0].addEventListener("mouseout", function() {document.getElementById("colorpolyline").style.width = '0px'});
			document.getElementById("colorpolyline").addEventListener("mouseover", function() {document.getElementById("colorpolyline").style.width = '210px'});
			document.getElementById("colorpolyline").addEventListener("mouseout", function() {document.getElementById("colorpolyline").style.width = '0px'});
			document.getElementsByClassName("leaflet-draw-draw-polygon")[0].addEventListener("mouseover", function() {document.getElementById("colorpolygon").style.width = '210px'});
			document.getElementsByClassName("leaflet-draw-draw-polygon")[0].addEventListener("mouseout", function() {document.getElementById("colorpolygon").style.width = '0px'});
			document.getElementById("colorpolygon").addEventListener("mouseover", function() {document.getElementById("colorpolygon").style.width = '210px'});
			document.getElementById("colorpolygon").addEventListener("mouseout", function() {document.getElementById("colorpolygon").style.width = '0px'});
			map.on(L.Draw.Event.CREATED, function (e) {
			    var type = e.layerType,layer = e.layer;
			    if (type === 'marker') {
			        layer.bindPopup('<div onclick="clickpopup(this)" onkeypress="writepopup(event,this)" >Click here to change text</div>');
			        layer.on("popupclose", function (element) {
			        	element.target.bindPopup(element.innerHTML);
			        });
			    }
			    drawnItems.addLayer(layer);
			});

			// FUNCTIONS
			function httpsend(link,funct) {
				xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
				    if (this.readyState == 4 && this.status == 200) {
				    	funct(this);
				    }
				};
				xhttp.open("GET", link, true);
				xhttp.send();
			}
			function putAlert() {
				document.getElementById("alert").style.opacity = 1;
				document.getElementById("alert").style.zIndex = 10000;
			}
			function clearAlert() {
				document.getElementById("alert").style.opacity = 0;
				document.getElementById("alert").style.zIndex = -10;
			}
			function clickpopup(element) {
				if (element.innerHTML.substring(0,52) !== '<input type="text" placeholder="Press Enter to save"') {
					if (element.outerText != "Click here to change text") {
						textbefore = element.outerText;
					} else {
						textbefore = "";
					}
					element.innerHTML = '<input type="text" placeholder="Press Enter to save" spellcheck="false" style="width:'+element.offsetWidth+'px;" value="'+textbefore+'" />'
					element.getElementsByTagName('input')[0].focus();
					element.getElementsByTagName('input')[0].select();
				};
			}
			function writepopup(e,ele) {
				if (e.keyCode === 13) {
					ele.innerHTML = ele.getElementsByTagName('input')[0].value;
				}
			}
			function setcolor(element) {
				values = element.split(".");
				if (values[1] === "red" ) {
					whited = "#FF5555"
				} else if( values[1] === "blue" || values[1] === "green") {
					whited = "light" + values[1]
				} else {
					whited = values[1];
				}
				if (values[0] === "polyline") {
					drawControl.setDrawingOptions({
					    polyline: {
					    	shapeOptions: {
								color: values[1],
								opacity: '0.6',
								weight: '5',
								clickable: false
							}
						}
					});
				} else {
					drawControl.setDrawingOptions({
					    polygon: {
					    	showArea: true,
					    	shapeOptions: {
					        	color: values[1],
					        	opacity: '0.6',
								weight: '3',
								clickable: false
					        }
					    }
					});
				}
				document.getElementsByClassName("leaflet-draw-draw-"+values[0])[0].style.backgroundColor = whited;
			}
			function share() {
				link = ""
				for (var item in drawnItems._layers) {
					layer = drawnItems._layers[item]
					if (layer instanceof L.Marker) {
						link += "marker,"+layer._latlng.lat+","+layer._latlng.lng+","
						try {
							if (layer._popup._wrapper.innerText === "Click here to change text") {
								throw TypeError;
							};
							link += layer._popup._wrapper.innerText.replace(",","(^)")+","
						} catch (TypeError) {
							link += ","
						}
				    }
				    if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon)) {
				        link += "polyline,"+layer.options.color+","+layer.editing.latlngs[0].length+","
				        for (var i = 0; i < layer.editing.latlngs[0].length; i++) {
				        	link += String(layer.editing.latlngs[0][i].lat) +","+ String(layer.editing.latlngs[0][i].lng) +","
				        };
				    }
				    if ((layer instanceof L.Polygon) && ! (layer instanceof L.Rectangle)) {
				    	link += "polygon,"+layer.options.color+","+layer.editing.latlngs[0][0].length+","
				        for (var i = 0; i < layer.editing.latlngs[0][0].length; i++) {
				        	link += String(layer.editing.latlngs[0][0][i].lat) +","+ String(layer.editing.latlngs[0][0][i].lng) +","
				        };
				    }
				};
				box = document.getElementById("boxlink");
				sharebox = document.getElementById("sharebox");
				box.value = "http://map.vtlog.net/ets2.html?export="+link
				sharebox.style.opacity = '1';
				sharebox.style.visibility = 'visible';		
				box.select();
				box.focus();
				hidemenu();
			}
			function copyshare() {
				document.getElementById("boxlink").select();
				document.getElementById("boxlink").focus();
				try {
				    var successful = document.execCommand('copy');
				} catch (e) {}
			}
			function gotocity(val) {
				if (val != 0) {
					citycoords = game_coord_to_image(g_cities_json[val].x, g_cities_json[val].z);
					map.setView(map.unproject(citycoords, 8),7);
				}
				wanttofollow[0] = false;
			}
			function showmenu() {
					document.getElementById("drawer").style.left = "0px";
			}
			function hidemenu() {
				document.getElementById("drawer").style.left = "-360px";
			}
			function game_coord_to_image(x, y) {
				var r = [x / 0.78125 + 89600 , y / 0.78125 + 89600];
				return r;
			}
			function getUsers(resp){
				var lastreq = new XMLHttpRequest();
				lastreq.onreadystatechange = function() { 
					if (lastreq.readyState == 4 && lastreq.status == 200)
						elab(lastreq.responseText);
				}
				lastreq.open("GET", "https://api.truckyapp.com/v2/map/online?playerID=1386149", true ); // add to the link '&vtc=<your_vtc_id>' for showing only your vtc
				lastreq.send( null );
			}
			function elab(text) {
				try {
					//console.log(text);
					user = JSON.parse(text).response;
					
					infos = "";
					playerslayer.clearLayers();
					//for (ob in user) {
					 	//truck = user[ob];
					 	// jobStart = (user[ob].data.job != null) ? user[ob].data.job.source_city : -1;
					 	// jobEnd = (user[ob].data.job != null) ? user[ob].data.job.destination_city : -1;
					 	// trailerDamage = (user[ob].data.trailer != null) ? user[ob].data.trailer.wear.chassis : -1;
					 	// truckDamage = (truck.wear.cabin + truck.wear.chassis + truck.wear.engine + truck.wear.transmission + truck.wear.wheels) / 5;
				 		coordtruck = game_coord_to_image(user.x, user.y);
						 console.log( coordtruck);
						 eventclick = "map.setView(map.unproject(["+coordtruck[0]+","+coordtruck[1]+"], 4),7);putinfo(\""+user[ob].Name+"\");hidemenu();wanttofollow = [true,\""+user[ob].MpId+"\"];";
					 	//eventclick = "map.setView(map.unproject(["+coordtruck[0]+","+coordtruck[1]+"], 8),7);putinfo(\""+user[ob].data.username+"\",\""+truck.brand + " " +truck.name+"\",\""+truck.speed+"\",\""+truck.fuel+"\",\""+jobStart+"\",\""+jobEnd+"\",\""+truckDamage+"\",\""+trailerDamage+"\");hidemenu();wanttofollow = [true,\""+user[ob].steamid+"\"];";
					 	//temp = new L.Marker(map.unproject(coordtruck, 8), {icon: new L.DivIcon({className: 'player',html:"<div class='circle' id='"+user[ob].steamid+"' onclick='"+eventclick+"'></div>"})});
					 	temp = new L.Marker(map.unproject(coordtruck, 4), {icon: new L.DivIcon({className: 'player',html:"<div class='circle' id='"+user.name+"' onclick='"+eventclick+"'></div>"})});

					 	playerslayer.addLayer(temp);
						infos += "<li class='playerlist' onclick='"+eventclick+"'><i class='material-icons'>&#xE558;</i><div> </div>"+user.name+"</li>";
						// if (user[ob].steamid == wanttofollow[1] && wanttofollow[0] == true && document.getElementById(wanttofollow[1])) {
						// 	document.getElementById(wanttofollow[1]).style.backgroundColor = "#00C853";
						// 	map.setView(map.unproject([coordtruck[0],coordtruck[1]], 8), map.getZoom());
						// 	putinfo(user[ob].data.username,truck.brand + " " +truck.name,truck.speed,truck.fuel,jobStart,jobEnd,truckDamage,trailerDamage);
						// }
					//}
					if (!document.getElementById(wanttofollow[1])) {
						document.getElementById("infopl").style.bottom = "-200px";
					}
					document.getElementById("list").innerHTML = infos;
				} catch (SyntaxError) {};
				setTimeout(function () {
					getUsers();
				},5000);
				
			}
			function putinfo(nick,brand,speed,fuel,from,to,damtruck,damtrailer) {
				textvtc = " for VTC NAME ";
				html = nick + "<p>Driving a " + brand + textvtc + "<br>Speed: " + parseInt(speed) + "km/h<br>Fuel: " + parseInt(fuel) + "L" + "<br>Truck damage: " + parseInt(damtruck) + "%<br>"
				if (from != -1 && to != -1) {
					html += "With a trailer from " + from + " to " + to + "<br>";
				}
				if (damtrailer != -1) {
					html += "Trailer damage: " + parseInt(damtrailer) + "%";
				}
				html += "<i class='material-icons' onclick='document.getElementById(\"infopl\").style.bottom = \"-150px\";'>&#xE5CF;</i>"
				document.getElementById("infopl").innerHTML = html;
				document.getElementById("infopl").style.bottom = "10px";
			}
			// START TO CHECK USERS
			getUsers();