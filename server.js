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
const client = new pg.Client(process.env.DATABASE_URL);
app.use(express.static('./public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Routes
app.get('/searches/new', searchHandler);
app.get('/error', errorHandler);
app.get('/searches', searchSubmitHandler);
app.post('/searches', searchSubmitHandler);
app.get('/', homeHandler);
app.get('/books/:id',singleHandler);
app.post('/add',addHandler);

// Route Handlers
function addHandler (req,res) {
    const sqlPlace = `INSERT INTO books (author, title, isbn, img, description) VALUES ($1,$2,$3,$4,$5) returning *`;
    const params = [req.body.author,req.body.title,req.body.isbn,req.body.img,req.body.description];
    client.query(sqlPlace,params)
    .then (book => res.status(200).redirect(`/books/${book.rows[0].id}`))
    .catch(error => errorHandler(req, res, error));
}

function singleHandler(req,res){
    const bookId = req.params.id;
    const sqlGet = `SELECT * FROM books where id= $1`;
    client.query(sqlGet,[bookId])
    .then(books => res.status(200).render(`pages/searches/details`, { books : books.rows}))
    .catch(error => errorHandler(req, res, error));
}

function searchHandler(req, res) {
    res.status(200).render('pages/searches/new');
}

function errorHandler(req, res, error) {
    console.log(error);
    res.status(500).render('pages/error');
}

function homeHandler(req, res) {
    const sqlGet = ` SELECT * FROM books`;
    client.query(sqlGet)
        .then(saved => {
                res.status(200).render('pages/index', { saved: saved.rows });
        })
        .catch(error => errorHandler(req, res, error));
}

function searchSubmitHandler(req, res) {
    const API = "https://www.googleapis.com/books/v1/volumes";
    const queryParams = {q: 'in' + req.body.search_type + ':' + req.body.search};

    superagent.get(API)
        .query(queryParams)
        .then(books => {
            let bookArr = books.body.items.map(book => new Book(book.volumeInfo));
            res.status(200).render('pages/searches/show', { books: bookArr });
        })
        .catch(error => errorHandler(req, res, error));
}

// Constructors
function Book(book) {
    this.title = book.title || 'No Title Avaliable';
    this.author = book.authors || 'No Author Avaliable';
    this.description = book.description || 'No Description Avaliable';
    this.img = (book.imageLinks) ? book.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.isbn = (book.industryIdentifiers) ? book.industryIdentifiers[0].identifier : 'ISBN NOT found';
}

// Connect to DB & start the server
client.connect()
    .then(() => app.listen(PORT, () => console.log(`Server now listening on port ${PORT}.`)))
    .catch(err => console.log('ERROR:', err));