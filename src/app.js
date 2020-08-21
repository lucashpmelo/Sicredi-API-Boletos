const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')

const sicredi = require('./services/sicredi-service')
const config = require('./config')

const app = express()

//Sicredi Service
sicredi.schedule()

//Banco
mongoose.set('useFindAndModify', false)
mongoose
  .connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Conectado'))
  .catch((err) => console.log(err))

//Models
const Usuario = require('./models/usuario')

//Rotas
const indexRoute = require('./routes/index-route')
const usuarioRoute = require('./routes/usuario-route')
const sicrediRoute = require('./routes/sicredi-route')

app.use(cors())
app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use('/', indexRoute)
app.use('/usuario', usuarioRoute)
app.use('/sicredi', sicrediRoute)

module.exports = app
