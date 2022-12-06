const express = require('express');
    morgan = require("morgan");
    fs = require('fs'), // import built in node modules fs and path 
    path = require('path');
const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
const bodyParser = require('body-parser');
//   methodOverride = require('method-override');

let topMovies = [
  {
    title: 'Arrival',
    author: 'Denis Villeneuve'
  },
  {
    title: 'The Lord of the Rings: Fellowship of the Ring',
    author: 'Peter Jackson'
  },
  {
    title: 'Before the Rain',
    author: 'Milcho Manchevski'
  },
  {
    title: "Schindler's List",
    director: "Steven Spielberg",
  },
  {
    title: "Forrest Gump",
    director: "Robert Zemeckis",
  },
  {
    title: 'Harry Potter and the Prisoner of Azkaban',
    director: 'Alfonso Cuarón'
  },
  {
    title: "Fight Club",
    director: "David Fincher",
  },
  {
    title: "Inside Llewyn Davis",
    director: "Ethan Coen and Joel Coen",
  },
  {
    title: "Marriage Story",
    director: "Noah Baumbach",
  },
  {
    title: "The Father",
    director: "Florian Zeller",
  }
];

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
// app.use(methodOverride());

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to BananaFlix!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something is not quite right. Please try again later.");
  });

// listen for requests
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});