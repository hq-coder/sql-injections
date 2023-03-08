const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();

app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(function () {
 db.run("CREATE TABLE user (username TEXT, password TEXT, title TEXT)");
 db.run("INSERT INTO user VALUES ('privilegedUser', 'privilegedUser1', 'Administrator')");
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
  
    const query = `SELECT title FROM user WHERE username = '${username}' AND password = '${password}'`;
  
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Query:', query);

    db.get(query, function(err, row) {
        if (err) {
            console.error('Error checking username/password:', err);
            res.status(500).send('Error checking username/password');
        } else if (!row) {
            res.send('Invalid username/password');
        } else {
            res.send(`Login successful. Your title is "${row.title}".`);

            db.get(query, function (err, row) {
                if (err) {
                    console.log('ERROR', err);
                    res.redirect("/index.html#error");
                } else if (!row) {
                    res.redirect("/index.html#unauthorized");
                } else {
                    res.send(`Hello <b>${row.title}!</b><br />This file contains all your secret data: <br /><br /> SECRETS <br /><br /> MORE SECRETS <br /><br /> <a href="/index.html">Go back to login</a>`);
                }
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`Server listening on port ${PORT}`);
});
