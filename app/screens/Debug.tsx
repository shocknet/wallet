import React from 'react'
import { Clipboard, ScrollView, Button, Text, ToastAndroid } from 'react-native'
import { connect } from 'react-redux'
import uuid from 'uuid/v1'

import * as CSS from '../res/css'
import * as Cache from '../services/cache'
import * as Store from '../store'
import * as Services from '../services'

import QR from './WalletOverview/QR'

export const DEBUG = 'DEBUG'

interface OwnProps {}

interface StateProps {
  chatsAmt: number
  sentReqsAmt: number
  receivedReqsAmt: number
  ownPostsAmt: number
  feedPostsAmt: number
  followsAmt: number

  debugModeEnabled: boolean

  online: boolean

  token: string

  deviceID: string
}

interface DispatchProps {
  disableDebug(): void
}

type Props = OwnProps & StateProps & DispatchProps

class Debug extends React.PureComponent<Props, Record<string, any>> {
  state: Record<string, any> = {}

  mounted = false

  subs = [() => {}]

  componentDidMount() {
    this.mounted = true

    const s = Services.rifle(`$user::currentHandshakeAddress::on`)

    s.on('$shock', (data: string) => {
      this.setState({
        handshakeAddr: data,
      })
    })

    this.subs.push(() => {
      s.off('*')
      s.close()
    })
  }

  componentWillUnmount() {
    this.mounted = false
  }

  copyDeviceID = () => {
    Clipboard.setString(this.props.deviceID)
    ToastAndroid.show('Copied', 800)
  }

  copyToken = () => {
    Clipboard.setString(this.props.token)
    ToastAndroid.show('Copied', 800)
  }

  clearAuthData = () => {
    Cache.writeStoredAuthData(null)
  }

  generateNewHandshakeNode = () => {
    Services.post(`api/gun/put`, {
      body: `$user>currentHandshakeAddress`,
      value: uuid(),
    })
  }

  disableDebugMode = () => {
    this.props.disableDebug()
  }

  render() {
    const {
      chatsAmt,
      deviceID,
      feedPostsAmt,
      followsAmt,
      online,
      ownPostsAmt,
      receivedReqsAmt,
      sentReqsAmt,
      token,
      debugModeEnabled,
    } = this.props

    const { handshakeAddr } = this.state

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={CSS.styles.alignItemsCenter}
      >
        <Button title="Disable " onPress={this.disableDebugMode} />

        <Text>Debug Mode {debugModeEnabled ? 'Enabled' : 'Disabled'}</Text>

        <Text>Canary Socket Status:</Text>
        <Text>{online ? 'Connected' : 'Disconnected'}</Text>

        <Text>Current Handshake Address:</Text>
        <Text>{handshakeAddr}</Text>

        <Text>Current Chats:</Text>
        <Text>{chatsAmt}</Text>

        <Text>Current Sent reqs:</Text>
        <Text>{sentReqsAmt}</Text>

        <Text>Current Received reqs:</Text>
        <Text>{receivedReqsAmt}</Text>

        <Text>Feed posts:</Text>
        <Text>{feedPostsAmt}</Text>

        <Text>Follows:</Text>
        <Text>{followsAmt}</Text>

        <Text>Own Posts:</Text>
        <Text>{ownPostsAmt}</Text>

        <Text>Device ID:</Text>
        <Text>{deviceID}</Text>

        <Text>Token:</Text>
        <Text>{token}</Text>

        <Button title="Clear AUTH Data" onPress={this.clearAuthData} />

        <Button
          title="Copy device id to clipboard"
          onPress={this.copyDeviceID}
        />

        <Button title="Copy token to clipboard" onPress={this.copyToken} />

        <Button
          title="New Handshake Address"
          onPress={this.generateNewHandshakeNode}
        />

        <QR
          size={256}
          logoToShow="shock"
          value={`$$__SHOCKWALLET__USER__${this.state.pk}`}
        />
      </ScrollView>
    )
  }
}

const styles = {
  container: [CSS.styles.flex],
}

const mapStateToProps = (state: Store.State): StateProps => {
  return {
    chatsAmt: Object.keys(state.chat.contacts).length,
    deviceID: state.connection.deviceId,
    feedPostsAmt: Store.getPostsFromFollowed(state).length,
    followsAmt: Store.getFollowedPublicKeys(state).length,
    ownPostsAmt: Store.getOwnPosts(state).length,
    receivedReqsAmt: -1,
    sentReqsAmt: -1,
    token: state.auth.token,
    online: Store.isOnline(state),
    debugModeEnabled: state.debug.enabled,
  }
}

const mapDispatch = {
  disableDebug: Store.disableDebug,
}

export default connect(
  mapStateToProps,
  mapDispatch,
)(Debug)
