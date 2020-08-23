export const requestedTip = (
  amount: number,
  recipientsPublicKey: string,
  memo: string,
) =>
  ({
    type: 'tips/requestedTip',
    data: {
      amount,
      recipientsPublicKey,
      memo,
    },
  } as const)

export const tipWentThrough = (recipientsPublicKey: string) =>
  ({
    type: 'tips/tipWentThrough',
    data: {
      recipientsPublicKey,
    },
  } as const)

export type TipsAction =
  | ReturnType<typeof requestedTip>
  | ReturnType<typeof tipWentThrough>
