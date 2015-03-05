var fs = require('fs');
var util = require('util');
var Entities = require('html-entities').XmlEntities;
var entities = new Entities();
var request = require('request');
var cheerio = require('cheerio');

var domain = 'http://www.imdb.com';

var url = domain + '/search/title?at=0&certificates=us%3Ag,us%3Apg,us%3Atv_14,us%3Atv_y7&genres=animation&num_votes=400,&title_type=tv_series';


var currentPage = 1;
var rank = 1;



function requestPage(url) {
    //console.log("Page: " + currentPage, url);
    request({
        'url': url,
        headers: {
            'Accept-Language': 'en-US'
        }
    }, function(error, response, html) {

        if (!error) {

            var $ = cheerio.load(html, {
                normalizeWhitespace: true,
                xmlMode: false,
                decodeEntities: false
            });
            if ($('A:contains(\'Next\')').length > 0) {

                $(".detailed").each(function() {
                    var $item = $(this);
                    var id = $item.find('a').attr('href').split('/')[2];
                    var imgo = $item.find('img').attr('src');
                    /*
                    if (imgo.indexOf('.gif') === -1) {

                        var imga = imgo.split('.');
                        var img = imga.splice(0, imga.length - 2).join('.') + '.jpg'; // get full image from cdn
                        console.log(img);
                        var writer = fs.createWriteStream(id + '.jpg');
                        request(img).pipe(writer);
                    }
                    */
                    var year = $item.find('.year_type').text().split(' ')[0].split('(').join('');
                    var title = entities.decode($($item.find('a').get(1)).text());
                    var plot = entities.decode($item.find('.outline').text());
                    var votes = $item.find('.rating.rating-list').first().attr('title').split('(')[1].split(' votes)')[0].split(',').join('');
                    var ytsearch = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(title);
                    var csv = util.format('"%s","%s","%s","%s","%s","%s","%s"',votes, id,title, ytsearch,imgo,year,plot); 
                    console.log(csv); //rank,title,year, plot
                    rank++;

                });

                var nextUrl = domain + $('A:contains(\'Next\')').last().attr('href');

                currentPage++;
                //requestPage(nextUrl);
            } else {
                console.log('Done');
                return;
            }
        } else {
            console.log('Error!', error);
        }
    });
}

requestPage(url);