const request = require('request');
const cheerio = require('cheerio');
const regression = require('regression');
const Promise = require('promise');
let funcObj = {};

const removeDashes = (name, i) => {
    name[i] = name[i].toLowerCase();
    if (name[i].includes("-")) {
        name[i].replace("-", "");
    }
};

funcObj.getUrl = name => {
    for (let i = 0; i < name.length; i++) {
        removeDashes(name, i);
    }
    if (name[1] === "dicaprio") {
        name[1] = "di";
        name[2] = "caprio";
    }
    let actorUrl1 = name.join("_");
    while (actorUrl1.includes(".")) {
        actorUrl1 = actorUrl1.replace(".", "");
    }
    let actorUrl2 = actorUrl1.replace("_", "-");

    actorUrl1 = 'https://www.rottentomatoes.com/celebrity/' + actorUrl1;
    actorUrl2 = 'https://www.rottentomatoes.com/celebrity/' + actorUrl2;

    name = name.join(" ");

    return [actorUrl1, actorUrl2, name];
};

funcObj.getWebData = (urlArr, req, res) => {
    let url = urlArr[0];
    let name = urlArr[2];
    // scrape the first url
    webScrape(url, name, urlArr, req, res);
};

const webScrape = (url, name, urlArr, req, res) => {
    let data = [];
    request(url, function (error, response, html) {
        // First we'll check to make sure no errors occurred when making the request
        if (!error) {
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
            const $ = cheerio.load(html);
            // Finally, we'll define the variables we're going to capture
            const actorName = $('.celebrity-bio__name-wrap').children().text();

            data = cheerioMethod($, data);
            // if data is not empty
            if (data.length > 0) {
                const linearData = getLinearRegression(data);
                return res.render('graph', {actorName: actorName, dataArr: data, linearData: linearData});
            }
            else {
                // in case of no data being returned
                if (url === urlArr[1]) {
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
            if (url === urlArr[1]) {
                console.log("An error occurred when finding " + name);
                req.flash("error", "An error occurred when finding " + name);
                return res.render("index", {error: req.flash("error")});
            }
            webScrape(urlArr[1], name, urlArr, req, res);
        }
    });
};

const createMovieObj = (searchData, $, data) => {
    searchData.each(function (i, elem) {
        let movieObj = {};
        const score = $(this).attr("data-rating");
        const hasRating = !($(this).find(".tMeterIcon").hasClass('noRating'));
        if (score && hasRating) {
            movieObj.y = Number(score);
            movieObj.title = $(this).attr("data-title");
            movieObj.link = "http://www.rottentomatoes.com" + $(this).children("td").children("a").attr('href');
            movieObj.year = $(this).children().eq(-1).text().trim();
            data.push(movieObj);
        }
    });
};

const cheerioMethod = ($, data) => {
    const searchData = $('.filmography__table tbody').children();
    console.log(searchData)
    // Let's store the data we filter into a variable so we can easily see what's going on.
    // Go through each film and collect data
    createMovieObj(searchData, $, data);
    // Reverse data so it is in chronological order
    data = data.reverse();
    // Add film # to the data
    for (let i = 0; i < data.length; i++) {
        data[i].x = i + 1;
    };

    return data;
};

const getLinearRegression = data => {
    let resultArr = [];
    data.forEach(function (elem) {
        resultArr.push([elem.x, elem.y]);
    });
    let result = regression.linear(resultArr);
    // min/max decimation for performance improvement
    result = [result.points[0], result.points[result.points.length - 1]];
    return result;
};

module.exports = funcObj;