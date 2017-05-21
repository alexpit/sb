/**
 * Created by alexp on 2017-05-20.
 */

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const passHash = require('password-hash');
const cache = require('persistent-cache');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

const users = cache();


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, './public', 'login.html'));
});

app.post('/register',function(req,res){
  const userid = req.body.user;
  const hashedPasswd = passHash.generate(req.body.password);
  const email = req.body.email;

  users.get(`${userid}`, function(err, user) {
    if (!err && !user) {
      const profile = {
        'guid': userid,
        'password': hashedPasswd,
        'email': email
      };
      users.put(`${userid}`, profile, () => {
        const msg = `Registered user: ${userid}`;
        console.info(msg);
        res.end(msg);
      });
    } else {
      const msg = `User [${userid}] already exists`;
      console.info(msg);
      res.end(msg);
    }
  });
});

app.post('/login', function (req, res) {
  console.log(req.body.user);
  console.log(req.body.password);
  const userid = req.body.user;
  users.get(userid, function(err, user) {
    if (!err && !user) {
        const msg = `User [${userid}] not found`;
        console.info(msg);
        res.end(msg);
    } else {
      const isAuth = passHash.verify(req.body.password, user.password);
      const msg = `User [${userid}] authentication ${isAuth ? 'succeeded' : 'failed'}`;
      console.info(msg);
      res.end(msg);
    }
  });
});

app.listen(8888, function () {
  console.log('Server listening on port:  8888');
});

