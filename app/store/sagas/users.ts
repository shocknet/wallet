import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import { io as SocketIO } from 'socket.io-client'
import { Constants } from 'shock-common'
import size from 'lodash/size'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { rifle } from '../../services'

import { getStore } from './common'

const sockets: Record<string, ReturnType<typeof SocketIO>> = {}

function* users() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isReady(state)
    const allPublicKeys = Selectors.getAllPublicKeys(state)
    const host = Selectors.selectHost(state)

    if (isReady) {
      assignSocketsToPublicKeysIfNeeded(allPublicKeys, host)
    }

    if (!isReady && size(sockets)) {
      Logger.log(`Will remove user sockets from all subbed public keys`)
      for (const publicKey of allPublicKeys) {
        const normalSocket = sockets['normal' + publicKey]
        const binarySocket = sockets['binary' + publicKey]

        if (normalSocket) {
          normalSocket.off('*')
          normalSocket.close()
          delete sockets['normal' + publicKey]
        }

        if (binarySocket) {
          binarySocket.off('*')
          binarySocket.close()
          delete sockets['binary' + publicKey]
        }
      }
    }
  } catch (err) {
    Logger.log('Error inside users* ()')
    Logger.log(err.message)
  }
}

const assignSocketsToPublicKeysIfNeeded = (
  publicKeys: string[],
  host: string,
) => {
  for (const publicKey of publicKeys) {
    const normalSocketName = 'normal' + publicKey
    const binarySocketName = 'binary' + publicKey

    if (sockets[normalSocketName] && sockets[binarySocketName]) {
      continue
    }

    Logger.log(`Assigning socket to publicKey: ${publicKey}`)

    if (!(!sockets[normalSocketName] && !sockets[binarySocketName])) {
      throw new Error(
        `Assertion: !sockets[normalSocketName] && !sockets[binarySocketName] failed`,
      )
    }

    sockets[normalSocketName] = rifle(host, `${publicKey}::Profile::on`)

    sockets[normalSocketName].on('$shock', (data: any) => {
      try {
        getStore().dispatch(
          Actions.receivedSingleUserData({
            bio: data.bio,
            displayName: data.displayName,
            lastSeenApp: data.lastSeenApp,
            lastSeenNode: data.lastSeenNode,
            pinnedPost: data.pinnedPost,
            publicKey,
          }),
        )
      } catch (err) {
        Logger.log('Error inside users* ()')
        Logger.log(err.message)
      }
    })

    // Will not handle NOT_AUTH event here, enough sockets probably handle that
    // already and this is a multi socket saga will probably make app eat paint.

    sockets[normalSocketName].on('$error', (err: unknown) => {
      if (err === Constants.ErrorCode.NOT_AUTH) {
        getStore().dispatch(Actions.tokenDidInvalidate())
        return
      }
      Logger.log('Error inside users* ()')
      Logger.log(err)
    })

    sockets[binarySocketName] = rifle(
      host,
      `${publicKey}::profileBinary::map.on`,
    )

    sockets[binarySocketName].on('$shock', (data: any, key: string) => {
      try {
        if (key === 'avatar') {
          getStore().dispatch(
            Actions.receivedSingleUserData({
              publicKey,
              avatar: data,
            }),
          )
        } else if (key === 'header') {
          getStore().dispatch(
            Actions.receivedSingleUserData({
              publicKey,
              header: data,
            }),
          )
        } else {
          throw new TypeError(
            `Unknown key: ${key} for other user binary profile data gun RPC socket`,
          )
        }
      } catch (err) {
        Logger.log('Error inside users* ()')
        Logger.log(err.message)
      }
    })

    sockets[binarySocketName].on('$error', (err: unknown) => {
      if (err === Constants.ErrorCode.NOT_AUTH) {
        getStore().dispatch(Actions.tokenDidInvalidate())
        return
      }
      Logger.log('Error inside users* ()')
      Logger.log(err)
    })
  }
}

function* rootSaga() {
  yield takeEvery('*', users)
}

export default rootSaga
