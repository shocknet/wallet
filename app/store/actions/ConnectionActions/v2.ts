export const ping = (timestamp: number) =>
  ({
    type: 'socket/ping',
    data: {
      timestamp,
    },
  } as const)

export const KEYS_LOADED = 'encryption/loadKeys'

interface LoadedKeys {
  devicePublicKey: string | undefined
  APIPublicKey: string
  sessionId: string
  success: boolean
}

export const keysLoaded = (keys: LoadedKeys) =>
  ({
    type: KEYS_LOADED,
    data: keys,
  } as const)

export type ConnectionAction =
  | ReturnType<typeof ping>
  | ReturnType<typeof keysLoaded>
