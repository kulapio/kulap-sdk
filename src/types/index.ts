
import { TradeOptions, Rate } from "./TradeOptions"
import { Configuration, Network } from "./Configuration"


export type APIError = {
    message: string
    status?: number
}

export type Options = {
    gasOptions?: "FAST" | "STD" | "SLOW",
    slippage?: number,
    partnerId? :number
}

export {
    TradeOptions,
    Configuration,
    Network,
    Rate
}
