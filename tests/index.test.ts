import { Kulap } from "../src"
import Web3 from "web3"

let kulapSDK: any
let testRate : any

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
        testRate = await kulapSDK.getRate(baseToken, pairToken, amountIn)
        expect(testRate.routes.length).toBeGreaterThan(0)
        expect(testRate.fromAmount).toBe(amountIn)
    
    })

    test("Verify there is trading proxies", async () => {
        const totalProxies = await kulapSDK.totalProxies()
        expect(totalProxies).toBeGreaterThan(0)
    })

    test("Verify validation and approve fuctions are functional", async () => {
        const symbols : string[] = kulapSDK.listSymbols()
        const baseToken = symbols.find(symbol => symbol === "DAI")
        const pairToken = symbols.find(symbol => symbol === "ETH")
        const amountIn = "1000000000000000000" // 1 DAI
        const rateForApprove = await kulapSDK.getRate(baseToken, pairToken, amountIn)
        const validated = await kulapSDK.validate(rateForApprove)
        if (!validated) {
            await kulapSDK.approve(rateForApprove, "FAST")
        }
        const afterApproval = await kulapSDK.validate(rateForApprove)
        expect(afterApproval).toBe(true)
    })

    test("Verify trade execution", async () => {
        
        const beforeSwap = await kulapSDK.balanceOf("DAI")
        await kulapSDK.trade(testRate)
        const afterSwap = await kulapSDK.balanceOf("DAI")
        expect(afterSwap).toBeGreaterThan(beforeSwap)
        console.log("before / after ", `${beforeSwap} DAI`, `${afterSwap} DAI`)
    })

});