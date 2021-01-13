import axios, { AxiosError } from 'axios';
import { Configuration, APIError, TradeOptions, Rate } from '../types'
import { CMC_URL, CMC_IDS_MAP } from '../constants'
import { Quotes } from './types'
import { resolveTokenDecimals } from '../utils'
import BigNumber from 'bignumber.js'

// CoinMarketCap api
export class Cmc {
    config: Configuration

    constructor(
        accessKey: string,
    ) {
        this.config = {
            accessKey
        }
    }

    async getQuotesBySymbol(symbols: Array<string>): Promise<any> {
        console.log('getQuotesBySymbol: ', symbols.join(','))
        const response = await axios.get(CMC_URL + '/v1/cryptocurrency/quotes/latest', {
            params: {
                symbol: symbols.join(',')
            },
            headers: {
                'X-CMC_PRO_API_KEY': this.config.accessKey
            },
        })
        return response.data.data
    }

    async getQuotesById(ids: Array<number>): Promise<any> {
        console.log('getQuotesById: ', ids.join(','))
        const response = await axios.get(CMC_URL + '/v1/cryptocurrency/quotes/latest', {
            params: {
                id: ids.join(',')
            },
            headers: {
                'X-CMC_PRO_API_KEY': this.config.accessKey
            },
        })
        return response.data.data
    }

    async quotes(symbols: Array<string>): Promise<Quotes | APIError> {
        try {
            console.log('Getting quotes for: ', symbols.join(','))
            // @ts-ignore
            const ids = Object.keys(CMC_IDS_MAP).filter(id => symbols.includes(CMC_IDS_MAP[id]))

            let output: Quotes = {}
            // @ts-ignore
            const quotesById = await this.getQuotesById(ids)
            Object.keys(quotesById).forEach((quoteId: string) => {
                // @ts-ignore
                output[CMC_IDS_MAP[quoteId]] = {
                    name: quotesById[quoteId].name,
                    price: quotesById[quoteId].quote.USD.price.toString(),
                    id: quotesById[quoteId].id
                }
            })

            return output
        } catch (e) {
            return this.handleAPIError(e)
        }
    }

    tokenAmount(quotes: Quotes, symbol: string, usdAmount: string) : string {
        const decimals = resolveTokenDecimals(symbol)
        return new BigNumber(usdAmount)
            .div(quotes[symbol].price)
            .decimalPlaces(decimals as number)
            .toString(10)
	}
	
	rate(quotes: Quotes, fromSymbol: string, toSymbol: string) : string {
		return new BigNumber(quotes[fromSymbol].price).div(quotes[toSymbol].price).toString(10)
	}

    private handleAPIError(e: AxiosError): APIError {
        if (e.response) {
            const { data, status } = e.response!;
            return { status, message: data.error };
        }
        return new Error(e.message);
    }
}