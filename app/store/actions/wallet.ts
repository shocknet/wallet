export const loadedUSDRate = (USDRate: number) =>
  ({
    type: 'usdRate/load',
    data: USDRate,
  } as const)

export const loadedBalance = (
  confirmedBalance: string,
  pendingChannelBalance: string,
  channelBalance: string,
) =>
  ({
    type: 'balance/load',
    data: {
      confirmedBalance,
      pendingChannelBalance,
      channelBalance,
    },
  } as const)

export type WalletAction =
  | ReturnType<typeof loadedUSDRate>
  | ReturnType<typeof loadedBalance>
