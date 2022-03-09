const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
require("dotenv").config()

app.use(bodyParser.json());

const books = [
    {
        "author": "Chinua Achebe",
        "country": "Nigeria",
        "language": "English",
        "pages": 209,
        "title": "Things Fall Apart",
        "year": 1958
    },
    {
        "author": "Hans Christian Andersen",
        "country": "Denmark",
        "language": "Danish",
        "pages": 784,
        "title": "Fairy tales",
        "year": 1836
    },
    {
        "author": "Dante Alighieri",
        "country": "Italy",
        "language": "Italian",
        "pages": 928,
        "title": "The Divine Comedy",
        "year": 1315
    },
];

// Access token for the JWT signing
// token should be the same one used in the authentication service
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// Middleware for authentification
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization
    // we read the value of the authorization header. 
    // Since the authorization header has a value in the format of Bearer [JWT_TOKEN], 
    // we have split the value by the space and separated the token.

    if(authHeader) {
        const token = authHeader.split(" ")[1]

        // Verify token with JWT
        jwt.verify(token, accessTokenSecret, (err, user) => {
            if(err) {
                return res.sendStatus(403)
            }
            
            // Attach user object into the request
            req.user = user
            next()
        })
    } else {
        res.sendStatus(401)
    }
}

// configure middleware in GET request handler
app
.route('/books')

// Authentification middleware that binds the user to the request
// Fetch the role from the req.user
.get(authenticateJWT, (req, res) => {
    res.json(books);
})

.post(authenticateJWT, (req, res) => {
    const {role} = req.user

    // check if user is admin
    if(role !== "admin") {
        return res.sendStatus(403)
    }

    const book = req.body
    books.push(book)

    res.send("Book added successfully.")
})

app.listen(4000, () => {
    console.log('Books service started on port 4000');
});