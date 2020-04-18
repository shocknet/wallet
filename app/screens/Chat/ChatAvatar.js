import React from 'react'

import ShockAvatar from '../../components/ShockAvatar'

const AVATAR_SIZE = 40

/**
 * @typedef {object} Props
 * @prop {string|null} avatar
 * @prop {number|null} lastSeenApp
 */

/**
 * @type {React.FC<Props>}
 */
const ChatAvatar = ({ avatar, lastSeenApp }) => {
  return ((
    <ShockAvatar
      height={AVATAR_SIZE}
      image={avatar}
      lastSeenApp={lastSeenApp}
    />
  ))
}

export default ChatAvatar
