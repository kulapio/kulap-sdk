export type QuoteCoin = {
  name: string
  price: string
}

export type Quotes = {
  [key: string]: QuoteCoin
}
