const express = require('express')
const router = express.Router()
const controller = require('../controllers/usuario-controller')

router.get('/', controller.get)
router.get('/consulta', controller.consulta)
router.get('/impressao', controller.impressao)
router.post('/', controller.post)
router.post('/emissao', controller.emissao)
router.post('/autenticacao', controller.autenticacao)
router.post('/comandoInstrucao', controller.comandoInstrucao)

module.exports = router
