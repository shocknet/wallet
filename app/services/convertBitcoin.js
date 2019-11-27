import Big from 'big.js'

const Units = {
  BTC: new Big(1),
  mBTC: new Big(0.001),
  μBTC: new Big(0.000001),
  bit: new Big(0.000001),
  Satoshi: new Big(0.00000001),
  sat: new Big(0.00000001),
}

/**
 *
 * @param {number} from
 * @param {keyof typeof Units} fromUnit
 * @param {keyof typeof Units} toUnit
 * @returns {number}
 */
const convert = (from, fromUnit, toUnit) => {
  const fromFactor = Units[fromUnit]
  if (fromFactor === undefined) {
    throw new Error(`'${fromUnit}' is not a bitcoin unit`)
  }
  const toFactor = Units[toUnit]
  if (toFactor === undefined) {
    throw new Error(`'${toUnit}' is not a bitcoin unit`)
  }

  if (typeof from !== 'number') {
    throw new Error(`convert() -> from is not a number`)
  }

  const result = new Big(from).times(fromFactor).div(toFactor)

  return Number(result.toString())
}

export default convert
