import { State } from '../reducers'

export const selectSeedServerURL = (state: State): string =>
  state.mediaLib.seedServerUrl
