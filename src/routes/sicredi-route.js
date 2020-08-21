const express = require('express')
const router = express.Router()
const controller = require('../controllers/sicredi-controller')

router.get('/health', controller.health)
router.get('/consulta', controller.consulta)
router.post('/autenticacao', controller.autenticacao)

module.exports = router
