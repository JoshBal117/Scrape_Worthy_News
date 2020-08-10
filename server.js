//These are the Dependencies
var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");
var path = require("path");

//these are the Scraping Tools
var axios = require("axios");
var cheerio = require("cheerio");

//Here we require all of the models
var db = require("./models");

//Initializing the Port
var PORT = process.env.PORT || 3000;

//Initializing Express
var app = express();



app.use(logger("dev"));

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use(express.static("public"));

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

var MANDODB_URI = process.env.MONGODB-URI || "mongodb://localhost/mongotheonion";

mongoose.connect(MONGODB_URI);

/*
The following is the Routes
*/

app.get("/", function(req, res) {
    db.Article.find({"saved": false}).then(function(result) {
        var hbsObject = { articles: result};
        res.render("index",hbsObject);
    }).catch(function(err){ res.json(err) });
});

app.get("/scraped", function(req, res) {
    axios.get("http:/www.theonion.com/").then(function(response) {
        var $ = cheerio.load(response.data);
    
        $("h2.entry-title").each(function(i, element) {
            var result = {};

            result.title = $(element).text();

            result.title = $(element).children("a").attr("href");

            result.summary = $(element).siblings(".entry-summary").text().trim();

            db.Article.create(result)
            .then(function(dbArticle){
                console.log(dbArticle);
            })
            .catch(function(err){
                console.log(err);
            });
        });
           
    });
    res.send("Scrape Complete");
    });


app.get("saved", function(req, res) {
    db.Article.find({"saved": true})
        .populate("notes")
        .then(function(result){
            var hbsObject = { articles: results };
            res.render("saved", hbsObject);
        }).catch(function(err){ res.join(err) });
});


app.post("/saved/:id", function(req, res){
    db.Article.findOneAndUpdate({"_id": req.params.id}, {"$set":{"saved": true}})
    .then(function(result){
        res.json(result);
    }).catch(function(err){ res.json(err) });
})

app.post("/delete/:id", function(req, res) {
    db.Article.findOneAndUpdate({"_id":req.params.id}, {"$set": {"saved": false}})
    .then(function(result){
        res.json(result);
    }).catch(function(err) {
        res.json(err)  
    });
});

app.get("/articles/: id", function(req, res){
    db.Article.findOne({"_id": req.params.id})
        .populate("notes")
        .then(function(result) {
            res.json(result);
        }).catch(function(err) {
            res.json(err);
        });
});

app.post("articles/:id", function(req, res) {
    db.Note.create(req.body)
      .then(function(dbNote) {
          return(db.Article.findOneAndUpdate({"_id": req.params.id}, {"notes": dbNote._id}, {new: true}));
      })
      .then(function(dbArticle){
          res.json(dbArticle);
      })
      .catch(function(err){
          res.json(err);
      });
});

app.post("/deleteNote/:id", function(req, res) {
    db.Note.remove({"_id": req.params.id})
      .then(function(result){
          res.json(result);
      })
      .catch(function(err) {
          res.json(err)
      });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT);
});