# KULAP SDK 

This provides quick access to KULAP system where you can find the best rate when do swap or pay using ERC-20 tokens.

## Initialization

Install the SDK using npm or yarn

```
yarn add kulap-sdk
```

You will need to supply the provider whether from web3.js or ethers.js in order to initialize the SDK.

#### Node.js

```
const { Kulap } = require("kulap-sdk")
const Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/YOUR_PROJECT_ID"))

const kulapSDK = new Kulap('access_key',web3.currentProvider) // getting access key from the kulap.io console

```

#### ES6 / Typescript with injected Web3

```
import { Kulap } from "kulap-sdk"

const kulapSDK = new Kulap('access_key', window.ethereum) // getting access key from the kulap.io console

```

## Usage

#### To retrieve the list all available tokens
```
const symbols = kulapSDK.listSymbols()
```

#### Look for Network ID
```
const networkId = await kulapSDK.getNetworkId()
```

#### Get the rate of a token pair 
```
const srcToken = "ETH"
const destToken = "DAI"
const amountIn = "1000000000000000000" // 1 ETH

const rate = await kulapSDK.getRate(baseToken, pairToken, amountIn)
```
##### Response
| Value      | Description                                |
|------------|--------------------------------------------|
| rate       | Best rate given from off-chain API         | 
| routes     | Trading proxy containing the best rate     |          
| fromAmount | Source ERC20 token amount in Wei           | 
| fromSymbol | Source token symbol                        | 
| toAmount   | Destination ERC20 token amount in Wei      |
| toSymbol   | Destination token symbol                   | 
| gasOptions | GAS price options (SLOW, STD, FAST)        | 


