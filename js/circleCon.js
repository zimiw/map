function CustomOverlay(position, index) {
            this.index = index;
            this.position = position;
        }
        CustomOverlay.prototype = new qq.maps.Overlay();
         //定义construct,实现这个接口来初始化自定义的Dom元素
        CustomOverlay.prototype.construct = function() {
            var div = this.div = document.createElement("div");
            var divStyle = this.div.style;
            divStyle.position = "absolute";
            divStyle.width = "30px";
            divStyle.height = "30px";
            divStyle.backgroundColor = "red";
            divStyle.color = "white";
            divStyle.border = "3px solid gray";
            divStyle.textAlign = "center";
            divStyle.lineHeight = "30px";
            divStyle.borderRadius = "15px";
            divStyle.cursor = "pointer";
            this.div.innerHTML = "帝远";
            //将dom添加到覆盖物层
            var panes = this.getPanes();
            //设置panes的层级，overlayMouseTarget可接收点击事件
            panes.overlayMouseTarget.appendChild(div);

            var self = this;
            this.div.onclick = function() {
                alert(self.index);
            }
        }
         //实现draw接口来绘制和更新自定义的dom元素
        CustomOverlay.prototype.draw = function() {
            var overlayProjection = this.getProjection();
            //返回覆盖物容器的相对像素坐标
            var pixel = overlayProjection.fromLatLngToDivPixel(this.position);
            var divStyle = this.div.style;
            divStyle.left = pixel.x - 12 + "px";
            divStyle.top = pixel.y - 12 + "px";
        }
         //实现destroy接口来删除自定义的Dom元素，此方法会在setMap(null)后被调用
        CustomOverlay.prototype.destroy = function() {
            this.div.onclick = null;
            this.div.parentNode.removeChild(this.div);
            this.div = null
        }