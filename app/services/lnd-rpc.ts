import { default as SocketIO } from 'socket.io-client'

import Logger from 'react-native-file-log'
import { getStore } from '../store'
import { tokenDidInvalidate } from '../store/actions'

export const rod = (
  service: string,
  method: string,
  args: Record<string, unknown>,
): ReturnType<typeof SocketIO> => {
  const {
    auth: { host: nodeURL },
  } = getStore().getState()

  const socket = SocketIO(`http://${nodeURL}/lndstreaming`, {
    query: {
      service,
      method,
      args: JSON.stringify(args),
    },
  })

  socket.on('NOT_AUTH', () => {
    getStore().dispatch(tokenDidInvalidate())
    socket.off('*')
    socket.close()
  })

  const handleError = (err: unknown): void => {
    Logger.log(
      `Error inside LND RPC, service: ${service}, method: ${method}, args: ${JSON.stringify(
        args,
      )}, will close the socket.`,
    )

    Logger.log(JSON.stringify(err))

    socket.off('*')
    socket.close()
  }

  // 'error' is a reserved event name we can't use it
  socket.on('$error', handleError)

  socket.on('end', () => {
    socket.off('*')
    socket.close()
  })

  return socket
}
