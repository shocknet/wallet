import { createAction } from '@reduxjs/toolkit'

export const enableDebug = createAction('debug/enable')

export const disableDebug = createAction('debug/disable')

export const log = createAction('debug/log', (...content: any[]) => ({
  payload: {
    content,
  },
}))

export type DebugAction =
  | ReturnType<typeof enableDebug>
  | ReturnType<typeof disableDebug>
  | ReturnType<typeof log>
