//! authServer에서는 TOKEN create, deletion, refreshment만 처리
require('dotenv').config()

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')
//json을 login route에 pass 해야함. server가 핸들링 할 수 있도록 등록
app.use(express.json())

let refreshTokens = [] //원래는 당연히 DB에 저장해야함

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403) //do we have vaild refresh token that exist in the DB?
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({name:user.name}) //user객체가 아니라 name을 전달해야함
        res.json({ accessToken:accessToken })
    })
})

app.post('/login', (req, res) => {
    // Authentificate User
    const username = req.body.username
    const user = {name: username}
    //serialize
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET) //일단 리프레시 토큰의 유효기간은 수동적으로 조작 
    refreshTokens.push(refreshToken)
    res.json({accessToken: accessToken, refreshToken:refreshToken})
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30s'}) //실제 응용프로그램에선 좀 더 김(10분~30분)
}



const port = 4000
app.listen(port, () => console.log(`listening on http://localhost:${port}`))