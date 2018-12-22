var express = require('express');
var router = express.Router();
var mongoose = require('../db/mongoose');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";

/* GET home page. */
/*
router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

router.post('/do',function (req,res,next) {
    var username = req.body.username,
        pwd = req.body.pwd;
    mongoose.findOne({username:username},function(err,docs){
        if(err) return;
        if(!docs){
            return res.end("usererr");
        }
        if(docs.pwd == pwd){
            return res.end("ok");
        }else{
            return res.end("pwderr");
        }
    })
});
router.post('/newuser',function (req,res,next) {
    var newusername = req.body.newusername,
        newpwd1 = req.body.newpwd1,
        newpwd2 = req.body.newpwd2;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        var myobj = { username: newusername, pwd: newpwd1 };
        dbo.collection("users").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("插入成功");
            db.close();
        });
        return res.end("ok");
    });
});
router.get('/getHistoryPoints',function (req,res,next) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("historyPoints").find().toArray(function (err,result) {
            //console.log(result);
            res.send(result);
            res.end("ok");
        });

    });
});
module.exports = router;
