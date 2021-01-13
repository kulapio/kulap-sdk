import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { resolveTokenDecimals } from '../../src/utils'

export const percentageDifference = (valueA: string, valueB: string): string => {
  return new BigNumber(valueA).minus(valueB).abs().div(valueA).times('100').toFixed(2)
}

export const toNumber = (value: any) => {
  return new BigNumber(value).toNumber()
}

export const formatUnits = (symbol: string, amount: any) => {
  const decimals = resolveTokenDecimals(symbol).toString()
  return toNumber(
      ethers.utils.formatUnits(amount, decimals).toString()
  )
}

export const parseUnits = (symbol: string, amount: any) => {
  const decimals = resolveTokenDecimals(symbol).toString()
  return toNumber(
      ethers.utils.parseUnits(amount, decimals).toString()
  )
}
