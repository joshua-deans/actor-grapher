const request = require('request');
const cheerio = require('cheerio');
const regression = require('regression');
const Promise = require('promise');
var funcObj = {};

funcObj.getUrl = function(name){
    for (var i = 0; i < name.length; i++){
        name[i] = name[i].toLowerCase();
        if (name[i].includes("-")){
            name[i].replace("-", "");
        }
    }
    if (name[1] === "dicaprio"){
        name[1] = "di";
        name[2] = "caprio";
    }
    var actorUrl1 = name.join("_");
    while (actorUrl1.includes(".")){
        actorUrl1 = actorUrl1.replace(".","");
    }
    var actorUrl2 = actorUrl1.replace("_", "-");

    actorUrl1 = 'https://www.rottentomatoes.com/celebrity/' + actorUrl1;
    actorUrl2 = 'https://www.rottentomatoes.com/celebrity/' + actorUrl2;

    name = name.join(" ");

    return [actorUrl1, actorUrl2, name];
};

funcObj.getWebData = function(urlArr, req, res) {
    var url = urlArr[0];
    var name = urlArr[2];
    // scrape the first url
    webScrape(url, name, urlArr, req, res);
};

function webScrape(url, name, urlArr, req, res){
    var data = [];
    request(url, function(error, response, html){
        // First we'll check to make sure no errors occurred when making the request
        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
            var $ = cheerio.load(html);
            // Finally, we'll define the variables we're going to capture
            var actorName = $('.celeb_name').children().text();

            data = cheerioMethod($, data);

            // if data is not empty
            if (data.length > 0) {
                var linearData = getLinearRegression(data);
                res.render('graph', {actorName: actorName, dataArr: data, linearData: linearData});
            }
            else {
                // in case of no data being returned
                if (url === urlArr[1]){
                    console.log(name + " was not found on Rotten Tomatoes");
                    req.flash("error", "\"" + name + "\" was not found on Rotten Tomatoes");
                    return res.render("index", {error: req.flash("error")});
                }
                else {
                    webScrape(urlArr[1], name, urlArr, req, res);
                }
            }
        }
        else {
            if (url === urlArr[1]){
                console.log("An error occured when finding " + name);
                req.flash("error", "An error occurred when finding " + name);
                return res.render("index", {error: req.flash("error")});
            }
            else {
                webScrape(urlArr[1], name, urlArr, req, res);
            }
        }
    });
}

function cheerioMethod($, data){
    $('#filmographyTbl').filter(function(){
        // Let's store the data we filter into a variable so we can easily see what's going on.
        var searchData = $(this).children("tbody").children();
        // Go through each film and collect data
        searchData.each(function(i, elem) {
            var movieObj = {};
            var score = $(this).children("td").children(".tMeterIcon").children(".tMeterScore").text();
            if (score && score !== "No Score Yet") {
                movieObj.y = Number(score.slice(0, -1));
                movieObj.title = $(this).children("td").children("a").text();
                movieObj.link =  "http://www.rottentomatoes.com" + $(this).children("td").children("a").attr('href');
                movieObj.year = $(this).children().eq(-1).text();
                data.push(movieObj);
            }
        });
        // Reverse data so it is in chronological order
        data = data.reverse();
        // Add film # to the data
        for (var i = 0; i<data.length; i++){
            data[i].x = i+1;
        }
    });

    return data;
}

function getLinearRegression(data){
    var resultArr = [];
    data.forEach(function(elem){
        resultArr.push([elem.x, elem.y]);
    });
    var result = regression.linear(resultArr);
    // min/max decimation for performance improvement
    result = [result.points[0], result.points[result.points.length-1]];
    return result;
}

module.exports = funcObj;