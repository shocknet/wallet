import { State } from '../reducers'

export const selectFees = ({ fees: { absoluteFee, relativeFee } }: State) => ({
  absoluteFee,
  relativeFee,
})
