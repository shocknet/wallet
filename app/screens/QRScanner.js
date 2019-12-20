/**
 * @prettier
 */
import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCodeScanner from 'react-native-qrcode-scanner'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from '../res/css'

/**
 * @typedef {object} Props
 * @prop {(ip: string, port: number) => void} connectToNodeIP
 * @prop {() => void} toggleQRScreen
 */

/**
 * @augments React.PureComponent<Props>
 */
export default class QRScanner extends React.PureComponent {
  static navigationOptions = {
    header: null,
  }

  /**
   * @param {{ data: string }} e
   */
  onQRRead = e => {
    const { connectToNodeIP } = this.props
    console.log('Scanning...', e)
    const parsedData = JSON.parse(e.data)
    console.log('parsedData', parsedData, e)
    try {
      connectToNodeIP(parsedData.internalIP, parsedData.walletPort)
    } catch (err) {
      connectToNodeIP(parsedData.externalIP, parsedData.walletPort)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <LinearGradient
            start={GRADIENT_ZERO_ZERO}
            end={GRADIENT_ZERO_POINT_NINE}
            colors={GRADIENT_COLORS}
            style={styles.topSection}
          />
          <LinearGradient
            start={GRADIENT_ZERO_ZERO}
            end={GRADIENT_ZERO_POINT_NINE}
            colors={GRADIENT_COLORS}
            style={styles.topSection}
          />
          <TouchableOpacity
            onPress={this.props.toggleQRScreen}
            style={[styles.topSection, styles.topSectionTextContainer]}
          >
            <Ionicons
              name="md-close"
              color="white"
              size={30}
              style={styles.topSectionBtn}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.targetSquare} />

        <QRCodeScanner
          onRead={this.onQRRead}
          cameraProps={CAMERA_PROPS}
          cameraStyle={styles.cameraStyle}
        />

        <View style={styles.explanation}>
          <LinearGradient
            start={GRADIENT_ZERO_POINT_NINE}
            end={GRADIENT_ZERO_ZERO}
            colors={GRADIENT_COLORS}
            style={styles.bottomSection}
          />
          <LinearGradient
            start={GRADIENT_ZERO_POINT_NINE}
            end={GRADIENT_ZERO_ZERO}
            colors={GRADIENT_COLORS}
            style={styles.bottomSection}
          />
          <View
            style={[styles.bottomSection, styles.bottomSectionTextContainer]}
          >
            <Text style={styles.bottomSectionTextHead}>SCAN A NODE IP</Text>
            <Text style={styles.bottomSectionTextDescription}>
              Point your camera at a ShockWizard QR Code to scan it.
            </Text>
            <TouchableOpacity
              onPress={this.props.toggleQRScreen}
              style={styles.bottomSectionCancelBtn}
            >
              <Text style={styles.bottomSectionCancelBtnText}>Cancel Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

const GRADIENT_ZERO_ZERO = { x: 0, y: 0 }
const GRADIENT_ZERO_POINT_NINE = { x: 0, y: 0.9 }
const GRADIENT_COLORS = ['black', 'transparent']

const CAMERA_PROPS = { ratio: '16:9' }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CSS.Colors.BACKGROUND_BLACK,
  },
  cameraStyle: {
    opacity: 0.8,
  },
  explanation: {
    position: 'relative',
    width: '100%',
  },
  toolbar: {
    position: 'relative',
    width: '100%',
    flexShrink: 0,
  },
  targetSquare: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 180,
    height: 200,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: CSS.Colors.ORANGE,
    borderRadius: 5,
    transform: [{ translateX: -90 }, { translateY: -100 }],
    zIndex: 100,
  },
  topSection: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 200,
    zIndex: 1000,
  },
  topSectionBtn: {},
  topSectionTextContainer: {
    alignItems: 'flex-end',
    paddingTop: 30,
    paddingRight: 15,
    opacity: 0.7,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 200,
    zIndex: 1000,
  },
  bottomSectionTextContainer: {
    alignItems: 'center',
    paddingTop: 15,
  },
  bottomSectionTextHead: {
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_WHITE,
    fontSize: 20,
  },
  bottomSectionTextDescription: {
    width: '75%',
    marginTop: 10,
    fontFamily: 'Montserrat-600',
    color: CSS.Colors.TEXT_WHITE,
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  bottomSectionCancelBtn: {
    paddingHorizontal: 50,
    paddingVertical: 15,
    backgroundColor: CSS.Colors.TEXT_WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    marginTop: 20,
  },
  bottomSectionCancelBtnText: {
    color: CSS.Colors.BLUE_DARK,
    fontFamily: 'Montserrat-700',
  },
})
