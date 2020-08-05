//These are the Dependencies
var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");

//these are the Scraping Tools
var axios = require("axios");
var cheerio = require("cheerio");

//Here we require all of the models
var db = require("./models");

//Initializing the Port
var PORT = process.env.PORT || 3000;

//Initializing Express
var app = express();

