const mongoose = require('mongoose')
const Usuario = mongoose.model('Usuario')

exports.getById = async (id) => {
  const res = await Usuario.findById(id)
  return res
}

exports.create = async (data) => {
  const usuario = new Usuario(data)
  return await usuario.save()
}

exports.update = async (data) => {
  const retorno = await Usuario.findOneAndUpdate(
    {
      _id: data.id,
    },
    {
      $set: {
        chaveTransacao: data.chaveTransacao,
        dataExpiracao: data.dataExpiracao,
      },
    },
    { new: true },
    function (err, res) {
      // Deal with the response data/error
    }
  )
  return retorno
}
