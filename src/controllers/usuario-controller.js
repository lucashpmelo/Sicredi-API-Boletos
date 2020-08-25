const repository = require('../repositories/usuario-repository')
const sicredi = require('../services/sicredi-service')

const { map } = require('lodash')

const moment = require('moment')
require('moment/locale/pt-br')
moment.locale('pt-br')

exports.get = async (req, res, next) => {
  try {
    const usuario = await repository.getById(req.query.id)

    res.status(200).send(usuario)
    return next(usuario)
  } catch (erro) {
    const response = {
      message: 'Falha ao processar sua requisição.',
      Error: erro.message,
    }
    res.status(500).send(response)
    return next(erro)
  }
}

exports.consulta = async (req, res, next) => {
  try {
    const usuario = await repository.getById(req.query.id)

    if (!usuario) {
      const response = {
        message: 'Usuario não encontrado.',
      }
      res.status(400).send(response)
      return next(response)
    }

    const { nossoNumero, dataInicio, dataFim, tipoData } = req.query

    const filtros = {
      chaveTransacao: usuario.chaveTransacao,
      agencia: usuario.agencia,
      cedente: usuario.cedente,
      posto: usuario.posto,
      nossoNumero: nossoNumero,
      dataInicio: dataInicio,
      dataFim: dataFim,
      tipoData: tipoData,
    }

    const find = await sicredi.consulta(filtros)

    if (find.status / 100 > 2) {
      const { data } = find
      const response = {
        message: `${data.codigo} - ${data.mensagem}`,
      }
      res.status(400).send(response)
      return next(response)
    }

    const { data } = find

    const retorno = map(data, (boleto) => {
      boleto['dataEmissao'] = boleto.dataEmissao
        ? moment(boleto.dataEmissao)
        : null
      boleto['dataVencimento'] = boleto.dataVencimento
        ? moment(boleto.dataVencimento)
        : null
      return boleto
    })

    res.status(200).send(retorno)
    return next(retorno)
  } catch (erro) {
    const response = {
      message: 'Falha ao processar sua requisição.',
      Error: erro.message,
    }
    res.status(500).send(response)
    return next(erro)
  }
}

exports.impressao = async (req, res, next) => {
  try {
    const usuario = await repository.getById(req.query.id)

    if (!usuario) {
      const response = {
        message: 'Usuario não encontrado.',
      }
      res.status(400).send(response)
      return next(response)
    }

    const { nossoNumero } = req.query

    const filtros = {
      chaveTransacao: usuario.chaveTransacao,
      agencia: usuario.agencia,
      cedente: usuario.cedente,
      posto: usuario.posto,
      nossoNumero: nossoNumero,
    }

    const print = await sicredi.impressao(filtros)

    if (print.status / 100 > 2) {
      const { data } = print
      const response = {
        message: `${data.codigo} - ${data.mensagem}`,
      }
      res.status(400).send(response)
      return next(response)
    }

    const { data } = print

    const retorno = {
      ...data,
    }

    res.status(200).send(retorno)
    return next(retorno)
  } catch (erro) {
    const response = {
      message: 'Falha ao processar sua requisição.',
      Error: erro.message,
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
      Error: erro.message,
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

    if (auth.status / 100 > 2) {
      const { data } = auth
      const response = {
        message: `${data.codigo} - ${data.mensagem}`,
      }
      res.status(400).send(response)
      return next(response)
    }

    const { chaveTransacao, dataExpiracao } = auth.data

    const data = {
      id: usuario._id,
      chaveTransacao: chaveTransacao,
      dataExpiracao: dataExpiracao,
    }

    const retorno = await repository.update(data)

    res.status(201).send(retorno)
    return next(retorno)
  } catch (erro) {
    const response = {
      message: 'Falha ao processar sua requisição.',
      Error: erro.message,
    }
    res.status(500).send(response)
    return next(erro)
  }
}

exports.emissao = async (req, res, next) => {
  try {
    const usuario = await repository.getById(req.body.id)

    if (!usuario) {
      const response = {
        message: 'Usuario não encontrado.',
      }
      res.status(400).send(response)
      return next(response)
    }

    const emissao = {
      ...req.body,
      chaveTransacao: usuario.chaveTransacao,
    }

    const create = await sicredi.emissao(emissao)

    if (create.status / 100 > 2) {
      const { data } = create
      const response = {
        message: `${data.codigo} - ${data.mensagem}`,
      }
      res.status(400).send(response)
      return next(response)
    }

    const { data } = create

    const retorno = {
      ...data,
    }

    res.status(200).send(retorno)
    return next(retorno)
  } catch (erro) {
    const response = {
      message: 'Falha ao processar sua requisição.',
      Error: erro.message,
    }
    res.status(500).send(response)
    return next(erro)
  }
}

exports.comandoInstrucao = async (req, res, next) => {
  try {
    const usuario = await repository.getById(req.body.id)

    if (!usuario) {
      const response = {
        message: 'Usuario não encontrado.',
      }
      res.status(400).send(response)
      return next(response)
    }

    const { instrucao } = req.body

    instrucao['chaveTransacao'] = usuario.chaveTransacao

    const change = await sicredi.comandoInstrucao(instrucao)

    if (change.status / 100 > 2) {
      const { data } = change
      const response = {
        message: `${data.codigo} - ${data.mensagem}`,
      }
      res.status(400).send(response)
      return next(response)
    }

    const { data } = change

    const retorno = {
      ...data,
    }

    res.status(200).send(retorno)
    return next(retorno)
  } catch (erro) {
    const response = {
      message: 'Falha ao processar sua requisição.',
      Error: erro.message,
    }
    res.status(500).send(response)
    return next(erro)
  }
}
