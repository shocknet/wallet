/**
 * @format
 */
import React from 'react'
import { StyleSheet } from 'react-native'
import { Avatar } from 'react-native-elements'
import { connect } from 'react-redux'
import { withNavigation } from 'react-navigation'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

import * as CSS from '../res/css'
import { isOnline, SET_LAST_SEEN_APP_INTERVAL } from '../services/utils'
import * as Reducers from '../../reducers'
import * as Routes from '../routes'
import * as Store from '../../store'

const DEFAULT_USER_IMAGE =
  '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'

/**
 * @typedef {object} Props
 * @prop {number} height
 * @prop {string|null} image
 * @prop {(() => void)=} onPress
 * @prop {number|null} lastSeenApp
 * @prop {boolean=} disableOnlineRing
 * @prop {object=} avatarStyle
 */

/**
 * @deprecated
 * @augments React.PureComponent<Props>
 */
export default class ShockAvatar extends React.PureComponent {
  /** @type {number|null} */
  intervalID = 0

  componentDidMount() {
    this.intervalID = setInterval(() => {
      this.forceUpdate()
    }, SET_LAST_SEEN_APP_INTERVAL)
  }

  componentWillUnmount() {
    if (this.intervalID !== null) {
      clearInterval(this.intervalID)
      this.intervalID = null
    }
  }

  render() {
    const {
      height,
      image,
      lastSeenApp,
      onPress,
      disableOnlineRing,
      avatarStyle,
    } = this.props

    let avatarStyleToApply = avatarStyle
    if (!avatarStyle) {
      if (lastSeenApp && isOnline(lastSeenApp) && !disableOnlineRing) {
        avatarStyleToApply = styles.avatar
      } else {
        avatarStyleToApply = CSS.styles.empty
      }
    }
    return (
      <Avatar
        height={height}
        rounded
        source={
          image === null || image.length === 0
            ? {
                uri: 'data:image/jpeg;base64,' + DEFAULT_USER_IMAGE,
              }
            : {
                uri: 'data:image/jpeg;base64,' + image,
              }
        }
        onPress={onPress}
        avatarStyle={avatarStyleToApply}
      />
    )
  }
}

const styles = StyleSheet.create({
  avatar: {
    borderColor: CSS.Colors.SUCCESS_GREEN,
    borderWidth: 2,
  },
})

/**
 * @typedef {object} ConnectedProps
 * @prop {number} height
 * @prop {string} publicKey
 * @prop {(() => void)=} onPress
 * @prop {boolean=} disableOnlineRing
 */

const makeMapStateToProps = () => {
  const getUser = Store.makeGetUser()

  /**
   * @param {Reducers.State} state
   * @param {ConnectedProps & { navigation: Navigation }} ownProps
   * @returns {Props}
   */
  const f = (state, ownProps) => {
    const { publicKey } = ownProps
    const user = getUser(state, publicKey)

    return {
      ...ownProps,
      image: user.avatar,
      lastSeenApp: user.lastSeenApp,
      onPress: () => {
        if (ownProps.onPress) {
          return ownProps.onPress()
        }
        /** @type {Routes.UserParams} */
        const params = { publicKey }
        ownProps.navigation.navigate(Routes.USER, params)
      },
    }
  }

  return f
}

/**
 * @type {React.FC<ConnectedProps>}
 */
// @ts-ignore TODO
const _ConnectedShockAvatar = connect(makeMapStateToProps)(ShockAvatar)

export const ConnectedShockAvatar = withNavigation(_ConnectedShockAvatar)
