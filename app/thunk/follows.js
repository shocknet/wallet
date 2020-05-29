// @ts-nocheck
import * as API from '../services/contact-api'

const followThunk = recipientPublicKey => (dispatch, getState) => {
  return API.Actions.follow(recipientPublicKey).then(follow => {
    dispatch({
      type: 'follow/follow',
      data: {
        follow,
      },
    })
  })
}
export { followThunk }
