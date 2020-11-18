import { io as SocketIO } from 'socket.io-client'

/**
 * Returns a socket wired up to the given query. Use `.on('$shock')` for values.
 * Please do not forget to listen to the NOT_AUTH event and react accordingly.
 * Query example:
 * ```js
 * rifle(`$user::Profile>displayName::on`)
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
  host: string,
  query: string,
  publicKeyForDecryption?: string,
): ReturnType<typeof SocketIO> => {
  const socket = SocketIO(`http://${host}/gun`, {
    query: {
      $shock: query,
      publicKeyForDecryption,
    },
  })

  return socket
}
