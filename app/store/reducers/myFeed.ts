import produce from 'immer'
//import { ToastAndroid } from 'react-native'
import * as Common from 'shock-common'
import { Action } from '../actions'
export type State = {
  posts: Common.Schema.Post[]
  lastPageFetched: number
}

const INITIAL_STATE: State = {
  posts: [],
  lastPageFetched: 0,
}

const reducer = (state: State = INITIAL_STATE, action: Action) => {
  switch (action.type) {
    case 'myFeed/beganFetchPage': {
      return state
    }
    case 'myFeed/finishedFetchPage': {
      const { data } = action
      return produce(state, draft => {
        ;(draft.lastPageFetched = data.page), (draft.posts = data.posts)
      })
    }
    case 'myFeed/errorFetchPage': {
      //const {data} = action
      //ToastAndroid.show(data.error,800)
      return state
    }
    default: {
      return state
    }
  }
}

export default reducer
