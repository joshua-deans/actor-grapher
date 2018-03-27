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
    saveUnitialized: false
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

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(server_port, server_ip_address, function(){
    console.log("The Server has started! on port ");
});