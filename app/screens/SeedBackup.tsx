import React from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Clipboard,
  ToastAndroid,
} from 'react-native'
import Http from 'axios'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { nodeInfo } from '../services/wallet'
import * as CSS from '../res/css'
import Pad from '../components/Pad'
import { getStore } from '../store'
import Nav from '../components/Nav'
type NodeInfo = import('../services/wallet').NodeInfo

export const SEED_BACKUP = 'SEED_BACKUP'
type State = {
  nodeInfo:NodeInfo|null
  seedBackup:string|null
  chansBackup:string|null
}
type Props ={
  navigation: import('react-navigation').NavigationScreenProp<{}, {}>
}
export default class SeedBackup extends React.PureComponent<Props,State> {
  state:State = {
    nodeInfo: null,
    seedBackup: null,
    chansBackup: null,
  }

  copyPubToClipboard = () => {
    const { chansBackup } = this.state
    if (chansBackup === '') {
      return
    }
    if (typeof chansBackup === 'string') {
      Clipboard.setString(chansBackup)
      ToastAndroid.show('Copied to clipboard!', 800)
    }
  }

  toHexString = (byteArray:number[]) => {
    return Array.from(byteArray, byte => {
      // eslint-disable-next-line
      return ('0' + (byte & 0xff).toString(16)).slice(-2)
    }).join('')
  }
  mounted:boolean = false //??
  componentDidMount() {
    this.mounted = true

    const { gunPublicKey } = getStore().getState().auth
    Http.get(`/api/gun/user/once/seedBackup`, {
      headers: {
        'public-key-for-decryption': gunPublicKey,
      },
    }).then(({ data: { data: seedBackup } }) => {
      this.mounted &&
        this.setState({
          seedBackup,
        })
    })

    nodeInfo().then(nodeInfo => {
      this.mounted && this.setState({ nodeInfo })
    })
  }

  componentWillUnmount() {
    this.mounted = false
  }

  render() {
    const { seedBackup, nodeInfo, chansBackup } = this.state
    if (!nodeInfo) {
      return (
        <>
        <Nav style={styles.nav} backButton title="Wallet Settings" navigation={this.props.navigation} />
        <View style={xStyles.container}>
          <ActivityIndicator size="large" color={CSS.Colors.BLUE_MEDIUM_DARK} />
        </View>
        </>
      )
    }

    return (
      <>
      <Nav style={styles.nav} backButton title="Wallet Settings" navigation={this.props.navigation} />
      <View style={xStyles.container}>
        
        <Text style={xStyles.title}>Lightning Pubkey</Text>
        <Text style={xStyles.text}>{nodeInfo.identity_pubkey}</Text>
        <Pad amount={48} />
        <Text style={xStyles.title}>Seed Phrase</Text>
        {seedBackup && (
          <Text style={xStyles.text}>{seedBackup}</Text>
        )}
        {!seedBackup && (
          <Text style={xStyles.text}>
            Seed backup not available on this node
          </Text>
        )}
        <Pad amount={48} />
        <Text style={xStyles.title}>Channels Backup</Text>
        {chansBackup && (
          <Ionicons
            name="ios-copy"
            color={CSS.Colors.TEXT_WHITE}
            size={24}
            onPress={this.copyPubToClipboard}
          />
        )}
        <Text style={xStyles.text}>
          Channels backup not available on this node
        </Text>
      </View>
      </>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 24,
    paddingRight: 24,
    backgroundColor: '#16191C',
    
  },
  nav:{
    backgroundColor: '#16191C',
  }
})

const xStyles = {
  container: [CSS.styles.flex, CSS.styles.deadCenter, styles.container],

  title: [CSS.styles.fontSize24, CSS.styles.fontMontserrat,{color:'white'}],

  text: [
    CSS.styles.fontMontserrat,
    CSS.styles.fontSize18,
    CSS.styles.textAlignCenter,
    {color:'white'}
  ],
}
