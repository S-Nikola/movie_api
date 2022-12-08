const express = require('express');
    morgan = require("morgan");
    uuid = require('uuid');
    fs = require('fs'), 
    path = require('path');

const app = express();
const bodyParser = require('body-parser');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

// Setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

//Movies JSON
let movies = [
  {
    "Title": "Arrival",
    "Description": "A linguist is recruited by the military to assist in translating alien communications.",
    "Genre": {
      "Name": "Sci-Fi",
      "Description":"Science fiction typically deals with imaginative and futuristic concepts such as advanced science and technology."
    },
    "Director":{
      "Name":"Denis Villeneuve",
      "Bio":"Denis Villeneuve is a Canadian filmmaker.",
      "Birth":"1967",
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/en/d/df/Arrival%2C_Movie_Poster.jpg",
    "Featured": false
  },
  {
    "Title": "The Lord of the Rings: Fellowship of the Ring",
    "Description": "A young hobbit, Frodo, who has found the One Ring that belongs to the Dark Lord Sauron, begins his journey with eight companions to Mount Doom, the only place where it can be destroyed.",
    "Genre": {
      "Name": "Fantasy",
      "Description":"Fantasy movies are films with fantastic themes, usually magic, supernatural events, mythology, folklore, etc."
    },
    "Director":{
      "Name":"Peter Jackson",
      "Bio":"Peter Jackson is a filmmaker from New Zealand.",
      "Birth":"1961",
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/en/8/8a/The_Lord_of_the_Rings_The_Fellowship_of_the_Ring_%282001%29.jpg",
    "Featured": false
  },
  {
    "Title": "Before the Rain",
    "Description": "A monk who has taken a vow of silence helps an Albanian girl who is in danger.",
    "Genre": {
      "Name": "Drama",
      "Description":"Drama film is a genre that relies on the emotional and relational development of realistic characters."
    },
    "Director":{
      "Name":"Milcho Manchevski",
      "Bio":"Milcho Manchevski is a Macedonian filmmaker.",
      "Birth":"1959",
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Beforetherain.jpg/220px-Beforetherain.jpg",
    "Featured": false
  },
  {
    "Title": "Schindler's List",
    "Description": "Oskar Schindler, a German industrialist and member of the Nazi party, tries to save his Jewish employees.",
    "Genre": {
      "Name": "Historical-drama",
      "Description":"A historical drama is a work set in a particular past-time period."
    },
    "Director":{
      "Name":"Steven Spielberg",
      "Bio":"Steven Spielberg is an American filmmaker.",
      "Birth":"1949",
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/en/3/38/Schindler%27s_List_movie.jpg",
    "Featured": false
  },
  {
    "Title": "Forrest Gump",
    "Description": "Forrest, a man with low IQ, recounts the early years of his life when he found himself in the middle of key historical events.",
    "Genre": {
      "Name": "Comedy Drama",
      "Description":"Comedy Drama is a genre that explores the emotional and comedic undertones of life."
    },
    "Director":{
      "Name":"Robert Zemeckis",
      "Bio":"Robert Zemeckis is an American filmmaker.",
      "Birth":"1952",
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Forrest_Gump_poster.jpg/220px-Forrest_Gump_poster.jpg",
    "Featured": false
  },
  {
    "Title": "Fight Club",
    "Description": "Unhappy with his capitalistic lifestyle, a white-collared insomniac forms an underground fight club with Tyler, a careless soap salesman.",
    "Genre": {
      "Name": "Thriller",
      "Description":"Thriller is a genre of fiction, having numerous, often overlapping subgenres, characterized by heightened feelings of suspense"
    },
    "Director":{
      "Name":"David Fincher",
      "Bio":"David Fincher is an American filmmaker.",
      "Birth":"1962",
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/en/f/fc/Fight_Club_poster.jpg",
    "Featured": false
  },
  {
    "Title": "Harry Potter and the Prisoner of Azkaban",
    "Description": "Harry, Ron and Hermoine return to Hogwarts just as they learn about Sirius Black and his plans to kill Harry.",
    "Genre": {
      "Name": "Fantasy",
      "Description":"Fantasy movies are films with fantastic themes, usually magic, supernatural events, mythology, folklore, etc."
    },
    "Director":{
      "Name":"Alfonso Cuarón",
      "Bio":"Alfonso Cuarón is a Mexican filmmaker.",
      "Birth":"1961",
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/en/thumb/b/bc/Prisoner_of_azkaban_UK_poster.jpg/220px-Prisoner_of_azkaban_UK_poster.jpg",
    "Featured": false
  },
  {
    "Title": "Inside Llewyn Davis",
    "Description": "Llewyn Davis is a folk singer, struggling to maintain his artistic independence against the commercial needs of the music industry.",
    "Genre": {
      "Name": "Drama",
      "Description":"Drama film is a genre that relies on the emotional and relational development of realistic characters."
    },
    "Director":{
      "Name":"Ethan Coen and Joel Coen",
      "Bio":"Ethan Coen and Joel Coen are Jewish-American filmmakers.",
      "Birth":"1957 and 1954",
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/en/d/df/Inside_Llewyn_Davis_Poster.jpg",
    "Featured": false
  },
  {
    "Title": "Marriage Story",
    "Description": "A stage director and his actor wife struggle through a gruelling, coast-to-coast divorce that pushes them to their personal and creative extremes.",
    "Genre": {
      "Name": "Drama",
      "Description":"Drama film is a genre that relies on the emotional and relational development of realistic characters."
    },
    "Director":{
      "Name":"Noah Baumbach",
      "Bio":"Noah Baumbach is a Jewish-American filmmaker.",
      "Birth":"1969",
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/en/5/55/MarriageStoryPoster.png",
    "Featured": false
  },
  {
    "Title": "The Father",
    "Description": "A man refuses all assistance from his daughter as he ages. As he tries to make sense of his changing circumstances, he begins to doubt his loved ones, his own mind and even the fabric of his reality.",
    "Genre": {
      "Name": "Drama",
      "Description":"Drama film is a genre that relies on the emotional and relational development of realistic characters."
    },
    "Director":{
      "Name":"Florian Zeller",
      "Bio":"Florian Zeller is a French filmmaker.",
      "Birth":"1979",
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/en/thumb/a/ab/The_Father_2020_poster.jpg/220px-The_Father_2020_poster.jpg",
    "Featured": false
  }
];

// Users JSON
let users = [
  {
    "id": "1",
    "name": "Rex",
    "favoriteMovies": ["Lord of the Rings"]
},
  {
    "id": "2",
    "name": "Floki",
    "favoriteMovies": ["Star Wars"]
},
{
  "id": "3",
  "name": "Mr. Deletable",
  "favoriteMovies": []
}
];

// Basic GET requests
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

// READ - Return a list of all movies to the user;
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// READ - Return data about a single movie by title to the user;
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title)
  
  if (movie) {
    res.status(200).json(movie);
  } else { 
    res.status(400).send('no such movie')
  }
});

// READ - Return data about a genre (description) by name of genre (e.g., “Thriller”);
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else { 
    res.status(400).send('no such genre')
  }
});

// READ - Return data about a director (bio, birth year, etc) by name;
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  } else { 
    res.status(400).send('no such director')
  }
});

// CREATE - Allow new users to register;
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('users need names')
  }
})

// UPDATE - Allow users to update their user info (username);
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user =>user.id == id);
  
  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }
})

// UPDATE - Allow users to add a movie to their list of favorites (showing only a text that a movie has been added);
app.put('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user =>user.id == id);
  
  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

// DELETE - Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed);
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user =>user.id == id);
  
  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

// DELETE - Allow existing users to deregister (showing only a text that a user email has been removed).
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id);
  
  if (user) {
    users= users.filter( user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }
})

// ERROR
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something is not quite right. Give it another try.");
  });

// Listen
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});