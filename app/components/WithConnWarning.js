/**
 * @format
 */
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import * as ContactAPI from '../services/contact-api'

/**
 * @typedef {object} Props
 * @prop {boolean=} disable
 */

/**
 * @typedef {object} State
 * @prop {boolean} connected
 */

export {} // stop JSDoc comments from merging

/**
 * @augments React.PureComponent<Props, State, never>
 */
export default class WithConnWarning extends React.PureComponent {
  /**
   * @type {State}
   */
  state = {
    connected: true,
  }

  /**
   * @private
   * @returns {void}
   */
  connUnsub = () => {}

  componentDidMount = () => {
    this.connUnsub = ContactAPI.Events.onConnection(this.onConn)
  }

  /**
   * @private
   * @param {boolean} connected
   * @returns {void}
   */
  onConn = connected => {
    this.setState({
      connected,
    })
  }

  render() {
    const { children, disable } = this.props
    const { connected } = this.state

    if (!!disable || connected) {
      return children
    }

    return (
      <View style={styles.flex}>
        <View style={styles.flex}>{children}</View>

        <View style={styles.banner}>
          <Text style={styles.text}>Disconnected from server</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'red',
    height: 24,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },

  flex: {
    flex: 1,
  },

  text: {
    color: 'white',
  },
})
