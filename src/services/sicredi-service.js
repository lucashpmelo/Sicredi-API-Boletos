const axios = require('axios')
const cron = require('cron')
const CronJob = cron.CronJob

const moment = require('moment')
require('moment/locale/pt-br')
moment.locale('pt-br')

const os = require('os')
const networkInterfaces = os.networkInterfaces()

const URL =
  'https://cobrancaonline.sicredi.com.br/sicredi-cobranca-ws-ecomm-api/ecomm/v1/boleto'

/**
 * Rota de teste para simular retornos da API da Sicredi,
 * já que eles não fornecem um ambiente para testes.
 */
// const URL = `http://${networkInterfaces.Ethernet[1].address}:3001/sicredi`

const PATHS = {
  AUTH: '/autenticacao',
  CHANGE: '/comandoInstrucao',
  CREATE: '/emissao',
  FIND: '/consulta',
  HEALTH: '/health',
  PRINT: '/impressao',
}

/**
 * Como a API da Sicredi atualmente ainda não possui uma rota de notificação
 * quando a situação do boleto é alterada, a ideia seria criar uma rotina,
 * que iria buscar todos os dias os boletos que ainda não foram liquidados,
 * e verificando se a situação dos mesmos foi alterada, atualizando os dados
 * deles no sistema.
 */
exports.schedule = () => {
  const job = new CronJob(
    '* * * * *',
    async () => {
      console.log(await this.health())
    },
    null,
    true,
    'America/Sao_Paulo'
  )

  job.start()
}

exports.health = async () => {
  try {
    const options = {
      method: 'GET',
      url: URL + PATHS['HEALTH'],
    }

    await axios(options)

    return true
  } catch (error) {
    return false
  }
}

exports.autenticacao = async (tokenMaster) => {
  try {
    const options = {
      method: 'POST',
      headers: { token: tokenMaster, 'Content-Type': 'application/json' },
      url: URL + PATHS['AUTH'],
    }

    const health = await this.health()

    if (!health) {
      const retorno = {
        status: 404,
        statusText: 'Not Found',
        data: {
          codigo: 'SICREDI404',
          mensagem:
            'O Sistema de Cobrança Online está fora do ar, tente novamente mais tarde!',
          parametro: '',
        },
      }

      return retorno
    }

    const auth = await axios(options).catch((error) => {
      return error
    })

    const { status, statusText, data } = auth.data ? auth : auth.response

    const retorno = {
      status: status,
      statusText: statusText,
      data: data,
    }

    return retorno
  } catch (error) {
    const retorno = {
      status: 500,
      statusText: 'Internal Server Error',
      data: {
        codigo: 'AUTH500',
        mensagem: 'Falha na Autenticação!',
        parametro: `${error}`,
      },
    }

    return retorno
  }
}

exports.consulta = async (filtros) => {
  try {
    if (typeof filtros !== 'object') {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'FIND01',
          mensagem: 'Informe os filtros da consulta!',
          parametro: 'filtros',
        },
      }

      return retorno
    }

    const token = filtros.chaveTransacao
    const agencia = filtros.agencia
    const cedente = filtros.cedente
    const posto = filtros.posto
    const nossoNumero = filtros.nossoNumero
    const tipoData = filtros.tipoData
    const dataInicio = filtros.dataInicio
      ? moment(filtros.dataInicio).format('DD/MM/YYYY')
      : undefined
    const dataFim = filtros.dataFim
      ? moment(filtros.dataFim).format('DD/MM/YYYY')
      : undefined

    if (!token) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'FIND02',
          mensagem: 'A Chave de Transação é obrigatória!',
          parametro: 'chaveTransacao',
        },
      }

      return retorno
    }

    if (!agencia) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'FIND03',
          mensagem: 'O código da cooperativa obrigatório!',
          parametro: 'agencia',
        },
      }

      return retorno
    }

    if (!cedente) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'FIND04',
          mensagem: 'O código do Beneficiário é obrigatório!',
          parametro: 'cedente',
        },
      }

      return retorno
    }

    if (!posto) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'FIND05',
          mensagem: 'O código do posto do Beneficiário é obrigatório!',
          parametro: 'posto',
        },
      }

      return retorno
    }

    if (!nossoNumero && !tipoData) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'FIND06',
          mensagem:
            'Deve ser informado o Nosso Número do Boleto ou o Tipo de Data a ser consultada!',
          parametro: 'nossoNumero ou tipoData',
        },
      }

      return retorno
    }

    if (tipoData && (!dataInicio || !dataFim)) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'FIND07',
          mensagem:
            'Deve ser informado a Data de Inicio e a Data Final do intervalo da consulta!',
          parametro: 'dataInicio e dataFim',
        },
      }

      return retorno
    }

    const params = new Object()
    params['agencia'] = agencia
    params['cedente'] = cedente
    params['posto'] = posto

    if (nossoNumero) {
      params['nossoNumero'] = nossoNumero
    } else {
      params['tipoData'] = tipoData
      params['dataInicio'] = dataInicio
      params['dataFim'] = dataFim
    }

    const options = {
      method: 'GET',
      headers: { token: token },
      params: params,
      url: URL + PATHS['FIND'],
    }

    const health = await this.health()

    if (!health) {
      const retorno = {
        status: 404,
        statusText: 'Not Found',
        data: {
          codigo: 'SICREDI404',
          mensagem:
            'O Sistema de Cobrança Online está fora do ar, tente novamente mais tarde!',
          parametro: '',
        },
      }

      return retorno
    }

    const consulta = await axios(options).catch((error) => {
      return error
    })

    const { status, statusText, data } = consulta.data
      ? consulta
      : consulta.response

    const retorno = {
      status: status,
      statusText: statusText,
      data: data,
    }

    return retorno
  } catch (error) {
    const retorno = {
      status: 500,
      statusText: 'Internal Server Error',
      data: {
        codigo: 'FIND500',
        mensagem: 'Falha na Consulta de boletos!',
        parametro: `${error}`,
      },
    }

    return retorno
  }
}

exports.emissao = async (emissao) => {
  try {
    if (typeof emissao !== 'object') {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE01',
          mensagem: 'Informe os dados do boleto!',
          parametro: 'emissao',
        },
      }

      return retorno
    }

    //CAMPOS OBRIGATÓRIOS
    const token = emissao.chaveTransacao
    const agencia = emissao.agencia
    const posto = emissao.posto
    const cedente = emissao.cedente
    const tipoPessoa = emissao.tipoPessoa
    const cpfCnpj = emissao.cpfCnpj
    const nome = emissao.nome
    const cep = emissao.cep
    const especieDocumento = emissao.especieDocumento
    const seuNumero = emissao.seuNumero
    const dataVencimento = emissao.dataVencimento
      ? moment(emissao.dataVencimento).format('DD/MM/YYYY')
      : undefined
    const valor = emissao.valor
    const tipoDesconto = emissao.tipoDesconto
    const tipoJuros = emissao.tipoJuros

    //CAMPOS OPCIONAIS
    const nossoNumero = emissao.nossoNumero
    const codigoPagador = emissao.codigoPagador
    const email = emissao.email
    const codigoSacadorAvalista = emissao.codigoSacadorAvalista
    const juros = emissao.juros
    const multas = emissao.multas
    const descontoAntecipado = emissao.descontoAntecipado
    const informativo = emissao.informativo
    const mensagem = emissao.mensagem
    const codigoMensagem = emissao.codigoMensagem
    const numDiasNegativacaoAuto = emissao.numDiasNegativacaoAuto

    //CAMPOS OBRIGATÓRIOS, SE UM CAMPO OPCIONAL ESPECIFICO NÃO FOR INFORMADO
    const endereco = emissao.endereco
    const cidade = emissao.cidade
    const uf = emissao.uf
    const telefone = emissao.telefone
    const valorDesconto1 = emissao.valorDesconto1
    const dataDesconto1 = emissao.dataDesconto1
      ? moment(emissao.dataDesconto1).format('DD/MM/YYYY')
      : undefined
    const valorDesconto2 = emissao.valorDesconto2
    const dataDesconto2 = emissao.dataDesconto2
      ? moment(emissao.dataDesconto2).format('DD/MM/YYYY')
      : undefined
    const valorDesconto3 = emissao.valorDesconto3
    const dataDesconto3 = emissao.dataDesconto3
      ? moment(emissao.dataDesconto3).format('DD/MM/YYYY')
      : undefined

    if (!token) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE02',
          mensagem: 'A Chave de Transação é obrigatória!',
          parametro: 'chaveTransacao',
        },
      }

      return retorno
    }

    if (!agencia) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE03',
          mensagem: 'O código da cooperativa obrigatório!',
          parametro: 'agencia',
        },
      }

      return retorno
    }

    if (!posto) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE04',
          mensagem: 'O código do posto do Beneficiário é obrigatório!',
          parametro: 'posto',
        },
      }

      return retorno
    }

    if (!cedente) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE05',
          mensagem: 'O código do Beneficiário é obrigatório!',
          parametro: 'cedente',
        },
      }

      return retorno
    }

    if (!tipoPessoa) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE06',
          mensagem: 'O Tipo Pessoa do pagador é obrigatório!',
          parametro: 'tipoPessoa',
        },
      }

      return retorno
    }

    if (!cpfCnpj) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE07',
          mensagem: 'O CPF ou CNPJ do pagador é obrigatório!',
          parametro: 'cpfCnpj',
        },
      }

      return retorno
    }

    if (!nome) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE08',
          mensagem: 'O Nome do pagador é obrigatório!',
          parametro: 'nome',
        },
      }

      return retorno
    }

    if (!cep) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE09',
          mensagem: 'O CEP do pagador é obrigatório!',
          parametro: 'cep',
        },
      }

      return retorno
    }

    if (!especieDocumento) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE10',
          mensagem: 'Espécie de documento do título é obrigatório!',
          parametro: 'especieDocumento',
        },
      }

      return retorno
    }

    if (!seuNumero) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE11',
          mensagem:
            'O Número de controle interno do beneficiário é obrigatório!',
          parametro: 'seuNumero',
        },
      }

      return retorno
    }

    if (!dataVencimento) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE12',
          mensagem: 'A Data de vencimento do boleto é obrigatório!',
          parametro: 'dataVencimento',
        },
      }

      return retorno
    }

    if (!valor) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE13',
          mensagem: 'O Valor do boleto é obrigatório!',
          parametro: 'valor',
        },
      }

      return retorno
    }

    if (!tipoDesconto) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE14',
          mensagem: 'O Tipo de desconto do boleto é obrigatório!',
          parametro: 'tipoDesconto',
        },
      }

      return retorno
    }

    if (!tipoJuros) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CREATE15',
          mensagem: 'O Tipo de Juros do boleto é obrigatório!',
          parametro: 'tipoJuros',
        },
      }

      return retorno
    }

    const body = new Object()

    body['agencia'] = agencia
    body['posto'] = posto
    body['cedente'] = cedente
    body['tipoPessoa'] = tipoPessoa
    body['cpfCnpj'] = cpfCnpj
    body['nome'] = nome
    body['cep'] = cep
    body['especieDocumento'] = especieDocumento
    body['seuNumero'] = seuNumero
    body['dataVencimento'] = dataVencimento
    body['valor'] = valor
    body['tipoDesconto'] = tipoDesconto
    body['tipoJuros'] = tipoJuros

    if (nossoNumero) {
      body['nossoNumero'] = nossoNumero
    }

    if (codigoPagador) {
      body['codigoPagador'] = codigoPagador
    }

    if (email) {
      body['email'] = email
    }

    if (codigoSacadorAvalista) {
      body['codigoSacadorAvalista'] = codigoSacadorAvalista
    }

    if (juros) {
      body['juros'] = juros
    }

    if (multas) {
      body['multas'] = multas
    }

    if (descontoAntecipado) {
      body['descontoAntecipado'] = descontoAntecipado
    }

    if (informativo) {
      body['informativo'] = informativo
    }

    if (mensagem) {
      body['mensagem'] = mensagem
    }

    if (codigoMensagem) {
      body['codigoMensagem'] = codigoMensagem
    }

    if (numDiasNegativacaoAuto) {
      body['numDiasNegativacaoAuto'] = numDiasNegativacaoAuto
    }

    /**
     * Se o codigoPagador não for informado, é necessário passar
     * endereco, cidade, uf e telefone do pagador
     */
    if (!codigoPagador) {
      if (!endereco) {
        const retorno = {
          status: 400,
          statusText: 'Bad Request',
          data: {
            codigo: 'CREATE16',
            mensagem:
              'O endereço do pagador é obrigatório quando o código do pagador não for informado!',
            parametro: 'endereco',
          },
        }

        return retorno
      }

      if (!cidade) {
        const retorno = {
          status: 400,
          statusText: 'Bad Request',
          data: {
            codigo: 'CREATE17',
            mensagem:
              'A cidade do pagador é obrigatória quando o código do pagador não for informado!',
            parametro: 'cidade',
          },
        }

        return retorno
      }

      if (!uf) {
        const retorno = {
          status: 400,
          statusText: 'Bad Request',
          data: {
            codigo: 'CREATE18',
            mensagem:
              'O estado do pagador é obrigatório quando o código do pagador não for informado!',
            parametro: 'uf',
          },
        }

        return retorno
      }

      if (!telefone) {
        const retorno = {
          status: 400,
          statusText: 'Bad Request',
          data: {
            codigo: 'CREATE19',
            mensagem:
              'O telefone do pagador é obrigatório quando o código do pagador não for informado!',
            parametro: 'telefone',
          },
        }

        return retorno
      }

      body['endereco'] = endereco
      body['cidade'] = cidade
      body['uf'] = uf
      body['telefone'] = telefone
    }

    /**
     * Se o valorDesconto for informado, é necessário passar a dataDesconto,
     * ou se a dataDesconto for informada, é necessário passar o valorDesconto
     */
    if (valorDesconto1 && dataDesconto1) {
      body['valorDesconto1'] = valorDesconto1
      body['dataDesconto1'] = dataDesconto1
    }

    if (valorDesconto2 && dataDesconto2) {
      body['valorDesconto2'] = valorDesconto2
      body['dataDesconto2'] = dataDesconto2
    }

    if (valorDesconto3 && dataDesconto3) {
      body['valorDesconto3'] = valorDesconto3
      body['dataDesconto3'] = dataDesconto3
    }

    const options = {
      method: 'POST',
      headers: { token: token, 'Content-Type': 'application/json' },
      data: body,
      url: URL + PATHS['CREATE'],
    }

    const health = await this.health()

    if (!health) {
      const retorno = {
        status: 404,
        statusText: 'Not Found',
        data: {
          codigo: 'SICREDI404',
          mensagem:
            'O Sistema de Cobrança Online está fora do ar, tente novamente mais tarde!',
          parametro: '',
        },
      }

      return retorno
    }

    const create = await axios(options).catch((error) => {
      return error
    })

    const { status, statusText, data } = create.data ? create : create.response

    const retorno = {
      status: status,
      statusText: statusText,
      data: data,
    }

    return retorno
  } catch (error) {
    const retorno = {
      status: 500,
      statusText: 'Internal Server Error',
      data: {
        codigo: 'CREATE500',
        mensagem: 'Falha na Emissão do boleto!',
        parametro: `${error}`,
      },
    }

    return retorno
  }
}

exports.impressao = async (filtros) => {
  try {
    if (typeof filtros !== 'object') {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'PRINT01',
          mensagem: 'Informe os filtros para impressão!',
          parametro: 'filtros',
        },
      }

      return retorno
    }

    const token = filtros.chaveTransacao
    const agencia = filtros.agencia
    const cedente = filtros.cedente
    const posto = filtros.posto
    const nossoNumero = filtros.nossoNumero

    if (!token) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'PRINT02',
          mensagem: 'A Chave de Transação é obrigatória!',
          parametro: 'chaveTransacao',
        },
      }

      return retorno
    }

    if (!agencia) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'PRINT03',
          mensagem: 'O código da cooperativa obrigatório!',
          parametro: 'agencia',
        },
      }

      return retorno
    }

    if (!cedente) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'PRINT04',
          mensagem: 'O código do Beneficiário é obrigatório!',
          parametro: 'cedente',
        },
      }

      return retorno
    }

    if (!posto) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'PRINT05',
          mensagem: 'O código do posto do Beneficiário é obrigatório!',
          parametro: 'posto',
        },
      }

      return retorno
    }

    if (!nossoNumero) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'PRINT06',
          mensagem: 'Deve ser informado o Nosso Número do Boleto!',
          parametro: 'nossoNumero',
        },
      }

      return retorno
    }

    const params = new Object()
    params['agencia'] = agencia
    params['cedente'] = cedente
    params['posto'] = posto
    params['nossoNumero'] = nossoNumero

    const options = {
      method: 'GET',
      headers: { token: token },
      params: params,
      url: URL + PATHS['PRINT'],
    }

    const health = await this.health()

    if (!health) {
      const retorno = {
        status: 404,
        statusText: 'Not Found',
        data: {
          codigo: 'SICREDI404',
          mensagem:
            'O Sistema de Cobrança Online está fora do ar, tente novamente mais tarde!',
          parametro: '',
        },
      }

      return retorno
    }

    const print = await axios(options).catch((error) => {
      return error
    })

    const { status, statusText, data } = print.data ? print : print.response

    const retorno = {
      status: status,
      statusText: statusText,
      data: data,
    }

    return retorno
  } catch (error) {
    const retorno = {
      status: 500,
      statusText: 'Internal Server Error',
      data: {
        codigo: 'PRINT500',
        mensagem: 'Falha na Impressão!',
        parametro: `${error}`,
      },
    }

    return retorno
  }
}

exports.comandoInstrucao = async (instrucao) => {
  try {
    if (typeof instrucao !== 'object') {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CHANGE01',
          mensagem: 'Informe as instruções para alteração!',
          parametro: 'instrucao',
        },
      }

      return retorno
    }

    const token = instrucao.chaveTransacao

    if (!token) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CHANGE02',
          mensagem: 'A Chave de Transação é obrigatória!',
          parametro: 'chaveTransacao',
        },
      }

      return retorno
    }

    if (!instrucao.agencia) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CHANGE03',
          mensagem: 'O código da cooperativa obrigatório!',
          parametro: 'agencia',
        },
      }

      return retorno
    }

    if (!instrucao.cedente) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CHANGE04',
          mensagem: 'O código do Beneficiário é obrigatório!',
          parametro: 'cedente',
        },
      }

      return retorno
    }

    if (!instrucao.posto) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CHANGE05',
          mensagem: 'O código do posto do Beneficiário é obrigatório!',
          parametro: 'posto',
        },
      }

      return retorno
    }

    if (!instrucao.nossoNumero) {
      const retorno = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          codigo: 'CHANGE06',
          mensagem: 'Deve ser informado o Nosso Número do Boleto!',
          parametro: 'nossoNumero',
        },
      }

      return retorno
    }

    if (instrucao.data1) {
      instrucao['data1'] = moment(instrucao.data1).format('DD/MM/YYYY')
    }

    const body = {
      ...instrucao,
    }

    delete body['chaveTransacao']

    const options = {
      method: 'POST',
      headers: { token: token, 'Content-Type': 'application/json' },
      data: body,
      url: URL + PATHS['CHANGE'],
    }

    const health = await this.health()

    if (!health) {
      const retorno = {
        status: 404,
        statusText: 'Not Found',
        data: {
          codigo: 'SICREDI404',
          mensagem:
            'O Sistema de Cobrança Online está fora do ar, tente novamente mais tarde!',
          parametro: '',
        },
      }

      return retorno
    }

    const change = await axios(options).catch((error) => {
      return error
    })

    const { status, statusText, data } = change.data ? change : change.response

    const retorno = {
      status: status,
      statusText: statusText,
      data: data,
    }

    return retorno
  } catch (error) {
    const retorno = {
      status: 500,
      statusText: 'Internal Server Error',
      data: {
        codigo: 'CHANGE500',
        mensagem: 'Falha na Alteração do Boleto!',
        parametro: `${error}`,
      },
    }

    return retorno
  }
}
