export enum NodeEnvironment {
  Prod = 'production',
  Dev = 'development',
}

export const ONE_HOUR_AS_SECONDS = 3600;
export const FIVE_MIN_AS_SECONDS = 300;

export const IS_PROD = process.env.NODE_ENV === NodeEnvironment.Prod;
