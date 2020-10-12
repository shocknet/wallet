interface HasPublicKey {
  publicKey: string
}

interface UserBase {
  avatar: string | null
  bio: string | null
  displayName: string | null
  lastSeenApp: number
  lastSeenNode: number
}

export type User = HasPublicKey & UserBase

export type PartialUser = HasPublicKey & Partial<User>

/**
 * Tips should hopefully take less than 30 seconds to go through so we don't
 * store them anywhere in persistent storage. That's why we have the state
 * embedded in the schema definition itself.
 */
export interface Tip {
  amount: number
  state: 'processing' | 'wentThrough' | 'err'
  lastErr: string
  lastMemo: string
}
