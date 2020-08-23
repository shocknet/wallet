import { Schema } from 'shock-common'

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

export const tipWentThrough = (
  recipientsPublicKey: string,
  payment: Schema.PaymentV2,
) =>
  ({
    type: 'tips/tipWentThrough',
    data: {
      recipientsPublicKey,
      payment,
    },
  } as const)

export type TipsAction =
  | ReturnType<typeof requestedTip>
  | ReturnType<typeof tipWentThrough>
