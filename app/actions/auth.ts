import { Schema } from 'shock-common'
import { ListInvoiceResponse as ListInvoicesResponse } from '../services'

export const authed = (data: {
  alias: string
  token: string
  gunPublicKey: string
  data: {
    follows: Record<string, Schema.Follow>
    invoices: ListInvoicesResponse
  }
}) =>
  ({
    type: 'authed',
    data,
  } as const)

export const tokenDidInvalidate = () =>
  ({
    type: 'tokenDidInvalidate',
  } as const)

export const hostWasSet = (host: string) =>
  ({
    type: 'hostWasSet',
    data: {
      host,
    },
  } as const)

export type AuthAction =
  | ReturnType<typeof authed>
  | ReturnType<typeof tokenDidInvalidate>
  | ReturnType<typeof hostWasSet>
