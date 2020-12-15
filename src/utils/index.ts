import { TOKEN_ADDRESSES, TOKEN_DECIMALS } from "../constants"
import { Options } from "../types/Web3"
import { Rate } from "../types"

export const resolveContractAddress = (symbol: string): String => {
    // @ts-ignore
    return TOKEN_ADDRESSES[symbol] ? TOKEN_ADDRESSES[symbol] : ""
}

export const resolveTokenDecimals = (symbol: string): Number => {
    // @ts-ignore
    return TOKEN_DECIMALS[symbol] ? TOKEN_DECIMALS[symbol] : 18
}

export const constructGasOptions = (option: string, rate: Rate): any => {
    switch (option) {
        case "FAST":
            return rate.gasOptions["FAST"]
        case "SLOW":
            return rate.gasOptions["SLOW"]
        default:
            return rate.gasOptions["STD"]
    }
}

export const defaultGasOptions = (rate: Rate): any => {
    return rate.gasOptions["FAST"]
}