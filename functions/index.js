const request = require('request');
const cheerio = require('cheerio');
const regression = require('regression');
var funcObj = {};

funcObj.getUrl = function(name){
    for (var i = 0; i < name.length; i++){
        name[i] = name[i].toLowerCase();
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
    return [actorUrl1, actorUrl2, name];
};

funcObj.getWebData = function(urlArr, res, index){
    var url = urlArr[0];
    var name = urlArr[2];
    // webscrape the first url
    var attempt1 = webScrape(url, name, res);
    url = urlArr[1];
    var attempt2 = webScrape(url, name, res);
    // return res.redirect("back");
};

function webScrape(url, name, res){
    var data = [];
    request(url, function(error, response, html){
        // First we'll check to make sure no errors occurred when making the request
        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
            var $ = cheerio.load(html);
            // Finally, we'll define the variables we're going to capture
            var actorName;
            var movieCount = 0;

            actorName = $('.celeb_name').children().text();

            $('#filmographyTbl').filter(function(){
                // Let's store the data we filter into a variable so we can easily see what's going on.
                var searchData = $(this).children("tbody").children();
                // go through each film and collect data
                searchData.each(function(i, elem) {
                    var movieObj = {};
                    var score = $(this).children("td").children(".tMeterIcon").children(".tMeterScore").text();
                    if (score && score !== "No Score Yet") {
                        movieObj.y = Number(score.slice(0, -1));
                        movieObj.title = $(this).children("td").children("a").text();
                        movieObj.link =  "www.rottentomatoes.com" + $(this).children("td").children("a").attr('href');
                        movieObj.year = $(this).children().eq(-1).text();
                        movieCount++;
                        data.push(movieObj);
                    }
                });
                data = data.reverse();
                for (var i = 0; i<movieCount; i++){
                    data[i].x = i+1;
                }
            });
            if (data[0]) {
                var linearData = getLinearRegression(data);
                res.render('graph', {actorName: actorName, dataArr: data, linearData: linearData.points});
            }
            else {
                return -1;
            }
        }
        else {
            return -1;
        }
    });
}

function getLinearRegression(data){
    var resultArr = [];
    data.forEach(function(elem){
        resultArr.push([elem.x, elem.y]);
    });
    const result = regression.linear(resultArr);
    return result;
}

module.exports = funcObj;