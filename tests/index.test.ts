import { Kulap } from "../src"
import Web3 from "web3"

let kulapSDK: any
let rateEthDai : any
let rateDaiLink : any

describe("Kulap SDK", () => {

    beforeAll(async () => {

        const web3 = new Web3('http://localhost:8545')

        kulapSDK = new Kulap('access_key',web3.currentProvider)
    });

    test("Local ganache is running and connected to mainnet" , async () => {
        const networkId = await kulapSDK.getNetworkId()
        expect(networkId).toBe(1)
    })

    test("Verify supported tokens", async () => {
        const symbols = kulapSDK.listSymbols()
        expect(symbols.indexOf("ETH")).toBeGreaterThan(-1)
        expect(symbols.indexOf("WBTC")).toBeGreaterThan(-1)
        expect(symbols.indexOf("OMG")).toBeGreaterThan(-1)
    })

    test("Verify returned rates and routes from off-chain API", async () => {
        const symbols : string[] = kulapSDK.listSymbols()
        const baseToken = symbols.find(symbol => symbol === "ETH")
        const pairToken = symbols.find(symbol => symbol === "DAI")
        const amountIn = "1000000000000000000" // 1 ETH
        rateEthDai = await kulapSDK.getRate(baseToken, pairToken, amountIn)
        expect(rateEthDai.routes.length).toBeGreaterThan(0)
        expect(rateEthDai.fromAmount).toBe(amountIn)
    
    })

    test("Verify there is trading proxies", async () => {
        const totalProxies = await kulapSDK.totalProxies()
        expect(totalProxies).toBeGreaterThan(0)
    })

    test("Verify validation and approve fuctions are functional", async () => {
        const symbols : string[] = kulapSDK.listSymbols()
        const baseToken = symbols.find(symbol => symbol === "DAI")
        const pairToken = symbols.find(symbol => symbol === "LINK")
        const amountIn = "100000000000000000000" // 100 DAI
        rateDaiLink = await kulapSDK.getRate(baseToken, pairToken, amountIn)
        const validated = await kulapSDK.validate(rateDaiLink)
        if (!validated) {
            await kulapSDK.approve(rateDaiLink, {
                gasOptions : "FAST"
            })
        }
        const afterApproval = await kulapSDK.validate(rateDaiLink)
        expect(afterApproval).toBe(true)
    })

    test("Verify trade execution", async () => {
        // Trade ETH -> DAI
        const beforeBuyDAI = await kulapSDK.balanceOf("DAI")
        await kulapSDK.trade(rateEthDai , {
            gasOptions : "FAST",
            slippage : 3
        })
        const afterBuyDAI = await kulapSDK.balanceOf("DAI")
        expect(afterBuyDAI).toBeGreaterThan(beforeBuyDAI)
        // Trade DAI -> LINK
        const beforeBuyLINK = await kulapSDK.balanceOf("LINK")
        await kulapSDK.trade(rateDaiLink , {
            gasOptions : "FAST",
            slippage : 5
        })
        const afterBuyLINK = await kulapSDK.balanceOf("LINK")
        expect(afterBuyLINK).toBeGreaterThan(beforeBuyLINK)
        const afterSellDAI = await kulapSDK.balanceOf("DAI")
        expect(afterBuyDAI).toBeGreaterThan(afterSellDAI)


    })

});