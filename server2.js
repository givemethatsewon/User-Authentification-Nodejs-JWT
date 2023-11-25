require('dotenv').config()

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')
//json을 login route에 pass 해야함. server가 핸들링 할 수 있도록 등록
app.use(express.json())

const posts = [
    {
        username: 'Kyle',
        title: 'Post 1',
        why: '클라이언트에 JWT가 저장되어 있으니까 server2에 session 저장 안되도 로그인 가능'
    },
    {
        username: 'Jim',
        title: 'Post 2'
    }
]

//미들웨어로 authenticateToken 등록
app.get('/posts', authenticateToken, (req, res) => {
    // 미들웨어 때문에 user에 접근 가능
    res.json(posts.filter(post => post.username === req.user.name))
}) //checked application is working properly

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