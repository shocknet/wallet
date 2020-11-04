import { createAction } from '@reduxjs/toolkit'

export const enableDebug = createAction('debug/enable')

export const disableDebug = createAction('debug/disable')

export type DebugAction =
  | ReturnType<typeof enableDebug>
  | ReturnType<typeof disableDebug>
