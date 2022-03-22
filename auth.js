const express = require("express");
const app = express();
const port = process.env.PORT || 8080
const jwt = require("jsonwebtoken")
const bodyParser = require("body-parser")
require('dotenv').config(); 
const cors = require("cors")

const users = [
    {
        username: 'john',
        password: 'password123admin',
        role: 'admin'
    }, 
    {
        username: 'anna',
        password: 'password123member',
        role: 'member'
    }
];

app.use(bodyParser.json()) // middleware to parse JSON body from HTTP request
app.use(cors())
// Request handler to handle user login request
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

const refreshTokenSecret = "hereSomeComplicatedRefreshSecret"
const refreshTokens = []

app
.get("/", (req, res) => {
    res.send("Hello World.")
})
.post("/login", (req, res) => {
    // Read username and password from request body
    const {username, password} = req.body

    // Filter user from the users array by username and password. Must fit both conditions
    const user = users.find(u => { return u.username === username && u.password === password})

    if(user) {
        // Generate an access token
        const accessToken = jwt.sign({username: user.username, role: user.role}, accessTokenSecret, {expiresIn: "20m"})
        // AND generate refresh token
        const refreshToken = jwt.sign({username: user.username, role: user.role}, accessTokenSecret)

        refreshTokens.push(refreshToken)

        res.json({
            accessToken,
            refreshToken
        })
    } else {
        res.send("Username or password incorrect")
    }
})

app
.post("/token", (req, res) => {
    const {token} = req.body

    if(!token) {
        return res.sendStatus(401)
    }

    if(!refreshTokens.includes(token)) {
        return res.sendStatus(403)
    }

    jwt.verify(token, refreshTokenSecret, (err, user) => {
        if(err) {
            return res.sendStatus(403)
        }

        const accessToken = jwt.sign({username: user.username, role: user.role }, accessTokenSecret, { expiresIn: '20m' })

        res.json( {
            accessToken
        })
    })
})

// Logout function to prevent stealing refresh token
app.post("/logout", (req, res) => {
    const {token} = req.body
    refreshTokens = refreshTokens.filter(token => t !== token)

    res.send("Logged out")
})

app.listen(port, () => {
    console.log("Authentication service started on port " + port)
})