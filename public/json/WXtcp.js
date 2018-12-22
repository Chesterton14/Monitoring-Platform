var http = require('http');
var fs = require('fs');
var port = 4000;

http.createServer(function(req, res){

    req.on('data', function(data){
        console.log(JSON.parse(data.toString()));
        var thedata = data.toString();
        fs.writeFile('WXtest.json', thedata, function (err) {
            if (err) {
                console.log('err');
            } else {
                console.log('ok');
            }
        })
    });

    req.on('end', function(){
        res.end("end");
    });
}).listen(port);
console.log("server start at port:" + port);