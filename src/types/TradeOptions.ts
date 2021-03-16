import { GasOption } from "./Web3"

type Trade = {
    routes: number[]
    fromAmount: string
    toAmount: string
    rate: string
}

export type TradeOption = {
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
        "FAST": GasOption,
        "STD": GasOption,
        "SLOW": GasOption
    }
}

