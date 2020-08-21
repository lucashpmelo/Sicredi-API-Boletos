const repository = require('../repositories/usuario-repository')
const sicredi = require('../services/sicredi-service')

exports.get = async (req, res, next) => {
  try {
    const usuario = await repository.getById(req.query.id)

    res.status(200).send(usuario)
    return next(usuario)
  } catch (erro) {
    const response = {
      message: 'Falha ao processar sua requisição.',
      erro,
    }
    res.status(500).send(response)
    return next(erro)
  }
}

exports.post = async (req, res, next) => {
  try {
    const { nome, chaveTransacao, dataExpiracao } = req.body

    const data = {
      nome,
      chaveTransacao,
      dataExpiracao,
    }

    const retorno = await repository.create(data)
    res.status(201).send(retorno)
    return next(retorno)
  } catch (erro) {
    const response = {
      message: 'Falha ao processar sua requisição.',
      erro,
    }
    res.status(500).send(response)
    return next(erro)
  }
}

exports.autenticacao = async (req, res, next) => {
  try {
    const usuario = await repository.getById(req.body.id)

    if (!usuario) {
      const response = {
        message: 'Usuario não encontrado.',
      }
      res.status(400).send(response)
      return next(response)
    }

    const auth = await sicredi.autenticacao(usuario.tokenMaster)

    if (!'chaveTransacao' in auth) {
      const response = {
        message: 'Falha em gerar Chave de Transação.',
      }
      res.status(400).send(response)
      return next(response)
    }

    const data = {
      id: usuario._id,
      chaveTransacao: auth.chaveTransacao,
      dataExpiracao: auth.dataExpiracao,
    }

    const retorno = await repository.update(data)

    res.status(201).send(retorno)
    return next(retorno)
  } catch (erro) {
    const response = {
      message: 'Falha ao processar sua requisição.',
      erro,
    }
    res.status(500).send(response)
    return next(erro)
  }
}
