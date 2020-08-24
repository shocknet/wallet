import Http from 'axios'
import Logger from 'react-native-file-log'

import { Schema } from 'shock-common'

// TODO: Move to common repo
interface ErrResponse {
  field?: string
  errorMessage: string
}

export const tip = async (
  amount: number,
  recipientsPublicKey: string,
  memo: string,
  feeLimit: number,
): Promise<Schema.PaymentV2> => {
  try {
    const { data, status } = await Http.post<Schema.PaymentV2 | ErrResponse>(
      `/api/lnd/unifiedTrx`,
      {
        type: 'spont',
        amt: amount,
        to: recipientsPublicKey,
        memo,
        feeLimit,
      },
    )

    if (status !== 200) {
      throw new Error(JSON.stringify(data))
    }

    // cast: If status is 200 response will be PaymentV2
    return data as Schema.PaymentV2
  } catch (err) {
    const msg = `tip() -> ${JSON.stringify(err)}`
    Logger.log(msg)
    throw new Error(msg)
  }
}
