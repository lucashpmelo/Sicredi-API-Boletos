const express = require('express')
const router = express.Router()
const controller = require('../controllers/sicredi-controller')

router.get('/health', controller.health)
router.get('/consulta', controller.consulta)
router.get('/impressao', controller.impressao)
router.post('/emissao', controller.emissao)
router.post('/autenticacao', controller.autenticacao)
router.post('/comandoInstrucao', controller.comandoInstrucao)

module.exports = router
