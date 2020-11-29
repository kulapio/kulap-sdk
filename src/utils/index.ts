import { TOKEN_ADDRESSES } from "../constants"
import { Options } from "../types/Web3"
import { Rate } from "../types"

export const resolveContractAddress = (symbol : string) : String => {
    // @ts-ignore
    return TOKEN_ADDRESSES[symbol] ? TOKEN_ADDRESSES[symbol] : ""
}

export const constructGasOptions = (option: string, rate : Rate) : any  => {
    switch (option) {
        case "FAST":
            return rate.gasOptions["FAST"]
        case "SLOW":
            return rate.gasOptions["SLOW"]
        default:
            return rate.gasOptions["STD"]
    }
}

export const defaultGasOptions = (rate : Rate) : any  => {
    return rate.gasOptions["STD"]
}