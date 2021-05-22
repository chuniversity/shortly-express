const models = require('../models');
const Promise = require('bluebird');

// next just means "done"
module.exports.createSession = (req, res, next) => {
  //req.cookies should just be cookieObj from cookieParser
  // if no cookies, generate a session with a unique hash
  if ((req.cookies === undefined) || Object.keys(req.cookies).length === 0) {
    console.log('there are no cookies on the request');
    models.Sessions.create().
      then((data) => {
        var options = { id: data.insertId };
        return models.Sessions.get(options);
      })
      .then(({ hash }) => {
        // use this unique hash to set cookie on response header
        req.session = { hash };
        res.cookie('shortlyid', hash);
        next();
      })
      .catch((err) => {
        console.error('error making session:' + err.message);
      });
  } else {
    console.log('there are cookies on the request');
    // if there are cookies,
    // look for session in sessions database that corresponds to it (will be using shortlyid for comparison)
    var hash = req.cookies.shortlyid;
    models.Sessions.get({ hash })
      .then((sessionData) => {
        if (sessionData !== undefined) {
          req.session = sessionData;
        } else {
          models.Sessions.create()
            .then(({ hash }) => {
              req.session = { hash };
              res.cookie('shortlyid', hash);
              next();
            });
        }
        next();
      })
      .catch(err => {
        console.error('error comparing cookies: ' + err.message);
      });

  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

/* module.exports.verifySession = (req, res, next) = {

}; */