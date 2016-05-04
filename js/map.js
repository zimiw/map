
if (window.DriverBridge) {
	try {
		window.DriverBridge.setWebViewTitle("订单热图");
	} catch (e) {

	}
}

//默认的中心坐标
var DEFAULT_CENTER = {
	'lat': 31.231706,
	'lng': 121.472644
};

//起始点地址
var CURRENT_ADDRESS = null;

//多边形style与level对应的数组
var POLYGON_STYLES = [{}, {
	color: '#ffdc2f',
	opacity: '0.4',
	strokeColor: '#d2a028',
	strokeWeight: 1
}, {
	color: '#fa973b',
	opacity: '0.5',
	strokeColor: '#d2a028',
	strokeWeight: 1
}, {
	color: '#fe4b48',
	opacity: '0.5',
	strokeColor: '#cd703c',
	strokeWeight: 1
}, {
	color: '#fe4b48',
	opacity: '0.7',
	strokeColor: '#cd703c',
	strokeWeight: 1
}, {
	color: '#fe4b48',
	opacity: '0.9',
	strokeColor: '#cd703c',
	strokeWeight: 1
}];

//默认多边形style
var DEFAULT_POLYGON_STYLES = {
	color: '#fe4b48',
	opacity: '0.5',
	strokeColor: '#cd703c',
	strokeWeight: 1
};

//多边形方法倍率
POLYGON_RATE = 1000000;

//地图数据
//var MAP_DATA;

//地图
var map;

//图标集合
var markerArr = [];

//多边形集合 
var polyArr = [];

//展示的视图标志 false-热力图；true-路况图
var VIEW_TYPE = false;

//实时路况层
var roadConditionLayer = null;

//设置获取驾车线路方案的服务
var drivingService = null;

//目的地坐标
var TARGET_POSITION = null;

//目的地标志图标
var targetMarker = null;

//获取当前坐标
function getLocation() {

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(gpsPosition, showError);
	} else {
		alert("Geolocation is not supported by this browser.")
	}
	//showPosition(null);
}

function gpsPosition(position) {

	myPosition = {
		lat: position.coords.latitude,
		lng: position.coords.longitude
	}
	showPosition(myPosition);
}

function showPosition(position) {

	if (position === null) {
		var lat = util.getUrlParam('lat');
		var lng = util.getUrlParam('lng');
		if (lat && lng) {
			position = {
				lat: lat,
				lng: lng
			};
		} else {
			position = DEFAULT_CENTER;
		}
	}else{
		 DEFAULT_CENTER = position;
	}
	//获取当前地点的地址
	//getCurrentAdd(new qq.maps.LatLng(position.lat, position.lng));

	// 如果取不到当前坐标，直接用默认坐标
	showMapWithCenter(position);
}

function showError(error) {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			alert("User denied the request for Geolocation.");
			break;
		case error.POSITION_UNAVAILABLE:
			alert("Location information is unavailable.");
			break;
		case error.TIMEOUT:
			alert("The request to get user location timed out.");
			break;
		case error.UNKNOWN_ERROR:
			alert("An unknown error occurred.");
			break;
	}
	showPosition(null);
}

/**
 * 获取坐标点对应的地址
 */
function getCurrentAdd(latLng) {
	var addressConvertor = new qq.maps.Geocoder({
		//设置服务请求成功的回调函数
		complete: function(result) {
			CURRENT_ADDRESS = result.detail.address;
			//$("#addressCurrent").html(result.detail.address);
		},
		//若服务请求失败，则运行以下函数
		error: function() {
			alert("出错了，请输入正确的经纬度！！！");
		}
	});
	addressConvertor.getAddress(latLng);
}

//指定当前坐标绘制地图
function showMapWithCenter(pos) {
	pos = pos || DEFAULT_CENTER;
	/*DEFAULT_CENTER = pos;
	// 从后端请求数据
	util.ajax({
		url : '../../bigdata/thermodynamic.html',
		data : {
			currentLoc : pos ? JSON.stringify(pos) : ""
		},
		success : function(data) {
			var showCurrentPos = false;
			if (data.ret.code == 0) {
				MAP_DATA = JSON.parse(data.data);
				if (data.ret.msg) {
					pos = JSON.parse(data.ret.msg);
					DEFAULT_CENTER = pos;
					if (!pos.addr) {
						showCurrentPos = true;
					}
				}
				renderMap(pos, showCurrentPos);
			}
		}
	});*/
	renderMap(pos, true);
}

/**
 * 渲染地图
 * @param pos
 * @param showCurrentPos
 */
function renderMap(pos, showCurrentPos) {

	map = new qq.maps.Map(document.getElementById("container"), {
		// 地图的中心地理坐标。
		center: new qq.maps.LatLng(pos.lat, pos.lng),
		zoom: 16, // 缩放级别
		zoomControl: false,
		panControl: false,
		mapTypeControl: false,
		scaleControl: false
	});

	if (showCurrentPos) {
		// 当前坐标以小车图片形式显示
		var marker = new qq.maps.Marker({
			map: map,
			position: map.getCenter()
		});
		marker.setIcon(new qq.maps.MarkerImage('images/icon_adr.png', null, null,
			null, new qq.maps.Size(25, 30)));
	}

	//展示控件
	showControllers();

	//点击事件测试
	//bindLongPress();
	showMarker(MAP_DATA.markers);
}
/**
 * 页面图标的点击事件
 */
function markerClick(obj,address) {
	
	TARGET_POSITION = {
		lat : obj.getLat(),
		lng : obj.getLng()
	}
	var ends = {
				start: DEFAULT_CENTER,
				end: TARGET_POSITION,
				address: address
			};
	//显示路径相关信息
	showRouter(ends);

}
/**
 * 在地图上展示标志点
 * @param {Object} markers
 */
function showMarker(markers) {
	
	for(var length =markers.length-1;length>=0;length-- ){
		var latlng = new qq.maps.LatLng(markers[length].lat, markers[length].lng);
		var options = {
			id:length,
			name : markers[length].name,
			categories : markers[length].category,
			address : markers[length].address
		};
		var overlay = new CustomOverlay(latlng, options, markerClick);
		overlay.setMap(map);
	}
	
}

/**
 * 绑定长按事件
 */
function bindLongPress() {

	var startTime, endTime;
	document.getElementById("container").addEventListener('touchstart', function() {
		startTime = new Date().getTime();
	}, false);
	document.getElementById("container").addEventListener('touchend', function() {
		endTime = new Date().getTime();
		if (endTime - startTime > 2000) {
			//设置终点图标
			if (null == targetMarker) {
				targetMarker = new qq.maps.Marker({
					map: map,
					icon: new qq.maps.MarkerImage('images/icon_adr.png', null, null,
						null, new qq.maps.Size(25, 30)),
					position: new qq.maps.LatLng(TARGET_POSITION.lat, TARGET_POSITION.lng)
				});
			} else {
				targetMarker.setPosition(new qq.maps.LatLng(TARGET_POSITION.lat, TARGET_POSITION.lng));
				targetMarker.setVisible(true);
			}

			var obj = {
				start: DEFAULT_CENTER,
				end: TARGET_POSITION
			};
			//显示路径相关信息
			showRouter(obj);
		} else {

		}
	}, false);

	qq.maps.event.addListener(
		map,
		'click',
		function(event) {
			TARGET_POSITION = {
				lat: event.latLng.getLat(),
				lng: event.latLng.getLng()
			};
		}
	);
}

/**
 * 展示路线规划
 * @param obj
 */
function showRouter(obj) {
	var startLat = new qq.maps.LatLng(obj.start.lat, obj.start.lng),
		endLat = new qq.maps.LatLng(obj.end.lat, obj.end.lng),
		policy = obj.policy || qq.maps.DrivingPolicy.REAL_TRAFFIC,
		address = obj.address || "";
	//清除地图上路线规划
	if (drivingService != null) {
		drivingService.clear();
	}
	drivingService = new qq.maps.DrivingService({});

	//设置驾车方案
	drivingService.setPolicy(policy);

	//设置回调函数
	drivingService.setComplete(function(result) {
		if (result.type == qq.maps.ServiceResultType.MULTI_DESTINATION) {
			alert("起终点不唯一");
		}
		var outResult = result.detail;
		var addressConvertor = new qq.maps.Geocoder({
			//设置服务请求成功的回调函数
			complete: function(result) {
				//展示路径提示信息页面
				showRouterInfo(outResult.distance, outResult.duration, address||result.detail.address);
				//改变回到中心控件的位置
				$(".icon_restore").css({
					margin: "0px 5px 100px 0px"
				});
			},
			//若服务请求失败，则运行以下函数
			error: function() {
				alert("出错了，请输入正确的经纬度！！！");
			}
		});

		addressConvertor.getAddress(result.detail.end.latLng);
	});
	//设置检索失败回调函数
	drivingService.setError(function(data) {
		alert(data);
	});
	//设置驾驶路线的起点和终点
	drivingService.search(startLat, endLat);
}

/**
 * 在地图上重绘路线图
 */
function repaintRouter(start, end, policy) {

	var startLat = new qq.maps.LatLng(start.lat, start.lng),
		endLat = new qq.maps.LatLng(end.lat, end.lng);

	//设置获取驾车线路方案的服务
	drivingService = new qq.maps.DrivingService({
		map: map
	});
	//设置驾车方案
	drivingService.setPolicy(policy || qq.maps.DrivingPolicy.REAL_TRAFFIC); /*LEAST_DISTANCE*/
	//设置驾车的区域范围
	//drivingService.setLocation("北京");
	//设置回调函数
	drivingService.setComplete(function(result) {
		if (result.type == qq.maps.ServiceResultType.MULTI_DESTINATION) {
			alert("起终点不唯一");
		}
	});
	//设置检索失败回调函数
	drivingService.setError(function(data) {
		alert(data);
	});
	//设置驾驶路线的起点和终点
	drivingService.search(startLat, endLat);
}

/**
 * 展示线路信息
 * @param distance
 * @param duration
 * @param address
 */
function showRouterInfo(distance, duration, address) {

	//显示信息提示框
	$(".ui_btm_box").show();
	$(".ui_map_address").show();
	$(".e_line").hide();

	$(".target_address").html(address);
	if (distance > 1000) {
		var disHtml = '距离' + Math.round(distance / 100) / 10 + '公里';
	} else {
		var disHtml = '距离' + distance + '米';
	}
	$(".distance").html(disHtml);
	$(".duration").html(duration + '分钟');
	$(".current_address").html(CURRENT_ADDRESS);
}

/**
 * 切换视图
 * @param is
 */
function shiftView() {

	//展示路况信息
	showRoadCondition(!VIEW_TYPE);
	//改变图标
	//显示热力图
	/*for(var i=0,length=polyArr.length;i<length;i++){
		polyArr[i].setVisible(VIEW_TYPE);
	}*/
	VIEW_TYPE = !VIEW_TYPE;
}

/**
 * 展示路况信息 
 * @param isShow-是否显示路况[Boolean]
 */
function showRoadCondition(isShow) {
	//实时路况图层
	if (roadConditionLayer == null) {
		roadConditionLayer = new qq.maps.TrafficLayer();
	}
	if (isShow) {
		roadConditionLayer.setMap(map);
	} else {
		roadConditionLayer.setMap(null);
	}

}

/**
 * 提交建议
 */
function submitAdvise() {

	var value = $.trim($(".e_submit_text").val());
	//如果值为可空
	if (value == '' || value == null || value == undefined) {
		$("#textEmpty").show();
		setTimeout(function() {
			$("#textEmpty").hide()
		}, 2000);
		return;
	}
	util.ajax({
		url: '../../bigdata/thermodynamic-chart.html',
		data: {
			feedback: value
		},
		success: function(data) {
			$(".e_submit_text").val('');
			$("#textOK").show();
			$(".popup").hide();
			$(".mask").hide();
			setTimeout(function() {
				$("#textOK").hide()
			}, 2000);
		}
	});

}

/**
 * 展示地图上所有控件
 */
function showControllers() {

	// 回到当前位置控件
	var customCenterDiv = document.createElement("div");
	var customCenterControl = new CustomCenterControl(customCenterDiv, map);
	map.controls[qq.maps.ControlPosition.RIGHT_BOTTOM].push(customCenterDiv);

	/*// “单量较多”——“单量峰值”图片说明控件
	var customLegendDiv = document.createElement("div");
	var customLegendControl = new CustomLegendControl(customLegendDiv, map);
	map.controls[qq.maps.ControlPosition.TOP_RIGHT].push(customLegendDiv);*/

	// 比例尺控件
	var scaleControl = new qq.maps.ScaleControl({
		align: qq.maps.ALIGN.LEFT_BOTTOM,
		map: map
	});

	// 帮助控件
	var helpDiv = document.createElement("div");
	var helpControl = new HelpControl(helpDiv, map);
	map.controls[qq.maps.ControlPosition.RIGHT_TOP].push(helpDiv);

	// 显示路况控件
	var roadConditionDiv = document.createElement("div");
	var roadConditionControl = new RoadConditionControl(roadConditionDiv, map);
	map.controls[qq.maps.ControlPosition.RIGHT_TOP].push(roadConditionDiv);

}

//回到中心控件
function CustomCenterControl(controlDiv, map) {
	controlDiv.innerHTML = "<i id='ctlBackToCenter' class='icon_restore'/></i>";
	controlDiv.onclick = function() {
		map.panTo(new qq.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng));
	};
}

/**
 * 帮助控件
 */
function HelpControl(controlDiv, map) {

	$(controlDiv).addClass('icon_help icon_position');
	controlDiv.onclick = function() {
		//显示帮助页面
		showHelpPage();
	};
}

/**
 * 视图切换控件
 */
function RoadConditionControl(controlDiv, map) {

	$(controlDiv).addClass('icon_cdn_off icon_position');

	controlDiv.onclick = function() {
		//切换视图
		shiftView();
		_this = $(this);
		if (_this.hasClass('icon_cdn_on')) {
			_this.removeClass('icon_cdn_on').addClass('icon_cdn_off');
		} else {
			_this.removeClass('icon_cdn_off').addClass('icon_cdn_on');
		}
	};
}

//“单量较多”——“单量峰值”说明图片控件
function CustomLegendControl(controlDiv, map) {
	controlDiv.style.padding = "10px";
	controlDiv.innerHTML = "<p class='order_dtl'><b>单量峰值</b><em>单量较多</em></p>";
}

//播放语音播报
function playAudioTip(notify) {
	var audio = document.getElementById('audio');
	var map = {
		'订单较少': '1.ogg',
		'订单较多': '2.ogg',
		'订单很多': '3.ogg'
	}
	audio.src = map[notify];
	audio.play();
}

/**
 * 打开帮助页面
 */
function showHelpPage() {
	$(".popup").show();
	$(".mask").show();
}

//查询当前位置坐标并绘制热力图
getLocation();