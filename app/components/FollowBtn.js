import React from 'react'
import { Button } from 'react-native-elements'
import { connect } from 'react-redux'
import * as Common from 'shock-common'
import * as Store from '../../store'
import * as Actions from '../actions'
import * as Thunks from '../thunks'

/**
 * @typedef {object} StateProps
 * @prop {Common.Schema.Follow | null} follow
 */

/**
 * @typedef {object} DispatchProps
 * @prop {() => void} onPressFollow
 * @prop {() => void} onPressUnfollow
 */

/**
 * @typedef {object} OwnProps
 * @prop {string} publicKey
 */

/**
 * @type {React.FC<StateProps & DispatchProps & OwnProps>}
 */
export const FollowBtn = ({ follow, onPressFollow, onPressUnfollow }) => {
  /**
   * @type {Common.Schema.Follow['status'] | 'unfollowed'}
   */
  const state = follow ? follow.status : 'unfollowed'

  const title = (() => {
    switch (state) {
      case 'ok':
        return 'unfollow'
      case 'processing':
        return '...'
      case 'unfollowed':
        return 'follow'
    }
  })()

  return ((
    <Button
      // eslint-disable-next-line react/jsx-no-bind
      onPress={() => {
        switch (state) {
          case 'ok':
            onPressUnfollow()
            break
          case 'unfollowed':
            onPressFollow()
            break
        }
      }}
      title={title}
      disabled={state === 'processing'}
    />
  ))
}

/**
 * @param {Store.State} state
 * @param {OwnProps} ownProps
 * @returns {StateProps}
 */
const mapState = (state, ownProps) => ({
  follow: Store.Selectors.Follows.getFollow(state, ownProps.publicKey),
})

//@type {import('react-redux').MapDispatchToProps<DispatchProps, OwnProps>}
/**
 * @param {import('redux').Dispatch<Actions.Action>} dispatch
 * @param {OwnProps} ownProps
 * @returns {DispatchProps}
 */
const mapDispatch = (dispatch, ownProps) => ({
  onPressFollow: () => {
    // @ts-expect-error
    dispatch(Thunks.Follows.follow(ownProps.publicKey))
  },
  onPressUnfollow: () => {
    // @ts-expect-error
    dispatch(Thunks.Follows.unfollow(ownProps.publicKey))
  },
})

export default connect(
  mapState,
  mapDispatch,
)(FollowBtn)
