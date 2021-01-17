require('dotenv').config()

export const API_BASE_URL = process.env.KULAP_API_BASH_URL || 'https://api.kulap.io/v1/api'
console.log('API_BASE_URL', API_BASE_URL)
export const CMC_URL = "https://pro-api.coinmarketcap.com"

export const CMC_IDS_MAP = {
    1: 'BTC',
    1027: 'ETH',
    825: 'USDT',
    3408: 'USDC',
    4943: 'DAI',
    3717: 'WBTC',
    1975: 'LINK',
    1518: 'MKR',
    1934: 'LRC',
    2586: 'SNX',
    5692: 'COMP',
    1982: 'KNC',
    1896: 'ZRX',
    1808: 'OMG',
    2739: 'DGX',
    1697: 'BAT',
    4687: 'BUSD',
    4679: 'BAND',
    7083: 'UNI',
    6758: 'SUSHI'
}

export const SUPPORTED_TOKENS = [
    "ETH",
    "USDT",
    "USDC",
    "DAI",
    "WBTC",
    "LINK",
    "MKR",
    "LRC",
    "SNX",
    "COMP",
    "KNC",
    "ZRX",
    "OMG",
    "DGX",
    "BAT",
    "BUSD",
    "BAND",
    "UNI",
    "SUSHI"
]

export const TOKEN_ADDRESSES = {
    "BAND":     "0xba11d00c5f74255f56a5e366f4f77f5a186d7f55",
    "BAT":      "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    "BUSD":     "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    "COMP":     "0xc00e94cb662c3520282e6f5717214004a7f26888",
    "DAI":      "0x6b175474e89094c44da98b954eedeac495271d0f",
    "DGX":      "0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf",
    "ETH":      "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "KNC":      "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
    "LINK":     "0x514910771af9ca656af840dff83e8264ecf986ca",
    "LRC":      "0xbbbbca6a901c926f240b89eacb641d8aec7aeafd",
    "MKR":      "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    "OMG":      "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07",
    "SNX":      "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
    "USDC":     "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "USDT":     "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "WBTC":     "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    "ZRX":      "0xe41d2489571d322189246dafa5ebde1f4699f498",
    "UNI":      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    "SUSHI":    "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
}

export const TOKEN_DECIMALS = {
    "BAND": 18,
    "BAT": 18,
    "BUSD": 18,
    "COMP": 18,
    "DAI": 18,
    "DGX": 9,
    "ETH": 18,
    "KNC": 18,
    "LINK": 18,
    "LRC": 18,
    "MKR":  18,
    "OMG": 18,
    "SNX": 18,
    "USDC": 6,
    "USDT": 6,
    "WBTC": 8,
    "ZRX": 18,
    "UNI": 18,
    "SUSHI": 18
}

export const KULAP_DEX_CONTRACT = "0x3833cf2972394d636b1C5b80d34FeE1F17175b77"

