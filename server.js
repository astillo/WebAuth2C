const express = require('express')
const server = express()
const bcrypt = require('bcrypt')
const restricted = require('./auth/auth-middleware')
const session = require('express-session')

server.use(express.json())

const sessionConfig = {
    name: 'cookie',
    secret: 'this is our little secret',
    cookie: {
        maxAge: 10000 * 30000,
        secure: false,
        httpOnly: true,
    },
    resave: false,
    saveUninitialized: false,
};

server.use(session(sessionConfig))

const Users = require('./auth/auth-user-model')

server.post('/register', (req, res) => {
    let user = req.body;
    const hash = bcrypt.hashSync(user.password, 10)
    Users.add(user, user.password = hash)
        .then(saved => {
            res.status(201).json({ saved })
        })
        .catch(err => {
            res.status(500).json({ err })
            console.log(err)
        })
})

server.post('/login', (req, res) => {
    let { username, password } = req.body
    Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                req.session.user = user
                res.status(201).json({ message: `welcome ${username}` })
            }
            else {
                res.status(500).json({ message: `get out of here!` })
            }
        })
})

server.get('/users', restricted, (req, res) => {
    Users.find()
        .then(users => {
            res.json({ users })
        })
        .catch(err => {
            res.status(500).json({ err })
        })
})

module.exports = server