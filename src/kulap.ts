import axios, { AxiosError } from 'axios';
import Web3 from "web3"
import { ethers } from 'ethers'
import { Network, Configuration, APIError, TradeOptions, Rate, Options } from "./types"
import { SUPPORTED_TOKENS, API_BASE_URL, KULAP_DEX_CONTRACT } from "./constants"
import { kulapAbi } from "./abi"
import { resolveContractAddress, resolveTokenDecimals, constructGasOptions, defaultGasOptions } from "./utils"
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
        if (sourceToken === targetToken) return new Error("Same sourceToken and targetToken");

        try {
            const decimals = resolveTokenDecimals(sourceToken)
            const fromAmount = ethers.utils.parseUnits(amount, decimals.toString()).toString()
            const response = await axios.get(`${API_BASE_URL}/rate/best-rate/toAmount`, {
                params: {
                    from: sourceToken,
                    to: targetToken,
                    fromAmount: fromAmount,
                    accessKey: this.config.accessKey
                }
            })
            const tradeOptions: TradeOptions = response.data
            
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

    async getRateAmountOut(
        sourceToken: string,
        targetToken: string,
        amount: string
    ): Promise<Rate | APIError> {
        if (sourceToken === targetToken) return new Error("Same sourceToken and targetToken");

        try {
            const decimals = resolveTokenDecimals(sourceToken)
            const toAmount = ethers.utils.parseUnits(amount, decimals.toString()).toString()
            const response = await axios.get(`${API_BASE_URL}/rate/best-rate/fromAmount`, {
                params: {
                    from: sourceToken,
                    to: targetToken,
                    toAmount: toAmount,
                    accessKey: this.config.accessKey
                }
            })
            const tradeOptions: TradeOptions = response.data
            
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

    async approve(rate: Rate, options?: Options): Promise<any> {
        try {

            if (options && options.gasOptions && ["FAST", "STD", "SLOW"].indexOf(options.gasOptions) === -1) {
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
            const gasOptions = (options && options.gasOptions) ? constructGasOptions(options.gasOptions, rate) : defaultGasOptions(rate)
            const tx = await sourceTokenContract.methods.approve(KULAP_DEX_CONTRACT, totalSupply).send({ from: currentAccount, ...gasOptions })
            return tx
            return
        } catch (e) {
            throw new Error(e)
        }
    }

    async trade(rate: Rate, options?: Options): Promise<any> {

        if (options && options.gasOptions && ["FAST", "STD", "SLOW"].indexOf(options.gasOptions) === -1) {
            throw new Error("Given option is not valid. Please use 'FAST' 'STD' 'SLOW'")
        }

        if (options && options.slippage && !(options.slippage > 0 && options.slippage <= 10)) {
            throw new Error("Sllipage value must be in > 0 and <= 10")
        }

        try {
            // @ts-ignore
            const dexContract = new this.web3.eth.Contract(kulapAbi, KULAP_DEX_CONTRACT)
            const currentAccount = await this.getAccount()
            let gasOptions = (options && options.gasOptions) ? constructGasOptions(options.gasOptions, rate) : defaultGasOptions(rate)
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

            let normalizedToAmount
            if (options && options.slippage) {
                // @ts-ignore
                normalizedToAmount = (this.web3.utils.toBN(rate.toAmount).mul(this.web3.utils.toBN(`${100-options.slippage}`)).div(this.web3.utils.toBN("100")))
            } else {
                normalizedToAmount = (this.web3.utils.toBN(rate.toAmount))
            }

            const tx = await dexContract.methods.trade(
                tradingProxyIndex,
                fromAddress,
                rate.fromAmount,
                toAddress,
                normalizedToAmount ? normalizedToAmount.toString() : "0",
                options && options.partnerId ? options.partnerId : 0
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