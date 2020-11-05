'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

// Environment variables
require('dotenv').config();

//Create Port
const PORT = process.env.PORT || 3000;

// Setup application
const app = express();
const client = new pg.Client(process.env.DATABASE_URL)
app.use(express.static('./public')); // where server wil look for pages
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


// Routes
app.get('/searches/new', searchHandler);
app.get('/error', errorHandler);
app.get('/searches', searchSubmitHandler);
app.post('/searches', searchSubmitHandler);
app.get('/', homeHandler);


// Route Handlers
function searchHandler(req, res) {
    res.status(200).render('pages/searches/new');
}

function errorHandler(req, res, error) {
    res.status(500).render('pages/error');
}

function homeHandler(req, res) {
    res.status(200).render('pages/index');
}

function searchSubmitHandler(req, res) {
    const API = "https://www.googleapis.com/books/v1/volumes";
    const queryParams = {
        q: 'in' + req.body.search_type + ':' + req.body.search,
        maxResults: 10
    };

    superagent.get(API)
        .query(queryParams)
        .then(books => {
            let bookArr = books.body.items.map(book => new Book(book));
            console.log(books.body.items[0].volumeInfo);
            console.log(books.body.items[1].volumeInfo);
            res.status(200).render('pages/searches/show', { books: bookArr });
        })
        .catch(error => {
            errorHandler(req, res, error);
        });
}

// Constructors
function Book(book) {
    this.title = (book.volumeInfo.title) ? book.volumeInfo.title : 'No Title Avaliable';
    this.author = (book.volumeInfo.authors) ? book.volumeInfo.authors : 'No Author Avaliable';
    this.desc = (book.volumeInfo.description) ? book.volumeInfo.description : 'No Description Avaliable';
    this.img = (book.volumeInfo.imageLinks) ? book.volumeInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.isbn = (book.volumeInfo.industryIdentifiers[0].identifier) ? book.volumeInfo.industryIdentifiers[0].identifier : 'ISBN NOT found';
}

// Connect to DB
client.connect();
// Start the server
app.listen(PORT, () => console.log(`Server now listening on port ${PORT}.`));

