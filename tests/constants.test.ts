require('dotenv').config()
import { 
    CMC_IDS_MAP,
    SUPPORTED_TOKENS,
    TOKEN_ADDRESSES,
    TOKEN_DECIMALS,
    KULAP_DEX_CONTRACT 
} from '../src/constants'

function length(object: Object) {
    return Object.keys(object).length
}

describe('Asset', () => {
    test('Configure Asset Information correctly', async () => {
        // Number of assets
        expect(length(CMC_IDS_MAP) - 1).toEqual(SUPPORTED_TOKENS.length) // exclude BTC
        expect(length(TOKEN_ADDRESSES)).toEqual(SUPPORTED_TOKENS.length)
        expect(length(TOKEN_DECIMALS)).toEqual(SUPPORTED_TOKENS.length)

        // Asset informations
        const tokens = SUPPORTED_TOKENS.sort()
        const cmcIdAssets = Object.values(CMC_IDS_MAP).sort().filter(asset => asset !== 'BTC')
        const tokenAddressAssets = Object.keys(TOKEN_ADDRESSES).sort()
        const tokenDecimalsAssets = Object.keys(TOKEN_DECIMALS).sort()
        expect(cmcIdAssets).toEqual(tokens)
        expect(tokenAddressAssets).toEqual(tokens)
        expect(tokenDecimalsAssets).toEqual(tokens)

        // Token addresses
        Object.entries(TOKEN_ADDRESSES).forEach(([key, tokenAddress]) => {
            expect([tokenAddress, tokenAddress.length]).toEqual([tokenAddress, 42])
            expect([tokenAddress, tokenAddress.slice(0, 2)]).toEqual([tokenAddress, '0x'])
        })

        // Token decimals
        Object.entries(TOKEN_DECIMALS).forEach(([key, tokenDecimals]) => {
            expect(tokenDecimals).toBeGreaterThan(0)
            expect(tokenDecimals).toBeLessThanOrEqual(18)
        })
    })

    test('Dex', async () => {
        // Dex Contract Address
        expect(KULAP_DEX_CONTRACT).toEqual('0x3833cf2972394d636b1C5b80d34FeE1F17175b77')
        expect(KULAP_DEX_CONTRACT.length).toEqual(42)
        expect(KULAP_DEX_CONTRACT.slice(0, 2)).toEqual('0x')
    })
})