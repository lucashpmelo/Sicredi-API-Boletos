const mongoose = require('mongoose')
const Usuario = mongoose.model('Usuario')

exports.getByTokenMaster = async (token) => {
  const res = await Usuario.find({ tokenMaster: token })
  return res[0]
}
