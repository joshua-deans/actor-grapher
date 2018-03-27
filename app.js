var express = require('express');
const bodyParser = require('body-parser');
var flash = require('connect-flash');
var externalFunc = require("./functions/index.js");
var session = require('express-session');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + "/public"));
app.use(session({
    secret: "Anything I want",
    resave: false,
    saveUninitialized: false
}));

// app.use(methodOverride("_method"));
app.use(flash());

app.set("view engine", "ejs");

app.get('/', function(req, res){
    res.render('index', {error: []});
});

app.post('/', function(req, res){
    var name = req.body.actorName.trim();
    var nameSplit = name.split(" ");
    var urls = externalFunc.getUrl(nameSplit);
    externalFunc.getWebData(urls, req, res);
});

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP;

app.listen(port, ip, function(){
    console.log( "Listening on " + ip + ", port " + port )
});