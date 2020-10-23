import { ListPaymentsReq, ListPaymentsRes } from '../../services/wallet'

export const receivedOwnPayments = (data: {
  payments: ListPaymentsRes['payments']
  first_index_offset: number
  last_index_offset: number
  originRequest: ListPaymentsReq
}) =>
  ({
    type: 'payments/receivedOwn',
    data,
  } as const)

type ReceivedOwnPaymentsAction = ReturnType<typeof receivedOwnPayments>

export const paymentsRefreshForced = () =>
  ({
    type: 'payments/refreshForced',
  } as const)

type PaymentsRefreshForcedAction = ReturnType<typeof paymentsRefreshForced>

export type PaymentsAction =
  | ReceivedOwnPaymentsAction
  | PaymentsRefreshForcedAction
