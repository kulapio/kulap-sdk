import BigNumber from 'bignumber.js'

export const percentageDifference = (valueA: string, valueB: string): string => {
  return new BigNumber(valueA).minus(valueB).abs().div(valueA).times('100').toFixed(2)
}
