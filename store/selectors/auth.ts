import { State } from '../../reducers'

export const getMyPublicKey = (state: State) => state.auth.gunPublicKey
