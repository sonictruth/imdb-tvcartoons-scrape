var fs = require('fs');
var util = require('util');
var Entities = require('html-entities').XmlEntities;
var entities = new Entities();
var request = require('request');
var cheerio = require('cheerio');

var domain = 'http://www.imdb.com';

var url = domain + '/search/title?genres=animation&title_type=tv_series&num_votes=1000,&certificates=us:tv_g,us:tv_pg,us:tv_14,us:tv_y7,us:g,us:pg,us:14,us:y7';


var currentPage = 1;
var rank = 1;



function requestPage(url) {
    //console.log("Page: " + currentPage, url);
    request({
        'url': url,
        headers: {
            'Accept-Language': 'en-US'
        }
    }, function (error, response, html) {

        if (!error) {

            var $ = cheerio.load(html, {
                normalizeWhitespace: true,
                xmlMode: false,
                decodeEntities: false
            });


            $(".detailed").each(function () {
                var $item = $(this);
                var id = $item.find('a').attr('href').split('/')[2];
                var imgo = $item.find('img').attr('src');
                var hide = false;
                
                if (imgo.indexOf('.gif') === -1) {
		    /*
                    var imga = imgo.split('.');
                    var img = imga.splice(0, imga.length - 2).join('.') + '.jpg'; // get full image from cdn
                    console.log(img);
                    var writer = fs.createWriteStream(id + '.jpg');
                    request(img).pipe(writer);
		    */
                } else {
                    hide = true;
                }
                
                var year = $item.find('.year_type').text().split(' ')[0].split('(').join('');
                var title = entities.decode($($item.find('a').get(1)).text()).split('"').join('""');
                var plot = entities.decode($item.find('.outline').text()).split('"').join('""'); // scape quotes csv
                var votes = $item.find('.rating.rating-list').first().attr('title').split('(')[1].split(' votes)')[0].split(',').join('');
                var ytsearch = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(title + ' theme song');
                var csv = util.format('"%s","%s","%s","%s","[PUT YT HERE]","%s","%s","%s"', votes, id, title, ytsearch, imgo, year, plot);
                if(!hide){
                    console.log(csv); //rank,title,year, plot
                }
                rank++;

            });

            var nextUrl = domain + $('A:contains(\'Next\')').last().attr('href');

            currentPage++;



            if ($('A:contains(\'Next\')').length > 0) {
                requestPage(nextUrl);
            } else {
                //console.log('Done');
                return;
            }
        } else {
            console.log('Error!', error);
        }
    });
}

requestPage(url);