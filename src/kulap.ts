import axios, { AxiosError } from 'axios';
import Web3 from "web3"
import { Network, Configuration, APIError, TradeOptions, Rate } from "./types"
import { SUPPORTED_TOKENS, API_URL, KULAP_DEX_CONTRACT } from "./constants"
import { kulapAbi } from "./abi"
import { resolveContractAddress, constructGasOptions, defaultGasOptions } from "./utils"
import { erc20Abi } from './abi/index';

export class Kulap {

    config: Configuration
    web3: Web3

    constructor(
        accessKey: string,
        provider?: any // FIXME: Declares types
    ) {

        this.web3 = new Web3(provider)

        // TODO: Validate Access Key

        this.config = {
            accessKey
        }
    }

    async getNetworkId(): Promise<Number> {
        try {
            return await this.web3.eth.net.getId()
        } catch (e) {
            throw new Error("Can't connect to local Ganache server!")
        }
    }

    async getAccount(): Promise<String> {
        const accounts = await this.web3.eth.getAccounts()
        return accounts[0] ? accounts[0] : ""
    }

    listSymbols(): Array<string> {
        const symbols = SUPPORTED_TOKENS.map(item => item.code)
        return symbols.sort()
    }

    async getRate(
        sourceToken: string,
        targetToken: string,
        amount: string
    ): Promise<Rate | APIError> {
        try {

            // const sample = { "FAST": { "gasPrice": "14.1", "gasLimit": 500000, "trade": { "routes": [2], "fromAmount": "1000000000000000000", "toAmount": "546241766328648771413", "rate": "546.241766328648771413" } }, "STD": { "gasPrice": "11.2", "gasLimit": 500000, "trade": { "routes": [2], "fromAmount": "1000000000000000000", "toAmount": "546241766328648771413", "rate": "546.241766328648771413" } }, "SLOW": { "gasPrice": "11.2", "gasLimit": 500000, "trade": { "routes": [2], "fromAmount": "1000000000000000000", "toAmount": "546241766328648771413", "rate": "546.241766328648771413" } } }

            const response = await axios.get(API_URL, {
                params: {
                    from: sourceToken,
                    to: targetToken,
                    fromAmount: amount,
                    accessKey: this.config.accessKey
                }
            })
            const tradeOptions : TradeOptions = response.data
            // const tradeOptions: TradeOptions = sample

            const reduceOption = (option: any) => {
                return {
                    gasLimit: option.gasLimit,
                    gasPrice: `${this.web3.utils.toWei(option.gasPrice, "gwei")}`
                }
            }

            return {
                rate: tradeOptions["STD"].trade.rate,
                routes: tradeOptions["STD"].trade.routes,
                fromAmount: tradeOptions["STD"].trade.fromAmount,
                fromSymbol: sourceToken,
                toAmount: tradeOptions["STD"].trade.toAmount,
                toSymbol: targetToken,
                gasOptions: {
                    "FAST": reduceOption(tradeOptions["FAST"]),
                    "STD": reduceOption(tradeOptions["STD"]),
                    "SLOW": reduceOption(tradeOptions["SLOW"])
                }
            }
        } catch (e) {
            return this.handleAPIError(e)
        }
    }

    async validate(rate: Rate): Promise<Boolean> {
        try {
            const erc20Address = resolveContractAddress(rate.fromSymbol)
            if (!erc20Address) {
                throw new Error("Can't find contract address from the given symbol")
            }

            if (erc20Address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
                return true
            }

            // @ts-ignore
            const sourceTokenContract = new this.web3.eth.Contract(erc20Abi, erc20Address)
            const currentAccount = await this.getAccount()
            const allowance = await sourceTokenContract.methods.allowance(currentAccount, KULAP_DEX_CONTRACT).call()
            // @ts-ignore
            return new this.web3.utils.BN(allowance).gte(new this.web3.utils.BN(rate.fromAmount))
        } catch (e) {
            throw new Error(e)
        }
    }

    async approve(rate: Rate, option?: string): Promise<any> {
        try {

            if (option && ["FAST", "STD", "SLOW"].indexOf(option) === -1) {
                throw new Error("Given option is not valid. Please use 'FAST' 'STD' 'SLOW'")
            }

            const erc20Address = resolveContractAddress(rate.fromSymbol)
            if (!erc20Address) {
                throw new Error("Can't find contract address from the given symbol")
            }
            if (erc20Address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
                throw new Error("Doesn't need to do approve for native ETH")
            }

            // @ts-ignore
            const sourceTokenContract = new this.web3.eth.Contract(erc20Abi, erc20Address)
            const currentAccount = await this.getAccount()
            const totalSupply = await sourceTokenContract.methods.totalSupply().call()
            const gasOptions = option ? constructGasOptions(option, rate) : defaultGasOptions(rate)
            const tx = await sourceTokenContract.methods.approve(KULAP_DEX_CONTRACT, totalSupply).send({ from: currentAccount, ...gasOptions })
            return tx
            return
        } catch (e) {
            throw new Error(e)
        }
    }

    async trade(rate: Rate, partnerId?: number, option?: string): Promise<any> {

        if (option && ["FAST", "STD", "SLOW"].indexOf(option) === -1) {
            throw new Error("Given option is not valid. Please use 'FAST' 'STD' 'SLOW'")
        }

        try {
            // @ts-ignore
            const dexContract = new this.web3.eth.Contract(kulapAbi, KULAP_DEX_CONTRACT)
            const currentAccount = await this.getAccount()
            let gasOptions = option ? constructGasOptions(option, rate) : defaultGasOptions(rate)
            // Supply value when the source is native ETH
            if (rate.fromSymbol === "ETH") {
                gasOptions = {
                    value: rate.fromAmount,
                    ...gasOptions,
                }
            }
            const tradingProxyIndex = rate.routes[0]
            const fromAddress = resolveContractAddress(rate.fromSymbol)
            const toAddress = resolveContractAddress(rate.toSymbol)

            // @ts-ignore
            const normalizedToAmount = (this.web3.utils.toBN(rate.toAmount).mul(this.web3.utils.toBN("97")).div(this.web3.utils.toBN("100")))

            const tx = await dexContract.methods.trade(
                tradingProxyIndex,
                fromAddress,
                rate.fromAmount,
                toAddress,
                normalizedToAmount.toString(), // Do offset at the client side
                // rate.toAmount,
                partnerId ? partnerId : 0
            ).send({
                from: currentAccount,
                ...gasOptions
            })

            return tx
        } catch (e) {
            console.log(e)
            throw new Error(e)
        }
    }

    async totalProxies(): Promise<Number> {
        try {
            // @ts-ignore
            const contract = new this.web3.eth.Contract(kulapAbi, KULAP_DEX_CONTRACT)
            const total = await contract.methods.getProxyCount().call()
            return Number(total)
        } catch (e) {
            throw new Error(e)
        }
    }

    async balanceOf(symbol: string): Promise<any> {

        try {
            if (symbol === "ETH") {
                throw new Error("Not support ETH")
            }
            const erc20Address = resolveContractAddress(symbol)
            if (!erc20Address) {
                throw new Error("Can't find contract address from the given symbol")
            }
            // @ts-ignore
            const tokenContract = new this.web3.eth.Contract(erc20Abi, erc20Address)
            const currentAccount = await this.getAccount()
            const amount = await tokenContract.methods.balanceOf(currentAccount).call()
            return Number(this.web3.utils.fromWei(amount))
        } catch (e) {
            throw new Error(e)
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