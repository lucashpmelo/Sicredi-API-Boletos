const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  nome: {
    type: String,
  },
  tokenMaster: {
    type: String,
  },
  chaveTransacao: {
    type: String,
  },
  dataExpiracao: {
    type: Date,
  },
  agencia: {
    type: String,
  },
  cedente: {
    type: String,
  },
  posto: {
    type: String,
  },
})

module.exports = mongoose.model('Usuario', schema)
