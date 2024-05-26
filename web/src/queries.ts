export enum QueryKeys {
  GET_ACCOUNT = "GET_ACCOUNT",
  GET_DEVICE = "GET_DEVICE",
  GET_CATEGORIES = "GET_CATEGORIES",
  GET_STATISTICS_TRANSACTIONS_IN_CATEGORY = "GET_STATISTICS_TRANSACTIONS_IN_CATEGORY",
  GET_STATISTICS = "GET_STATISTICS",
  GET_TRANSACTIONS = "GET_TRANSACTIONS",
  GET_TRANSACTIONS_TOTAL = "GET_TRANSACTIONS_TOTAL",
}

export const queries: Record<QueryKeys, { refetchOnUpdate: boolean }> = {
  [QueryKeys.GET_ACCOUNT]: {
    refetchOnUpdate: false,
  },
  [QueryKeys.GET_DEVICE]: {
    refetchOnUpdate: false,
  },
  [QueryKeys.GET_CATEGORIES]: {
    refetchOnUpdate: true,
  },
  [QueryKeys.GET_STATISTICS_TRANSACTIONS_IN_CATEGORY]: {
    refetchOnUpdate: true,
  },
  [QueryKeys.GET_STATISTICS]: {
    refetchOnUpdate: true,
  },
  [QueryKeys.GET_TRANSACTIONS]: {
    refetchOnUpdate: true,
  },
  [QueryKeys.GET_TRANSACTIONS_TOTAL]: {
    refetchOnUpdate: true,
  },
};
