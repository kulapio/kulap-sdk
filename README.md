# KULAP SDK 

This SDK provides access to KULAP DEX from a custom application where the best rate will be given to you and your user on each trade using ERC-20 tokens.


## Initialization

Install the SDK using npm or yarn

```
yarn add kulap-sdk
```

You will need to the provider object to the constructor which will allows the SDK to automatically handle query and retrieve requests from blockchains the user is connected to. Also the access token doesn't required at the moment.

#### Node.js

```js
const { Kulap } = require("kulap-sdk")
const Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/YOUR_PROJECT_ID"))

const kulapSDK = new Kulap('access_key',web3.currentProvider) // getting access key from the kulap.io console
```

#### ES6 / Typescript with injected Web3 (Metamask)

```ts
import { Kulap } from "kulap-sdk"

const kulapSDK = new Kulap('access_key', window.ethereum) // getting access key from the kulap.io console
```
## Quick Start

Example: Swap 100 DAI to LINK

```js
const srcToken = "DAI"
const destToken = "LINK"
const amountIn = "100" // 100 DAI

const response = await kulapSDK.getRate(baseToken, pairToken, amountIn) // Get best rate from off-chain API

const isApproved = await kulapSDK.validate(response) // Check allowance of DAI token to Kulap DEX smart contract is made

if (!isApproved) {
  await kulapSDK.approve(response) // Giving a permission to Kulap DEX smart contract, the rights to transfer DAI
}

await kulapSDK.trade(response) // Execute trade

```
## Demo Dapp

We've build the demo dapp that allows you to quickly look up quickly look up how first sample application is made.

https://pensive-thompson-5185d1.netlify.app

Source code :

https://github.com/pisuthd/kulap-demo-dapp

## Usage

#### To retrieve the list all available tokens
```js
const symbols = kulapSDK.listSymbols()
```

#### To get network ID
```js
const networkId = await kulapSDK.getNetworkId()
```

#### To get the rate of a token pair 

This will help construct the order details from the pair and given amount that later you use it for validate, approve and execute a trade.

```ts
const srcToken = "ETH"
const destToken = "DAI"
const amountIn = "1" // 1 ETH

const order = await kulapSDK.getRate(baseToken, pairToken, amountIn)
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
```js
const isValidated = await kulapSDK.validate(response) // given response when get the rate 

or

const fromSymbol = "DAI"
const fromAmount = "100" // 100 DAI
const isValidated = await kulapSDK.validate({ fromSymbol, fromAmount })
```

#### To approve an ERC20
```js
await kulapSDK.approve(order) // given response when get the rate 

or

await kulapSDK.approve(order, { gasOptions : "FAST" }) // "FAST", "STD", "SLOW" (default : "FAST")

or

const fromSymbol = "LINK"
await kulapSDK.approve({ fromSymbol }, { gasOptions : "SLOW" })
```

#### Execute trade

We would recommend to set the slippage rate to prevent surge, for example the default value is 0, if the price is change more than the given price from order details, the transaction will failed.

```js
await kulapSDK.trade(order)

or

await kulapSDK.trade(order , { gasOptions : "FAST", slippage : 3  }) // slippage must be provided in percentage
```

If you registered as partner and want the commision to be paid out on transactions, kindly provide your partner id as following:
```js
await kulapSDK.trade(order, { partnerId : YOUR_ID })
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








