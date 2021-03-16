
import { GasOption } from './Web3'
import { TradeOption, TradeOptions, Rate } from "./TradeOptions"
import { Configuration, Network } from "./Configuration"


export type APIError = {
    message: string
    status?: number
}

export type Options = {
    gasOptions?: string, // TODO: Use enum
    slippage?: number,
    partnerId? :number
}

export {
    GasOption,
    TradeOption,
    TradeOptions,
    Configuration,
    Network,
    Rate
}