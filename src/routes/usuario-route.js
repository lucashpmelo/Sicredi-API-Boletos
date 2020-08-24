const express = require('express')
const router = express.Router()
const controller = require('../controllers/usuario-controller')

// router.get('/', controller.get)
router.get('/consulta', controller.consulta)
router.post('/', controller.post)
router.post('/autenticacao', controller.autenticacao)

module.exports = router
