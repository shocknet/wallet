/**
 * @prettier
 */
import React from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ImageBackground,
} from 'react-native'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from '../css'
/** @type {number} */
// @ts-ignore
const shockBG = require('../assets/images/shock-bg.png')

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

/**
 * @param {string} ip
 */
const isValidIP = ip => {
  const sections = ip.split('.')

  if (sections.length !== 4) return false

  return sections.every(
    s => Number.isInteger(Number(s)) && s.length <= 3 && s.length > 0,
  )
}

/** @type {number} */
// @ts-ignore
const shockLogo = require('../assets/images/shocklogo.png')

/**
 * @typedef {object} Props
 * @prop {boolean} disableControls
 * @prop {(ip: string) => void} onPressConnect
 * @prop {() => void} onPressUseShockcloud
 * @prop {() => void} toggleQRScreen
 */

/**
 * @typedef {object} State
 * @prop {string} nodeIP
 */

/**
 * @augments React.PureComponent<Props, State, never>
 */
export default class ConnectToNode extends React.PureComponent {
  /** @type {State} */
  state = {
    nodeIP: '',
  }

  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  /**
   * @private
   * @param {string} nodeIP
   */
  onChangeNodeIP = nodeIP => {
    this.setState({
      nodeIP,
    })
  }

  /** @private */
  onPressConnect = () => {
    this.props.onPressConnect(this.state.nodeIP)
  }

  render() {
    const { nodeIP } = this.state

    return (
      <ImageBackground
        resizeMode="cover"
        resizeMethod="scale"
        source={shockBG}
        style={styles.container}
      >
        <View style={styles.shockWalletLogoContainer}>
          <Image style={styles.shockLogo} source={shockLogo} />
          <Text style={styles.logoText}>SHOCKWALLET</Text>
        </View>

        {/* <View style={styles.shockWalletCallToActionContainer}>
        </View> */}

        <View>
          <Text style={styles.callToAction}>WELCOME</Text>
          <View style={styles.textInputFieldContainer}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!this.props.disableControls}
              keyboardType="numeric"
              onChangeText={this.onChangeNodeIP}
              placeholder="Specify Node IP"
              placeholderTextColor="grey"
              style={styles.textInputField}
              value={nodeIP}
            />
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={this.props.toggleQRScreen}
            >
              <Ionicons
                name="ios-barcode"
                style={styles.positionAbsolute}
                size={10}
                color="#eee"
              />
              <Ionicons
                name="md-qr-scanner"
                style={styles.positionAbsolute}
                size={20}
                color="#eee"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            disabled={!isValidIP(nodeIP) || this.props.disableControls}
            onPress={this.onPressConnect}
            style={styles.connectBtn}
          >
            <Text style={styles.connectBtnText}>Connect</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!isValidIP(nodeIP) || this.props.disableControls}
            onPress={this.onPressConnect}
          >
            <View style={styles.shockBtn}>
              <EntypoIcon name="cloud" size={20} color="#274f94" />
              <Text style={styles.shockBtnText}>Use ShockCloud</Text>
            </View>
          </TouchableOpacity>

          {/* <ShockButton
            disabled={!isValidIP(nodeIP) || this.props.disableControls}
            onPress={this.onPressConnect}
            title="Connect"
          /> */}

          {/* <ShockButton
            disabled={this.props.disableControls}
            color="grey"
            onPress={this.props.onPressUseShockcloud}
            title="Use Shock Cloud"
          /> */}
        </View>
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  positionAbsolute: {
    position: 'absolute',
  },
  container: {
    flex: 1,
    backgroundColor: CSS.Colors.BLUE_DARK,
    justifyContent: 'space-around',
    paddingLeft: 30,
    paddingRight: 30,
  },
  shockLogo: {
    width: 70,
    height: 70,
    marginBottom: 17,
  },
  shockWalletLogoContainer: {
    alignItems: 'center',
  },
  textInputFieldContainer: {
    flexDirection: 'row',
    backgroundColor: CSS.Colors.TEXT_WHITE,
    height: 60,
    borderRadius: 100,
    paddingLeft: 25,
    marginBottom: 25,
    elevation: 3,
    alignItems: 'center',
  },
  textInputField: {
    fontSize: 14,
    fontFamily: 'Montserrat-600',
    flex: 1,
  },
  scanBtn: {
    width: 35,
    height: 35,
    flexShrink: 0,
    backgroundColor: CSS.Colors.GRAY_MEDIUM,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    fontSize: 18,
    letterSpacing: 2.5,
  },
  callToAction: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-900',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 30,
  },
  connectBtn: {
    height: 60,
    backgroundColor: CSS.Colors.ORANGE,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  connectBtnText: {
    fontSize: 15,
    letterSpacing: 1.25,
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
  },
  shockBtn: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: CSS.Colors.TEXT_WHITE,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    opacity: 0.7,
  },
  shockBtnText: {
    fontSize: 15,
    letterSpacing: 1,
    color: CSS.Colors.BLUE_DARK,
    fontFamily: 'Montserrat-700',
    marginLeft: 10,
  },
})
