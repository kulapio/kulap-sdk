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
## Quick Start

Example: Swap 100 DAI to LINK

```
const srcToken = "DAI"
const destToken = "LINK"
const amountIn = "100000000000000000000" // 100 DAI in Wei unit

const response = await kulapSDK.getRate(baseToken, pairToken, amountIn) // Get best rate from off-chain API

const isApproved = await kulapSDK.validate(response) // Check allowance of DAI token to Kulap DEX smart contract is made

if (!isApproved) {
  await kulapSDK.approve(response) // Giving a permission to Kulap DEX smart contract, the rights to transfer DAI
}

await kulapSDK.trade(response) // Execute trade

```

## Usage

#### To retrieve the list all available tokens
```
const symbols = kulapSDK.listSymbols()
```

#### To get network ID
```
const networkId = await kulapSDK.getNetworkId()
```

#### To get the rate of a token pair 
```
const srcToken = "ETH"
const destToken = "DAI"
const amountIn = "1000000000000000000" // 1 ETH

const response = await kulapSDK.getRate(baseToken, pairToken, amountIn)
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

#### To get the allowance of an ERC20
```
const isValidated = await kulapSDK.validate(response) // given response when get the rate 
```

##### Or you can set manually by:
```
const fromSymbol = "DAI"
const fromAmount = "100000000000000000000" // 100 DAI
const isValidated = await kulapSDK.validate({ fromSymbol, fromAmount })
```

#### To approve an ERC20
```
await kulapSDK.approve(response) // given response when get the rate 
```
##### To provide gas price
```
await kulapSDK.approve(response, { gasOptions : "FAST" }) // Can be "FAST", "STD", "SLOW" (default : "STD")
```
#### Set it all manually
```
const fromSymbol = "LINK"
await kulapSDK.approve({ fromSymbol }, { gasOptions : "SLOW" })
```

#### Execute trade
This will send a transaction to the smart contract and execute trade method with the given provider.
```
await kulapSDK.trade(response, { gasOptions : "FAST" }) // Can be "FAST", "STD", "SLOW" (default : "STD")
```


## Running tests

To run the tests, follow these steps.

First clone the repository to your local machine and then install dependencies

```
yarn install
```
You will need to run forked mainnet of Ganache by

```
yarn run-ganache
```
Open another terminal and run tests
```
yarn test
```
This will execute the simulated trade of ETH to DAI and DAI to LINK on the local ganache server instead of running it on mainnet.








