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
  paymentV2: Schema.PaymentV2,
) =>
  ({
    type: 'tips/tipWentThrough',
    data: {
      recipientsPublicKey,
      paymentV2,
    },
  } as const)

export const tipFailed = (recipientsPublicKey: string, message: string) =>
  ({
    type: 'tips/tipFailed',
    data: {
      recipientsPublicKey,
      message,
    },
  } as const)

export const requestedPostTip = (postID: string, amt: number) =>
  ({
    type: 'tips/requestedPostTip',
    data: {
      amt,
      postID,
    },
  } as const)

export type TipsAction =
  | ReturnType<typeof requestedTip>
  | ReturnType<typeof tipWentThrough>
  | ReturnType<typeof tipFailed>
  | ReturnType<typeof requestedPostTip>
