import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import { Schema } from 'shock-common'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { getStore } from '../store'

let socket: ReturnType<typeof SocketIO> | null = null

function* chats() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isOnline(state) && Selectors.isAuth(state)
    const {
      auth: { host },
    } = state

    if (isReady && !socket) {
      socket = SocketIO(`http://${host}/chats`, {
        query: {
          token: state.auth.token,
        },
      })

      socket.on('$shock', (chats: Schema.Chat[]) => {
        const store = getStore()

        const contacts = chats.map(chat => ({
          pk: chat.recipientPublicKey,
          avatar: chat.recipientAvatar,
          displayName: chat.recipientDisplayName,
        }))

        store.dispatch({
          // @ts-expect-error
          type: Actions.ChatActions.ACTIONS.LOAD_CONTACTS,
          // @ts-expect-error
          data: contacts,
        })

        const messages = chats.reduce(
          (messages, chat) => ({
            ...messages,
            [chat.recipientPublicKey]: chat.messages,
          }),
          {},
        )

        store.dispatch({
          type: 'messages/load',
          data: messages,
        })

        const receivedChatsAction = {
          type: 'chats/receivedChats',
          data: {
            chats,
          },
        } as const

        store.dispatch(receivedChatsAction)
      })

      socket.on('$error', (e: string) => {
        Logger.log('Error inside chats* ()')
        Logger.log(e)
        socket!.off('*')
        socket!.close()
        socket = null
      })
    }

    if (!isReady && socket) {
      socket.off('*')
      socket.close()
      socket = null
    }
  } catch (e) {
    Logger.log('Error inside chats* ()')
    Logger.log(e.message)
    if (socket) {
      socket.off('*')
      socket.close()
      socket = null
    }
  }
}

function* rootSaga() {
  yield takeEvery('*', chats)
}

export default rootSaga
