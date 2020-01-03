/**
 * @format
 */
import React from 'react'
import {
  View,
  Text,
  Clipboard,
  ToastAndroid,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from '../../res/css'
import ShockModal from '../../components/ShockModal'
import Pad from '../../components/Pad'

/**
 * @typedef {object} Props
 * @prop {import('../../services/wallet').NodeInfo|null} info
 * @prop {() => void} onRequestClose
 * @prop {boolean} visible
 */

/**
 * @augments React.PureComponent<Props>
 */
export default class InfoModal extends React.PureComponent {
  copyPubToClipboard = () => {
    const { info } = this.props
    if (info === null) {
      return
    }

    Clipboard.setString(info.identity_pubkey)
    ToastAndroid.show('Copied to clipboard!', 800)
  }

  render() {
    const { info } = this.props

    if (info === null) {
      return null
    }

    return (
      <ShockModal
        visible={this.props.visible}
        onRequestClose={this.props.onRequestClose}
      >
        <ScrollView onStartShouldSetResponder={alwaysTrue}>
          <Text style={styles.title}>Node Info</Text>

          <Pad amount={50} />

          <View style={styles.subtitleAndIconHolder}>
            <Text style={styles.subtitle}>Synced to Chain</Text>
            {info.synced_to_chain ? (
              <Entypo name="check" color={CSS.Colors.BLUE_LIGHT} size={24} />
            ) : (
              <MaterialCommunityIcons
                name="clock"
                color={CSS.Colors.BLUE_LIGHT}
                size={24}
              />
            )}
          </View>

          <Pad amount={45} />

          <View style={styles.subtitleAndIconHolder}>
            <Text style={styles.subtitle}>Synced to Graph</Text>
            {info.synced_to_graph ? (
              <Entypo name="check" color={CSS.Colors.BLUE_LIGHT} size={24} />
            ) : (
              <MaterialCommunityIcons
                name="clock"
                color={CSS.Colors.BLUE_LIGHT}
                size={24}
              />
            )}
          </View>

          <Pad amount={45} />

          <View style={styles.subtitleAndIconHolder}>
            <Text style={styles.subtitle}>Lightning PubKey:</Text>
            <Ionicons
              name="ios-copy"
              color={CSS.Colors.BLUE_LIGHT}
              size={24}
              onPress={this.copyPubToClipboard}
            />
          </View>

          <Text
            numberOfLines={1}
            style={[styles.data, styles.pubKey]}
            ellipsizeMode="tail"
          >
            {info.identity_pubkey}
          </Text>

          <Pad amount={45} />

          <View style={styles.subtitleAndIconHolder}>
            <Text style={styles.subtitle}>Uris</Text>
            <Ionicons name="ios-copy" color={CSS.Colors.BLUE_LIGHT} size={24} />
          </View>

          <Text style={styles.data}>
            {`Number of Uris: ${info.uris.length.toString()}`}
          </Text>

          <Pad amount={45} />

          <View style={styles.subtitleAndIconHolder}>
            <Text style={styles.subtitle}>Pending Channels:</Text>
          </View>

          <Text style={styles.data}>
            {info.num_pending_channels.toString()}
          </Text>

          <Pad amount={45} />

          <View style={styles.subtitleAndIconHolder}>
            <Text style={styles.subtitle}>Block Height:</Text>
          </View>

          <Text style={styles.data}>{info.block_height.toString()}</Text>

          <Pad amount={45} />

          <View style={styles.subtitleAndIconHolder}>
            <Text style={styles.subtitle}>Block Height:</Text>
          </View>

          <Text style={styles.data}>{info.block_height.toString()}</Text>

          <Pad amount={45} />

          <View style={styles.subtitleAndIconHolder}>
            <Text style={styles.subtitle}>Best Header Timestamp:</Text>
          </View>

          <Text style={styles.data}>{info.best_header_timestamp}</Text>

          <Pad amount={45} />

          <View style={styles.subtitleAndIconHolder}>
            <Text style={styles.subtitle}>LND Version</Text>
          </View>

          <Text style={styles.data}>{info.version}</Text>

          <Pad amount={45} />

          <TouchableOpacity disabled style={styles.btn}>
            <Text style={styles.btnText}>Download Backup</Text>
          </TouchableOpacity>

          <Pad amount={18} />

          <Text style={styles.footer}>
            <Text style={styles.warning}>Warning: </Text> Consult documentation
            before use.
          </Text>
        </ScrollView>
      </ShockModal>
    )
  }
}

const styles = StyleSheet.create({
  btnText: {
    fontSize: 15,
    letterSpacing: 1.25,
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
  },

  btn: {
    height: 60,
    backgroundColor: CSS.Colors.BUTTON_BLUE,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  data: {
    color: CSS.Colors.TEXT_GRAY_LIGHT,
    fontSize: 14,
    fontFamily: 'Montserrat-200',
  },

  footer: {
    alignSelf: 'center',
    textAlign: 'center',
  },

  pubKey: {
    maxWidth: '50%',
  },

  subtitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-400',
  },

  subtitleAndIconHolder: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 24,
    fontFamily: 'Montserrat-700',
    textAlign: 'center',
  },

  warning: {
    color: CSS.Colors.BUTTON_BLUE,
  },
})

const alwaysTrue = () => true
