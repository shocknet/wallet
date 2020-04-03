import React from 'react'

import ShockAvatar from '../../components/ShockAvatar'

const AVATAR_SIZE = 40

/**
 * @typedef {object} Props
 * @prop {string|null} avatar
 */

/**
 * @type {React.FC<Props>}
 */
const ChatAvatar = ({ avatar }) => {
  return <ShockAvatar height={AVATAR_SIZE} image={avatar} />
}

export default ChatAvatar
