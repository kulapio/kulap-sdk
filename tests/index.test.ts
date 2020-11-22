import { Kulap } from "../src"

let kulapSDK : any

describe("Kulap SDK", () => {

    beforeAll(() => {
        kulapSDK = new Kulap('access_key', "mainnet")
    });

    test("Verify constructor creation is correct", async () => {
        const networkName = kulapSDK.getCurrentNetwork()
        expect(networkName).toBe("mainnet");

        try {
            new Kulap('access_key', "wrong")
        } catch (error) {
            expect(error.message).toBe("Given network name is not valid.");
        }

    });

    test("Verify supported tokens list is correct", async () => {
        const symbols = kulapSDK.tokensList()
        expect( symbols.indexOf("ETH") ).toBeGreaterThan(-1)
        expect( symbols.indexOf("DAI") ).toBeGreaterThan(-1)
    });


    test("Verify returned rates and paths are received ", async () => {
        const baseToken = kulapSDK.tokensList()[0]
        const pairToken = kulapSDK.tokensList()[1]
        const amountIn = "1000000000000000000"
        const txOptions = await kulapSDK.getRate(baseToken, pairToken, amountIn)
        expect( Object.keys(txOptions).length).toBe(3)
        expect( txOptions.STD.trade.fromAmount ).toBe(amountIn)
    });

    
    

});