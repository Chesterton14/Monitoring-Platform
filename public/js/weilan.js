
var vm = new Vue({
    el:'#checkbtn',
    methods:{
        docheck:function(){
            this.$http.get('/json/test.json').then(function(result){
                var lng = result.data.lng,
                    lat = result.data.lat;
                this.$http.jsonp("http://api.map.baidu.com/geoconv/v1/?coords="+ lng +"," + lat+ "&from=1&to=5&ak=ijFmea7PT5GlBEsq7CbHNSTQALgPV7cZ",
                ).then(function(result){
                    addmap(result);

                })
            })
        }
    }
});
function addmap(result) {
    var x = result.data.result[0].x,
        y = result.data.result[0].y;

var map = new BMap.Map('allmap');
var pt = new BMap.Point(x,y);
map.centerAndZoom(pt, 18);
map.enableScrollWheelZoom();
var overlays = [];
var overlaycomplete = function(e){
    overlays.push(e.overlay);
};
var styleOptions = {
    strokeColor:"#888888",    //边线颜色。
    fillColor:"#888888",      //填充颜色。当参数为空时，圆形将没有填充效果。
    strokeWeight: 2,       //边线的宽度，以像素为单位。
    strokeOpacity: 0.6,	   //边线透明度，取值范围0 - 1。
    fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
    strokeStyle: 'solid' //边线的样式，solid或dashed。
}
//实例化鼠标绘制工具
var drawingManager = new BMapLib.DrawingManager(map, {
    isOpen: false, //是否开启绘制模式
    enableDrawingTool: true, //是否显示工具栏
    drawingToolOptions: {
        anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
        offset: new BMap.Size(5, 5), //偏离值
    },
    circleOptions: styleOptions, //圆的样式
    polylineOptions: styleOptions, //线的样式
    polygonOptions: styleOptions, //多边形的样式
    rectangleOptions: styleOptions //矩形的样式
});
//添加鼠标绘制工具监听事件，用于获取绘制结果
drawingManager.addEventListener('overlaycomplete', overlaycomplete);
drawingManager.addEventListener('circlecomplete',function(e, overlay) {
    //console.log(overlay);
    var set_pt=pt;//设定标记点
    var c = overlay.point; //获取所绘制的圆的圆心
    var r = overlay.getRadius();//获取所绘制的圆的半径
    //console.log(r);
    var circle = new BMap.Circle(c,r);//所绘制的圆
    var result = BMapLib.GeoUtils.isPointInCircle(set_pt, circle);//判断
    if(result == true){
        //alert("点在圆形内");
        layui.use('layer', function(){
            var layer = layui.layer;

            layer.msg('此设备正处于围栏中！',{time:5000});
        });
    } else {
        layui.use('layer', function(){
            var layer = layui.layer;

            layer.msg('此设备不在围栏中！！！',{time:1000});
        });
        //alert("点在圆形外")
    }
});
drawingManager.addEventListener('polygoncomplete',function (e,overlay) {
    //console.log(overlay);
    var set_pt=pt;//设定标记点
    var pts =overlay.getPath();//获取所绘制的多边形各个点的坐标
    //console.log(pts);
    var ply = new BMap.Polygon(pts);//绘制多边形
    var result = BMapLib.GeoUtils.isPointInPolygon(set_pt, ply);//判断
    if(result == true){
        //alert("点在圆形内");
        layui.use('layer', function(){
            var layer = layui.layer;

            layer.msg('此设备正处于围栏中！',{time:5000});
        });
    } else {
        layui.use('layer', function(){
            var layer = layui.layer;

            layer.msg('此设备不在围栏中！！！',{time:1500});
        });
        //alert("点在圆形外")
    }
});
function clearAll() {
    for(var i = 0; i < overlays.length; i++){
        map.removeOverlay(overlays[i]);
    }
    overlays.length = 0;
}
}
