import React from 'react'
import { Clipboard, View, Button, Text, ToastAndroid } from 'react-native'
import { connect } from 'react-redux'

import * as CSS from '../res/css'
import * as Cache from '../services/cache'
import { Actions, Events, Socket } from '../services/contact-api'
import QR from './WalletOverview/QR'

export const DEBUG = 'DEBUG'

/**
 * @typedef {object} Props
 * @prop {string} deviceID
 */

/** @augments React.Component<Props, Record<string, any>> */
class Debug extends React.Component {
  state = {
    addr: '',
    chats: [],
    sreqs: [],
    rreqs: [],
    pk: '',
    token: '',
  }

  subs = [() => {}]

  componentDidMount() {
    this.subs.push(
      Events.onHandshakeAddr(addr => this.setState({ addr })),
      Events.onChats(chats => this.setState({ chats })),
      Events.onSentRequests(sreqs => this.setState({ sreqs })),
      Events.onReceivedRequests(rreqs => this.setState({ rreqs })),
    )

    Cache.getToken().then(token => {
      this.setState({
        token,
      })
    })

    Cache.getStoredAuthData().then(ad => {
      ad &&
        this.setState({
          pk: ad.authData.publicKey,
        })
    })
  }

  componentWillUnmount() {
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

  sendSentReqsEvent = async () => {
    Socket.socket.emit('ON_SENT_REQUESTS', {
      token: await Cache.getToken(),
    })
  }

  render() {
    return (
      <View style={[CSS.styles.deadCenter, CSS.styles.flex]}>
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

// @ts-ignore
const mapStateToProps = ({ connection }) => ({
  deviceID: connection.deviceId,
})

export default connect(mapStateToProps)(Debug)
