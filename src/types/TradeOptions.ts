import { Options } from "./Web3"

type Trade = {
    routes: number[]
    fromAmount: string
    toAmount: string
    rate: string
}

type TradeOption = {
    gasPrice: string
    gasLimit: number
    trade: Trade
}

export type TradeOptions = {
    "FAST": TradeOption,
    "STD": TradeOption,
    "SLOW": TradeOption
}

export type Rate = {
    rate: string
    routes: number[]
    fromAmount: string
    fromSymbol : string
    toAmount: string
    toSymbol : string
    gasOptions: {
        "FAST": Options,
        "STD": Options,
        "SLOW": Options
    }
}

