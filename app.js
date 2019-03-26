var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var redis = require("redis");

var app = express();

//Connection for RTG
var client = redis.createClient(10098, "redis://redistogo:ceaac8d9d98c8e12e91816b17b0fa213@barb.redistogo.com");

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

// Original Connection

//var client = redis.createClient();

//client.on("connect", function(){
   // console.log("Redis server is connected.");
//});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req, res) {
    client.lrange("scorpions", 0, -1, function(err, reply) {
        client.hgetall("call", function(err, call){
            res.render("index", {
                scorpions: reply,
                call: call
        });
        });
    });
});

app.post("/scorpion/add", function(req, res) {
    var scorpion = req.body.scorpion;
    client.rpush("scorpions", scorpion, function(err, reply){
        if(err){
            console.log(err);
        }
        console.log("Scorpion Added!");
        res.redirect("/");
    });
});

app.post("/scorpion/delete", function(req, res){
    var scorpionsToDel = req.body.scorpions;
    client.lrange("scorpions", 0, -1, function(err, scorpions){
        for(var i = 0; i < scorpions.length; i++){
            if(scorpionsToDel.indexOf(scorpions[i]) > -1) {
                client.lrem("scorpions", 0, scorpions[i], function(){
                    if(err){
                        console.log(err);
                    }
                });
            }
        }
        res.redirect("/");
    });
});

app.post('/call/add', function(req, res){

    var newCall = {};


    newCall.name = req.body.name;

    newCall.company = req.body.company;

    newCall.phone = req.body.phone;

    newCall.time = req.body.time;


    client.hmset('call', ['name', newCall.name, 'company', newCall.company, 'phone', newCall.phone, 'time', newCall.time], function(err, reply){

        if(err){

            console.log(err);

        }

        console.log(reply);

        res.redirect('/');

    });

});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The lister is listing."); 
});

module.exports = app;