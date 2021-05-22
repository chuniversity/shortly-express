// for each post request
const parseCookies = (req, res, next) => {
  // 'shortlyid=18ea4fb6ab3178092ce936c591ddbb90c99c9f66; otherCookie=2a990382005bcc8b968f2b18f8f7ea490e990e78; anotherCookie=8a864482005bcc8b968f2b18f8f7ea490e577b20'
  // define empty object
  var cookieObj = {};
  // grab cookies from request]
  var key = 'shortlyid=';
  if (req.headers.cookie) {
    var theCookies = req.headers.cookie.split('; ');
    theCookies.forEach((cookie) => {
      var cookieSplit = cookie.split('=');
      cookieObj[cookieSplit[0]] = cookieSplit[1];
    });

    req.cookies = cookieObj;
  } else {

  }
  next();
};

module.exports = parseCookies;