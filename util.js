var util = {
	//暂时去掉名字中的测试
	handleTesterName: function(name){
		return name.replace('（','').replace('(','').replace('）','').replace(')','').replace('测试','');
	},	
	//手机号码验证
    phoneCheck: function (str) {
        var reg = /^[1]\d{10}$/;
        return reg.test(str);
    },
    //union name check
    unionNameCheck: function(str){
    	var reg = /^[^1-9]{6,8}$/;
        return reg.test(str);
    },
    //union nickname check
    unionNicknameCheck: function(str){
    	var reg = /^[^1-9]{6,8}$/;
        return reg.test(str);
    },
    // 获取做单进度所在等级
    // 返回单数的最大值
    getAmountMax: function(currentAmount){
    	var num = 1000;
		if(currentAmount > 999  && currentAmount <= 1999){
			num = 2000;
		}
		else if(currentAmount > 1999){
			num = 3000;
		}
		return num;
    },
    // 设置app里的标题
    setAppTitle: function(str){
    	//在司机端中设置标题
		if (window.DriverBridge) {
			try {
				window.DriverBridge.setWebViewTitle(str);
			}catch(e) {
				
			}
		}
    },
	// 封装ajax
	ajax : function(param) {
		var _id = 'util-ajax-bg';
		var id = '#' + _id;
		if (!param.hidden) {
			var len = $(id).length;
			if (len < 1) {
				$("body").append('<div id="' + _id + '" class="util-ajax-bg"><div class="icon"></div></div>');
			}
			$(id).show();
		}
		// 默认参数
		var _param = {
			url : "",
			data : {},
			type : "POST",
			timeout: 30000,
			jsonp : 'callback',
			jsonpCallback : 'callback',
			dataType : "json",
			async : true,
			success : function(data, param) {
			},
			error : function(data, param) {
			},
			param : {}
		};
		// 合并参数
		var newParam = $.extend(_param, param);
		
		$.ajax({
			url : newParam.url,
			type : newParam.type,
			data : newParam.data,
			timeout: newParam.timeout,
			async : newParam.async,
			jsonp : newParam.jsonp,
			jsonpCallback : newParam.jsonpCallback,
			beforeSend: function(request) {
                request.setRequestHeader("Last-Modified", "");
				request.setRequestHeader("If-Modified-Since", "");
            },
			success : function(data) {
				
				newParam.success(data, newParam.param);
				if (!newParam.hidden) {
					$(id).hide();
				}
			},
			error : function(data) {
				newParam.error(data, newParam.param);
				if (!newParam.hidden) {
					$(id).hide();
				}
			},
			dataType : newParam.dataType
		});
	},
	// 获取参数
	getUrlParam : function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
		var r = window.location.search.substr(1).match(reg); // 匹配目标参数
		if (r != null)
			return decodeURI(r[2]);
		return null; // 返回参数值
	},
	dialog: function(option){
		var _option = {
			id: "util-dialog",
			type: "confirm",
			content: "内容",
			okBtn: "确定",
			cancelBtn: "取消",
			okCallback: function(){},
			cancelCallback: function(){}
		};
		var opt = $.extend(_option, option);
		var dialog_id = opt.id;

		var module = {
		    init: function(){
				this.initDom();
				this.initEvent();
			},
			initDom: function(){
				var html = '';
				html += '<div class="util-mask-layer" id="'+ dialog_id +'">';
				html += '<div class="util-mask-layer-box">';
				html += '<div class="title">!</div>';
				html += '<div class="content">'+opt.content+'</div>';
				html += '<div class="submit">';
				if (opt.type === 'confirm'){
					html += '<a class="cancel" href="javascript:;">'+opt.cancelBtn+'</a>';
				}
				html += '<a class="ok" href="javascript:;">'+opt.okBtn+'</a>';
				html += '</div>';
				html += '</div>';
				html += '</div>';
				$("body").append(html);

				this.show();
		    },
			//初始化事件
			initEvent: function(){
				// 清除原先事件
				$(document).off("."+opt.id);
				// 取消按钮
				$(document).on("click" + "." + opt.id, "#" + dialog_id + " .cancel", function (e) {
					module.hide();
					opt.cancelCallback();
				});
				// 确定按钮
				$(document).on("click" + "." + opt.id, "#" + dialog_id + " .ok", function (e) {
					module.hide();
					opt.okCallback();
				});
			},
			hide: function(){
				$("#"+dialog_id).remove();
			},
			show: function(){
				$("#"+dialog_id).show();
			}
		};
		module.init();
	},
	toast: function(option){
		var _option = {
			id: "util-toast",
			content: "内容",
			time: 1500,
			callback: function(){}
		};
		var opt = $.extend(_option, option);
		var dialog_id = opt.id;

		var module = {
		    init: function(){
				this.initDom();
				setTimeout(function(){
					this.hide();
					opt.callback();
				}.bind(this), opt.time);
			},
			initDom: function(){
				var html = '';
				html += '<div class="util-toast" id="'+ dialog_id +'">';
    			html += '<div class="util-toast-content">';
    			html += opt.content;
				html += '</div>';
				html += '</div>';
				$("body").append(html);
				
				this.show();
		    },
			hide: function(){
				$("#"+dialog_id).remove();
			},
			show: function(){
				$("#"+dialog_id).show();
			}
		};
		module.init();
	},
	helper: function(){
		//比较是否相等的if
        Handlebars.registerHelper("ifEqual", function(v1,v2,options){
            if(v1==v2){
                //满足添加继续执行
                return options.fn(this);
            }else{
                return options.inverse(this);
            }
        });
        //比较是否不相等的if
        Handlebars.registerHelper("ifNotEqual", function(v1,v2,options){
            if(v1!=v2){
                //满足添加继续执行
                return options.fn(this);
            }else{
                return options.inverse(this);
            }
        });
      	//比较是否大
        Handlebars.registerHelper("ifGT", function(v1,v2,options){
            if(v1 > v2){
                //满足添加继续执行
                return options.fn(this);
            }else{
                return options.inverse(this);
            }
        });
      	//比较是否不大于
        Handlebars.registerHelper("ifNotGT", function(v1,v2,options){
            if(v1 <= v2){
                //满足添加继续执行
                return options.fn(this);
            }else{
                return options.inverse(this);
            }
        });
      	//比较是否小于
        Handlebars.registerHelper("ifLT", function(v1,v2,options){
            if(v1 < v2){
                //满足添加继续执行
                return options.fn(this);
            }else{
                return options.inverse(this);
            }
        });
      	//比较是否不小于
        Handlebars.registerHelper("ifNotLT", function(v1,v2,options){
            if(v1 >= v2){
                //满足添加继续执行
                return options.fn(this);
            }else{
                return options.inverse(this);
            }
        });
        // parseInt
        Handlebars.registerHelper('parseInt', function(num) {
			return parseInt(num) || 0;
		});
		// 保留一位小数
        Handlebars.registerHelper('toFixed', function(num) {
			return (parseFloat(num) || 0).toFixed(1);
		});
		// 保留两位小数
        Handlebars.registerHelper('toFixed2', function(num) {
			return (parseFloat(num) || 0).toFixed(2);
		});

		// 获取字符串首字母
		Handlebars.registerHelper('getInitial', function(str) {
			if(str){
				return str.charAt(0);
			}
		});
		// 去掉名字里面的测试
		Handlebars.registerHelper('changeTesterName', function(str) {
			if(str){
				return util.handleTesterName(str);
			}
		});

	}
}
