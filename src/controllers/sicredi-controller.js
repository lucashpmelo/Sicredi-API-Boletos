const repository = require('../repositories/sicredi-repository')

exports.health = async (req, res, next) => {
  try {
    res.status(200).send()
    return next()
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
    const { token } = req.headers
    const { query } = req

    const usuario = await repository.getByChaveTransacao(token)

    if (!usuario) {
      const response = {
        codigo: 'E0033',
        mensagem: 'Chave Transacao inválida para este beneficiario.',
        parametro: 'Token',
      }
      res.status(400).send(response)
      return next(response)
    }

    if (query.nossoNumero) {
      const retorno = [
        {
          seuNumero: '1234567891',
          nossoNumero: '181000853',
          nomePagador: 'TESTE',
          valor: '10',
          valorLiquidado: '0',
          dataEmissao: '2017-07-06',
          dataVencimento: '2017-08-27',
          situacao: 'EM CARTEIRA',
        },
      ]

      res.status(200).send(retorno)
      return next(retorno)
    } else {
      const retorno = [
        {
          seuNumero: '1234567891',
          nossoNumero: '191007112',
          nomePagador: 'TESTE',
          valor: '10',
          valorLiquidado: '0',
          dataEmissao: '2018-12-31',
          dataVencimento: '2019-01-10',
          situacao: 'EM CARTEIRA',
        },
        {
          seuNumero: '1234567891',
          nossoNumero: '191006884',
          nomePagador: 'TESTE',
          valor: '10',
          valorLiquidado: '0',
          dataEmissao: '2018-12-31',
          dataVencimento: '2019-01-05',
          situacao: 'REJEITADO',
        },
        {
          seuNumero: '1234567891',
          nossoNumero: '191006892',
          nomePagador: 'TESTE',
          valor: '10',
          valorLiquidado: '0',
          dataEmissao: '2018-12-31',
          dataVencimento: '2019-01-20',
          situacao: 'BAIXADO POR SOLICITACAO',
        },
        {
          seuNumero: '1234567891',
          nossoNumero: '191006906',
          nomePagador: 'TESTE',
          valor: '10',
          valorLiquidado: '10',
          dataEmissao: '2018-12-31',
          dataVencimento: '2019-01-31',
          situacao: 'LIQUIDADO',
        },
      ]

      res.status(200).send(retorno)
      return next(retorno)
    }
  } catch (erro) {
    const response = {
      message: 'Falha ao processar sua requisição.',
      erro,
    }
    res.status(500).send(response)
    return next(erro)
  }
}

exports.impressao = async (req, res, next) => {
  try {
    const { query } = req
    console.log(query)

    const retorno = {
      menssagem: 'Processado com sucesso.',
      arquivo: 'data:application/pdf;base64,JVBE7U2.....',
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

exports.autenticacao = async (req, res, next) => {
  try {
    const { token } = req.headers

    const usuario = await repository.getByTokenMaster(token)

    const retorno = {
      chaveTransacao: usuario.chaveTransacao,
      dataExpiracao: usuario.dataExpiracao,
    }

    // const retorno = {
    //   codigo: '0004',
    //   mensagem: 'Existe um Token de Transação válido cadastrado!',
    //   parametro: '',
    // }

    res.status(200).send(retorno)
    // res.status(404).send(retorno)
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

exports.comandoInstrucao = async (req, res, next) => {
  try {
    const { body } = req

    console.log(body)

    const retorno = {
      codigo: 'E0029',
      mensagem: 'Comando de Instrução realizado com sucesso!',
      parametro: null,
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

exports.emissao = async (req, res, next) => {
  try {
    const { body } = req

    console.log(body)

    const retorno = {
      linhaDigitavel: '74891118100010510116608680621045677550000010099',
      codigoBanco: '748',
      nomeBeneficiario: 'NOME DO BENEFICIÁRIO',
      enderecoBeneficiario: 'ENDEREÇO DO BENEFICIÁRIO',
      cpfCnpjBeneficiario: '91544098000101',
      cooperativaBeneficiario: '0116',
      postoBeneficiario: '08',
      codigoBeneficiario: '68062',
      dataDocumento: '2018-09-06',
      seuNumero: '1234567890',
      especieDocumento: 'B',
      aceite: 'N',
      dataProcessamento: '2018-09-06',
      nossoNumero: 181001051,
      especie: 'REAL',
      valorDocumento: 100.99,
      dataVencimento: '2018-12-31',
      nomePagador: 'TESTE',
      cpfCnpjPagador: '10531369943',
      enderecoPagador: 'AV FRANCA, 123',
      dataLimiteDesconto: '2018-10-29',
      valorDesconto: 0,
      jurosMulta: 1,
      instrucao:
        'Mensagem gerada pelo teste de integracao\rAPOS VENCIMENTO COBRAR MORADIARIA DE R$ 1.01.\rCONCEDER DESCONTO DE R$ 10.99 SE PAGO ATE 29/10/2018.\rCONCEDERDESCONTO DE R$ 12.99 POR DIA DE ANTECIPACAO.\r',
      informativo: 'Informativo gerado pelo teste de integracao\r',
      codigoBarra: '74896775500000100991118100105101160868062104',
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
