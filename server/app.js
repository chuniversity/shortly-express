const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const cookie = require('./middleware/cookieParser');
const models = require('./models');


const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// loads client to page
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookie);



app.get('/',
  (req, res, next) => {
    console.log('general get request');
    res.render('index');
  });

// route for going to login "endpoint"
app.get('/login', (req, res, next) => {
  console.log('login get request');
  res.render('login');
});

app.post('/login', (req, res, next) => {
  //compare(attempted, password, salt) {
  // logs in as existing user
  // extract user and password from response body
  var name = req.body.username;
  var pass = req.body.password;
  var userObject = { username: name };
  // run users.get to return the rows that match username
  models.Users.get(userObject)
    .then((user) => {
      // userArray = [id, username, password, salt]
      console.log(user);
      // if userArray doesnt exist, then stay on login page (????)
      if (!user) {
        console.log('user array doesnt exist');
        res.redirect(400, '/login');
      } else {
        if (models.Users.compare(pass, user.password, user.salt)) {
          // then if compare returns true (password is correct), redirect to index
          console.log('compare finished running');
          // res.redirect('/');
          res.redirect(200, '/');
        } else {
          // but if compare returns false (password is incorrect), then stay on login page (????)
          res.redirect(400, '/login');
        }
      }
    })
    .catch((err) => {
      console.error('error logging in: ' + err.message);
    });
});
//routers for signup

app.get('/signup', (req, res, next) => {
  console.log('signup get request');
  res.render('signup');
});

app.post('/signup', (req, res, next) => {
  // get data from request body
  // var params = [req.body.]
  var name = req.body.username;
  var options = { username: name };
  models.Users.get(options)
    .then((resultsArray) => { // the data that returns from querying users table with name up above
      var test = resultsArray;
      if (resultsArray) {
        // redirect to signup
        res.redirect('/signup');
      } else {
        // call users.create with it
        models.Users.create(req.body)
          .then((data) => {
            console.log('user successfully created');
            res.redirect('/');
            res.status(201).send(data);
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// routes for app

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
