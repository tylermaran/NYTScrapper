var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
var PORT = 5000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to 
// use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/week18Populater", {
  useMongoClient: true
});

// Routes

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
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
          
          // Only pulling results with full detail
          var filteredResults = [];
          for (var i = 0; i < results.length; i++) {
            if (results[i].byline != "") {
              filteredResults.push(results[i]);
            }
          }
          updateDB(filteredResults);
        }
      
      scrapeNYT();

      // Create a new Article using the `result` object built from scraping
      function updateDB(filteredResults) {
        db.Article.create(filteredResults)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
      }

    

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");

});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds 
  // the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, 
      // send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        { _id: req.params.id }, 
        { note: dbNote._id }, 
        { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen((process.env.PORT || 5000), function() {
  console.log("App running on port " + PORT + "!");
});
