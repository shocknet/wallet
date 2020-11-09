const btcAddress = /^(bc(1|r)|[123]|m|n|((t|x)pub)|(tb1))[a-zA-HJ-NP-Z0-9]{25,90}$/
const lnInvoice = /^(ln(tb|bc|bcrt))[0-9][a-z0-9]{180,7089}$/
const lnPubKey = /^[a-f0-9]{66}$/

/**
 * @param {string} data
 * @returns {string}
 */
export const removePrefix = data => {
  let value = data
  if (data.includes('bitcoin:')) {
    ;[, value] = data.split('bitcoin:')
  } else if (data.includes('lightning:')) {
    ;[, value] = data.split('lightning:')
  } else if (data.includes('LIGHTNING:')) {
    ;[, value] = data.split('LIGHTNING:')
  }

  return value
}
/**
 *
 * @param {string} data
 * @returns {{address:string,amount:undefined|string}}
 */
export const hasAmount = data => {
  if (data.includes('?amount=')) {
    const amountSplit = data.split('?amount=')

    const amount = Math.floor(Number(amountSplit[1]) * 100000000)
    return { address: amountSplit[0], amount: amount.toString() }
  }
  return { address: data, amount: undefined }
}

/** @param {string} data */
export const isBitcoinAddress = data => {
  return btcAddress.test(data)
}

/** @param {string} data */
export const isLightningPaymentRequest = data =>
  lnInvoice.test(data.toLowerCase())

/** @param {string} data */
export const isLightningPubKey = data => lnPubKey.test(data)

/** @param {string} data */
export const isShockPubKey = data => data.startsWith('$$__SHOCKWALLET__USER__')

/** @param {string} data */
export const findlnurl = data => {
  const res = /^(http.*[&?]lightning=)?((lnurl)([0-9]{1,}[a-z0-9]+){1})/.exec(
    data.toLowerCase(),
  )
  if (res) {
    return res[2]
  }
  return null
}

/**
 * @typedef {object} ExtractedBTCAddress
 * @prop {'btc'} type
 * @prop {string} address
 * @prop {string=} amount
 */
/**
 * @typedef {object} ExtractedLNInvoice
 * @prop {'ln'} type
 * @prop {string} request
 */
/**
 * @typedef {object} ExtractedKeysend
 * @prop {'keysend'} type
 * @prop {string} address
 */
/**
 * @typedef {object} ExtractedShockPK
 * @prop {'pk'} type
 * @prop {string} pk
 */
/**
 * @typedef {object} ExtractedLNURL
 * @prop {'lnurl'} type
 * @prop {string} lnurl
 */
/**
 * @typedef {object} ExtractedUnknown
 * @prop {'unknown'} type
 */

/**
 * @param {string} data
 * @returns {ExtractedBTCAddress|ExtractedLNInvoice|ExtractedKeysend|ExtractedShockPK|ExtractedUnknown|ExtractedLNURL}
 */
const extractInfo = data => {
  const cleanData = removePrefix(data)
  const { address, amount } = hasAmount(cleanData)
  if (isBitcoinAddress(address)) {
    return {
      type: 'btc',
      address,
      amount,
    }
  }
  if (isLightningPaymentRequest(cleanData)) {
    return {
      type: 'ln',
      request: cleanData,
    }
  }
  if (isLightningPubKey(cleanData)) {
    return {
      type: 'keysend',
      address: cleanData,
    }
  }
  if (isShockPubKey(cleanData)) {
    return {
      type: 'pk',
      pk: cleanData,
    }
  }

  const found = findlnurl(cleanData)
  if (found) {
    return {
      type: 'lnurl',
      lnurl: found.toUpperCase(),
    }
  }
  return { type: 'unknown' }
}

export default extractInfo
