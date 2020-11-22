import axios, { AxiosError } from 'axios';
import { Network, Configuration, APIError, TradeOptions } from "./types"
import { SUPPORTED_TOKENS, API_URL } from "./constants"

export class Kulap {

    config: Configuration

    constructor(
        accessKey: string,
        networkName: string = "mainnet"
    ) {

        const network = Network[networkName as keyof typeof Network]

        if (!network) {
            throw new Error("Given network name is not valid.")
        }

        // TODO: Validate Access Key

        this.config = {
            accessKey,
            network
        }
    }

    getCurrentNetwork(): string {
        return this.config.network
    }

    tokensList(): Array<string> {
        const symbols = SUPPORTED_TOKENS.map(item => item.symbol)
        return symbols
    }

    async getRate(
        sourceToken: string,
        targetToken: string,
        amount: string
    ): Promise<TradeOptions | APIError> {
        try {
            const { data } = await axios.get(API_URL, {
                params: {
                    from: sourceToken,
                    to: targetToken,
                    fromAmount: amount,
                    accessKey: this.config.accessKey
                }
            })
            return data 
            // return {
            //     "FAST": {
            //         "gasPrice": "46",
            //         "gasLimit": 500000,
            //         "trade": {
            //             "routes": [
            //                 2
            //             ],
            //             "fromAmount": "1000000000000000000",
            //             "toAmount": "518950296471435895073",
            //             "rate": "518.950296471435895073"
            //         }
            //     },
            //     "STD": {
            //         "gasPrice": "28",
            //         "gasLimit": 500000,
            //         "trade": {
            //             "routes": [
            //                 2
            //             ],
            //             "fromAmount": "1000000000000000000",
            //             "toAmount": "518950296471435895073",
            //             "rate": "518.950296471435895073"
            //         }
            //     },
            //     "SLOW": {
            //         "gasPrice": "27",
            //         "gasLimit": 500000,
            //         "trade": {
            //             "routes": [
            //                 2
            //             ],
            //             "fromAmount": "1000000000000000000",
            //             "toAmount": "518950296471435895073",
            //             "rate": "518.950296471435895073"
            //         }
            //     }
            // }
        } catch (e) {
            return this.handleAPIError(e)
        }
    }

    private handleAPIError(e: AxiosError): APIError {
        if (e.response) {
            const { data, status } = e.response!;
            return { status, message: data.error };
        }
        return new Error(e.message);
    }

}