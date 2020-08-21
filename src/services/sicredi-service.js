const axios = require('axios')
const cron = require('cron')
const CronJob = cron.CronJob

const moment = require('moment')
require('moment/locale/pt-br')
moment.locale('pt-br')

const os = require('os')
const networkInterfaces = os.networkInterfaces()

// const URL =
//   'https://cobrancaonline.sicredi.com.br/sicredi-cobranca-ws-ecomm-api/ecomm/v1/boleto'

const URL = `http://${networkInterfaces.Ethernet[1].address}:3001/sicredi`

const PATHS = {
  AUTH: '/autenticacao',
  CHANGE: '/comandoInstrucao',
  CREATE: '/emissao',
  FIND: '/consulta',
  HEALTH: '/health',
  PRINT: '/impressao',
}

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
