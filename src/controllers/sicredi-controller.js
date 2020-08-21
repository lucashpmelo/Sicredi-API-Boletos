const repository = require('../repositories/sicredi-repository')

exports.health = async (req, res, next) => {
  try {
    const retorno = {
      mensagem: 'Ok!',
    }

    res.status(200).send(retorno)
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

exports.consulta = async (req, res, next) => {
  try {
    console.log(req.query)

    const data = {
      codigo: 'E0024',
      mensagem:
        'Nao foram encontrados resultados para os filtros de consulta informados.',
      parametro: '',
    }

    res.status(404).send(data)
    return next(data)
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
    const { token } = req.headers

    if (token) {
      const response = {
        codigo: 'E20001',
        mensagem: 'EToken de Transação inválido.',
        parametro: 'Token',
      }

      res.status(400).send(response)
      return next(response)
    }

    const usuario = await repository.getByTokenMaster(token)

    const data = {
      chaveTransacao: usuario.chaveTransacao,
      dataExpiracao: usuario.dataExpiracao,
    }

    const retorno = data

    res.status(200).send(retorno)
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
