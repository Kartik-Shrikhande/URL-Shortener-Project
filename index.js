const express = require('express')
const {redisClient}=require('./src/controllers/redis')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config({path:'.env'})
const route = require('./src/routes/route')
app.use(express.json())
mongoose.connect(process.env.MONGODB,{
    useNewUrlParser: true
},mongoose.set('strictQuery', true))

    .then(() => console.log("mongodb is connected"))
    .catch(err => console.log(err))

app.use('/', route)

app.listen(process.env.PORT, function () {
    console.log("running on port" ,process.env.PORT)
})

