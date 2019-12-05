import React from 'react'
import { NetInfo } from 'react-native'

import { Events } from '../services/contact-api'

export const ConnectionContext = React.createContext(false)
ConnectionContext.displayName = 'ConnectionContext'

/**
 * @typedef {object} State
 * @prop {boolean} internet
 * @prop {boolean} socketConnected
 */

/**
 * @augments React.PureComponent<{}, State>
 */
export class ConnectionProvider extends React.PureComponent {
  /** @type {State} */
  state = {
    internet: false,
    socketConnected: false,
  }

  socketConnUnsub = () => {}

  componentDidMount() {
    this.socketConnUnsub = Events.onConnection(socketConnected => {
      this.setState({
        socketConnected,
      })
    })

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectivityChange,
    )
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this.handleConnectivityChange,
    )
  }

  /**
   * @param {boolean} internet
   */
  handleConnectivityChange = internet => {
    this.setState({
      internet,
    })
  }

  render() {
    const isConnected = this.state.internet && this.state.socketConnected

    return (
      <ConnectionContext.Provider value={isConnected}>
        {this.props.children}
      </ConnectionContext.Provider>
    )
  }
}
