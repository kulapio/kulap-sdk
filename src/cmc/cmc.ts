import axios, { AxiosError } from 'axios';
import { Configuration, APIError, TradeOptions, Rate } from '../types'
import { CMC_URL } from '../constants'
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

    async quotes(symbols: Array<string>): Promise<Quotes | APIError> {
        try {
            console.log('Getting quotes for: ', symbols.join(','))
            const response = await axios.get(CMC_URL + '/v1/cryptocurrency/quotes/latest', {
                params: {
                    symbol: symbols.join(',')
                },
                headers: {
                    'X-CMC_PRO_API_KEY': this.config.accessKey
                },
            })
            const data = response.data.data
            const output = Object.keys(data).reduce((acc: Quotes, key: string) => {
                acc[key] = {
                    name: data[key].name,
                    price: data[key].quote.USD.price.toString()
                }
                return acc
            }, {})
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

    private handleAPIError(e: AxiosError): APIError {
        if (e.response) {
            const { data, status } = e.response!;
            return { status, message: data.error };
        }
        return new Error(e.message);
    }
}