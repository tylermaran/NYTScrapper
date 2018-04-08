// Require cheerio and Request
var cheerio = require("cheerio");
var request = require("request");

function scrapeNYT() {

  // First, tell the console what server.js is doing
  console.log("Pulling NYT articles and logging them to Mongo Database")

  // Make a request to front page of NYT, and return the html
  request("https://www.nytimes.com/", function (error, response, html) {

      // Load the HTML into cheerio and save it to a variable
      // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
      var $ = cheerio.load(html);

      // An empty array to save the data that we'll scrape
      var results = [];

      // With cheerio, find each h2-tag with the "story-heading" class
      // (i: iterator. element: the current element)
      $("h2.story-heading").each(function (i, element) {

        // Save the text of the element in a "title" variable
        var title = $(element).text();

        // In the currently selected element, look at its child elements (i.e., its a-tags),
        // then save the values for any "href" attributes that the child elements may have

        var link = $(element).children().attr("href");

        var summary = $(element).siblings(".summary").text();
        var byline = $(element).siblings(".byline").text();
        
        // Save these results in an object that we'll push into the results array we defined earlier
        results.push({
          title: title.trim(),
          link: link,
          summary: summary.trim(),
          byline: byline.trim()
        });
        // Call sorting function and pass results
        sortArticles(results);
      });
    });
  }

  // Log the results once you've looped through each of the elements found with cheerio
  function sortArticles(results) {
    console.log("-------------------------------------------------");

    var filteredResults = [];
    for (var i = 0; i < results.length; i++) {
      if (results[i].byline != "") {
        filteredResults.push(results[i]);
        // do nothing. This is bad formatting
      }
    }
    console.log("At least pretend to work");
    console.log(filteredResults);

    return filteredResults;
  }

scrapeNYT();