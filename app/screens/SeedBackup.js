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
import { getStore } from '../../store'
/**
 * @typedef {import('../services/wallet').NodeInfo} NodeInfo
 */

export const SEED_BACKUP = 'SEED_BACKUP'

/**
 * @typedef {object} State
 *  @prop {NodeInfo|null} nodeInfo
 * @prop {string|null} seedBackup
 * @prop {string|null} chansBackup
 */

/**
 * @augments React.PureComponent<{}, State>
 */
export default class SeedBackup extends React.PureComponent {
  /** @type {State} */
  state = {
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

  /**@param {number[]} byteArray */
  toHexString = byteArray => {
    return Array.from(byteArray, byte => {
      // eslint-disable-next-line
      return ('0' + (byte & 0xff).toString(16)).slice(-2)
    }).join('')
  }

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
        <View style={xStyles.container}>
          <ActivityIndicator size="large" color={CSS.Colors.BLUE_MEDIUM_DARK} />
        </View>
      )
    }

    return (
      <View style={xStyles.container}>
        <Text style={xStyles.title}>Lightning Pubkey</Text>
        <Text style={xStyles.text}>{nodeInfo.identity_pubkey}</Text>
        <Pad amount={48} />
        <Text style={xStyles.title}>Seed Phrase</Text>
        {seedBackup && (
          <Text style={CSS.styles.fontMontserrat}>{seedBackup}</Text>
        )}
        {!seedBackup && (
          <Text style={CSS.styles.fontMontserrat}>
            Seed backup not available on this node
          </Text>
        )}
        <Pad amount={48} />
        <Text style={xStyles.title}>Channels Backup</Text>
        {chansBackup && (
          <Ionicons
            name="ios-copy"
            color={CSS.Colors.BACKGROUND_BLACK}
            size={24}
            onPress={this.copyPubToClipboard}
          />
        )}
        <Text style={CSS.styles.fontMontserrat}>
          Channels backup not available on this node
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 24,
    paddingRight: 24,
  },
})

const xStyles = {
  container: [CSS.styles.flex, CSS.styles.deadCenter, styles.container],

  title: [CSS.styles.fontSize24, CSS.styles.fontMontserrat],

  text: [
    CSS.styles.fontMontserrat,
    CSS.styles.fontSize18,
    CSS.styles.textAlignCenter,
  ],
}
