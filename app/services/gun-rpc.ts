import { default as SocketIO } from 'socket.io-client'

import { getStore } from '../../store'
import { tokenDidInvalidate } from '../actions'

/**
 * Returns a socket wired up to the given query. Use `.on('$shock')` for values.
 * Query example:
 * ```js
 * rifle(`$user::Profile.displayName::on`)
 * // results in:
 * gun.user().get('Profile').get('displayName').on(...)
 *
 * const pk = '....'
 * rifle(`${pk}::Profile::map.once`)
 * // results in:
 * gun.user(pk).get('Profile').get('displayName').map()once(...)
 *
 * rifle(`$gun::handshakeNodes::on`)
 * // results in:
 * gun.get('handshakeNodes').on(...)
 * ```
 * @param query
 * @param publicKeyForDecryption
 */
export const rifle = (
  query: string,
  publicKeyForDecryption?: string,
): ReturnType<typeof SocketIO> => {
  const {
    auth: { host: nodeURL },
  } = getStore().getState()

  const socket = SocketIO(`http://${nodeURL}/gun`, {
    query: {
      $shock: query,
      publicKeyForDecryption,
    },
  })

  socket.on('NOT_AUTH', () => {
    getStore().dispatch(tokenDidInvalidate())
    socket.off('*')
    socket.close()
  })

  return socket
}
