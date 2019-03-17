const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const externalFunc = require("./functions/index.js");
const session = require('express-session');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use("/public", express.static(__dirname + "/public"));
app.use(session({
    secret: "Anything I want",
    resave: false,
    saveUninitialized: false
}));

// app.use(methodOverride("_method"));
app.use(flash());

app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('index', {error: []});
});

app.post('/', (req, res) => {
    let name = req.body.actorName.trim();
    let nameSplit = name.split(" ");
    let urls = externalFunc.getUrl(nameSplit);
    externalFunc.getWebData(urls, req, res);
});

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP;

app.listen(port, ip, () => {
    console.log("Listening on " + ip + ", port " + port)
});