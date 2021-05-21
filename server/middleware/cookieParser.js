// for each post request
const parseCookies = (req, res, next) => {
  // define empty object
  var cookieObj = {};
  // grab cookies from request
  console.log('test1', req.headers.cookie);
  // console.log('test2', req[cookies]);
  req.cookies = cookieObj;
};

module.exports = parseCookies;