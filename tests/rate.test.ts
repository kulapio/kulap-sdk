require('dotenv').config()
import { Kulap } from '../src'
import Web3 from 'web3'
import { Cmc } from '../src/cmc'
import { Quotes } from '../src/cmc/types'
import { Rate } from '../src/types'
import BigNumber from 'bignumber.js'
import { percentageDifference } from './utils'

const MAXIMUM_PERCENT_DIFF = '5'
let kulapSDK: Kulap
let cmc: Cmc
let cmcQuotes: Quotes

async function getRates(quotes: Quotes, fromSymbol: string, toSymbol: string, amountIn: string)
    : Promise<{ kulapRate: string, cmcRate: string, percentDiff: string }> {

    const kulapRate = ((await kulapSDK.getRate(fromSymbol, toSymbol, amountIn)) as Rate).rate
    const cmcRate = cmc.rate(quotes, fromSymbol, toSymbol)
    return {
        kulapRate,
        cmcRate,
        percentDiff: percentageDifference(cmcRate, kulapRate)
    }
}

describe('Rate', () => {
    beforeAll(async () => {
        const web3 = new Web3('http://localhost:8545')
        kulapSDK = new Kulap('access_key', web3.currentProvider)
        cmc = new Cmc(process.env.CMC_API_KEY || 'please provide access key in .env file')
    })

    test('CoinMarketCap verify api key', async () => {
        const output = await cmc.quotes(['BTC'])
        expect(output.status).toEqual(undefined)
    })

    test('Get cmc quotes', async () => {
        const symbols = kulapSDK.listSymbols()
        cmcQuotes = await cmc.quotes(symbols) as Quotes
        expect(Object.keys(cmcQuotes).length).toEqual(symbols.length)
    })

    test('1 WBTC -> USDT', async () => {
        const kulapRate = (await kulapSDK.getRate('WBTC', 'USDT', '1')) as Rate
        const cmcRate = ((await cmc.quotes(['BTC'])) as Quotes).BTC
        const percentDiff = percentageDifference(cmcRate.price, kulapRate.rate)
        expect(parseInt(kulapRate.rate)).toBeGreaterThan(3000)
        expect(parseInt(percentDiff)).toBeLessThan(parseInt(MAXIMUM_PERCENT_DIFF))
    })

    describe('Compare rates with Cmc', () => {
        test('Any -> USDT for $100 volume', async () => {
            const toSymbol = 'USDT'
            const usdAmount = '100'
            for (const fromSymbol of kulapSDK.listSymbols()) {
                if (fromSymbol === toSymbol) continue

                const amountIn = cmc.tokenAmount(cmcQuotes, fromSymbol, usdAmount)
                const { kulapRate, cmcRate, percentDiff } = await getRates(cmcQuotes, fromSymbol, toSymbol, amountIn)
                const isTooDiff = new BigNumber(percentDiff).gt(MAXIMUM_PERCENT_DIFF)

                const errorMsg = `${fromSymbol} -> ${toSymbol} rate is not ok, kulap: ${kulapRate}, cmc: ${cmcRate}, percentDiff; ${percentDiff}`
                expect({isTooDiff, errorMsg}).toEqual({isTooDiff: false, errorMsg})
            }
        })

        test('Any -> ETH for $100 volume', async () => {
            const toSymbol = 'ETH'
            const usdAmount = '100'
            for (const fromSymbol of kulapSDK.listSymbols()) {
                if (fromSymbol === toSymbol) continue

                const amountIn = cmc.tokenAmount(cmcQuotes, fromSymbol, usdAmount)
                const { kulapRate, cmcRate, percentDiff } = await getRates(cmcQuotes, fromSymbol, toSymbol, amountIn)
                const isTooDiff = new BigNumber(percentDiff).gt(MAXIMUM_PERCENT_DIFF)

                const errorMsg = `${fromSymbol} -> ${toSymbol} rate is not ok, kulap: ${kulapRate}, cmc: ${cmcRate}, percentDiff; ${percentDiff}`
                expect({isTooDiff, errorMsg}).toEqual({isTooDiff: false, errorMsg})
            }
        })

        test('USDT -> Any for $100 volume', async () => {
            const fromSymbol = 'USDT'
            const usdAmount = '100'
            for (const toSymbol of kulapSDK.listSymbols()) {
                if (toSymbol === fromSymbol) continue

                const amountIn = usdAmount
                const { kulapRate, cmcRate, percentDiff } = await getRates(cmcQuotes, fromSymbol, toSymbol, amountIn)
                const isTooDiff = new BigNumber(percentDiff).gt(MAXIMUM_PERCENT_DIFF)
                
                const errorMsg = `${fromSymbol} -> ${toSymbol} rate is not ok, kulap: ${kulapRate}, cmc: ${cmcRate}, percentDiff; ${percentDiff}`
                expect({isTooDiff, errorMsg}).toEqual({isTooDiff: false, errorMsg})
            }
        })

        test('ETH -> Any for $100 volume', async () => {
            const fromSymbol = 'ETH'
            const usdAmount = '100'
            for (const toSymbol of kulapSDK.listSymbols()) {
                if (toSymbol === fromSymbol) continue

                const amountIn = cmc.tokenAmount(cmcQuotes, fromSymbol, usdAmount)
                const { kulapRate, cmcRate, percentDiff } = await getRates(cmcQuotes, fromSymbol, toSymbol, amountIn)
                const isTooDiff = new BigNumber(percentDiff).gt(MAXIMUM_PERCENT_DIFF)

                const errorMsg = `${fromSymbol} -> ${toSymbol} rate is not ok, kulap: ${kulapRate}, cmc: ${cmcRate}, percentDiff; ${percentDiff}`
                expect({isTooDiff, errorMsg}).toEqual({isTooDiff: false, errorMsg})
            }
        })
    })

})