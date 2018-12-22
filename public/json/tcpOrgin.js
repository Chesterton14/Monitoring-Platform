var net = require('net');
var http = require('http');
var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";
var PORT = 8867;

// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
net.createServer(function (sock) {

    // 我们获得一个连接 - 该连接自动关联一个socket对象
    console.log('已建立连接');
    sock.write('Connect OK');
    // 为这个socket实例添加一个"data"事件处理函数
    sock.on('data', function (data) {
        console.log('---------------------------------------------------------------------');
        console.log('DATA:' + data);

        var strs = [];
        strs = data.toString().split(",");
        console.log(strs.length);
        var GGA = strs[0].split("$")[1];
        if (GGA != 'GNGGA') {
            console.log("不是GNGGA，已过滤");
            return false
        }
        if (strs.length < 15) {
            console.log("数据不完整，已过滤");
            return false
        }
        console.log("消息ID：" + GGA + "\n" + "UTC时间：" + strs[1] + "\n" + "纬度：" + strs[2] + "\n" + "N/S指示：" + strs[3] + "\n" + "经度：" + strs[4] + "\n" + "E/W指示：" + strs[5] + "\n" + "定位指示：" + strs[6] + "\n" + "可以卫星数：" + strs[7] + "\n" + "HDOP(水平精度因子)：" + strs[8] + "\n" + "海拔高度：" + strs[9] + "\n" + "单位：" + strs[10] + "\n" + "大地椭球面相对海平面高度：" + strs[11] + "\n" + "单位：" + strs[12] + "\n" + "差分ID：" + strs[13] + "\n" + "校验和：" + strs[14] + "\n");

        var curlat = move2(strs[2]);
        var curlng = move3(strs[4]);
        var date = new Date();
        var thetime = date.pattern("yyyy-MM-dd hh:mm:ss");
        console.log(thetime);
        var singlePoints = '{"lng":' + curlng + ',"lat":' + curlat + '}';
        console.log(singlePoints);
        fs.writeFile('test.json', singlePoints, function (err) {
            if (err) {
                console.log('err');
            } else {
                console.log('写入数据成功');
            }
        });
        http.get('http://127.0.0.1:3000/json/test.json', (res) => {
            const {statusCode} = res;
            const contentType = res.headers['content-type'];
            let error;
            if (statusCode !== 200) {
                error = new Error('请求失败。\n' + `状态码: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error('无效的 content-type.\n' + `期望 application/json 但获取的是 ${contentType}`);
            }
            if (error) {
                console.error(error.message);
                // 消耗响应数据以释放内存
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    const olng = parsedData.lng;
                    const olat = parsedData.lat;
                    //console.log("lng:"+olng);
                    //console.log("lat:"+olat);
                    http.get('http://api.map.baidu.com/geoconv/v1/?coords=' + olng + ',' + olat + '&from=1&to=5&ak=ijFmea7PT5GlBEsq7CbHNSTQALgPV7cZ', (res) => {
                        const {statusCode} = res;
                        const contentType = res.headers['content-type'];
                        let error;
                        if (statusCode !== 200) {
                            error = new Error('请求失败。\n' + `状态码: ${statusCode}`);
                        } else if (!/^application\/json/.test(contentType)) {
                            error = new Error('无效的 content-type.\n' + `期望 application/json 但获取的是 ${contentType}`);
                        }
                        if (error) {
                            console.error(error.message);
                            // 消耗响应数据以释放内存
                            res.resume();
                            return;
                        }
                        res.setEncoding('utf8');
                        let rawData = '';
                        res.on('data', (chunk) => {
                            rawData += chunk;
                        });
                        res.on('end', () => {
                            try {
                                const parsedData = JSON.parse(rawData);
                                const lng = parsedData.result[0].x;
                                const lat = parsedData.result[0].y;

                                MongoClient.connect(url, function (err, db) {
                                    if (err) throw err;
                                    var dbo = db.db("test");
                                    var myobj = {lng: lng, lat: lat, time: thetime};
                                    dbo.collection("historyPoints").insertOne(myobj, function (err) {
                                        if (err) throw err;
                                        console.log("插入数据库成功");
                                        db.close();
                                    });
                                });

                            } catch (e) {
                                console.error(e.message);
                            }
                        });
                    }).on('error', (e) => {
                        console.error(`错误: ${e.message}`);
                    });
                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(`错误: ${e.message}`);
        });
        //console.log(newData);
        // 回发该数据，客户端将收到来自服务端的数据
        sock.write('Received');
    });
    // 为这个socket实例添加一个"close"事件处理函数
    sock.on('close', function (data) {
        console.log('已断开连接');
    });
    sock.on('error', function (err) {
        console.log(err);
    });
}).listen(PORT);

console.log('Server listening on:' + PORT);

function move2(oldStr) {
    var str1 = oldStr.split('');
    str1.splice(4, 1);
    str1.splice(2, 0, '.');
    var str2 = str1.join('');
    return str2;
}

function move3(oldStr) {
    var str1 = oldStr.split('');
    str1.splice(5, 1);
    str1.splice(3, 0, '.');
    var str2 = str1.join('');
    return str2;
}

Date.prototype.pattern = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours() % 24 == 0 ? 24 : this.getHours() % 24, //小时
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    var week = {
        "0": "/u65e5",
        "1": "/u4e00",
        "2": "/u4e8c",
        "3": "/u4e09",
        "4": "/u56db",
        "5": "/u4e94",
        "6": "/u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
