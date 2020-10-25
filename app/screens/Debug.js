import React from 'react'
import { Clipboard, View, Button, Text, ToastAndroid } from 'react-native'
import { connect } from 'react-redux'

import * as CSS from '../res/css'
import * as Cache from '../services/cache'
import { Actions, Events } from '../services/contact-api'
import * as Store from '../store'

import QR from './WalletOverview/QR'

export const DEBUG = 'DEBUG'

/**
 * @typedef {object} Props
 * @prop {string} deviceID
 */

/** @augments React.Component<Props, Record<string, any>> */
class Debug extends React.Component {
  state = {
    // TODO
    addr: '',
    chats: [],
    sreqs: [],
    rreqs: [],
    pk: '',
    token: '',
    socketConnected: false,
    lastPing: Date.now() - 10000,
  }

  subs = [() => {}]

  onSocketRes = () => {
    this.mounted &&
      this.setState({
        lastPing: Date.now(),
      })
  }

  setupSub = () => {
    this.subs.push(
      Store.getStore().subscribe(() => {
        this.mounted &&
          this.setState({
            lastPing: Store.getStore().getState().connection.lastPing,
            socketConnected: Store.getStore().getState().connection
              .socketConnected,
          })
      }),
    )
  }

  componentDidMount() {
    this.mounted = true

    this.setupSub()

    this.subs.push(
      Events.onChats(chats => this.setState({ chats })),
      Events.onSentRequests(sreqs => this.setState({ sreqs })),
      Events.onReceivedRequests(rreqs => this.setState({ rreqs })),
    )

    Cache.getToken().then(token => {
      this.mounted &&
        this.setState({
          token,
        })
    })

    Cache.getStoredAuthData().then(ad => {
      ad &&
        this.mounted &&
        this.setState({
          pk: ad.authData.publicKey,
        })
    })
  }

  componentWillUnmount() {
    this.mounted = false
    this.subs.forEach(s => s())
  }

  copyDeviceID = () => {
    Clipboard.setString(this.props.deviceID)
    ToastAndroid.show('Copied', 800)
  }

  copyToken = () => {
    Clipboard.setString(this.state.token)
    ToastAndroid.show('Copied', 800)
  }

  sendSentReqsEvent = () => {
    // eslint-disable-next-line no-console
    console.warn('deprecated')
  }

  connectSocket = () => {
    // eslint-disable-next-line no-console
    console.warn('deprecated')
  }

  clearAuthData = () => {
    Cache.writeStoredAuthData(null)
  }

  render() {
    const { lastPing } = this.state

    const isBetterConnected = Date.now() - lastPing < 5000

    return (
      <View style={[CSS.styles.deadCenter, CSS.styles.flex]}>
        <Text>A random number:</Text>
        <Text>{Math.random().toString()}</Text>

        <Text>Current Socket Status:</Text>
        <Text>{this.state.socketConnected ? 'Connected' : 'Disconnected'}</Text>

        <Text>Better Socket Status:</Text>
        <Text>{isBetterConnected ? 'Connected' : 'Disconnected'}</Text>

        <Text>Current Handshake Address:</Text>
        <Text>{this.state.addr}</Text>

        <Text>Current Chats:</Text>
        <Text>{this.state.chats.length}</Text>

        <Text>Current Sent reqs:</Text>
        <Text>{this.state.sreqs.length}</Text>

        <Text>Current Received reqs:</Text>
        <Text>{this.state.rreqs.length}</Text>

        <Text>Device ID:</Text>
        <Text>{this.props.deviceID}</Text>

        <Text>Token:</Text>
        <Text>{this.state.token}</Text>

        <Button title="Connect Socket" onPress={this.connectSocket} />
        <Button title="Disconnect Socket" onPress={this.connectSocket} />
        <Button title="Clear AUTH Data" onPress={this.clearAuthData} />

        <Button
          title="Copy device id to clipboard"
          onPress={this.copyDeviceID}
        />

        <Button title="Copy token to clipboard" onPress={this.copyToken} />

        <Button
          title="New Handshake Address"
          onPress={Actions.generateNewHandshakeNode}
        />

        <Button
          title="Send Sent Requests Event"
          onPress={this.sendSentReqsEvent}
        />

        <QR
          size={256}
          logoToShow="shock"
          value={`$$__SHOCKWALLET__USER__${this.state.pk}`}
        />
      </View>
    )
  }
}

// @ts-expect-error
const mapStateToProps = ({ connection }) => ({
  deviceID: connection.deviceId,
})

export default connect(mapStateToProps)(Debug)
