import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'

import { onSeedBackup, currentSeedBackup } from '../services/contact-api/events'
import { nodeInfo } from '../services/wallet'
import * as CSS from '../res/css'
import Pad from '../components/Pad'
/**
 * @typedef {import('../services/wallet').NodeInfo} NodeInfo
 */

export const SEED_BACKUP = 'SEED_BACKUP'

/**
 * @typedef {object} State
 *  @prop {NodeInfo|null} nodeInfo
 * @prop {string|null} seedBackup
 */

/**
 * @augments React.PureComponent<{}, State>
 */
export default class SeedBackup extends React.PureComponent {
  /** @type {State} */
  state = {
    nodeInfo: null,
    seedBackup: currentSeedBackup,
  }

  componentDidMount() {
    this.mounted = true
    nodeInfo().then(nodeInfo => {
      this.mounted && this.setState({ nodeInfo })
    })
    this.unsub = onSeedBackup(
      seedBackup => this.mounted && this.setState({ seedBackup }),
    )
  }

  componentWillUnmount() {
    this.mounted = false
    this.unsub && this.unsub()
  }

  render() {
    const { seedBackup, nodeInfo } = this.state
    if (!seedBackup || !nodeInfo) {
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
        <Text style={CSS.styles.fontMontserrat}>{seedBackup}</Text>
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
