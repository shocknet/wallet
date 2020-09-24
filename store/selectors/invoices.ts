import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../../reducers'

type Invoice =
  | Schema.InvoiceWhenAdded
  | Schema.InvoiceWhenListed
  | Schema.InvoiceWhenDecoded

interface HasPayReq {
  payReq: string
}

const getInvoicesAdded = (state: State) => state.invoicesAdded
const getInvoicesListed = (state: State) => state.invoicesListed
const getInvoicesDecoded = (state: State) => state.decodedInvoices
const getPayReq = (_: State, props: HasPayReq) => props.payReq

export const makeGetInvoice = () =>
  createSelector<
    State,
    HasPayReq, // Props to selectors
    ReturnType<typeof getInvoicesAdded>,
    ReturnType<typeof getInvoicesListed>,
    ReturnType<typeof getInvoicesDecoded>,
    ReturnType<typeof getPayReq>,
    Invoice | null // Return type
  >(
    getInvoicesAdded,
    getInvoicesListed,
    getInvoicesDecoded,
    getPayReq,
    (invoicesAdded, invoicesListed, invoicesDecoded, payReq) => {
      if (invoicesDecoded[payReq]) {
        return invoicesDecoded[payReq]
      }

      if (invoicesListed.byId[payReq]) {
        return invoicesListed.byId[payReq]
      }

      if (invoicesAdded[payReq]) {
        return invoicesAdded[payReq]
      }

      return null
    },
  )
