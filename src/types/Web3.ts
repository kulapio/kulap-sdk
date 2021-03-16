
// export interface Web3Signature {
//     message: string;
//     messageHash: string;
//     v: string;
//     r: string;
//     s: string;
//     signature: string;
// }

// // The raw unsigned transaction object from web3
// // https://web3js.readthedocs.io/en/1.0/web3-eth.html#sendtransaction
// export interface UnsignedRawTransaction {
//     from: string;
//     to?: string;
//     value?: string;
//     gas?: string;
//     gasPrice?: string;
//     data?: string;
//     nonce?: string;
// }

// export type SignTransactionFunction = (
//     unsignedTransaction: UnsignedRawTransaction,
//     from?: string,
// ) => Promise<string>;

// export type SignMessageFunction = (
//     message: string,
//     from?: string,
// ) => Promise<Web3Signature>;

export interface GasOption {
    readonly gasLimit: string;
    readonly gasPrice: any;
}
