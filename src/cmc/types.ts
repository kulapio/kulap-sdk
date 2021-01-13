export type QuoteCoin = {
  name: string
  price: string
  id: number
}

export type Quotes = {
  [key: string]: QuoteCoin
}
