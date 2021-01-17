require('dotenv').config()
import { Kulap } from '../src'
import Web3 from 'web3'
import { Cmc } from '../src/cmc'
import { Quotes } from '../src/cmc/types'
import { Rate, APIError } from '../src/types'
import BigNumber from 'bignumber.js'
import { percentageDifference, toNumber, formatUnits, parseUnits } from './utils'
import winston from 'winston'
import { ethers } from 'ethers'
import { resolveTokenDecimals } from '../src/utils'
import { MockCmcRates } from './mocks/cmcRates'

const MAXIMUM_PERCENT_DIFF = '6'
const UNTRACKED_TOKENS = ['DGX', 'BUSD'] // Because of low liquidity
const CMC_RATES_MOCK = false
let kulapSDK: Kulap
let cmc: Cmc
let cmcQuotes: Quotes
let symbols: Array<string>

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'tests-rate.log' })
    ]
})
logger.log({
    level: 'info',
    message: `run rate.test.ts ${new Date()}`
})


async function getKulapRateAmountIn(quotes: Quotes, fromSymbol: string, toSymbol: string, amountIn: string)
    : Promise<Rate> {

    const response = await kulapSDK.getRate(fromSymbol, toSymbol, amountIn)
    const error = response as APIError
    const result = response as Rate
    if ((response as APIError).status !== undefined || result.routes === undefined || result.rate === undefined) {
        console.error(`can not get rate ${fromSymbol} -> ${toSymbol} for amount ${amountIn}`)
        throw response
    }
    // Gas limit should be between 50,000 and 2,000,000
    expect(result.gasOptions.STD.gasLimit).toBeGreaterThan(50000)
    expect(result.gasOptions.STD.gasLimit).toBeLessThan(2e6)

    // Gas price should be between 1 and 3,000 gwei
    expect(toNumber(result.gasOptions.STD.gasPrice)).toBeGreaterThan(1 * 1e9)
    expect(toNumber(result.gasOptions.STD.gasPrice)).toBeLessThan(3000 * 1e9)

    // Verify from amount
    expect(formatUnits(fromSymbol, result.fromAmount)).toBeCloseTo(toNumber(amountIn))

    // Verify to amount and rate
    const toDecimals = resolveTokenDecimals(toSymbol).toString()
    const fromAmountBase = formatUnits(fromSymbol, result.fromAmount)
    const toAmountBase = (new BigNumber(fromAmountBase)).times(result.rate).decimalPlaces(parseInt(toDecimals))
    // writeLog(`${amountIn} ${fromSymbol} -> ${toSymbol}, rate: ${result.rate} result.toAmount: ${result.toAmount}, toAmountBase: ${toAmountBase}`)
    expect(toNumber(toAmountBase)).toBeCloseTo(formatUnits(toSymbol, result.toAmount))

    expect(toNumber(result.rate)).toBeGreaterThan(0)
    expect(result.routes.length).toBeGreaterThanOrEqual(1)
    expect(result.routes[0]).toBeGreaterThan(0)
    return result
}

async function getKulapRateAmountOut(quotes: Quotes, fromSymbol: string, toSymbol: string, amountOut: string)
    : Promise<Rate> {

    const response = await kulapSDK.getRateAmountOut(fromSymbol, toSymbol, amountOut)
    const error = response as APIError
    const result = response as Rate
    if ((response as APIError).status !== undefined || result.routes === undefined || result.rate === undefined) {
        console.error(`can not get rate ${fromSymbol} -> ${toSymbol} for amount ${amountOut}`)
        throw response
    }
    return result
}

async function getRatesAmountIn(quotes: Quotes, fromSymbol: string, toSymbol: string, amountIn: string)
    : Promise<{ kulapRate: Rate, cmcRate: string, routes: Array<number> }> {

    const kulapRate = await getKulapRateAmountIn(quotes, fromSymbol, toSymbol, amountIn)
    const cmcRate = cmc.rate(quotes, fromSymbol, toSymbol)
    return {
        kulapRate,
        cmcRate,
        routes: kulapRate.routes
    }
}

function writeLog(rateMessage: string) {
    logger.log({
        level: 'info',
        message: rateMessage
    })
}

function verifyRates(
    fromSymbol: string,
    toSymbol: string,
    kulapRate: Rate,
    cmcRate: string,
    routes: Array<number>
) {
    const percentDiff = percentageDifference(cmcRate, kulapRate.rate)
    const isTooDiff = new BigNumber(percentDiff).gt(MAXIMUM_PERCENT_DIFF)

    const verifyingMsg = `${fromSymbol} -> ${toSymbol} verifying rate..., kulap: ${kulapRate.rate} (${kulapRate.fromAmount} -> ${kulapRate.toAmount}), cmc: ${cmcRate}, percentDiff; ${percentDiff}, routes: ${routes}`
    writeLog(verifyingMsg)
    expect({isTooDiff, verifyingMsg}).toEqual({isTooDiff: false, verifyingMsg})
}

describe('Rate', () => {
    beforeAll(async () => {
        const web3 = new Web3('http://localhost:8545')
        kulapSDK = new Kulap('access_key', web3.currentProvider)
        cmc = new Cmc(process.env.CMC_API_KEY || 'please provide access key in .env file')
        symbols = kulapSDK.listSymbols()

        // Filter out low liquidity token
        symbols = symbols.filter(symbol => !UNTRACKED_TOKENS.includes(symbol))
    })

    test('CoinMarketCap verify api key', async () => {
        if (!CMC_RATES_MOCK) {
            const output = await cmc.quotes(['BTC'])
            expect(output.status).toEqual(undefined)
        }
    })

    test('Get cmc quotes', async () => {
        if (CMC_RATES_MOCK) {
            console.log('Mock cmc rates')
            cmcQuotes = MockCmcRates
        } else {
            cmcQuotes = await cmc.quotes(symbols) as Quotes
            console.log(cmcQuotes)
        }
        expect(Object.keys(cmcQuotes).length).toEqual(symbols.length)
    })

    test('1 WBTC -> USDT', async () => {
        if (!CMC_RATES_MOCK) {
            const kulapRate = (await kulapSDK.getRate('WBTC', 'USDT', '1')) as Rate
            const cmcRate = ((await cmc.quotes(['BTC'])) as Quotes).BTC
            const percentDiff = percentageDifference(cmcRate.price, kulapRate.rate)
            expect(parseInt(kulapRate.rate)).toBeGreaterThan(3000)
            expect(parseInt(percentDiff)).toBeLessThan(parseInt(MAXIMUM_PERCENT_DIFF))
        }
    })

    // const sameTokens = [
    //     ['ETH', 'ETH'],
    //     ['USDT', 'USDT'],
    //     ['TEST', 'TEST'],
    // ]

    // test.each(sameTokens)('Same source and target token (%s -> %s) must throw error', async (sourceToken, targetToken) => {
    //     const testSameToken = () => {
    //         await kulapSDK.getRate(sourceToken, targetToken, '1')
    //     }
    //     expect(testSameToken).toThrow(Error)
    // })

    describe('Compare rates with Cmc', () => {
        test('Any -> Any for $5,000 volume', async () => {
            const usdAmount = '5000'
            for (const fromSymbol of symbols) {
                for (const toSymbol of symbols.filter(symbol => symbol !== fromSymbol)) {
                    const amountIn = cmc.tokenAmount(cmcQuotes, fromSymbol, usdAmount)
                    const { kulapRate, cmcRate, routes } = await getRatesAmountIn(cmcQuotes, fromSymbol, toSymbol, amountIn)
                    verifyRates(fromSymbol, toSymbol, kulapRate, cmcRate, routes)
                }
            }
        }, 300000)
    })

    describe('Compare query AmountOut with AmountIn', () => {
        test('Any -> Any for $5,000 volume', async () => {
            const usdAmount = '5000'
            for (const fromSymbol of symbols) {
                for (const toSymbol of symbols.filter(symbol => symbol !== fromSymbol)) {
                    const fromTokenDecimals = resolveTokenDecimals(fromSymbol).toString()
                    const toTokenDecimals = resolveTokenDecimals(toSymbol).toString()
                    // console.log({ fromSymbol, toSymbol, fromTokenDecimals, toTokenDecimals })

                    const amountOut = cmc.tokenAmount(cmcQuotes, toSymbol, usdAmount)
                    // console.log({ amountOut })
                    const rate = await getKulapRateAmountOut(cmcQuotes, fromSymbol, toSymbol, amountOut)
                    // console.log( { rate, amountOut })
                    
                    // // Verify with rateAmountIn
                    const amountIn = ethers.utils.formatUnits(rate.fromAmount, fromTokenDecimals)
                    const rate2 = await getKulapRateAmountIn(cmcQuotes, fromSymbol, toSymbol, amountIn)
                    const amountOutToVerify = ethers.utils.formatUnits(rate2.toAmount, toTokenDecimals)
                    // console.log({ rate2 })
                    // console.log({ amountOut, amountOutToVerify: amountOutToVerify })
                    const percentDiff = percentageDifference(amountOut, amountOutToVerify)
                    const isTooDiff = new BigNumber(percentDiff).gt('0.5')
                    // console.log({ percentDiff, isTooDiff })

                    const verifyingMsg = `${fromSymbol} -> ${toSymbol} verifying rate..., amountOut: ${amountOut}, amountOutToVerify: ${amountOutToVerify}, amountIn: ${amountIn}, percentDiff; ${percentDiff}, routes: ${rate.routes}`
                    writeLog(verifyingMsg)
                    expect(ethers.utils.parseUnits(amountOut, toTokenDecimals.toString()).toString()).toEqual(rate.toAmount)
                    expect({isTooDiff, verifyingMsg}).toEqual({isTooDiff: false, verifyingMsg})
                    expect(rate.routes).toEqual(rate2.routes)
                }
            }
            
        }, 600000)
    })

})