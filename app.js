var express = require('express');
const bodyParser = require('body-parser');
var methodOverride = require("method-override");
var externalFunc = require("./functions/index.js");
var app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + "/public"));
app.use(methodOverride("_method"));


app.set("view engine", "ejs");

app.get('/', function(req, res){
    res.render('index', {title: "Express"});
});

app.post('/', function(req, res){
    var name = req.body.actorName.trim();
    var nameSplit = name.split(" ");
    var urls = externalFunc.getUrl(nameSplit);
    externalFunc.getWebData(urls, res);
});
//
// app.get('/:firstName-:lastName', function(req, res){
//     res.render('graph', {title: "Express", firstName: firstName, lastName: firstName});
// });

var port = 8888;

app.listen(port, process.env.IP, function(){
    console.log("The Server has started! on port " + port);
});