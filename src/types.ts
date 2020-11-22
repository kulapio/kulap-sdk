
export enum Network {
    mainnet = "mainnet",
    // kovan = "kovan"
}

export type Configuration = {
    network: Network
    accessKey: string
}

export type APIError = {
    message: string
    status?: number
}

type Trade = {
    routes: number[]
    fromAmount: string
    toAmount: string
    rate: string
}

type TradeOption = {
    gasPrice : string
    gasLimit: number
    trade : Trade
}

export type TradeOptions = {
    "FAST": TradeOption,
    "STD": TradeOption,
    "SLOW": TradeOption
}