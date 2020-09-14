import {
  DMMF,
  DMMFClass,
  Engine,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  sqltag as sql,
  empty,
  join,
  raw,
} from './runtime';

export { PrismaClientKnownRequestError }
export { PrismaClientUnknownRequestError }
export { PrismaClientRustPanicError }
export { PrismaClientInitializationError }
export { PrismaClientValidationError }

/**
 * Re-export of sql-template-tag
 */
export { sql, empty, join, raw }

/**
 * Prisma Client JS version: 2.6.1
 * Query Engine version: 6a8054bb549e4cc23f157b0010cb2e95cb2637fb
 */
export declare type PrismaVersion = {
  client: string
}

export declare const prismaVersion: PrismaVersion 

/**
 * Utility Types
 */

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON object.
 * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
 */
export declare type JsonObject = {[Key in string]?: JsonValue}
 
/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON array.
 */
export declare interface JsonArray extends Array<JsonValue> {}
 
/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches any valid JSON value.
 */
export declare type JsonValue = string | number | boolean | null | JsonObject | JsonArray

/**
 * Same as JsonObject, but allows undefined
 */
export declare type InputJsonObject = {[Key in string]?: JsonValue}
 
export declare interface InputJsonArray extends Array<JsonValue> {}
 
export declare type InputJsonValue = undefined |  string | number | boolean | null | InputJsonObject | InputJsonArray

declare type SelectAndInclude = {
  select: any
  include: any
}

declare type HasSelect = {
  select: any
}

declare type HasInclude = {
  include: any
}

declare type CheckSelect<T, S, U> = T extends SelectAndInclude
  ? 'Please either choose `select` or `include`'
  : T extends HasSelect
  ? U
  : T extends HasInclude
  ? U
  : S

/**
 * Get the type of the value, that the Promise holds.
 */
export declare type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

/**
 * Get the return type of a function which returns a Promise.
 */
export declare type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>


export declare type Enumerable<T> = T | Array<T>;

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

export declare type TruthyKeys<T> = {
  [key in keyof T]: T[key] extends false | undefined | null ? never : key
}[keyof T]

export declare type TrueKeys<T> = TruthyKeys<Pick<T, RequiredKeys<T>>>

/**
 * Subset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
 */
export declare type Subset<T, U> = {
  [key in keyof T]: key extends keyof U ? T[key] : never;
};
declare class PrismaClientFetcher {
  private readonly prisma;
  private readonly debug;
  private readonly hooks?;
  constructor(prisma: PrismaClient<any, any>, debug?: boolean, hooks?: Hooks | undefined);
  request<T>(document: any, dataPath?: string[], rootField?: string, typeName?: string, isList?: boolean, callsite?: string): Promise<T>;
  sanitizeMessage(message: string): string;
  protected unpack(document: any, data: any, path: string[], rootField?: string, isList?: boolean): any;
}


/**
 * Client
**/

export declare type Datasource = {
  url?: string
}

export type Datasources = {
  db?: Datasource
}

export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'

export interface PrismaClientOptions {
  /**
   * Overwrites the datasource url from your prisma.schema file
   */
  datasources?: Datasources

  /**
   * @default "colorless"
   */
  errorFormat?: ErrorFormat

  /**
   * @example
   * ```
   * // Defaults to stdout
   * log: ['query', 'info', 'warn', 'error']
   * 
   * // Emit as events
   * log: [
   *  { emit: 'stdout', level: 'query' },
   *  { emit: 'stdout', level: 'info' },
   *  { emit: 'stdout', level: 'warn' }
   *  { emit: 'stdout', level: 'error' }
   * ]
   * ```
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
   */
  log?: Array<LogLevel | LogDefinition>
}

export type Hooks = {
  beforeRequest?: (options: {query: string, path: string[], rootField?: string, typeName?: string, document: any}) => any
}

/* Types for Logging */
export type LogLevel = 'info' | 'query' | 'warn' | 'error'
export type LogDefinition = {
  level: LogLevel
  emit: 'stdout' | 'event'
}

export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
  GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
  : never

export type QueryEvent = {
  timestamp: Date
  query: string
  params: string
  duration: number
  target: string
}

export type LogEvent = {
  timestamp: Date
  message: string
  target: string
}
/* End Types for Logging */


export type PrismaAction =
  | 'findOne'
  | 'findMany'
  | 'create'
  | 'update'
  | 'updateMany'
  | 'upsert'
  | 'delete'
  | 'deleteMany'
  | 'executeRaw'
  | 'queryRaw'
  | 'aggregate'

/**
 * These options are being passed in to the middleware as "params"
 */
export type MiddlewareParams = {
  model?: string
  action: PrismaAction
  args: any
  dataPath: string[]
  runInTransaction: boolean
}

/**
 * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
 */
export type Middleware<T = any> = (
  params: MiddlewareParams,
  next: (params: MiddlewareParams) => Promise<T>,
) => Promise<T>

// tested in getLogLevel.test.ts
export declare function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js (ORM replacement)
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export declare class PrismaClient<
  T extends PrismaClientOptions = PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<LogLevel | LogDefinition> ? GetEvents<T['log']> : never : never
> {
  /**
   * @private
   */
  private fetcher;
  /**
   * @private
   */
  private readonly dmmf;
  /**
   * @private
   */
  private connectionPromise?;
  /**
   * @private
   */
  private disconnectionPromise?;
  /**
   * @private
   */
  private readonly engineConfig;
  /**
   * @private
   */
  private readonly measurePerformance;
  /**
   * @private
   */
  private engine: Engine;
  /**
   * @private
   */
  private errorFormat: ErrorFormat;

  /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js (ORM replacement)
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */
  constructor(optionsArg?: T);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? QueryEvent : LogEvent) => void): void;
  /**
   * @deprecated renamed to `$on`
   */
  on<V extends U>(eventType: V, callback: (event: V extends 'query' ? QueryEvent : LogEvent) => void): void;
  /**
   * Connect with the database
   */
  $connect(): Promise<void>;
  /**
   * @deprecated renamed to `$connect`
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): Promise<any>;
  /**
   * @deprecated renamed to `$disconnect`
   */
  disconnect(): Promise<any>;

  /**
   * Add a middleware
   */
  $use(cb: Middleware): void

  /**
   * Executes a raw query and returns the number of affected rows
   * @example
   * ```
   * // With parameters use prisma.executeRaw``, values will be escaped automatically
   * const result = await prisma.executeRaw`UPDATE User SET cool = ${true} WHERE id = ${1};`
   * // Or
   * const result = await prisma.executeRaw('UPDATE User SET cool = $1 WHERE id = $2 ;', true, 1)
  * ```
  * 
  * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
  */
  $executeRaw<T = any>(query: string | TemplateStringsArray, ...values: any[]): Promise<number>;

  /**
   * @deprecated renamed to `$executeRaw`
   */
  executeRaw<T = any>(query: string | TemplateStringsArray, ...values: any[]): Promise<number>;

  /**
   * Performs a raw query and returns the SELECT data
   * @example
   * ```
   * // With parameters use prisma.queryRaw``, values will be escaped automatically
   * const result = await prisma.queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'ema.il'};`
   * // Or
   * const result = await prisma.queryRaw('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'ema.il')
  * ```
  * 
  * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
  */
  $queryRaw<T = any>(query: string | TemplateStringsArray, ...values: any[]): Promise<T>;
 
  /**
   * @deprecated renamed to `$executeRaw`
   */
  queryRaw<T = any>(query: string | TemplateStringsArray, ...values: any[]): Promise<T>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): UserDelegate;

  /**
   * `prisma.accountSummaryTimestamp`: Exposes CRUD operations for the **AccountSummaryTimestamp** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AccountSummaryTimestamps
    * const accountSummaryTimestamps = await prisma.accountSummaryTimestamp.findMany()
    * ```
    */
  get accountSummaryTimestamp(): AccountSummaryTimestampDelegate;

  /**
   * `prisma.share`: Exposes CRUD operations for the **Share** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Shares
    * const shares = await prisma.share.findMany()
    * ```
    */
  get share(): ShareDelegate;

  /**
   * `prisma.userTransaction`: Exposes CRUD operations for the **UserTransaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserTransactions
    * const userTransactions = await prisma.userTransaction.findMany()
    * ```
    */
  get userTransaction(): UserTransactionDelegate;

  /**
   * `prisma.marketHolidays`: Exposes CRUD operations for the **MarketHolidays** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MarketHolidays
    * const marketHolidays = await prisma.marketHolidays.findMany()
    * ```
    */
  get marketHolidays(): MarketHolidaysDelegate;

  /**
   * `prisma.userVerification`: Exposes CRUD operations for the **UserVerification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserVerifications
    * const userVerifications = await prisma.userVerification.findMany()
    * ```
    */
  get userVerification(): UserVerificationDelegate;
}



/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export declare const UserDistinctFieldEnum: {
  id: 'id',
  email: 'email',
  password: 'password',
  firstName: 'firstName',
  lastName: 'lastName',
  hasFinishedSettingUp: 'hasFinishedSettingUp',
  avatarUrl: 'avatarUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
  region: 'region',
  regionalRanking: 'regionalRanking',
  occupation: 'occupation',
  ranking: 'ranking',
  cash: 'cash',
  totalPortfolio: 'totalPortfolio',
  totalPortfolioLastClosure: 'totalPortfolioLastClosure',
  watchlist: 'watchlist'
};

export declare type UserDistinctFieldEnum = (typeof UserDistinctFieldEnum)[keyof typeof UserDistinctFieldEnum]


export declare const AccountSummaryTimestampDistinctFieldEnum: {
  id: 'id',
  UTCDateString: 'UTCDateString',
  UTCDateKey: 'UTCDateKey',
  year: 'year',
  portfolioValue: 'portfolioValue',
  userID: 'userID'
};

export declare type AccountSummaryTimestampDistinctFieldEnum = (typeof AccountSummaryTimestampDistinctFieldEnum)[keyof typeof AccountSummaryTimestampDistinctFieldEnum]


export declare const ShareDistinctFieldEnum: {
  id: 'id',
  companyCode: 'companyCode',
  quantity: 'quantity',
  buyPriceAvg: 'buyPriceAvg',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userID: 'userID'
};

export declare type ShareDistinctFieldEnum = (typeof ShareDistinctFieldEnum)[keyof typeof ShareDistinctFieldEnum]


export declare const UserTransactionDistinctFieldEnum: {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  companyCode: 'companyCode',
  quantity: 'quantity',
  priceAtTransaction: 'priceAtTransaction',
  limitPrice: 'limitPrice',
  brokerage: 'brokerage',
  spendOrGain: 'spendOrGain',
  isFinished: 'isFinished',
  finishedTime: 'finishedTime',
  isTypeBuy: 'isTypeBuy',
  note: 'note',
  userID: 'userID'
};

export declare type UserTransactionDistinctFieldEnum = (typeof UserTransactionDistinctFieldEnum)[keyof typeof UserTransactionDistinctFieldEnum]


export declare const MarketHolidaysDistinctFieldEnum: {
  id: 'id',
  year: 'year',
  newYearsDay: 'newYearsDay',
  martinLutherKingJrDay: 'martinLutherKingJrDay',
  washingtonBirthday: 'washingtonBirthday',
  goodFriday: 'goodFriday',
  memorialDay: 'memorialDay',
  independenceDay: 'independenceDay',
  laborDay: 'laborDay',
  thanksgivingDay: 'thanksgivingDay',
  christmas: 'christmas'
};

export declare type MarketHolidaysDistinctFieldEnum = (typeof MarketHolidaysDistinctFieldEnum)[keyof typeof MarketHolidaysDistinctFieldEnum]


export declare const UserVerificationDistinctFieldEnum: {
  id: 'id',
  email: 'email',
  password: 'password',
  expiredAt: 'expiredAt'
};

export declare type UserVerificationDistinctFieldEnum = (typeof UserVerificationDistinctFieldEnum)[keyof typeof UserVerificationDistinctFieldEnum]


export declare const SortOrder: {
  asc: 'asc',
  desc: 'desc'
};

export declare type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]



/**
 * Model User
 */

export type User = {
  id: string
  email: string | null
  password: string | null
  firstName: string | null
  lastName: string | null
  hasFinishedSettingUp: boolean
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
  dateOfBirth: Date | null
  gender: string | null
  region: string | null
  regionalRanking: number | null
  occupation: string | null
  ranking: number | null
  cash: number | null
  totalPortfolio: number | null
  totalPortfolioLastClosure: number | null
  watchlist: string[]
}


export type AggregateUser = {
  count: number
  avg: UserAvgAggregateOutputType | null
  sum: UserSumAggregateOutputType | null
  min: UserMinAggregateOutputType | null
  max: UserMaxAggregateOutputType | null
}

export type UserAvgAggregateOutputType = {
  regionalRanking: number
  ranking: number
  cash: number
  totalPortfolio: number
  totalPortfolioLastClosure: number
}

export type UserSumAggregateOutputType = {
  regionalRanking: number | null
  ranking: number | null
  cash: number | null
  totalPortfolio: number | null
  totalPortfolioLastClosure: number | null
}

export type UserMinAggregateOutputType = {
  regionalRanking: number | null
  ranking: number | null
  cash: number | null
  totalPortfolio: number | null
  totalPortfolioLastClosure: number | null
}

export type UserMaxAggregateOutputType = {
  regionalRanking: number | null
  ranking: number | null
  cash: number | null
  totalPortfolio: number | null
  totalPortfolioLastClosure: number | null
}


export type UserAvgAggregateInputType = {
  regionalRanking?: true
  ranking?: true
  cash?: true
  totalPortfolio?: true
  totalPortfolioLastClosure?: true
}

export type UserSumAggregateInputType = {
  regionalRanking?: true
  ranking?: true
  cash?: true
  totalPortfolio?: true
  totalPortfolioLastClosure?: true
}

export type UserMinAggregateInputType = {
  regionalRanking?: true
  ranking?: true
  cash?: true
  totalPortfolio?: true
  totalPortfolioLastClosure?: true
}

export type UserMaxAggregateInputType = {
  regionalRanking?: true
  ranking?: true
  cash?: true
  totalPortfolio?: true
  totalPortfolioLastClosure?: true
}

export type AggregateUserArgs = {
  where?: UserWhereInput
  orderBy?: Enumerable<UserOrderByInput>
  cursor?: UserWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Enumerable<UserDistinctFieldEnum>
  count?: true
  avg?: UserAvgAggregateInputType
  sum?: UserSumAggregateInputType
  min?: UserMinAggregateInputType
  max?: UserMaxAggregateInputType
}

export type GetUserAggregateType<T extends AggregateUserArgs> = {
  [P in keyof T]: P extends 'count' ? number : GetUserAggregateScalarType<T[P]>
}

export type GetUserAggregateScalarType<T extends any> = {
  [P in keyof T]: P extends keyof UserAvgAggregateOutputType ? UserAvgAggregateOutputType[P] : never
}
    
    

export type UserSelect = {
  id?: boolean
  email?: boolean
  password?: boolean
  firstName?: boolean
  lastName?: boolean
  hasFinishedSettingUp?: boolean
  avatarUrl?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  dateOfBirth?: boolean
  gender?: boolean
  region?: boolean
  regionalRanking?: boolean
  occupation?: boolean
  ranking?: boolean
  cash?: boolean
  totalPortfolio?: boolean
  totalPortfolioLastClosure?: boolean
  watchlist?: boolean
  transactions?: boolean | FindManyUserTransactionArgs
  shares?: boolean | FindManyShareArgs
  accountSummaryChartInfo?: boolean | FindManyAccountSummaryTimestampArgs
}

export type UserInclude = {
  transactions?: boolean | FindManyUserTransactionArgs
  shares?: boolean | FindManyShareArgs
  accountSummaryChartInfo?: boolean | FindManyAccountSummaryTimestampArgs
}

export type UserGetPayload<
  S extends boolean | null | undefined | UserArgs,
  U = keyof S
> = S extends true
  ? User
  : S extends undefined
  ? never
  : S extends UserArgs | FindManyUserArgs
  ? 'include' extends U
    ? User  & {
      [P in TrueKeys<S['include']>]:
      P extends 'transactions'
      ? Array<UserTransactionGetPayload<S['include'][P]>> :
      P extends 'shares'
      ? Array<ShareGetPayload<S['include'][P]>> :
      P extends 'accountSummaryChartInfo'
      ? Array<AccountSummaryTimestampGetPayload<S['include'][P]>> : never
    }
  : 'select' extends U
    ? {
      [P in TrueKeys<S['select']>]:P extends keyof User ? User[P]
: 
      P extends 'transactions'
      ? Array<UserTransactionGetPayload<S['select'][P]>> :
      P extends 'shares'
      ? Array<ShareGetPayload<S['select'][P]>> :
      P extends 'accountSummaryChartInfo'
      ? Array<AccountSummaryTimestampGetPayload<S['select'][P]>> : never
    }
  : User
: User


export interface UserDelegate {
  /**
   * Find zero or one User.
   * @param {FindOneUserArgs} args - Arguments to find a User
   * @example
   * // Get one User
   * const user = await prisma.user.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneUserArgs>(
    args: Subset<T, FindOneUserArgs>
  ): CheckSelect<T, Prisma__UserClient<User | null>, Prisma__UserClient<UserGetPayload<T> | null>>
  /**
   * Find zero or more Users.
   * @param {FindManyUserArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Users
   * const users = await prisma.user.findMany()
   * 
   * // Get first 10 Users
   * const users = await prisma.user.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyUserArgs>(
    args?: Subset<T, FindManyUserArgs>
  ): CheckSelect<T, Promise<Array<User>>, Promise<Array<UserGetPayload<T>>>>
  /**
   * Create a User.
   * @param {UserCreateArgs} args - Arguments to create a User.
   * @example
   * // Create one User
   * const User = await prisma.user.create({
   *   data: {
   *     // ... data to create a User
   *   }
   * })
   * 
  **/
  create<T extends UserCreateArgs>(
    args: Subset<T, UserCreateArgs>
  ): CheckSelect<T, Prisma__UserClient<User>, Prisma__UserClient<UserGetPayload<T>>>
  /**
   * Delete a User.
   * @param {UserDeleteArgs} args - Arguments to delete one User.
   * @example
   * // Delete one User
   * const User = await prisma.user.delete({
   *   where: {
   *     // ... filter to delete one User
   *   }
   * })
   * 
  **/
  delete<T extends UserDeleteArgs>(
    args: Subset<T, UserDeleteArgs>
  ): CheckSelect<T, Prisma__UserClient<User>, Prisma__UserClient<UserGetPayload<T>>>
  /**
   * Update one User.
   * @param {UserUpdateArgs} args - Arguments to update one User.
   * @example
   * // Update one User
   * const user = await prisma.user.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  update<T extends UserUpdateArgs>(
    args: Subset<T, UserUpdateArgs>
  ): CheckSelect<T, Prisma__UserClient<User>, Prisma__UserClient<UserGetPayload<T>>>
  /**
   * Delete zero or more Users.
   * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
   * @example
   * // Delete a few Users
   * const { count } = await prisma.user.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends UserDeleteManyArgs>(
    args: Subset<T, UserDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more Users.
   * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Users
   * const user = await prisma.user.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  updateMany<T extends UserUpdateManyArgs>(
    args: Subset<T, UserUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one User.
   * @param {UserUpsertArgs} args - Arguments to update or create a User.
   * @example
   * // Update or create a User
   * const user = await prisma.user.upsert({
   *   create: {
   *     // ... data to create a User
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the User we want to update
   *   }
   * })
  **/
  upsert<T extends UserUpsertArgs>(
    args: Subset<T, UserUpsertArgs>
  ): CheckSelect<T, Prisma__UserClient<User>, Prisma__UserClient<UserGetPayload<T>>>
  /**
   * Count
   */
  count(args?: Omit<FindManyUserArgs, 'select' | 'include'>): Promise<number>

  /**
   * Aggregate
   */
  aggregate<T extends AggregateUserArgs>(args: Subset<T, AggregateUserArgs>): Promise<GetUserAggregateType<T>>
}

/**
 * The delegate class that acts as a "Promise-like" for User.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in 
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export declare class Prisma__UserClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  transactions<T extends FindManyUserTransactionArgs = {}>(args?: Subset<T, FindManyUserTransactionArgs>): CheckSelect<T, Promise<Array<UserTransaction>>, Promise<Array<UserTransactionGetPayload<T>>>>;

  shares<T extends FindManyShareArgs = {}>(args?: Subset<T, FindManyShareArgs>): CheckSelect<T, Promise<Array<Share>>, Promise<Array<ShareGetPayload<T>>>>;

  accountSummaryChartInfo<T extends FindManyAccountSummaryTimestampArgs = {}>(args?: Subset<T, FindManyAccountSummaryTimestampArgs>): CheckSelect<T, Promise<Array<AccountSummaryTimestamp>>, Promise<Array<AccountSummaryTimestampGetPayload<T>>>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * User findOne
 */
export type FindOneUserArgs = {
  /**
   * Select specific fields to fetch from the User
  **/
  select?: UserSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserInclude | null
  /**
   * Filter, which User to fetch.
  **/
  where: UserWhereUniqueInput
}


/**
 * User findMany
 */
export type FindManyUserArgs = {
  /**
   * Select specific fields to fetch from the User
  **/
  select?: UserSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserInclude | null
  /**
   * Filter, which Users to fetch.
  **/
  where?: UserWhereInput
  /**
   * Determine the order of the Users to fetch.
  **/
  orderBy?: Enumerable<UserOrderByInput>
  /**
   * Sets the position for listing Users.
  **/
  cursor?: UserWhereUniqueInput
  /**
   * The number of Users to fetch. If negative number, it will take Users before the `cursor`.
  **/
  take?: number
  /**
   * Skip the first `n` Users.
  **/
  skip?: number
  distinct?: Enumerable<UserDistinctFieldEnum>
}


/**
 * User create
 */
export type UserCreateArgs = {
  /**
   * Select specific fields to fetch from the User
  **/
  select?: UserSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserInclude | null
  /**
   * The data needed to create a User.
  **/
  data: UserCreateInput
}


/**
 * User update
 */
export type UserUpdateArgs = {
  /**
   * Select specific fields to fetch from the User
  **/
  select?: UserSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserInclude | null
  /**
   * The data needed to update a User.
  **/
  data: UserUpdateInput
  /**
   * Choose, which User to update.
  **/
  where: UserWhereUniqueInput
}


/**
 * User updateMany
 */
export type UserUpdateManyArgs = {
  data: UserUpdateManyMutationInput
  where?: UserWhereInput
}


/**
 * User upsert
 */
export type UserUpsertArgs = {
  /**
   * Select specific fields to fetch from the User
  **/
  select?: UserSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserInclude | null
  /**
   * The filter to search for the User to update in case it exists.
  **/
  where: UserWhereUniqueInput
  /**
   * In case the User found by the `where` argument doesn't exist, create a new User with this data.
  **/
  create: UserCreateInput
  /**
   * In case the User was found with the provided `where` argument, update it with this data.
  **/
  update: UserUpdateInput
}


/**
 * User delete
 */
export type UserDeleteArgs = {
  /**
   * Select specific fields to fetch from the User
  **/
  select?: UserSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserInclude | null
  /**
   * Filter which User to delete.
  **/
  where: UserWhereUniqueInput
}


/**
 * User deleteMany
 */
export type UserDeleteManyArgs = {
  where?: UserWhereInput
}


/**
 * User without action
 */
export type UserArgs = {
  /**
   * Select specific fields to fetch from the User
  **/
  select?: UserSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserInclude | null
}



/**
 * Model AccountSummaryTimestamp
 */

export type AccountSummaryTimestamp = {
  id: string
  UTCDateString: string
  UTCDateKey: string
  year: number
  portfolioValue: number
  userID: string
}


export type AggregateAccountSummaryTimestamp = {
  count: number
  avg: AccountSummaryTimestampAvgAggregateOutputType | null
  sum: AccountSummaryTimestampSumAggregateOutputType | null
  min: AccountSummaryTimestampMinAggregateOutputType | null
  max: AccountSummaryTimestampMaxAggregateOutputType | null
}

export type AccountSummaryTimestampAvgAggregateOutputType = {
  year: number
  portfolioValue: number
}

export type AccountSummaryTimestampSumAggregateOutputType = {
  year: number
  portfolioValue: number
}

export type AccountSummaryTimestampMinAggregateOutputType = {
  year: number
  portfolioValue: number
}

export type AccountSummaryTimestampMaxAggregateOutputType = {
  year: number
  portfolioValue: number
}


export type AccountSummaryTimestampAvgAggregateInputType = {
  year?: true
  portfolioValue?: true
}

export type AccountSummaryTimestampSumAggregateInputType = {
  year?: true
  portfolioValue?: true
}

export type AccountSummaryTimestampMinAggregateInputType = {
  year?: true
  portfolioValue?: true
}

export type AccountSummaryTimestampMaxAggregateInputType = {
  year?: true
  portfolioValue?: true
}

export type AggregateAccountSummaryTimestampArgs = {
  where?: AccountSummaryTimestampWhereInput
  orderBy?: Enumerable<AccountSummaryTimestampOrderByInput>
  cursor?: AccountSummaryTimestampWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Enumerable<AccountSummaryTimestampDistinctFieldEnum>
  count?: true
  avg?: AccountSummaryTimestampAvgAggregateInputType
  sum?: AccountSummaryTimestampSumAggregateInputType
  min?: AccountSummaryTimestampMinAggregateInputType
  max?: AccountSummaryTimestampMaxAggregateInputType
}

export type GetAccountSummaryTimestampAggregateType<T extends AggregateAccountSummaryTimestampArgs> = {
  [P in keyof T]: P extends 'count' ? number : GetAccountSummaryTimestampAggregateScalarType<T[P]>
}

export type GetAccountSummaryTimestampAggregateScalarType<T extends any> = {
  [P in keyof T]: P extends keyof AccountSummaryTimestampAvgAggregateOutputType ? AccountSummaryTimestampAvgAggregateOutputType[P] : never
}
    
    

export type AccountSummaryTimestampSelect = {
  id?: boolean
  UTCDateString?: boolean
  UTCDateKey?: boolean
  year?: boolean
  portfolioValue?: boolean
  user?: boolean | UserArgs
  userID?: boolean
}

export type AccountSummaryTimestampInclude = {
  user?: boolean | UserArgs
}

export type AccountSummaryTimestampGetPayload<
  S extends boolean | null | undefined | AccountSummaryTimestampArgs,
  U = keyof S
> = S extends true
  ? AccountSummaryTimestamp
  : S extends undefined
  ? never
  : S extends AccountSummaryTimestampArgs | FindManyAccountSummaryTimestampArgs
  ? 'include' extends U
    ? AccountSummaryTimestamp  & {
      [P in TrueKeys<S['include']>]:
      P extends 'user'
      ? UserGetPayload<S['include'][P]> : never
    }
  : 'select' extends U
    ? {
      [P in TrueKeys<S['select']>]:P extends keyof AccountSummaryTimestamp ? AccountSummaryTimestamp[P]
: 
      P extends 'user'
      ? UserGetPayload<S['select'][P]> : never
    }
  : AccountSummaryTimestamp
: AccountSummaryTimestamp


export interface AccountSummaryTimestampDelegate {
  /**
   * Find zero or one AccountSummaryTimestamp.
   * @param {FindOneAccountSummaryTimestampArgs} args - Arguments to find a AccountSummaryTimestamp
   * @example
   * // Get one AccountSummaryTimestamp
   * const accountSummaryTimestamp = await prisma.accountSummaryTimestamp.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneAccountSummaryTimestampArgs>(
    args: Subset<T, FindOneAccountSummaryTimestampArgs>
  ): CheckSelect<T, Prisma__AccountSummaryTimestampClient<AccountSummaryTimestamp | null>, Prisma__AccountSummaryTimestampClient<AccountSummaryTimestampGetPayload<T> | null>>
  /**
   * Find zero or more AccountSummaryTimestamps.
   * @param {FindManyAccountSummaryTimestampArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all AccountSummaryTimestamps
   * const accountSummaryTimestamps = await prisma.accountSummaryTimestamp.findMany()
   * 
   * // Get first 10 AccountSummaryTimestamps
   * const accountSummaryTimestamps = await prisma.accountSummaryTimestamp.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const accountSummaryTimestampWithIdOnly = await prisma.accountSummaryTimestamp.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyAccountSummaryTimestampArgs>(
    args?: Subset<T, FindManyAccountSummaryTimestampArgs>
  ): CheckSelect<T, Promise<Array<AccountSummaryTimestamp>>, Promise<Array<AccountSummaryTimestampGetPayload<T>>>>
  /**
   * Create a AccountSummaryTimestamp.
   * @param {AccountSummaryTimestampCreateArgs} args - Arguments to create a AccountSummaryTimestamp.
   * @example
   * // Create one AccountSummaryTimestamp
   * const AccountSummaryTimestamp = await prisma.accountSummaryTimestamp.create({
   *   data: {
   *     // ... data to create a AccountSummaryTimestamp
   *   }
   * })
   * 
  **/
  create<T extends AccountSummaryTimestampCreateArgs>(
    args: Subset<T, AccountSummaryTimestampCreateArgs>
  ): CheckSelect<T, Prisma__AccountSummaryTimestampClient<AccountSummaryTimestamp>, Prisma__AccountSummaryTimestampClient<AccountSummaryTimestampGetPayload<T>>>
  /**
   * Delete a AccountSummaryTimestamp.
   * @param {AccountSummaryTimestampDeleteArgs} args - Arguments to delete one AccountSummaryTimestamp.
   * @example
   * // Delete one AccountSummaryTimestamp
   * const AccountSummaryTimestamp = await prisma.accountSummaryTimestamp.delete({
   *   where: {
   *     // ... filter to delete one AccountSummaryTimestamp
   *   }
   * })
   * 
  **/
  delete<T extends AccountSummaryTimestampDeleteArgs>(
    args: Subset<T, AccountSummaryTimestampDeleteArgs>
  ): CheckSelect<T, Prisma__AccountSummaryTimestampClient<AccountSummaryTimestamp>, Prisma__AccountSummaryTimestampClient<AccountSummaryTimestampGetPayload<T>>>
  /**
   * Update one AccountSummaryTimestamp.
   * @param {AccountSummaryTimestampUpdateArgs} args - Arguments to update one AccountSummaryTimestamp.
   * @example
   * // Update one AccountSummaryTimestamp
   * const accountSummaryTimestamp = await prisma.accountSummaryTimestamp.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  update<T extends AccountSummaryTimestampUpdateArgs>(
    args: Subset<T, AccountSummaryTimestampUpdateArgs>
  ): CheckSelect<T, Prisma__AccountSummaryTimestampClient<AccountSummaryTimestamp>, Prisma__AccountSummaryTimestampClient<AccountSummaryTimestampGetPayload<T>>>
  /**
   * Delete zero or more AccountSummaryTimestamps.
   * @param {AccountSummaryTimestampDeleteManyArgs} args - Arguments to filter AccountSummaryTimestamps to delete.
   * @example
   * // Delete a few AccountSummaryTimestamps
   * const { count } = await prisma.accountSummaryTimestamp.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends AccountSummaryTimestampDeleteManyArgs>(
    args: Subset<T, AccountSummaryTimestampDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more AccountSummaryTimestamps.
   * @param {AccountSummaryTimestampUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many AccountSummaryTimestamps
   * const accountSummaryTimestamp = await prisma.accountSummaryTimestamp.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  updateMany<T extends AccountSummaryTimestampUpdateManyArgs>(
    args: Subset<T, AccountSummaryTimestampUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one AccountSummaryTimestamp.
   * @param {AccountSummaryTimestampUpsertArgs} args - Arguments to update or create a AccountSummaryTimestamp.
   * @example
   * // Update or create a AccountSummaryTimestamp
   * const accountSummaryTimestamp = await prisma.accountSummaryTimestamp.upsert({
   *   create: {
   *     // ... data to create a AccountSummaryTimestamp
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the AccountSummaryTimestamp we want to update
   *   }
   * })
  **/
  upsert<T extends AccountSummaryTimestampUpsertArgs>(
    args: Subset<T, AccountSummaryTimestampUpsertArgs>
  ): CheckSelect<T, Prisma__AccountSummaryTimestampClient<AccountSummaryTimestamp>, Prisma__AccountSummaryTimestampClient<AccountSummaryTimestampGetPayload<T>>>
  /**
   * Count
   */
  count(args?: Omit<FindManyAccountSummaryTimestampArgs, 'select' | 'include'>): Promise<number>

  /**
   * Aggregate
   */
  aggregate<T extends AggregateAccountSummaryTimestampArgs>(args: Subset<T, AggregateAccountSummaryTimestampArgs>): Promise<GetAccountSummaryTimestampAggregateType<T>>
}

/**
 * The delegate class that acts as a "Promise-like" for AccountSummaryTimestamp.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in 
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export declare class Prisma__AccountSummaryTimestampClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  user<T extends UserArgs = {}>(args?: Subset<T, UserArgs>): CheckSelect<T, Prisma__UserClient<User | null>, Prisma__UserClient<UserGetPayload<T> | null>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * AccountSummaryTimestamp findOne
 */
export type FindOneAccountSummaryTimestampArgs = {
  /**
   * Select specific fields to fetch from the AccountSummaryTimestamp
  **/
  select?: AccountSummaryTimestampSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: AccountSummaryTimestampInclude | null
  /**
   * Filter, which AccountSummaryTimestamp to fetch.
  **/
  where: AccountSummaryTimestampWhereUniqueInput
}


/**
 * AccountSummaryTimestamp findMany
 */
export type FindManyAccountSummaryTimestampArgs = {
  /**
   * Select specific fields to fetch from the AccountSummaryTimestamp
  **/
  select?: AccountSummaryTimestampSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: AccountSummaryTimestampInclude | null
  /**
   * Filter, which AccountSummaryTimestamps to fetch.
  **/
  where?: AccountSummaryTimestampWhereInput
  /**
   * Determine the order of the AccountSummaryTimestamps to fetch.
  **/
  orderBy?: Enumerable<AccountSummaryTimestampOrderByInput>
  /**
   * Sets the position for listing AccountSummaryTimestamps.
  **/
  cursor?: AccountSummaryTimestampWhereUniqueInput
  /**
   * The number of AccountSummaryTimestamps to fetch. If negative number, it will take AccountSummaryTimestamps before the `cursor`.
  **/
  take?: number
  /**
   * Skip the first `n` AccountSummaryTimestamps.
  **/
  skip?: number
  distinct?: Enumerable<AccountSummaryTimestampDistinctFieldEnum>
}


/**
 * AccountSummaryTimestamp create
 */
export type AccountSummaryTimestampCreateArgs = {
  /**
   * Select specific fields to fetch from the AccountSummaryTimestamp
  **/
  select?: AccountSummaryTimestampSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: AccountSummaryTimestampInclude | null
  /**
   * The data needed to create a AccountSummaryTimestamp.
  **/
  data: AccountSummaryTimestampCreateInput
}


/**
 * AccountSummaryTimestamp update
 */
export type AccountSummaryTimestampUpdateArgs = {
  /**
   * Select specific fields to fetch from the AccountSummaryTimestamp
  **/
  select?: AccountSummaryTimestampSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: AccountSummaryTimestampInclude | null
  /**
   * The data needed to update a AccountSummaryTimestamp.
  **/
  data: AccountSummaryTimestampUpdateInput
  /**
   * Choose, which AccountSummaryTimestamp to update.
  **/
  where: AccountSummaryTimestampWhereUniqueInput
}


/**
 * AccountSummaryTimestamp updateMany
 */
export type AccountSummaryTimestampUpdateManyArgs = {
  data: AccountSummaryTimestampUpdateManyMutationInput
  where?: AccountSummaryTimestampWhereInput
}


/**
 * AccountSummaryTimestamp upsert
 */
export type AccountSummaryTimestampUpsertArgs = {
  /**
   * Select specific fields to fetch from the AccountSummaryTimestamp
  **/
  select?: AccountSummaryTimestampSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: AccountSummaryTimestampInclude | null
  /**
   * The filter to search for the AccountSummaryTimestamp to update in case it exists.
  **/
  where: AccountSummaryTimestampWhereUniqueInput
  /**
   * In case the AccountSummaryTimestamp found by the `where` argument doesn't exist, create a new AccountSummaryTimestamp with this data.
  **/
  create: AccountSummaryTimestampCreateInput
  /**
   * In case the AccountSummaryTimestamp was found with the provided `where` argument, update it with this data.
  **/
  update: AccountSummaryTimestampUpdateInput
}


/**
 * AccountSummaryTimestamp delete
 */
export type AccountSummaryTimestampDeleteArgs = {
  /**
   * Select specific fields to fetch from the AccountSummaryTimestamp
  **/
  select?: AccountSummaryTimestampSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: AccountSummaryTimestampInclude | null
  /**
   * Filter which AccountSummaryTimestamp to delete.
  **/
  where: AccountSummaryTimestampWhereUniqueInput
}


/**
 * AccountSummaryTimestamp deleteMany
 */
export type AccountSummaryTimestampDeleteManyArgs = {
  where?: AccountSummaryTimestampWhereInput
}


/**
 * AccountSummaryTimestamp without action
 */
export type AccountSummaryTimestampArgs = {
  /**
   * Select specific fields to fetch from the AccountSummaryTimestamp
  **/
  select?: AccountSummaryTimestampSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: AccountSummaryTimestampInclude | null
}



/**
 * Model Share
 */

export type Share = {
  id: string
  companyCode: string | null
  quantity: number | null
  buyPriceAvg: number | null
  createdAt: Date
  updatedAt: Date
  userID: string
}


export type AggregateShare = {
  count: number
  avg: ShareAvgAggregateOutputType | null
  sum: ShareSumAggregateOutputType | null
  min: ShareMinAggregateOutputType | null
  max: ShareMaxAggregateOutputType | null
}

export type ShareAvgAggregateOutputType = {
  quantity: number
  buyPriceAvg: number
}

export type ShareSumAggregateOutputType = {
  quantity: number | null
  buyPriceAvg: number | null
}

export type ShareMinAggregateOutputType = {
  quantity: number | null
  buyPriceAvg: number | null
}

export type ShareMaxAggregateOutputType = {
  quantity: number | null
  buyPriceAvg: number | null
}


export type ShareAvgAggregateInputType = {
  quantity?: true
  buyPriceAvg?: true
}

export type ShareSumAggregateInputType = {
  quantity?: true
  buyPriceAvg?: true
}

export type ShareMinAggregateInputType = {
  quantity?: true
  buyPriceAvg?: true
}

export type ShareMaxAggregateInputType = {
  quantity?: true
  buyPriceAvg?: true
}

export type AggregateShareArgs = {
  where?: ShareWhereInput
  orderBy?: Enumerable<ShareOrderByInput>
  cursor?: ShareWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Enumerable<ShareDistinctFieldEnum>
  count?: true
  avg?: ShareAvgAggregateInputType
  sum?: ShareSumAggregateInputType
  min?: ShareMinAggregateInputType
  max?: ShareMaxAggregateInputType
}

export type GetShareAggregateType<T extends AggregateShareArgs> = {
  [P in keyof T]: P extends 'count' ? number : GetShareAggregateScalarType<T[P]>
}

export type GetShareAggregateScalarType<T extends any> = {
  [P in keyof T]: P extends keyof ShareAvgAggregateOutputType ? ShareAvgAggregateOutputType[P] : never
}
    
    

export type ShareSelect = {
  id?: boolean
  companyCode?: boolean
  quantity?: boolean
  buyPriceAvg?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  user?: boolean | UserArgs
  userID?: boolean
}

export type ShareInclude = {
  user?: boolean | UserArgs
}

export type ShareGetPayload<
  S extends boolean | null | undefined | ShareArgs,
  U = keyof S
> = S extends true
  ? Share
  : S extends undefined
  ? never
  : S extends ShareArgs | FindManyShareArgs
  ? 'include' extends U
    ? Share  & {
      [P in TrueKeys<S['include']>]:
      P extends 'user'
      ? UserGetPayload<S['include'][P]> : never
    }
  : 'select' extends U
    ? {
      [P in TrueKeys<S['select']>]:P extends keyof Share ? Share[P]
: 
      P extends 'user'
      ? UserGetPayload<S['select'][P]> : never
    }
  : Share
: Share


export interface ShareDelegate {
  /**
   * Find zero or one Share.
   * @param {FindOneShareArgs} args - Arguments to find a Share
   * @example
   * // Get one Share
   * const share = await prisma.share.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneShareArgs>(
    args: Subset<T, FindOneShareArgs>
  ): CheckSelect<T, Prisma__ShareClient<Share | null>, Prisma__ShareClient<ShareGetPayload<T> | null>>
  /**
   * Find zero or more Shares.
   * @param {FindManyShareArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Shares
   * const shares = await prisma.share.findMany()
   * 
   * // Get first 10 Shares
   * const shares = await prisma.share.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const shareWithIdOnly = await prisma.share.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyShareArgs>(
    args?: Subset<T, FindManyShareArgs>
  ): CheckSelect<T, Promise<Array<Share>>, Promise<Array<ShareGetPayload<T>>>>
  /**
   * Create a Share.
   * @param {ShareCreateArgs} args - Arguments to create a Share.
   * @example
   * // Create one Share
   * const Share = await prisma.share.create({
   *   data: {
   *     // ... data to create a Share
   *   }
   * })
   * 
  **/
  create<T extends ShareCreateArgs>(
    args: Subset<T, ShareCreateArgs>
  ): CheckSelect<T, Prisma__ShareClient<Share>, Prisma__ShareClient<ShareGetPayload<T>>>
  /**
   * Delete a Share.
   * @param {ShareDeleteArgs} args - Arguments to delete one Share.
   * @example
   * // Delete one Share
   * const Share = await prisma.share.delete({
   *   where: {
   *     // ... filter to delete one Share
   *   }
   * })
   * 
  **/
  delete<T extends ShareDeleteArgs>(
    args: Subset<T, ShareDeleteArgs>
  ): CheckSelect<T, Prisma__ShareClient<Share>, Prisma__ShareClient<ShareGetPayload<T>>>
  /**
   * Update one Share.
   * @param {ShareUpdateArgs} args - Arguments to update one Share.
   * @example
   * // Update one Share
   * const share = await prisma.share.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  update<T extends ShareUpdateArgs>(
    args: Subset<T, ShareUpdateArgs>
  ): CheckSelect<T, Prisma__ShareClient<Share>, Prisma__ShareClient<ShareGetPayload<T>>>
  /**
   * Delete zero or more Shares.
   * @param {ShareDeleteManyArgs} args - Arguments to filter Shares to delete.
   * @example
   * // Delete a few Shares
   * const { count } = await prisma.share.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends ShareDeleteManyArgs>(
    args: Subset<T, ShareDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more Shares.
   * @param {ShareUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Shares
   * const share = await prisma.share.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  updateMany<T extends ShareUpdateManyArgs>(
    args: Subset<T, ShareUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one Share.
   * @param {ShareUpsertArgs} args - Arguments to update or create a Share.
   * @example
   * // Update or create a Share
   * const share = await prisma.share.upsert({
   *   create: {
   *     // ... data to create a Share
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Share we want to update
   *   }
   * })
  **/
  upsert<T extends ShareUpsertArgs>(
    args: Subset<T, ShareUpsertArgs>
  ): CheckSelect<T, Prisma__ShareClient<Share>, Prisma__ShareClient<ShareGetPayload<T>>>
  /**
   * Count
   */
  count(args?: Omit<FindManyShareArgs, 'select' | 'include'>): Promise<number>

  /**
   * Aggregate
   */
  aggregate<T extends AggregateShareArgs>(args: Subset<T, AggregateShareArgs>): Promise<GetShareAggregateType<T>>
}

/**
 * The delegate class that acts as a "Promise-like" for Share.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in 
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export declare class Prisma__ShareClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  user<T extends UserArgs = {}>(args?: Subset<T, UserArgs>): CheckSelect<T, Prisma__UserClient<User | null>, Prisma__UserClient<UserGetPayload<T> | null>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * Share findOne
 */
export type FindOneShareArgs = {
  /**
   * Select specific fields to fetch from the Share
  **/
  select?: ShareSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ShareInclude | null
  /**
   * Filter, which Share to fetch.
  **/
  where: ShareWhereUniqueInput
}


/**
 * Share findMany
 */
export type FindManyShareArgs = {
  /**
   * Select specific fields to fetch from the Share
  **/
  select?: ShareSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ShareInclude | null
  /**
   * Filter, which Shares to fetch.
  **/
  where?: ShareWhereInput
  /**
   * Determine the order of the Shares to fetch.
  **/
  orderBy?: Enumerable<ShareOrderByInput>
  /**
   * Sets the position for listing Shares.
  **/
  cursor?: ShareWhereUniqueInput
  /**
   * The number of Shares to fetch. If negative number, it will take Shares before the `cursor`.
  **/
  take?: number
  /**
   * Skip the first `n` Shares.
  **/
  skip?: number
  distinct?: Enumerable<ShareDistinctFieldEnum>
}


/**
 * Share create
 */
export type ShareCreateArgs = {
  /**
   * Select specific fields to fetch from the Share
  **/
  select?: ShareSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ShareInclude | null
  /**
   * The data needed to create a Share.
  **/
  data: ShareCreateInput
}


/**
 * Share update
 */
export type ShareUpdateArgs = {
  /**
   * Select specific fields to fetch from the Share
  **/
  select?: ShareSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ShareInclude | null
  /**
   * The data needed to update a Share.
  **/
  data: ShareUpdateInput
  /**
   * Choose, which Share to update.
  **/
  where: ShareWhereUniqueInput
}


/**
 * Share updateMany
 */
export type ShareUpdateManyArgs = {
  data: ShareUpdateManyMutationInput
  where?: ShareWhereInput
}


/**
 * Share upsert
 */
export type ShareUpsertArgs = {
  /**
   * Select specific fields to fetch from the Share
  **/
  select?: ShareSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ShareInclude | null
  /**
   * The filter to search for the Share to update in case it exists.
  **/
  where: ShareWhereUniqueInput
  /**
   * In case the Share found by the `where` argument doesn't exist, create a new Share with this data.
  **/
  create: ShareCreateInput
  /**
   * In case the Share was found with the provided `where` argument, update it with this data.
  **/
  update: ShareUpdateInput
}


/**
 * Share delete
 */
export type ShareDeleteArgs = {
  /**
   * Select specific fields to fetch from the Share
  **/
  select?: ShareSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ShareInclude | null
  /**
   * Filter which Share to delete.
  **/
  where: ShareWhereUniqueInput
}


/**
 * Share deleteMany
 */
export type ShareDeleteManyArgs = {
  where?: ShareWhereInput
}


/**
 * Share without action
 */
export type ShareArgs = {
  /**
   * Select specific fields to fetch from the Share
  **/
  select?: ShareSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ShareInclude | null
}



/**
 * Model UserTransaction
 */

export type UserTransaction = {
  id: string
  createdAt: Date
  updatedAt: Date
  companyCode: string | null
  quantity: number | null
  priceAtTransaction: number | null
  limitPrice: number | null
  brokerage: number | null
  spendOrGain: number | null
  isFinished: boolean | null
  finishedTime: Date | null
  isTypeBuy: boolean | null
  note: string | null
  userID: string
}


export type AggregateUserTransaction = {
  count: number
  avg: UserTransactionAvgAggregateOutputType | null
  sum: UserTransactionSumAggregateOutputType | null
  min: UserTransactionMinAggregateOutputType | null
  max: UserTransactionMaxAggregateOutputType | null
}

export type UserTransactionAvgAggregateOutputType = {
  quantity: number
  priceAtTransaction: number
  limitPrice: number
  brokerage: number
  spendOrGain: number
}

export type UserTransactionSumAggregateOutputType = {
  quantity: number | null
  priceAtTransaction: number | null
  limitPrice: number | null
  brokerage: number | null
  spendOrGain: number | null
}

export type UserTransactionMinAggregateOutputType = {
  quantity: number | null
  priceAtTransaction: number | null
  limitPrice: number | null
  brokerage: number | null
  spendOrGain: number | null
}

export type UserTransactionMaxAggregateOutputType = {
  quantity: number | null
  priceAtTransaction: number | null
  limitPrice: number | null
  brokerage: number | null
  spendOrGain: number | null
}


export type UserTransactionAvgAggregateInputType = {
  quantity?: true
  priceAtTransaction?: true
  limitPrice?: true
  brokerage?: true
  spendOrGain?: true
}

export type UserTransactionSumAggregateInputType = {
  quantity?: true
  priceAtTransaction?: true
  limitPrice?: true
  brokerage?: true
  spendOrGain?: true
}

export type UserTransactionMinAggregateInputType = {
  quantity?: true
  priceAtTransaction?: true
  limitPrice?: true
  brokerage?: true
  spendOrGain?: true
}

export type UserTransactionMaxAggregateInputType = {
  quantity?: true
  priceAtTransaction?: true
  limitPrice?: true
  brokerage?: true
  spendOrGain?: true
}

export type AggregateUserTransactionArgs = {
  where?: UserTransactionWhereInput
  orderBy?: Enumerable<UserTransactionOrderByInput>
  cursor?: UserTransactionWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Enumerable<UserTransactionDistinctFieldEnum>
  count?: true
  avg?: UserTransactionAvgAggregateInputType
  sum?: UserTransactionSumAggregateInputType
  min?: UserTransactionMinAggregateInputType
  max?: UserTransactionMaxAggregateInputType
}

export type GetUserTransactionAggregateType<T extends AggregateUserTransactionArgs> = {
  [P in keyof T]: P extends 'count' ? number : GetUserTransactionAggregateScalarType<T[P]>
}

export type GetUserTransactionAggregateScalarType<T extends any> = {
  [P in keyof T]: P extends keyof UserTransactionAvgAggregateOutputType ? UserTransactionAvgAggregateOutputType[P] : never
}
    
    

export type UserTransactionSelect = {
  id?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  companyCode?: boolean
  quantity?: boolean
  priceAtTransaction?: boolean
  limitPrice?: boolean
  brokerage?: boolean
  spendOrGain?: boolean
  isFinished?: boolean
  finishedTime?: boolean
  isTypeBuy?: boolean
  note?: boolean
  user?: boolean | UserArgs
  userID?: boolean
}

export type UserTransactionInclude = {
  user?: boolean | UserArgs
}

export type UserTransactionGetPayload<
  S extends boolean | null | undefined | UserTransactionArgs,
  U = keyof S
> = S extends true
  ? UserTransaction
  : S extends undefined
  ? never
  : S extends UserTransactionArgs | FindManyUserTransactionArgs
  ? 'include' extends U
    ? UserTransaction  & {
      [P in TrueKeys<S['include']>]:
      P extends 'user'
      ? UserGetPayload<S['include'][P]> : never
    }
  : 'select' extends U
    ? {
      [P in TrueKeys<S['select']>]:P extends keyof UserTransaction ? UserTransaction[P]
: 
      P extends 'user'
      ? UserGetPayload<S['select'][P]> : never
    }
  : UserTransaction
: UserTransaction


export interface UserTransactionDelegate {
  /**
   * Find zero or one UserTransaction.
   * @param {FindOneUserTransactionArgs} args - Arguments to find a UserTransaction
   * @example
   * // Get one UserTransaction
   * const userTransaction = await prisma.userTransaction.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneUserTransactionArgs>(
    args: Subset<T, FindOneUserTransactionArgs>
  ): CheckSelect<T, Prisma__UserTransactionClient<UserTransaction | null>, Prisma__UserTransactionClient<UserTransactionGetPayload<T> | null>>
  /**
   * Find zero or more UserTransactions.
   * @param {FindManyUserTransactionArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all UserTransactions
   * const userTransactions = await prisma.userTransaction.findMany()
   * 
   * // Get first 10 UserTransactions
   * const userTransactions = await prisma.userTransaction.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const userTransactionWithIdOnly = await prisma.userTransaction.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyUserTransactionArgs>(
    args?: Subset<T, FindManyUserTransactionArgs>
  ): CheckSelect<T, Promise<Array<UserTransaction>>, Promise<Array<UserTransactionGetPayload<T>>>>
  /**
   * Create a UserTransaction.
   * @param {UserTransactionCreateArgs} args - Arguments to create a UserTransaction.
   * @example
   * // Create one UserTransaction
   * const UserTransaction = await prisma.userTransaction.create({
   *   data: {
   *     // ... data to create a UserTransaction
   *   }
   * })
   * 
  **/
  create<T extends UserTransactionCreateArgs>(
    args: Subset<T, UserTransactionCreateArgs>
  ): CheckSelect<T, Prisma__UserTransactionClient<UserTransaction>, Prisma__UserTransactionClient<UserTransactionGetPayload<T>>>
  /**
   * Delete a UserTransaction.
   * @param {UserTransactionDeleteArgs} args - Arguments to delete one UserTransaction.
   * @example
   * // Delete one UserTransaction
   * const UserTransaction = await prisma.userTransaction.delete({
   *   where: {
   *     // ... filter to delete one UserTransaction
   *   }
   * })
   * 
  **/
  delete<T extends UserTransactionDeleteArgs>(
    args: Subset<T, UserTransactionDeleteArgs>
  ): CheckSelect<T, Prisma__UserTransactionClient<UserTransaction>, Prisma__UserTransactionClient<UserTransactionGetPayload<T>>>
  /**
   * Update one UserTransaction.
   * @param {UserTransactionUpdateArgs} args - Arguments to update one UserTransaction.
   * @example
   * // Update one UserTransaction
   * const userTransaction = await prisma.userTransaction.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  update<T extends UserTransactionUpdateArgs>(
    args: Subset<T, UserTransactionUpdateArgs>
  ): CheckSelect<T, Prisma__UserTransactionClient<UserTransaction>, Prisma__UserTransactionClient<UserTransactionGetPayload<T>>>
  /**
   * Delete zero or more UserTransactions.
   * @param {UserTransactionDeleteManyArgs} args - Arguments to filter UserTransactions to delete.
   * @example
   * // Delete a few UserTransactions
   * const { count } = await prisma.userTransaction.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends UserTransactionDeleteManyArgs>(
    args: Subset<T, UserTransactionDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more UserTransactions.
   * @param {UserTransactionUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many UserTransactions
   * const userTransaction = await prisma.userTransaction.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  updateMany<T extends UserTransactionUpdateManyArgs>(
    args: Subset<T, UserTransactionUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one UserTransaction.
   * @param {UserTransactionUpsertArgs} args - Arguments to update or create a UserTransaction.
   * @example
   * // Update or create a UserTransaction
   * const userTransaction = await prisma.userTransaction.upsert({
   *   create: {
   *     // ... data to create a UserTransaction
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the UserTransaction we want to update
   *   }
   * })
  **/
  upsert<T extends UserTransactionUpsertArgs>(
    args: Subset<T, UserTransactionUpsertArgs>
  ): CheckSelect<T, Prisma__UserTransactionClient<UserTransaction>, Prisma__UserTransactionClient<UserTransactionGetPayload<T>>>
  /**
   * Count
   */
  count(args?: Omit<FindManyUserTransactionArgs, 'select' | 'include'>): Promise<number>

  /**
   * Aggregate
   */
  aggregate<T extends AggregateUserTransactionArgs>(args: Subset<T, AggregateUserTransactionArgs>): Promise<GetUserTransactionAggregateType<T>>
}

/**
 * The delegate class that acts as a "Promise-like" for UserTransaction.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in 
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export declare class Prisma__UserTransactionClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  user<T extends UserArgs = {}>(args?: Subset<T, UserArgs>): CheckSelect<T, Prisma__UserClient<User | null>, Prisma__UserClient<UserGetPayload<T> | null>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * UserTransaction findOne
 */
export type FindOneUserTransactionArgs = {
  /**
   * Select specific fields to fetch from the UserTransaction
  **/
  select?: UserTransactionSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserTransactionInclude | null
  /**
   * Filter, which UserTransaction to fetch.
  **/
  where: UserTransactionWhereUniqueInput
}


/**
 * UserTransaction findMany
 */
export type FindManyUserTransactionArgs = {
  /**
   * Select specific fields to fetch from the UserTransaction
  **/
  select?: UserTransactionSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserTransactionInclude | null
  /**
   * Filter, which UserTransactions to fetch.
  **/
  where?: UserTransactionWhereInput
  /**
   * Determine the order of the UserTransactions to fetch.
  **/
  orderBy?: Enumerable<UserTransactionOrderByInput>
  /**
   * Sets the position for listing UserTransactions.
  **/
  cursor?: UserTransactionWhereUniqueInput
  /**
   * The number of UserTransactions to fetch. If negative number, it will take UserTransactions before the `cursor`.
  **/
  take?: number
  /**
   * Skip the first `n` UserTransactions.
  **/
  skip?: number
  distinct?: Enumerable<UserTransactionDistinctFieldEnum>
}


/**
 * UserTransaction create
 */
export type UserTransactionCreateArgs = {
  /**
   * Select specific fields to fetch from the UserTransaction
  **/
  select?: UserTransactionSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserTransactionInclude | null
  /**
   * The data needed to create a UserTransaction.
  **/
  data: UserTransactionCreateInput
}


/**
 * UserTransaction update
 */
export type UserTransactionUpdateArgs = {
  /**
   * Select specific fields to fetch from the UserTransaction
  **/
  select?: UserTransactionSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserTransactionInclude | null
  /**
   * The data needed to update a UserTransaction.
  **/
  data: UserTransactionUpdateInput
  /**
   * Choose, which UserTransaction to update.
  **/
  where: UserTransactionWhereUniqueInput
}


/**
 * UserTransaction updateMany
 */
export type UserTransactionUpdateManyArgs = {
  data: UserTransactionUpdateManyMutationInput
  where?: UserTransactionWhereInput
}


/**
 * UserTransaction upsert
 */
export type UserTransactionUpsertArgs = {
  /**
   * Select specific fields to fetch from the UserTransaction
  **/
  select?: UserTransactionSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserTransactionInclude | null
  /**
   * The filter to search for the UserTransaction to update in case it exists.
  **/
  where: UserTransactionWhereUniqueInput
  /**
   * In case the UserTransaction found by the `where` argument doesn't exist, create a new UserTransaction with this data.
  **/
  create: UserTransactionCreateInput
  /**
   * In case the UserTransaction was found with the provided `where` argument, update it with this data.
  **/
  update: UserTransactionUpdateInput
}


/**
 * UserTransaction delete
 */
export type UserTransactionDeleteArgs = {
  /**
   * Select specific fields to fetch from the UserTransaction
  **/
  select?: UserTransactionSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserTransactionInclude | null
  /**
   * Filter which UserTransaction to delete.
  **/
  where: UserTransactionWhereUniqueInput
}


/**
 * UserTransaction deleteMany
 */
export type UserTransactionDeleteManyArgs = {
  where?: UserTransactionWhereInput
}


/**
 * UserTransaction without action
 */
export type UserTransactionArgs = {
  /**
   * Select specific fields to fetch from the UserTransaction
  **/
  select?: UserTransactionSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: UserTransactionInclude | null
}



/**
 * Model MarketHolidays
 */

export type MarketHolidays = {
  id: string
  year: number | null
  newYearsDay: string | null
  martinLutherKingJrDay: string | null
  washingtonBirthday: string | null
  goodFriday: string | null
  memorialDay: string | null
  independenceDay: string | null
  laborDay: string | null
  thanksgivingDay: string | null
  christmas: string | null
}


export type AggregateMarketHolidays = {
  count: number
  avg: MarketHolidaysAvgAggregateOutputType | null
  sum: MarketHolidaysSumAggregateOutputType | null
  min: MarketHolidaysMinAggregateOutputType | null
  max: MarketHolidaysMaxAggregateOutputType | null
}

export type MarketHolidaysAvgAggregateOutputType = {
  year: number
}

export type MarketHolidaysSumAggregateOutputType = {
  year: number | null
}

export type MarketHolidaysMinAggregateOutputType = {
  year: number | null
}

export type MarketHolidaysMaxAggregateOutputType = {
  year: number | null
}


export type MarketHolidaysAvgAggregateInputType = {
  year?: true
}

export type MarketHolidaysSumAggregateInputType = {
  year?: true
}

export type MarketHolidaysMinAggregateInputType = {
  year?: true
}

export type MarketHolidaysMaxAggregateInputType = {
  year?: true
}

export type AggregateMarketHolidaysArgs = {
  where?: MarketHolidaysWhereInput
  orderBy?: Enumerable<MarketHolidaysOrderByInput>
  cursor?: MarketHolidaysWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Enumerable<MarketHolidaysDistinctFieldEnum>
  count?: true
  avg?: MarketHolidaysAvgAggregateInputType
  sum?: MarketHolidaysSumAggregateInputType
  min?: MarketHolidaysMinAggregateInputType
  max?: MarketHolidaysMaxAggregateInputType
}

export type GetMarketHolidaysAggregateType<T extends AggregateMarketHolidaysArgs> = {
  [P in keyof T]: P extends 'count' ? number : GetMarketHolidaysAggregateScalarType<T[P]>
}

export type GetMarketHolidaysAggregateScalarType<T extends any> = {
  [P in keyof T]: P extends keyof MarketHolidaysAvgAggregateOutputType ? MarketHolidaysAvgAggregateOutputType[P] : never
}
    
    

export type MarketHolidaysSelect = {
  id?: boolean
  year?: boolean
  newYearsDay?: boolean
  martinLutherKingJrDay?: boolean
  washingtonBirthday?: boolean
  goodFriday?: boolean
  memorialDay?: boolean
  independenceDay?: boolean
  laborDay?: boolean
  thanksgivingDay?: boolean
  christmas?: boolean
}

export type MarketHolidaysGetPayload<
  S extends boolean | null | undefined | MarketHolidaysArgs,
  U = keyof S
> = S extends true
  ? MarketHolidays
  : S extends undefined
  ? never
  : S extends MarketHolidaysArgs | FindManyMarketHolidaysArgs
  ? 'include' extends U
    ? MarketHolidays 
  : 'select' extends U
    ? {
      [P in TrueKeys<S['select']>]:P extends keyof MarketHolidays ? MarketHolidays[P]
: 
 never
    }
  : MarketHolidays
: MarketHolidays


export interface MarketHolidaysDelegate {
  /**
   * Find zero or one MarketHolidays.
   * @param {FindOneMarketHolidaysArgs} args - Arguments to find a MarketHolidays
   * @example
   * // Get one MarketHolidays
   * const marketHolidays = await prisma.marketHolidays.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneMarketHolidaysArgs>(
    args: Subset<T, FindOneMarketHolidaysArgs>
  ): CheckSelect<T, Prisma__MarketHolidaysClient<MarketHolidays | null>, Prisma__MarketHolidaysClient<MarketHolidaysGetPayload<T> | null>>
  /**
   * Find zero or more MarketHolidays.
   * @param {FindManyMarketHolidaysArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all MarketHolidays
   * const marketHolidays = await prisma.marketHolidays.findMany()
   * 
   * // Get first 10 MarketHolidays
   * const marketHolidays = await prisma.marketHolidays.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const marketHolidaysWithIdOnly = await prisma.marketHolidays.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyMarketHolidaysArgs>(
    args?: Subset<T, FindManyMarketHolidaysArgs>
  ): CheckSelect<T, Promise<Array<MarketHolidays>>, Promise<Array<MarketHolidaysGetPayload<T>>>>
  /**
   * Create a MarketHolidays.
   * @param {MarketHolidaysCreateArgs} args - Arguments to create a MarketHolidays.
   * @example
   * // Create one MarketHolidays
   * const MarketHolidays = await prisma.marketHolidays.create({
   *   data: {
   *     // ... data to create a MarketHolidays
   *   }
   * })
   * 
  **/
  create<T extends MarketHolidaysCreateArgs>(
    args: Subset<T, MarketHolidaysCreateArgs>
  ): CheckSelect<T, Prisma__MarketHolidaysClient<MarketHolidays>, Prisma__MarketHolidaysClient<MarketHolidaysGetPayload<T>>>
  /**
   * Delete a MarketHolidays.
   * @param {MarketHolidaysDeleteArgs} args - Arguments to delete one MarketHolidays.
   * @example
   * // Delete one MarketHolidays
   * const MarketHolidays = await prisma.marketHolidays.delete({
   *   where: {
   *     // ... filter to delete one MarketHolidays
   *   }
   * })
   * 
  **/
  delete<T extends MarketHolidaysDeleteArgs>(
    args: Subset<T, MarketHolidaysDeleteArgs>
  ): CheckSelect<T, Prisma__MarketHolidaysClient<MarketHolidays>, Prisma__MarketHolidaysClient<MarketHolidaysGetPayload<T>>>
  /**
   * Update one MarketHolidays.
   * @param {MarketHolidaysUpdateArgs} args - Arguments to update one MarketHolidays.
   * @example
   * // Update one MarketHolidays
   * const marketHolidays = await prisma.marketHolidays.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  update<T extends MarketHolidaysUpdateArgs>(
    args: Subset<T, MarketHolidaysUpdateArgs>
  ): CheckSelect<T, Prisma__MarketHolidaysClient<MarketHolidays>, Prisma__MarketHolidaysClient<MarketHolidaysGetPayload<T>>>
  /**
   * Delete zero or more MarketHolidays.
   * @param {MarketHolidaysDeleteManyArgs} args - Arguments to filter MarketHolidays to delete.
   * @example
   * // Delete a few MarketHolidays
   * const { count } = await prisma.marketHolidays.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends MarketHolidaysDeleteManyArgs>(
    args: Subset<T, MarketHolidaysDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more MarketHolidays.
   * @param {MarketHolidaysUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many MarketHolidays
   * const marketHolidays = await prisma.marketHolidays.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  updateMany<T extends MarketHolidaysUpdateManyArgs>(
    args: Subset<T, MarketHolidaysUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one MarketHolidays.
   * @param {MarketHolidaysUpsertArgs} args - Arguments to update or create a MarketHolidays.
   * @example
   * // Update or create a MarketHolidays
   * const marketHolidays = await prisma.marketHolidays.upsert({
   *   create: {
   *     // ... data to create a MarketHolidays
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the MarketHolidays we want to update
   *   }
   * })
  **/
  upsert<T extends MarketHolidaysUpsertArgs>(
    args: Subset<T, MarketHolidaysUpsertArgs>
  ): CheckSelect<T, Prisma__MarketHolidaysClient<MarketHolidays>, Prisma__MarketHolidaysClient<MarketHolidaysGetPayload<T>>>
  /**
   * Count
   */
  count(args?: Omit<FindManyMarketHolidaysArgs, 'select' | 'include'>): Promise<number>

  /**
   * Aggregate
   */
  aggregate<T extends AggregateMarketHolidaysArgs>(args: Subset<T, AggregateMarketHolidaysArgs>): Promise<GetMarketHolidaysAggregateType<T>>
}

/**
 * The delegate class that acts as a "Promise-like" for MarketHolidays.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in 
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export declare class Prisma__MarketHolidaysClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';


  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * MarketHolidays findOne
 */
export type FindOneMarketHolidaysArgs = {
  /**
   * Select specific fields to fetch from the MarketHolidays
  **/
  select?: MarketHolidaysSelect | null
  /**
   * Filter, which MarketHolidays to fetch.
  **/
  where: MarketHolidaysWhereUniqueInput
}


/**
 * MarketHolidays findMany
 */
export type FindManyMarketHolidaysArgs = {
  /**
   * Select specific fields to fetch from the MarketHolidays
  **/
  select?: MarketHolidaysSelect | null
  /**
   * Filter, which MarketHolidays to fetch.
  **/
  where?: MarketHolidaysWhereInput
  /**
   * Determine the order of the MarketHolidays to fetch.
  **/
  orderBy?: Enumerable<MarketHolidaysOrderByInput>
  /**
   * Sets the position for listing MarketHolidays.
  **/
  cursor?: MarketHolidaysWhereUniqueInput
  /**
   * The number of MarketHolidays to fetch. If negative number, it will take MarketHolidays before the `cursor`.
  **/
  take?: number
  /**
   * Skip the first `n` MarketHolidays.
  **/
  skip?: number
  distinct?: Enumerable<MarketHolidaysDistinctFieldEnum>
}


/**
 * MarketHolidays create
 */
export type MarketHolidaysCreateArgs = {
  /**
   * Select specific fields to fetch from the MarketHolidays
  **/
  select?: MarketHolidaysSelect | null
  /**
   * The data needed to create a MarketHolidays.
  **/
  data: MarketHolidaysCreateInput
}


/**
 * MarketHolidays update
 */
export type MarketHolidaysUpdateArgs = {
  /**
   * Select specific fields to fetch from the MarketHolidays
  **/
  select?: MarketHolidaysSelect | null
  /**
   * The data needed to update a MarketHolidays.
  **/
  data: MarketHolidaysUpdateInput
  /**
   * Choose, which MarketHolidays to update.
  **/
  where: MarketHolidaysWhereUniqueInput
}


/**
 * MarketHolidays updateMany
 */
export type MarketHolidaysUpdateManyArgs = {
  data: MarketHolidaysUpdateManyMutationInput
  where?: MarketHolidaysWhereInput
}


/**
 * MarketHolidays upsert
 */
export type MarketHolidaysUpsertArgs = {
  /**
   * Select specific fields to fetch from the MarketHolidays
  **/
  select?: MarketHolidaysSelect | null
  /**
   * The filter to search for the MarketHolidays to update in case it exists.
  **/
  where: MarketHolidaysWhereUniqueInput
  /**
   * In case the MarketHolidays found by the `where` argument doesn't exist, create a new MarketHolidays with this data.
  **/
  create: MarketHolidaysCreateInput
  /**
   * In case the MarketHolidays was found with the provided `where` argument, update it with this data.
  **/
  update: MarketHolidaysUpdateInput
}


/**
 * MarketHolidays delete
 */
export type MarketHolidaysDeleteArgs = {
  /**
   * Select specific fields to fetch from the MarketHolidays
  **/
  select?: MarketHolidaysSelect | null
  /**
   * Filter which MarketHolidays to delete.
  **/
  where: MarketHolidaysWhereUniqueInput
}


/**
 * MarketHolidays deleteMany
 */
export type MarketHolidaysDeleteManyArgs = {
  where?: MarketHolidaysWhereInput
}


/**
 * MarketHolidays without action
 */
export type MarketHolidaysArgs = {
  /**
   * Select specific fields to fetch from the MarketHolidays
  **/
  select?: MarketHolidaysSelect | null
}



/**
 * Model UserVerification
 */

export type UserVerification = {
  id: string
  email: string | null
  password: string | null
  expiredAt: string | null
}


export type AggregateUserVerification = {
  count: number
}



export type AggregateUserVerificationArgs = {
  where?: UserVerificationWhereInput
  orderBy?: Enumerable<UserVerificationOrderByInput>
  cursor?: UserVerificationWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Enumerable<UserVerificationDistinctFieldEnum>
  count?: true
}

export type GetUserVerificationAggregateType<T extends AggregateUserVerificationArgs> = {
  [P in keyof T]: P extends 'count' ? number : never
}


    
    

export type UserVerificationSelect = {
  id?: boolean
  email?: boolean
  password?: boolean
  expiredAt?: boolean
}

export type UserVerificationGetPayload<
  S extends boolean | null | undefined | UserVerificationArgs,
  U = keyof S
> = S extends true
  ? UserVerification
  : S extends undefined
  ? never
  : S extends UserVerificationArgs | FindManyUserVerificationArgs
  ? 'include' extends U
    ? UserVerification 
  : 'select' extends U
    ? {
      [P in TrueKeys<S['select']>]:P extends keyof UserVerification ? UserVerification[P]
: 
 never
    }
  : UserVerification
: UserVerification


export interface UserVerificationDelegate {
  /**
   * Find zero or one UserVerification.
   * @param {FindOneUserVerificationArgs} args - Arguments to find a UserVerification
   * @example
   * // Get one UserVerification
   * const userVerification = await prisma.userVerification.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneUserVerificationArgs>(
    args: Subset<T, FindOneUserVerificationArgs>
  ): CheckSelect<T, Prisma__UserVerificationClient<UserVerification | null>, Prisma__UserVerificationClient<UserVerificationGetPayload<T> | null>>
  /**
   * Find zero or more UserVerifications.
   * @param {FindManyUserVerificationArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all UserVerifications
   * const userVerifications = await prisma.userVerification.findMany()
   * 
   * // Get first 10 UserVerifications
   * const userVerifications = await prisma.userVerification.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const userVerificationWithIdOnly = await prisma.userVerification.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyUserVerificationArgs>(
    args?: Subset<T, FindManyUserVerificationArgs>
  ): CheckSelect<T, Promise<Array<UserVerification>>, Promise<Array<UserVerificationGetPayload<T>>>>
  /**
   * Create a UserVerification.
   * @param {UserVerificationCreateArgs} args - Arguments to create a UserVerification.
   * @example
   * // Create one UserVerification
   * const UserVerification = await prisma.userVerification.create({
   *   data: {
   *     // ... data to create a UserVerification
   *   }
   * })
   * 
  **/
  create<T extends UserVerificationCreateArgs>(
    args: Subset<T, UserVerificationCreateArgs>
  ): CheckSelect<T, Prisma__UserVerificationClient<UserVerification>, Prisma__UserVerificationClient<UserVerificationGetPayload<T>>>
  /**
   * Delete a UserVerification.
   * @param {UserVerificationDeleteArgs} args - Arguments to delete one UserVerification.
   * @example
   * // Delete one UserVerification
   * const UserVerification = await prisma.userVerification.delete({
   *   where: {
   *     // ... filter to delete one UserVerification
   *   }
   * })
   * 
  **/
  delete<T extends UserVerificationDeleteArgs>(
    args: Subset<T, UserVerificationDeleteArgs>
  ): CheckSelect<T, Prisma__UserVerificationClient<UserVerification>, Prisma__UserVerificationClient<UserVerificationGetPayload<T>>>
  /**
   * Update one UserVerification.
   * @param {UserVerificationUpdateArgs} args - Arguments to update one UserVerification.
   * @example
   * // Update one UserVerification
   * const userVerification = await prisma.userVerification.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  update<T extends UserVerificationUpdateArgs>(
    args: Subset<T, UserVerificationUpdateArgs>
  ): CheckSelect<T, Prisma__UserVerificationClient<UserVerification>, Prisma__UserVerificationClient<UserVerificationGetPayload<T>>>
  /**
   * Delete zero or more UserVerifications.
   * @param {UserVerificationDeleteManyArgs} args - Arguments to filter UserVerifications to delete.
   * @example
   * // Delete a few UserVerifications
   * const { count } = await prisma.userVerification.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends UserVerificationDeleteManyArgs>(
    args: Subset<T, UserVerificationDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more UserVerifications.
   * @param {UserVerificationUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many UserVerifications
   * const userVerification = await prisma.userVerification.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
  **/
  updateMany<T extends UserVerificationUpdateManyArgs>(
    args: Subset<T, UserVerificationUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one UserVerification.
   * @param {UserVerificationUpsertArgs} args - Arguments to update or create a UserVerification.
   * @example
   * // Update or create a UserVerification
   * const userVerification = await prisma.userVerification.upsert({
   *   create: {
   *     // ... data to create a UserVerification
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the UserVerification we want to update
   *   }
   * })
  **/
  upsert<T extends UserVerificationUpsertArgs>(
    args: Subset<T, UserVerificationUpsertArgs>
  ): CheckSelect<T, Prisma__UserVerificationClient<UserVerification>, Prisma__UserVerificationClient<UserVerificationGetPayload<T>>>
  /**
   * Count
   */
  count(args?: Omit<FindManyUserVerificationArgs, 'select' | 'include'>): Promise<number>

  /**
   * Aggregate
   */
  aggregate<T extends AggregateUserVerificationArgs>(args: Subset<T, AggregateUserVerificationArgs>): Promise<GetUserVerificationAggregateType<T>>
}

/**
 * The delegate class that acts as a "Promise-like" for UserVerification.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in 
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export declare class Prisma__UserVerificationClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';


  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * UserVerification findOne
 */
export type FindOneUserVerificationArgs = {
  /**
   * Select specific fields to fetch from the UserVerification
  **/
  select?: UserVerificationSelect | null
  /**
   * Filter, which UserVerification to fetch.
  **/
  where: UserVerificationWhereUniqueInput
}


/**
 * UserVerification findMany
 */
export type FindManyUserVerificationArgs = {
  /**
   * Select specific fields to fetch from the UserVerification
  **/
  select?: UserVerificationSelect | null
  /**
   * Filter, which UserVerifications to fetch.
  **/
  where?: UserVerificationWhereInput
  /**
   * Determine the order of the UserVerifications to fetch.
  **/
  orderBy?: Enumerable<UserVerificationOrderByInput>
  /**
   * Sets the position for listing UserVerifications.
  **/
  cursor?: UserVerificationWhereUniqueInput
  /**
   * The number of UserVerifications to fetch. If negative number, it will take UserVerifications before the `cursor`.
  **/
  take?: number
  /**
   * Skip the first `n` UserVerifications.
  **/
  skip?: number
  distinct?: Enumerable<UserVerificationDistinctFieldEnum>
}


/**
 * UserVerification create
 */
export type UserVerificationCreateArgs = {
  /**
   * Select specific fields to fetch from the UserVerification
  **/
  select?: UserVerificationSelect | null
  /**
   * The data needed to create a UserVerification.
  **/
  data: UserVerificationCreateInput
}


/**
 * UserVerification update
 */
export type UserVerificationUpdateArgs = {
  /**
   * Select specific fields to fetch from the UserVerification
  **/
  select?: UserVerificationSelect | null
  /**
   * The data needed to update a UserVerification.
  **/
  data: UserVerificationUpdateInput
  /**
   * Choose, which UserVerification to update.
  **/
  where: UserVerificationWhereUniqueInput
}


/**
 * UserVerification updateMany
 */
export type UserVerificationUpdateManyArgs = {
  data: UserVerificationUpdateManyMutationInput
  where?: UserVerificationWhereInput
}


/**
 * UserVerification upsert
 */
export type UserVerificationUpsertArgs = {
  /**
   * Select specific fields to fetch from the UserVerification
  **/
  select?: UserVerificationSelect | null
  /**
   * The filter to search for the UserVerification to update in case it exists.
  **/
  where: UserVerificationWhereUniqueInput
  /**
   * In case the UserVerification found by the `where` argument doesn't exist, create a new UserVerification with this data.
  **/
  create: UserVerificationCreateInput
  /**
   * In case the UserVerification was found with the provided `where` argument, update it with this data.
  **/
  update: UserVerificationUpdateInput
}


/**
 * UserVerification delete
 */
export type UserVerificationDeleteArgs = {
  /**
   * Select specific fields to fetch from the UserVerification
  **/
  select?: UserVerificationSelect | null
  /**
   * Filter which UserVerification to delete.
  **/
  where: UserVerificationWhereUniqueInput
}


/**
 * UserVerification deleteMany
 */
export type UserVerificationDeleteManyArgs = {
  where?: UserVerificationWhereInput
}


/**
 * UserVerification without action
 */
export type UserVerificationArgs = {
  /**
   * Select specific fields to fetch from the UserVerification
  **/
  select?: UserVerificationSelect | null
}



/**
 * Deep Input Types
 */


export type UserWhereInput = {
  AND?: Enumerable<UserWhereInput>
  OR?: Array<UserWhereInput>
  NOT?: Enumerable<UserWhereInput>
  id?: string | StringFilter
  email?: string | StringNullableFilter | null
  password?: string | StringNullableFilter | null
  firstName?: string | StringNullableFilter | null
  lastName?: string | StringNullableFilter | null
  hasFinishedSettingUp?: boolean | BoolFilter
  avatarUrl?: string | StringNullableFilter | null
  createdAt?: Date | string | DateTimeFilter
  updatedAt?: Date | string | DateTimeFilter
  dateOfBirth?: Date | string | DateTimeNullableFilter | null
  gender?: string | StringNullableFilter | null
  region?: string | StringNullableFilter | null
  regionalRanking?: number | IntNullableFilter | null
  occupation?: string | StringNullableFilter | null
  ranking?: number | IntNullableFilter | null
  cash?: number | FloatNullableFilter | null
  totalPortfolio?: number | FloatNullableFilter | null
  totalPortfolioLastClosure?: number | FloatNullableFilter | null
  watchlist?: Enumerable<string | StringNullableListFilter>
  transactions?: UserTransactionListRelationFilter
  shares?: ShareListRelationFilter
  accountSummaryChartInfo?: AccountSummaryTimestampListRelationFilter
}

export type UserOrderByInput = {
  id?: SortOrder
  email?: SortOrder
  password?: SortOrder
  firstName?: SortOrder
  lastName?: SortOrder
  hasFinishedSettingUp?: SortOrder
  avatarUrl?: SortOrder
  createdAt?: SortOrder
  updatedAt?: SortOrder
  dateOfBirth?: SortOrder
  gender?: SortOrder
  region?: SortOrder
  regionalRanking?: SortOrder
  occupation?: SortOrder
  ranking?: SortOrder
  cash?: SortOrder
  totalPortfolio?: SortOrder
  totalPortfolioLastClosure?: SortOrder
  watchlist?: SortOrder
}

export type UserWhereUniqueInput = {
  id?: string
  email?: string | null
}

export type AccountSummaryTimestampWhereInput = {
  AND?: Enumerable<AccountSummaryTimestampWhereInput>
  OR?: Array<AccountSummaryTimestampWhereInput>
  NOT?: Enumerable<AccountSummaryTimestampWhereInput>
  id?: string | StringFilter
  UTCDateString?: string | StringFilter
  UTCDateKey?: string | StringFilter
  year?: number | IntFilter
  portfolioValue?: number | FloatFilter
  user?: UserWhereInput | null
  userID?: string | StringFilter
}

export type AccountSummaryTimestampOrderByInput = {
  id?: SortOrder
  UTCDateString?: SortOrder
  UTCDateKey?: SortOrder
  year?: SortOrder
  portfolioValue?: SortOrder
  userID?: SortOrder
}

export type AccountSummaryTimestampWhereUniqueInput = {
  id?: string
  UTCDateKey_userID?: UTCDateKeyUserIDCompoundUniqueInput
}

export type ShareWhereInput = {
  AND?: Enumerable<ShareWhereInput>
  OR?: Array<ShareWhereInput>
  NOT?: Enumerable<ShareWhereInput>
  id?: string | StringFilter
  companyCode?: string | StringNullableFilter | null
  quantity?: number | IntNullableFilter | null
  buyPriceAvg?: number | FloatNullableFilter | null
  createdAt?: Date | string | DateTimeFilter
  updatedAt?: Date | string | DateTimeFilter
  user?: UserWhereInput | null
  userID?: string | StringFilter
}

export type ShareOrderByInput = {
  id?: SortOrder
  companyCode?: SortOrder
  quantity?: SortOrder
  buyPriceAvg?: SortOrder
  createdAt?: SortOrder
  updatedAt?: SortOrder
  userID?: SortOrder
}

export type ShareWhereUniqueInput = {
  id?: string
}

export type UserTransactionWhereInput = {
  AND?: Enumerable<UserTransactionWhereInput>
  OR?: Array<UserTransactionWhereInput>
  NOT?: Enumerable<UserTransactionWhereInput>
  id?: string | StringFilter
  createdAt?: Date | string | DateTimeFilter
  updatedAt?: Date | string | DateTimeFilter
  companyCode?: string | StringNullableFilter | null
  quantity?: number | IntNullableFilter | null
  priceAtTransaction?: number | FloatNullableFilter | null
  limitPrice?: number | FloatNullableFilter | null
  brokerage?: number | FloatNullableFilter | null
  spendOrGain?: number | FloatNullableFilter | null
  isFinished?: boolean | BoolNullableFilter | null
  finishedTime?: Date | string | DateTimeNullableFilter | null
  isTypeBuy?: boolean | BoolNullableFilter | null
  note?: string | StringNullableFilter | null
  user?: UserWhereInput | null
  userID?: string | StringFilter
}

export type UserTransactionOrderByInput = {
  id?: SortOrder
  createdAt?: SortOrder
  updatedAt?: SortOrder
  companyCode?: SortOrder
  quantity?: SortOrder
  priceAtTransaction?: SortOrder
  limitPrice?: SortOrder
  brokerage?: SortOrder
  spendOrGain?: SortOrder
  isFinished?: SortOrder
  finishedTime?: SortOrder
  isTypeBuy?: SortOrder
  note?: SortOrder
  userID?: SortOrder
}

export type UserTransactionWhereUniqueInput = {
  id?: string
}

export type MarketHolidaysWhereInput = {
  AND?: Enumerable<MarketHolidaysWhereInput>
  OR?: Array<MarketHolidaysWhereInput>
  NOT?: Enumerable<MarketHolidaysWhereInput>
  id?: string | StringFilter
  year?: number | IntNullableFilter | null
  newYearsDay?: string | StringNullableFilter | null
  martinLutherKingJrDay?: string | StringNullableFilter | null
  washingtonBirthday?: string | StringNullableFilter | null
  goodFriday?: string | StringNullableFilter | null
  memorialDay?: string | StringNullableFilter | null
  independenceDay?: string | StringNullableFilter | null
  laborDay?: string | StringNullableFilter | null
  thanksgivingDay?: string | StringNullableFilter | null
  christmas?: string | StringNullableFilter | null
}

export type MarketHolidaysOrderByInput = {
  id?: SortOrder
  year?: SortOrder
  newYearsDay?: SortOrder
  martinLutherKingJrDay?: SortOrder
  washingtonBirthday?: SortOrder
  goodFriday?: SortOrder
  memorialDay?: SortOrder
  independenceDay?: SortOrder
  laborDay?: SortOrder
  thanksgivingDay?: SortOrder
  christmas?: SortOrder
}

export type MarketHolidaysWhereUniqueInput = {
  id?: string
  year?: number | null
}

export type UserVerificationWhereInput = {
  AND?: Enumerable<UserVerificationWhereInput>
  OR?: Array<UserVerificationWhereInput>
  NOT?: Enumerable<UserVerificationWhereInput>
  id?: string | StringFilter
  email?: string | StringNullableFilter | null
  password?: string | StringNullableFilter | null
  expiredAt?: string | StringNullableFilter | null
}

export type UserVerificationOrderByInput = {
  id?: SortOrder
  email?: SortOrder
  password?: SortOrder
  expiredAt?: SortOrder
}

export type UserVerificationWhereUniqueInput = {
  id?: string
}

export type UserCreateInput = {
  id?: string
  email?: string | null
  password?: string | null
  firstName?: string | null
  lastName?: string | null
  hasFinishedSettingUp?: boolean
  avatarUrl?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  dateOfBirth?: Date | string | null
  gender?: string | null
  region?: string | null
  regionalRanking?: number | null
  occupation?: string | null
  ranking?: number | null
  cash?: number | null
  totalPortfolio?: number | null
  totalPortfolioLastClosure?: number | null
  watchlist?: UserCreatewatchlistInput
  transactions?: UserTransactionCreateManyWithoutUserInput
  shares?: ShareCreateManyWithoutUserInput
  accountSummaryChartInfo?: AccountSummaryTimestampCreateManyWithoutUserInput
}

export type UserUpdateInput = {
  id?: string | StringFieldUpdateOperationsInput
  email?: string | NullableStringFieldUpdateOperationsInput | null
  password?: string | NullableStringFieldUpdateOperationsInput | null
  firstName?: string | NullableStringFieldUpdateOperationsInput | null
  lastName?: string | NullableStringFieldUpdateOperationsInput | null
  hasFinishedSettingUp?: boolean | BoolFieldUpdateOperationsInput
  avatarUrl?: string | NullableStringFieldUpdateOperationsInput | null
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
  dateOfBirth?: Date | string | NullableDateTimeFieldUpdateOperationsInput | null
  gender?: string | NullableStringFieldUpdateOperationsInput | null
  region?: string | NullableStringFieldUpdateOperationsInput | null
  regionalRanking?: number | NullableIntFieldUpdateOperationsInput | null
  occupation?: string | NullableStringFieldUpdateOperationsInput | null
  ranking?: number | NullableIntFieldUpdateOperationsInput | null
  cash?: number | NullableFloatFieldUpdateOperationsInput | null
  totalPortfolio?: number | NullableFloatFieldUpdateOperationsInput | null
  totalPortfolioLastClosure?: number | NullableFloatFieldUpdateOperationsInput | null
  watchlist?: UserUpdatewatchlistInput
  transactions?: UserTransactionUpdateManyWithoutUserInput
  shares?: ShareUpdateManyWithoutUserInput
  accountSummaryChartInfo?: AccountSummaryTimestampUpdateManyWithoutUserInput
}

export type UserUpdateManyMutationInput = {
  id?: string | StringFieldUpdateOperationsInput
  email?: string | NullableStringFieldUpdateOperationsInput | null
  password?: string | NullableStringFieldUpdateOperationsInput | null
  firstName?: string | NullableStringFieldUpdateOperationsInput | null
  lastName?: string | NullableStringFieldUpdateOperationsInput | null
  hasFinishedSettingUp?: boolean | BoolFieldUpdateOperationsInput
  avatarUrl?: string | NullableStringFieldUpdateOperationsInput | null
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
  dateOfBirth?: Date | string | NullableDateTimeFieldUpdateOperationsInput | null
  gender?: string | NullableStringFieldUpdateOperationsInput | null
  region?: string | NullableStringFieldUpdateOperationsInput | null
  regionalRanking?: number | NullableIntFieldUpdateOperationsInput | null
  occupation?: string | NullableStringFieldUpdateOperationsInput | null
  ranking?: number | NullableIntFieldUpdateOperationsInput | null
  cash?: number | NullableFloatFieldUpdateOperationsInput | null
  totalPortfolio?: number | NullableFloatFieldUpdateOperationsInput | null
  totalPortfolioLastClosure?: number | NullableFloatFieldUpdateOperationsInput | null
  watchlist?: UserUpdatewatchlistInput
}

export type AccountSummaryTimestampCreateInput = {
  id?: string
  UTCDateString: string
  UTCDateKey: string
  year: number
  portfolioValue: number
  user: UserCreateOneWithoutAccountSummaryChartInfoInput
}

export type AccountSummaryTimestampUpdateInput = {
  id?: string | StringFieldUpdateOperationsInput
  UTCDateString?: string | StringFieldUpdateOperationsInput
  UTCDateKey?: string | StringFieldUpdateOperationsInput
  year?: number | IntFieldUpdateOperationsInput
  portfolioValue?: number | FloatFieldUpdateOperationsInput
  user?: UserUpdateOneRequiredWithoutAccountSummaryChartInfoInput
}

export type AccountSummaryTimestampUpdateManyMutationInput = {
  id?: string | StringFieldUpdateOperationsInput
  UTCDateString?: string | StringFieldUpdateOperationsInput
  UTCDateKey?: string | StringFieldUpdateOperationsInput
  year?: number | IntFieldUpdateOperationsInput
  portfolioValue?: number | FloatFieldUpdateOperationsInput
}

export type ShareCreateInput = {
  id?: string
  companyCode?: string | null
  quantity?: number | null
  buyPriceAvg?: number | null
  createdAt?: Date | string
  updatedAt?: Date | string
  user: UserCreateOneWithoutSharesInput
}

export type ShareUpdateInput = {
  id?: string | StringFieldUpdateOperationsInput
  companyCode?: string | NullableStringFieldUpdateOperationsInput | null
  quantity?: number | NullableIntFieldUpdateOperationsInput | null
  buyPriceAvg?: number | NullableFloatFieldUpdateOperationsInput | null
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
  user?: UserUpdateOneRequiredWithoutSharesInput
}

export type ShareUpdateManyMutationInput = {
  id?: string | StringFieldUpdateOperationsInput
  companyCode?: string | NullableStringFieldUpdateOperationsInput | null
  quantity?: number | NullableIntFieldUpdateOperationsInput | null
  buyPriceAvg?: number | NullableFloatFieldUpdateOperationsInput | null
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
}

export type UserTransactionCreateInput = {
  id?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  companyCode?: string | null
  quantity?: number | null
  priceAtTransaction?: number | null
  limitPrice?: number | null
  brokerage?: number | null
  spendOrGain?: number | null
  isFinished?: boolean | null
  finishedTime?: Date | string | null
  isTypeBuy?: boolean | null
  note?: string | null
  user: UserCreateOneWithoutTransactionsInput
}

export type UserTransactionUpdateInput = {
  id?: string | StringFieldUpdateOperationsInput
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
  companyCode?: string | NullableStringFieldUpdateOperationsInput | null
  quantity?: number | NullableIntFieldUpdateOperationsInput | null
  priceAtTransaction?: number | NullableFloatFieldUpdateOperationsInput | null
  limitPrice?: number | NullableFloatFieldUpdateOperationsInput | null
  brokerage?: number | NullableFloatFieldUpdateOperationsInput | null
  spendOrGain?: number | NullableFloatFieldUpdateOperationsInput | null
  isFinished?: boolean | NullableBoolFieldUpdateOperationsInput | null
  finishedTime?: Date | string | NullableDateTimeFieldUpdateOperationsInput | null
  isTypeBuy?: boolean | NullableBoolFieldUpdateOperationsInput | null
  note?: string | NullableStringFieldUpdateOperationsInput | null
  user?: UserUpdateOneRequiredWithoutTransactionsInput
}

export type UserTransactionUpdateManyMutationInput = {
  id?: string | StringFieldUpdateOperationsInput
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
  companyCode?: string | NullableStringFieldUpdateOperationsInput | null
  quantity?: number | NullableIntFieldUpdateOperationsInput | null
  priceAtTransaction?: number | NullableFloatFieldUpdateOperationsInput | null
  limitPrice?: number | NullableFloatFieldUpdateOperationsInput | null
  brokerage?: number | NullableFloatFieldUpdateOperationsInput | null
  spendOrGain?: number | NullableFloatFieldUpdateOperationsInput | null
  isFinished?: boolean | NullableBoolFieldUpdateOperationsInput | null
  finishedTime?: Date | string | NullableDateTimeFieldUpdateOperationsInput | null
  isTypeBuy?: boolean | NullableBoolFieldUpdateOperationsInput | null
  note?: string | NullableStringFieldUpdateOperationsInput | null
}

export type MarketHolidaysCreateInput = {
  id?: string
  year?: number | null
  newYearsDay?: string | null
  martinLutherKingJrDay?: string | null
  washingtonBirthday?: string | null
  goodFriday?: string | null
  memorialDay?: string | null
  independenceDay?: string | null
  laborDay?: string | null
  thanksgivingDay?: string | null
  christmas?: string | null
}

export type MarketHolidaysUpdateInput = {
  id?: string | StringFieldUpdateOperationsInput
  year?: number | NullableIntFieldUpdateOperationsInput | null
  newYearsDay?: string | NullableStringFieldUpdateOperationsInput | null
  martinLutherKingJrDay?: string | NullableStringFieldUpdateOperationsInput | null
  washingtonBirthday?: string | NullableStringFieldUpdateOperationsInput | null
  goodFriday?: string | NullableStringFieldUpdateOperationsInput | null
  memorialDay?: string | NullableStringFieldUpdateOperationsInput | null
  independenceDay?: string | NullableStringFieldUpdateOperationsInput | null
  laborDay?: string | NullableStringFieldUpdateOperationsInput | null
  thanksgivingDay?: string | NullableStringFieldUpdateOperationsInput | null
  christmas?: string | NullableStringFieldUpdateOperationsInput | null
}

export type MarketHolidaysUpdateManyMutationInput = {
  id?: string | StringFieldUpdateOperationsInput
  year?: number | NullableIntFieldUpdateOperationsInput | null
  newYearsDay?: string | NullableStringFieldUpdateOperationsInput | null
  martinLutherKingJrDay?: string | NullableStringFieldUpdateOperationsInput | null
  washingtonBirthday?: string | NullableStringFieldUpdateOperationsInput | null
  goodFriday?: string | NullableStringFieldUpdateOperationsInput | null
  memorialDay?: string | NullableStringFieldUpdateOperationsInput | null
  independenceDay?: string | NullableStringFieldUpdateOperationsInput | null
  laborDay?: string | NullableStringFieldUpdateOperationsInput | null
  thanksgivingDay?: string | NullableStringFieldUpdateOperationsInput | null
  christmas?: string | NullableStringFieldUpdateOperationsInput | null
}

export type UserVerificationCreateInput = {
  id?: string
  email?: string | null
  password?: string | null
  expiredAt?: string | null
}

export type UserVerificationUpdateInput = {
  id?: string | StringFieldUpdateOperationsInput
  email?: string | NullableStringFieldUpdateOperationsInput | null
  password?: string | NullableStringFieldUpdateOperationsInput | null
  expiredAt?: string | NullableStringFieldUpdateOperationsInput | null
}

export type UserVerificationUpdateManyMutationInput = {
  id?: string | StringFieldUpdateOperationsInput
  email?: string | NullableStringFieldUpdateOperationsInput | null
  password?: string | NullableStringFieldUpdateOperationsInput | null
  expiredAt?: string | NullableStringFieldUpdateOperationsInput | null
}

export type StringFilter = {
  equals?: string
  in?: Enumerable<string>
  notIn?: Enumerable<string>
  lt?: string
  lte?: string
  gt?: string
  gte?: string
  contains?: string
  startsWith?: string
  endsWith?: string
  not?: string | NestedStringFilter
}

export type StringNullableFilter = {
  equals?: string | null
  in?: Enumerable<string> | null
  notIn?: Enumerable<string> | null
  lt?: string | null
  lte?: string | null
  gt?: string | null
  gte?: string | null
  contains?: string | null
  startsWith?: string | null
  endsWith?: string | null
  not?: string | NestedStringNullableFilter | null
}

export type BoolFilter = {
  equals?: boolean
  not?: boolean | NestedBoolFilter
}

export type DateTimeFilter = {
  equals?: Date | string
  in?: Enumerable<Date | string>
  notIn?: Enumerable<Date | string>
  lt?: Date | string
  lte?: Date | string
  gt?: Date | string
  gte?: Date | string
  not?: Date | string | NestedDateTimeFilter
}

export type DateTimeNullableFilter = {
  equals?: Date | string | null
  in?: Enumerable<Date | string> | null
  notIn?: Enumerable<Date | string> | null
  lt?: Date | string | null
  lte?: Date | string | null
  gt?: Date | string | null
  gte?: Date | string | null
  not?: Date | string | NestedDateTimeNullableFilter | null
}

export type IntNullableFilter = {
  equals?: number | null
  in?: Enumerable<number> | null
  notIn?: Enumerable<number> | null
  lt?: number | null
  lte?: number | null
  gt?: number | null
  gte?: number | null
  not?: number | NestedIntNullableFilter | null
}

export type FloatNullableFilter = {
  equals?: number | null
  in?: Enumerable<number> | null
  notIn?: Enumerable<number> | null
  lt?: number | null
  lte?: number | null
  gt?: number | null
  gte?: number | null
  not?: number | NestedFloatNullableFilter | null
}

export type StringNullableListFilter = {
  equals?: Enumerable<string>
}

export type UserTransactionListRelationFilter = {
  every?: UserTransactionWhereInput
  some?: UserTransactionWhereInput
  none?: UserTransactionWhereInput
}

export type ShareListRelationFilter = {
  every?: ShareWhereInput
  some?: ShareWhereInput
  none?: ShareWhereInput
}

export type AccountSummaryTimestampListRelationFilter = {
  every?: AccountSummaryTimestampWhereInput
  some?: AccountSummaryTimestampWhereInput
  none?: AccountSummaryTimestampWhereInput
}

export type IntFilter = {
  equals?: number
  in?: Enumerable<number>
  notIn?: Enumerable<number>
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  not?: number | NestedIntFilter
}

export type FloatFilter = {
  equals?: number
  in?: Enumerable<number>
  notIn?: Enumerable<number>
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  not?: number | NestedFloatFilter
}

export type UserRelationFilter = {
  is?: UserWhereInput | null
  isNot?: UserWhereInput | null
}

export type UTCDateKeyUserIDCompoundUniqueInput = {
  UTCDateKey: string
  userID: string
}

export type BoolNullableFilter = {
  equals?: boolean | null
  not?: boolean | NestedBoolNullableFilter | null
}

export type UserCreatewatchlistInput = {
  set?: Enumerable<string>
}

export type UserTransactionCreateManyWithoutUserInput = {
  create?: Enumerable<UserTransactionCreateWithoutUserInput>
  connect?: Enumerable<UserTransactionWhereUniqueInput>
}

export type ShareCreateManyWithoutUserInput = {
  create?: Enumerable<ShareCreateWithoutUserInput>
  connect?: Enumerable<ShareWhereUniqueInput>
}

export type AccountSummaryTimestampCreateManyWithoutUserInput = {
  create?: Enumerable<AccountSummaryTimestampCreateWithoutUserInput>
  connect?: Enumerable<AccountSummaryTimestampWhereUniqueInput>
}

export type StringFieldUpdateOperationsInput = {
  set?: string
}

export type NullableStringFieldUpdateOperationsInput = {
  set?: string | null
}

export type BoolFieldUpdateOperationsInput = {
  set?: boolean
}

export type DateTimeFieldUpdateOperationsInput = {
  set?: Date | string
}

export type NullableDateTimeFieldUpdateOperationsInput = {
  set?: Date | string | null
}

export type NullableIntFieldUpdateOperationsInput = {
  set?: number | null
}

export type NullableFloatFieldUpdateOperationsInput = {
  set?: number | null
}

export type UserUpdatewatchlistInput = {
  set?: Enumerable<string>
}

export type UserTransactionUpdateManyWithoutUserInput = {
  create?: Enumerable<UserTransactionCreateWithoutUserInput>
  connect?: Enumerable<UserTransactionWhereUniqueInput>
  set?: Enumerable<UserTransactionWhereUniqueInput>
  disconnect?: Enumerable<UserTransactionWhereUniqueInput>
  delete?: Enumerable<UserTransactionWhereUniqueInput>
  update?: Enumerable<UserTransactionUpdateWithWhereUniqueWithoutUserInput>
  updateMany?: Enumerable<UserTransactionUpdateManyWithWhereNestedInput> | null
  deleteMany?: Enumerable<UserTransactionScalarWhereInput>
  upsert?: Enumerable<UserTransactionUpsertWithWhereUniqueWithoutUserInput>
}

export type ShareUpdateManyWithoutUserInput = {
  create?: Enumerable<ShareCreateWithoutUserInput>
  connect?: Enumerable<ShareWhereUniqueInput>
  set?: Enumerable<ShareWhereUniqueInput>
  disconnect?: Enumerable<ShareWhereUniqueInput>
  delete?: Enumerable<ShareWhereUniqueInput>
  update?: Enumerable<ShareUpdateWithWhereUniqueWithoutUserInput>
  updateMany?: Enumerable<ShareUpdateManyWithWhereNestedInput> | null
  deleteMany?: Enumerable<ShareScalarWhereInput>
  upsert?: Enumerable<ShareUpsertWithWhereUniqueWithoutUserInput>
}

export type AccountSummaryTimestampUpdateManyWithoutUserInput = {
  create?: Enumerable<AccountSummaryTimestampCreateWithoutUserInput>
  connect?: Enumerable<AccountSummaryTimestampWhereUniqueInput>
  set?: Enumerable<AccountSummaryTimestampWhereUniqueInput>
  disconnect?: Enumerable<AccountSummaryTimestampWhereUniqueInput>
  delete?: Enumerable<AccountSummaryTimestampWhereUniqueInput>
  update?: Enumerable<AccountSummaryTimestampUpdateWithWhereUniqueWithoutUserInput>
  updateMany?: Enumerable<AccountSummaryTimestampUpdateManyWithWhereNestedInput> | null
  deleteMany?: Enumerable<AccountSummaryTimestampScalarWhereInput>
  upsert?: Enumerable<AccountSummaryTimestampUpsertWithWhereUniqueWithoutUserInput>
}

export type UserCreateOneWithoutAccountSummaryChartInfoInput = {
  create?: UserCreateWithoutAccountSummaryChartInfoInput
  connect?: UserWhereUniqueInput
}

export type IntFieldUpdateOperationsInput = {
  set?: number
}

export type FloatFieldUpdateOperationsInput = {
  set?: number
}

export type UserUpdateOneRequiredWithoutAccountSummaryChartInfoInput = {
  create?: UserCreateWithoutAccountSummaryChartInfoInput
  connect?: UserWhereUniqueInput
  update?: UserUpdateWithoutAccountSummaryChartInfoDataInput
  upsert?: UserUpsertWithoutAccountSummaryChartInfoInput
}

export type UserCreateOneWithoutSharesInput = {
  create?: UserCreateWithoutSharesInput
  connect?: UserWhereUniqueInput
}

export type UserUpdateOneRequiredWithoutSharesInput = {
  create?: UserCreateWithoutSharesInput
  connect?: UserWhereUniqueInput
  update?: UserUpdateWithoutSharesDataInput
  upsert?: UserUpsertWithoutSharesInput
}

export type UserCreateOneWithoutTransactionsInput = {
  create?: UserCreateWithoutTransactionsInput
  connect?: UserWhereUniqueInput
}

export type NullableBoolFieldUpdateOperationsInput = {
  set?: boolean | null
}

export type UserUpdateOneRequiredWithoutTransactionsInput = {
  create?: UserCreateWithoutTransactionsInput
  connect?: UserWhereUniqueInput
  update?: UserUpdateWithoutTransactionsDataInput
  upsert?: UserUpsertWithoutTransactionsInput
}

export type NestedStringFilter = {
  equals?: string
  in?: Enumerable<string>
  notIn?: Enumerable<string>
  lt?: string
  lte?: string
  gt?: string
  gte?: string
  contains?: string
  startsWith?: string
  endsWith?: string
  not?: NestedStringFilter | null
}

export type NestedStringNullableFilter = {
  equals?: string | null
  in?: Enumerable<string> | null
  notIn?: Enumerable<string> | null
  lt?: string | null
  lte?: string | null
  gt?: string | null
  gte?: string | null
  contains?: string | null
  startsWith?: string | null
  endsWith?: string | null
  not?: NestedStringNullableFilter | null
}

export type NestedBoolFilter = {
  equals?: boolean
  not?: NestedBoolFilter | null
}

export type NestedDateTimeFilter = {
  equals?: Date | string
  in?: Enumerable<Date | string>
  notIn?: Enumerable<Date | string>
  lt?: Date | string
  lte?: Date | string
  gt?: Date | string
  gte?: Date | string
  not?: NestedDateTimeFilter | null
}

export type NestedDateTimeNullableFilter = {
  equals?: Date | string | null
  in?: Enumerable<Date | string> | null
  notIn?: Enumerable<Date | string> | null
  lt?: Date | string | null
  lte?: Date | string | null
  gt?: Date | string | null
  gte?: Date | string | null
  not?: NestedDateTimeNullableFilter | null
}

export type NestedIntNullableFilter = {
  equals?: number | null
  in?: Enumerable<number> | null
  notIn?: Enumerable<number> | null
  lt?: number | null
  lte?: number | null
  gt?: number | null
  gte?: number | null
  not?: NestedIntNullableFilter | null
}

export type NestedFloatNullableFilter = {
  equals?: number | null
  in?: Enumerable<number> | null
  notIn?: Enumerable<number> | null
  lt?: number | null
  lte?: number | null
  gt?: number | null
  gte?: number | null
  not?: NestedFloatNullableFilter | null
}

export type NestedIntFilter = {
  equals?: number
  in?: Enumerable<number>
  notIn?: Enumerable<number>
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  not?: NestedIntFilter | null
}

export type NestedFloatFilter = {
  equals?: number
  in?: Enumerable<number>
  notIn?: Enumerable<number>
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  not?: NestedFloatFilter | null
}

export type NestedBoolNullableFilter = {
  equals?: boolean | null
  not?: NestedBoolNullableFilter | null
}

export type UserTransactionCreateWithoutUserInput = {
  id?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  companyCode?: string | null
  quantity?: number | null
  priceAtTransaction?: number | null
  limitPrice?: number | null
  brokerage?: number | null
  spendOrGain?: number | null
  isFinished?: boolean | null
  finishedTime?: Date | string | null
  isTypeBuy?: boolean | null
  note?: string | null
}

export type ShareCreateWithoutUserInput = {
  id?: string
  companyCode?: string | null
  quantity?: number | null
  buyPriceAvg?: number | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type AccountSummaryTimestampCreateWithoutUserInput = {
  id?: string
  UTCDateString: string
  UTCDateKey: string
  year: number
  portfolioValue: number
}

export type UserTransactionUpdateWithWhereUniqueWithoutUserInput = {
  where: UserTransactionWhereUniqueInput
  data: UserTransactionUpdateWithoutUserDataInput
}

export type UserTransactionUpdateManyWithWhereNestedInput = {
  where: UserTransactionScalarWhereInput
  data: UserTransactionUpdateManyDataInput
}

export type UserTransactionScalarWhereInput = {
  AND?: Enumerable<UserTransactionScalarWhereInput>
  OR?: Array<UserTransactionScalarWhereInput>
  NOT?: Enumerable<UserTransactionScalarWhereInput>
  id?: string | StringFilter
  createdAt?: Date | string | DateTimeFilter
  updatedAt?: Date | string | DateTimeFilter
  companyCode?: string | StringNullableFilter | null
  quantity?: number | IntNullableFilter | null
  priceAtTransaction?: number | FloatNullableFilter | null
  limitPrice?: number | FloatNullableFilter | null
  brokerage?: number | FloatNullableFilter | null
  spendOrGain?: number | FloatNullableFilter | null
  isFinished?: boolean | BoolNullableFilter | null
  finishedTime?: Date | string | DateTimeNullableFilter | null
  isTypeBuy?: boolean | BoolNullableFilter | null
  note?: string | StringNullableFilter | null
  userID?: string | StringFilter
}

export type UserTransactionUpsertWithWhereUniqueWithoutUserInput = {
  where: UserTransactionWhereUniqueInput
  update: UserTransactionUpdateWithoutUserDataInput
  create: UserTransactionCreateWithoutUserInput
}

export type ShareUpdateWithWhereUniqueWithoutUserInput = {
  where: ShareWhereUniqueInput
  data: ShareUpdateWithoutUserDataInput
}

export type ShareUpdateManyWithWhereNestedInput = {
  where: ShareScalarWhereInput
  data: ShareUpdateManyDataInput
}

export type ShareScalarWhereInput = {
  AND?: Enumerable<ShareScalarWhereInput>
  OR?: Array<ShareScalarWhereInput>
  NOT?: Enumerable<ShareScalarWhereInput>
  id?: string | StringFilter
  companyCode?: string | StringNullableFilter | null
  quantity?: number | IntNullableFilter | null
  buyPriceAvg?: number | FloatNullableFilter | null
  createdAt?: Date | string | DateTimeFilter
  updatedAt?: Date | string | DateTimeFilter
  userID?: string | StringFilter
}

export type ShareUpsertWithWhereUniqueWithoutUserInput = {
  where: ShareWhereUniqueInput
  update: ShareUpdateWithoutUserDataInput
  create: ShareCreateWithoutUserInput
}

export type AccountSummaryTimestampUpdateWithWhereUniqueWithoutUserInput = {
  where: AccountSummaryTimestampWhereUniqueInput
  data: AccountSummaryTimestampUpdateWithoutUserDataInput
}

export type AccountSummaryTimestampUpdateManyWithWhereNestedInput = {
  where: AccountSummaryTimestampScalarWhereInput
  data: AccountSummaryTimestampUpdateManyDataInput
}

export type AccountSummaryTimestampScalarWhereInput = {
  AND?: Enumerable<AccountSummaryTimestampScalarWhereInput>
  OR?: Array<AccountSummaryTimestampScalarWhereInput>
  NOT?: Enumerable<AccountSummaryTimestampScalarWhereInput>
  id?: string | StringFilter
  UTCDateString?: string | StringFilter
  UTCDateKey?: string | StringFilter
  year?: number | IntFilter
  portfolioValue?: number | FloatFilter
  userID?: string | StringFilter
}

export type AccountSummaryTimestampUpsertWithWhereUniqueWithoutUserInput = {
  where: AccountSummaryTimestampWhereUniqueInput
  update: AccountSummaryTimestampUpdateWithoutUserDataInput
  create: AccountSummaryTimestampCreateWithoutUserInput
}

export type UserCreateWithoutAccountSummaryChartInfoInput = {
  id?: string
  email?: string | null
  password?: string | null
  firstName?: string | null
  lastName?: string | null
  hasFinishedSettingUp?: boolean
  avatarUrl?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  dateOfBirth?: Date | string | null
  gender?: string | null
  region?: string | null
  regionalRanking?: number | null
  occupation?: string | null
  ranking?: number | null
  cash?: number | null
  totalPortfolio?: number | null
  totalPortfolioLastClosure?: number | null
  watchlist?: UserCreatewatchlistInput
  transactions?: UserTransactionCreateManyWithoutUserInput
  shares?: ShareCreateManyWithoutUserInput
}

export type UserUpdateWithoutAccountSummaryChartInfoDataInput = {
  id?: string | StringFieldUpdateOperationsInput
  email?: string | NullableStringFieldUpdateOperationsInput | null
  password?: string | NullableStringFieldUpdateOperationsInput | null
  firstName?: string | NullableStringFieldUpdateOperationsInput | null
  lastName?: string | NullableStringFieldUpdateOperationsInput | null
  hasFinishedSettingUp?: boolean | BoolFieldUpdateOperationsInput
  avatarUrl?: string | NullableStringFieldUpdateOperationsInput | null
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
  dateOfBirth?: Date | string | NullableDateTimeFieldUpdateOperationsInput | null
  gender?: string | NullableStringFieldUpdateOperationsInput | null
  region?: string | NullableStringFieldUpdateOperationsInput | null
  regionalRanking?: number | NullableIntFieldUpdateOperationsInput | null
  occupation?: string | NullableStringFieldUpdateOperationsInput | null
  ranking?: number | NullableIntFieldUpdateOperationsInput | null
  cash?: number | NullableFloatFieldUpdateOperationsInput | null
  totalPortfolio?: number | NullableFloatFieldUpdateOperationsInput | null
  totalPortfolioLastClosure?: number | NullableFloatFieldUpdateOperationsInput | null
  watchlist?: UserUpdatewatchlistInput
  transactions?: UserTransactionUpdateManyWithoutUserInput
  shares?: ShareUpdateManyWithoutUserInput
}

export type UserUpsertWithoutAccountSummaryChartInfoInput = {
  update: UserUpdateWithoutAccountSummaryChartInfoDataInput
  create: UserCreateWithoutAccountSummaryChartInfoInput
}

export type UserCreateWithoutSharesInput = {
  id?: string
  email?: string | null
  password?: string | null
  firstName?: string | null
  lastName?: string | null
  hasFinishedSettingUp?: boolean
  avatarUrl?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  dateOfBirth?: Date | string | null
  gender?: string | null
  region?: string | null
  regionalRanking?: number | null
  occupation?: string | null
  ranking?: number | null
  cash?: number | null
  totalPortfolio?: number | null
  totalPortfolioLastClosure?: number | null
  watchlist?: UserCreatewatchlistInput
  transactions?: UserTransactionCreateManyWithoutUserInput
  accountSummaryChartInfo?: AccountSummaryTimestampCreateManyWithoutUserInput
}

export type UserUpdateWithoutSharesDataInput = {
  id?: string | StringFieldUpdateOperationsInput
  email?: string | NullableStringFieldUpdateOperationsInput | null
  password?: string | NullableStringFieldUpdateOperationsInput | null
  firstName?: string | NullableStringFieldUpdateOperationsInput | null
  lastName?: string | NullableStringFieldUpdateOperationsInput | null
  hasFinishedSettingUp?: boolean | BoolFieldUpdateOperationsInput
  avatarUrl?: string | NullableStringFieldUpdateOperationsInput | null
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
  dateOfBirth?: Date | string | NullableDateTimeFieldUpdateOperationsInput | null
  gender?: string | NullableStringFieldUpdateOperationsInput | null
  region?: string | NullableStringFieldUpdateOperationsInput | null
  regionalRanking?: number | NullableIntFieldUpdateOperationsInput | null
  occupation?: string | NullableStringFieldUpdateOperationsInput | null
  ranking?: number | NullableIntFieldUpdateOperationsInput | null
  cash?: number | NullableFloatFieldUpdateOperationsInput | null
  totalPortfolio?: number | NullableFloatFieldUpdateOperationsInput | null
  totalPortfolioLastClosure?: number | NullableFloatFieldUpdateOperationsInput | null
  watchlist?: UserUpdatewatchlistInput
  transactions?: UserTransactionUpdateManyWithoutUserInput
  accountSummaryChartInfo?: AccountSummaryTimestampUpdateManyWithoutUserInput
}

export type UserUpsertWithoutSharesInput = {
  update: UserUpdateWithoutSharesDataInput
  create: UserCreateWithoutSharesInput
}

export type UserCreateWithoutTransactionsInput = {
  id?: string
  email?: string | null
  password?: string | null
  firstName?: string | null
  lastName?: string | null
  hasFinishedSettingUp?: boolean
  avatarUrl?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  dateOfBirth?: Date | string | null
  gender?: string | null
  region?: string | null
  regionalRanking?: number | null
  occupation?: string | null
  ranking?: number | null
  cash?: number | null
  totalPortfolio?: number | null
  totalPortfolioLastClosure?: number | null
  watchlist?: UserCreatewatchlistInput
  shares?: ShareCreateManyWithoutUserInput
  accountSummaryChartInfo?: AccountSummaryTimestampCreateManyWithoutUserInput
}

export type UserUpdateWithoutTransactionsDataInput = {
  id?: string | StringFieldUpdateOperationsInput
  email?: string | NullableStringFieldUpdateOperationsInput | null
  password?: string | NullableStringFieldUpdateOperationsInput | null
  firstName?: string | NullableStringFieldUpdateOperationsInput | null
  lastName?: string | NullableStringFieldUpdateOperationsInput | null
  hasFinishedSettingUp?: boolean | BoolFieldUpdateOperationsInput
  avatarUrl?: string | NullableStringFieldUpdateOperationsInput | null
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
  dateOfBirth?: Date | string | NullableDateTimeFieldUpdateOperationsInput | null
  gender?: string | NullableStringFieldUpdateOperationsInput | null
  region?: string | NullableStringFieldUpdateOperationsInput | null
  regionalRanking?: number | NullableIntFieldUpdateOperationsInput | null
  occupation?: string | NullableStringFieldUpdateOperationsInput | null
  ranking?: number | NullableIntFieldUpdateOperationsInput | null
  cash?: number | NullableFloatFieldUpdateOperationsInput | null
  totalPortfolio?: number | NullableFloatFieldUpdateOperationsInput | null
  totalPortfolioLastClosure?: number | NullableFloatFieldUpdateOperationsInput | null
  watchlist?: UserUpdatewatchlistInput
  shares?: ShareUpdateManyWithoutUserInput
  accountSummaryChartInfo?: AccountSummaryTimestampUpdateManyWithoutUserInput
}

export type UserUpsertWithoutTransactionsInput = {
  update: UserUpdateWithoutTransactionsDataInput
  create: UserCreateWithoutTransactionsInput
}

export type UserTransactionUpdateWithoutUserDataInput = {
  id?: string | StringFieldUpdateOperationsInput
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
  companyCode?: string | NullableStringFieldUpdateOperationsInput | null
  quantity?: number | NullableIntFieldUpdateOperationsInput | null
  priceAtTransaction?: number | NullableFloatFieldUpdateOperationsInput | null
  limitPrice?: number | NullableFloatFieldUpdateOperationsInput | null
  brokerage?: number | NullableFloatFieldUpdateOperationsInput | null
  spendOrGain?: number | NullableFloatFieldUpdateOperationsInput | null
  isFinished?: boolean | NullableBoolFieldUpdateOperationsInput | null
  finishedTime?: Date | string | NullableDateTimeFieldUpdateOperationsInput | null
  isTypeBuy?: boolean | NullableBoolFieldUpdateOperationsInput | null
  note?: string | NullableStringFieldUpdateOperationsInput | null
}

export type UserTransactionUpdateManyDataInput = {
  id?: string | StringFieldUpdateOperationsInput
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
  companyCode?: string | NullableStringFieldUpdateOperationsInput | null
  quantity?: number | NullableIntFieldUpdateOperationsInput | null
  priceAtTransaction?: number | NullableFloatFieldUpdateOperationsInput | null
  limitPrice?: number | NullableFloatFieldUpdateOperationsInput | null
  brokerage?: number | NullableFloatFieldUpdateOperationsInput | null
  spendOrGain?: number | NullableFloatFieldUpdateOperationsInput | null
  isFinished?: boolean | NullableBoolFieldUpdateOperationsInput | null
  finishedTime?: Date | string | NullableDateTimeFieldUpdateOperationsInput | null
  isTypeBuy?: boolean | NullableBoolFieldUpdateOperationsInput | null
  note?: string | NullableStringFieldUpdateOperationsInput | null
}

export type ShareUpdateWithoutUserDataInput = {
  id?: string | StringFieldUpdateOperationsInput
  companyCode?: string | NullableStringFieldUpdateOperationsInput | null
  quantity?: number | NullableIntFieldUpdateOperationsInput | null
  buyPriceAvg?: number | NullableFloatFieldUpdateOperationsInput | null
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
}

export type ShareUpdateManyDataInput = {
  id?: string | StringFieldUpdateOperationsInput
  companyCode?: string | NullableStringFieldUpdateOperationsInput | null
  quantity?: number | NullableIntFieldUpdateOperationsInput | null
  buyPriceAvg?: number | NullableFloatFieldUpdateOperationsInput | null
  createdAt?: Date | string | DateTimeFieldUpdateOperationsInput
  updatedAt?: Date | string | DateTimeFieldUpdateOperationsInput
}

export type AccountSummaryTimestampUpdateWithoutUserDataInput = {
  id?: string | StringFieldUpdateOperationsInput
  UTCDateString?: string | StringFieldUpdateOperationsInput
  UTCDateKey?: string | StringFieldUpdateOperationsInput
  year?: number | IntFieldUpdateOperationsInput
  portfolioValue?: number | FloatFieldUpdateOperationsInput
}

export type AccountSummaryTimestampUpdateManyDataInput = {
  id?: string | StringFieldUpdateOperationsInput
  UTCDateString?: string | StringFieldUpdateOperationsInput
  UTCDateKey?: string | StringFieldUpdateOperationsInput
  year?: number | IntFieldUpdateOperationsInput
  portfolioValue?: number | FloatFieldUpdateOperationsInput
}

/**
 * Batch Payload for updateMany & deleteMany
 */

export type BatchPayload = {
  count: number
}

/**
 * DMMF
 */
export declare const dmmf: DMMF.Document;
export {};
