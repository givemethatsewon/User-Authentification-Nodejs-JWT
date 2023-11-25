//! authServer에서는 TOKEN create, deletion, refreshment만 처리
require('dotenv').config()

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')
//json을 login route에 pass 해야함. server가 핸들링 할 수 있도록 등록
app.use(express.json())

app.post('/login', (req, res) => {
    // Authentificate User
    const username = req.body.username
    const user = {name: username}
    //serialize
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({accessToken: accessToken})
})

function authenticateToken(req, res, next)  {
    /* 
    get the token that they send us
    verify that this is the correct user
    return that user into the other function to get post
    */
    // token is going to come from the header, header -> Bearer
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // -> having authHeader, return token portion from that. if not don't do anything
    if (token == null) 
        return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403)
        req.user = user //adding a user property to the req(request) object. attach user information to the request object
        next()
    })
}

const port = 4000
app.listen(port, () => console.log(`listening on http://localhost:${port}`))