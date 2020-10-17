import * as Common from 'shock-common'

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

export interface NodeInfo {
  uris: string[]
  chains: {
    chain: string
    network: string
  }[]
  features: Record<number, Common.Schema.Feature>
  identity_pubkey: string
  alias: string
  num_pending_channels: number
  num_active_channels: number
  num_peers: number
  block_height: number
  block_hash: string
  synced_to_chain: boolean
  testnet: boolean
  best_header_timestamp: string
  version: string
  num_inactive_channels: number
  color: string
  synced_to_graph: boolean
  commit_hash: string
}
