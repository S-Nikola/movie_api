const express = require('express');
    morgan = require("morgan");
    uuid = require('uuid');
    fs = require('fs'), 
    path = require('path');
    mongoose = require('mongoose');
    Models = require('./models');
    Movies = Models.Movie;
    Users = Models.User;
    app = express();
    bodyParser = require('body-parser');
    bcrypt = require('bcrypt');

// mongoose.connect('mongodb://localhost:27017/BananaFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });


// The code commented out below did not work and UseNewUrlParser and useUnifiedTopology had to be removed to fix it
//mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect(process.env.CONNECTION_URI, () => {
  console.log('Mongo connected')
});

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

const { check, validationResult } = require('express-validator');

const cors = require('cors');

let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'http://testsite.com', 'https://banana-flix.netlify.app'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

// Setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

//Movies JSON
let movies = [
  {
    "MovieID": "1dawr24",
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
    "Username": "Rex",
    "Password": "rexi4",
    "Email": "rex@email.com",
    "Birthday": "07/02/90"
},
{
  "Username": "Floki",
  "Password": "floki4",
  "Email": "test@email.com",
  "Birthday": "01/04/90"
},
{
  "Username": "Mr. Deletable",
  "Password": "delete",
  "Email": "delete@email.com",
  "Birthday": "01/04/90"
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
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
      .then((movies) => {
          res.status(201).json(movies);
      })
      .catch((err) => {
          console.log(err);
          res.status(500).send('Error: ' + err);
      });
});

// READ - Return data about a single movie by title to the user;
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
          res.json(movie);
      })
      .catch((err) => {
          console.log(err);
          res.status(500).send('Error: ' + err);
      });
});

// READ - Return data about the user;
app.get('/profiles/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
      .then((user) => {
          res.json(user);
      })
      .catch((err) => {
          console.log(err);
          res.status(500).send('Error: ' + err);
      });
});


// READ - Return data about a genre (description) by name of genre (e.g., “Thriller”);
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.genreName })
      .then((movie) => {
          res.json(movie.Genre);
      })
      .catch((err) => {
          console.log(err);
          res.status(500).send('Error: ' + err);
      });
});


// READ - Return data about a director (bio, birth year, etc) by name;
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
      .then((movie) => {
          res.json(movie.Director);
      })
      .catch((err) => {
          console.log(err);
          res.status(500).send('Error: ' + err);
      });
});


// Return a list of users
// app.get('/users', (req, res) => {
//   Users.find()
//     .then((users) => {
//       res.status(201).json(users);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });

// Get a user by username
// app.get('/users/:Username', (req, res) => {
//   Users.findOne({ Username: req.params.Username })
//     .then((user) => {
//       res.json(user);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });

/* CREATE - Allow new users to register;*/
app.post('/users', 
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
});


// CREATE - Add a movie to the collection
// app.post('/movies', (req, res) => {
//   Movies.findOne({ Title: req.body.Title })
//     .then((movie) => {
//       if (movie) {
//         return res.status(400).send(req.body.Title + 'already exists');
//       } else {
//         Movies.create({
//             Title: req.body.Title,
//             Description: req.body.Description,
//             Genre: {
//                 Name: req.body.genreName,
//                 Description: req.body.Description
//               },
//               Director:{
//                 Name: req.body.Name,
//                 Bio: req.body.Bio,
//               },
//               ImagePath:req.body.ImageURL,
//               Featured: req.body.Boolean,
//           })
//           .then((movie) =>{res.status(201).json(movie) })
//         .catch((error) => {
//           console.error(error);
//           res.status(500).send('Error: ' + error);
//         })
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).send('Error: ' + error);
//     });
// });

/* UPDATE - Allow users to update their user info (username);
Expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {

  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: Users.hashPassword(req.body.Password), 
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});



// UPDATE - Allow users to add a movie to their list of favorites;
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


// DELETE - Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed);
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});



// DELETE - Allow existing users to deregister (showing only a text that a user email has been removed).
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE - Remove a movie from the collection
// app.delete('/movies/:Title', (req, res) => {
//   Users.findOneAndRemove({ Title: req.params.Title })
//     .then((user) => {
//       if (!user) {
//         res.status(400).send(req.params.Title + ' was not found');
//       } else {
//         res.status(200).send(req.params.Title + ' was deleted.');
//       }
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });


/*ERROR*/
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something is not quite right. Give it another try.");
  });

// Listen
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});