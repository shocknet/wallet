import { io as SocketIO } from 'socket.io-client'

import Logger from 'react-native-file-log'

export const rod = (
  host: string,
  service: string,
  method: string,
  args: Record<string, unknown>,
): ReturnType<typeof SocketIO> => {
  const socket = SocketIO(`http://${host}/lndstreaming`, {
    query: {
      service,
      method,
      args: JSON.stringify(args),
    },
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
