'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

//Create Port
const PORT = process.env.PORT || 3000;

// Setup application
const app = express();
app.use(express.static('./public')); // where server wil look for pages
app.use(cors());
app.use(express.urlencoded({ extended : true }));
app.set('view engine', 'ejs');


// Routes
app.get('/searches/new', searchHandler);
app.get('/error', errorHandler);
app.post('/searches', searchSubmitHandler);
app.get('/', homeHandler);


// Route Handlers
function searchHandler(req, res) {
    res.status(200).render('pages/searches/new');
};

function errorHandler(req, res){
    res.status(200).render('pages/error');
};

function homeHandler(req,res){
    res.status(200).render('pages/index');
};

function searchSubmitHandler() {
    const URL = "https://www.googleapis.com/books/v1/volumes";
    const queryParams = {

    };
    superagent.get();

    res.status(200).render('pages/searches');
};

// Constructors
function Book(book) {
    this.title = book.volumeInfo.title;
    this.author = book.volumeInfo.authors;
    this.desc = book.volumeInfo.description;
    this.img = book.volumeInfo.imageLinks.smallThumbnail || 'https://i.imgur.com/J5LVHEL.jpg';
};

// Start the server
app.listen(PORT, () => console.log(`Server now listening on port ${PORT}.`));