require('dotenv').config()
import { Kulap } from '../src'
import Web3 from 'web3'
import { Cmc } from '../src/cmc'
import { Quotes } from '../src/cmc/types'
import { Rate } from '../src/types'
import BigNumber from 'bignumber.js'

const MAXIMUM_PERCENT_DIFF = '5'
let kulapSDK: Kulap
let cmc: Cmc
let cmcQuotes: Quotes
let fromEth = '1'

async function getRates(quotes: Quotes, fromSymbol: string, toSymbol: string, amountIn: string)
    : Promise<{ kulapRate: string, cmcRate: string, percentDiff: string }> {
    const kulapRate = ((await kulapSDK.getRate(fromSymbol, toSymbol, amountIn)) as Rate).rate
    const cmcRate = new BigNumber(cmcQuotes[fromSymbol].price).div(cmcQuotes[toSymbol].price).toString(10)
    const percentDiff = new BigNumber(kulapRate).minus(cmcRate).abs().div(kulapRate).times('100').decimalPlaces(2)

    return {
        kulapRate,
        cmcRate,
        percentDiff: percentDiff.toString(10)
    }
}

describe('Rate', () => {
    beforeAll(async () => {
        const web3 = new Web3('http://localhost:8545')
        kulapSDK = new Kulap('access_key', web3.currentProvider)
  
        cmc = new Cmc(process.env.CMC_API_KEY || 'please provide access key in .env file')
  
        let fromUsdt = ((await kulapSDK.getRate('ETH', 'USDT', fromEth)) as Rate).rate
        console.log('fromUsdt', fromUsdt)
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

    describe('Compare rates with Cmc', () => {
        test('Any -> USDT for $100 volume', async () => {
            const toSymbol = 'USDT'
            const usdAmount = '100'
            for (const fromSymbol of kulapSDK.listSymbols()) {
                if (fromSymbol === toSymbol) continue

                const amountIn = cmc.tokenAmount(cmcQuotes, fromSymbol, usdAmount)
                const { kulapRate, cmcRate, percentDiff } = await getRates(cmcQuotes, fromSymbol, toSymbol, amountIn)
                const isTooDiff = new BigNumber(percentDiff).gt(MAXIMUM_PERCENT_DIFF)

                const msg = `${fromSymbol} -> ${toSymbol} rate is not ok, kulap: ${kulapRate}, cmc ${cmcRate}, percentDiff; ${percentDiff}`
                console.log({fromSymbol, toSymbol, amountIn, kulapRate, cmcRate, percentDiff: percentDiff})
                expect({msg, isTooDiff}).toEqual({msg, isTooDiff: false})

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

                const msg = `${fromSymbol} -> ${toSymbol} rate is not ok, kulap: ${kulapRate}, cmc ${cmcRate}, percentDiff; ${percentDiff}`
                console.log({fromSymbol, toSymbol, amountIn, kulapRate, cmcRate, percentDiff: percentDiff})
                expect({msg, isTooDiff}).toEqual({msg, isTooDiff: false})

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
                
                const msg = `${fromSymbol} -> ${toSymbol} rate is not ok, kulap: ${kulapRate}, cmc ${cmcRate}, percentDiff; ${percentDiff}`
                console.log({fromSymbol, toSymbol, amountIn, kulapRate, cmcRate, percentDiff: percentDiff})
                expect({msg, isTooDiff}).toEqual({msg, isTooDiff: false})

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

                const msg = `${fromSymbol} -> ${toSymbol} rate is not ok, kulap: ${kulapRate}, cmc ${cmcRate}, percentDiff; ${percentDiff}`
                console.log({fromSymbol, toSymbol, amountIn, kulapRate, cmcRate, percentDiff: percentDiff})
                expect({msg, isTooDiff}).toEqual({msg, isTooDiff: false})

            }
        })
    })

})