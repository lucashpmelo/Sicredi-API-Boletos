const express = require('express')
const router = express.Router()

const route = router.get('/', (req, res, next) => {
  const retorno = {
    message: 'Sucesso',
  }
  res.status(200).send(retorno)
  return next(retorno)
})

module.exports = router
