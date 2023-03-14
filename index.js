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

/**
 * Connects to MongoDB
 */
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

/**
 * Allow access only to specific origins
 */
let allowedOrigins = [
  'http://localhost:8080', 
  'http://localhost:1234', 
  'http://testsite.com', 
  'https://banana-flix.netlify.app', 
  'http://localhost:4200',
  'https://s-nikola.github.io'];

/**
 * Manages the allowedOrigins and corresponding responses
 */
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

// Sets up the logger
app.use(morgan('combined', {stream: accessLogStream}));

// CREATE

/** 
 * Registration
 * POST new user if a matching user is not found.
 * Perform checks on Username, Password and Email fields
 * Hash the user's password
 * @name registerUser
 * @kind function
 * @returns new user object
*/
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


// READ get-requests

/** 
 * get index.html file at endpoint "/"
*/
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

/** 
 * get documentation.html file at endpoint "/"
*/
app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

/**
 * GET a list of all movies
 * request: bearer token
 * @name getAllMovies
 * @kind function
 * @requires passport
 * @returns An array of objects containing movie information
 */
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

/**
 * Get data about a single movie by title;
 * @name getMovie
 * @kind function
 * @param {string} Title
 * @requires passport
 * @returns An objects containing information about a single movie
 */
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

/**
 * Get data about the user
 * @name getUser
 * @kind function
 * @param {string} Username
 * @requires passport
 * @returns An object containing information about the user
 */
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

/**
 * Get data about a genre
 * @name getGenre
 * @kind function
 * @param {string} Name of the required genre
 * @requires passport
 * @returns An object containing information about a genre
 */
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

/**
 * Get data about a director (bio, birth year, etc) by name;
 * @name getDirector
 * @kind function
 * @param {string} Name of the required director
 * @requires passport
 * @returns An object containing information about a director 
 */
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

/**
 * UPDATE - Allow users to update their user info (username);
 * Expect JSON in this format: {Username: String (required), Password: String (required), Email: String (required), Birthday: Date}
 * @name editUser
 * @kind function
 * @param {string} Username
 * @requires passport
 * @returns An object containing the user's updated information
 */
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



/**
 * UPDATE user's list of favorites by enabling them to add a movie to their list (array);
 * @name addFavoriteMovie
 * @kind function
 * @param {string} Username user's Username
 * @param {string} MovieID id of the movie
 * @requires passport
 * @returns the updated user object with the new favorite movie added to the FavoriteMovies array 
 */
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


/**
 * DELETE a movie from user's list of favorites
 * requires bearer token
 * @name removeFavoriteMovie
 * @kind function
 * @param {string} Username user's Username
 * @param {string} MovieID movie's ID
 * @requires passport
 * @returns the updated user object with the removed favorite movie from the FavoriteMovies array
 */
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



/**
 * DELETE user
 * @name deleteUser
 * @kind function
 * @param {string} Username user's Username
 * @requires passport
 * @returns A text message indicating whether the user was successfully deregistered 
 */
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


/**
 * ERROR handling
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something is not quite right. Give it another try.");
  });

/**
 * Function listening to port
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});