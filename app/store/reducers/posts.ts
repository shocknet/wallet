import produce from 'immer'
import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../actions'

type State = Record<string, Schema.PostN>

const reducer: Reducer<State, Action> = (state = {}, action) =>
  produce(state, draft => {
    if (action.type === 'posts/received') {
      const { posts } = action.payload

      posts.forEach(post => {
        // Posts can't get edited for now, let's not update unnecessarily
        // They can be deleted however but should be handled via posts/removed
        if (draft[post.id]) {
          return
        }

        draft[post.id] = {
          ...post,
          author:
            typeof post.author === 'string'
              ? post.author
              : post.author.publicKey,
        }
      })
    }

    if (action.type === 'posts/receivedRaw') {
      const {
        authorPublicKey,
        id,
        post: { contentItems, date, status, tags, title },
      } = action.payload

      // Posts can't get edited for now, let's not update unnecessarily
      if (!!draft[id]) {
        return
      }

      draft[id] = {
        author: authorPublicKey,
        contentItems,
        date,
        id,
        status,
        tags,
        title,
      }
    }

    if (action.type === 'posts/receivedSeveralRaw') {
      const { authorPublicKey, ids, posts } = action.payload

      for (let i = 0; i < ids.length; i++) {
        const { contentItems, date, status, tags, title } = posts[i]
        const id = ids[i]

        if (draft[id]) {
          continue
        }

        draft[id] = {
          author: authorPublicKey,
          contentItems,
          date,
          id,
          status,
          tags,
          title,
        }
      }
    }

    if (action.type === 'posts/removed') {
      const { postID } = action.payload

      delete draft[postID]
    }
  })

export default reducer
