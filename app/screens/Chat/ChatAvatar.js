import React from 'react'

import { ConnectedShockAvatar } from '../../components/ShockAvatar'

const AVATAR_SIZE = 40

/**
 * @typedef {object} Props
 * @prop {string} publicKey
 */

/**
 * @type {React.FC<Props>}
 */
const ChatAvatar = React.memo(({ publicKey }) => {
  return (<ConnectedShockAvatar height={AVATAR_SIZE} publicKey={publicKey} />)
})

export default ChatAvatar
