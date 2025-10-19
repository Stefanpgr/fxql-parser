export interface FxqlBlock {
  SourceCurrency: string;
  DestinationCurrency: string;
  SellPrice: number;
  BuyPrice: number;
  CapAmount: number;
  id?: string;
}

export interface CurrencyPair {
  sourceCurrency: string;
  destinationCurrency: string;
  buy: number;
  sell: number;
  cap: number
}