/**
 * @prettier
 */
import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCodeScanner from 'react-native-qrcode-scanner'
import Ionicons from 'react-native-vector-icons/Ionicons'

/**
 * @typedef {object} Props
 * @prop {(ip: string, port: number) => void} connectToNodeIP
 * @prop {() => void} toggleQRScreen
 */

/**
 * @augments React.PureComponent<Props, { nodeIP: string}>
 */
export default class QRScanner extends React.PureComponent {
  static navigationOptions = {
    header: null,
  }

  state = {
    nodeIP: '',
  }

  /**
   * @param {string} nodeIP
   */
  onChangeNodeIP = nodeIP => {
    this.setState({
      nodeIP,
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ position: 'relative', width: '100%', flexShrink: 0 }}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.9 }}
            colors={['black', 'transparent']}
            style={styles.topSection}
          />
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.9 }}
            colors={['black', 'transparent']}
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
          onRead={e => {
            const { connectToNodeIP } = this.props
            console.log('Scanning...', e)
            const parsedData = JSON.parse(e.data)
            console.log('parsedData', parsedData, e)
            try {
              connectToNodeIP(parsedData.internalIP, parsedData.walletPort)
            } catch (err) {
              connectToNodeIP(parsedData.externalIP, parsedData.walletPort)
            }
          }}
          cameraProps={{ ratio: '16:9' }}
          cameraStyle={{ opacity: 0.8 }}
        />
        <View style={{ position: 'relative', width: '100%' }}>
          <LinearGradient
            start={{ x: 0, y: 0.9 }}
            end={{ x: 0, y: 0 }}
            colors={['black', 'transparent']}
            style={styles.bottomSection}
          />
          <LinearGradient
            start={{ x: 0, y: 0.9 }}
            end={{ x: 0, y: 0 }}
            colors={['black', 'transparent']}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  shockLogo: {
    width: 70,
    height: 70,
    marginBottom: 17,
  },
  targetSquare: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 180,
    height: 200,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#f5a623',
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
    color: 'white',
    fontSize: 20,
  },
  bottomSectionTextDescription: {
    width: '75%',
    marginTop: 10,
    fontFamily: 'Montserrat-600',
    color: 'white',
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  bottomSectionCancelBtn: {
    paddingHorizontal: 50,
    paddingVertical: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    marginTop: 20,
  },
  bottomSectionCancelBtnText: {
    color: '#274f94',
    fontFamily: 'Montserrat-700',
  },
  shockWalletLogoContainer: {
    alignItems: 'center',
  },
  shockWalletCallToActionContainer: {
    alignItems: 'center',
  },
  textInputFieldContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
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
    backgroundColor: '#505050',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#ffffff',
    fontFamily: 'Montserrat-700',
    fontSize: 18,
    letterSpacing: 2.5,
  },
  callToAction: {
    color: '#ffffff',
    fontFamily: 'Montserrat-900',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 30,
  },
  connectBtn: {
    height: 60,
    backgroundColor: '#f8a61e',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  connectBtnText: {
    fontSize: 15,
    letterSpacing: 1.25,
    color: 'white',
    fontFamily: 'Montserrat-700',
  },
  shockBtn: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#ffffff',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    opacity: 0.7,
  },
  shockBtnText: {
    fontSize: 15,
    letterSpacing: 1,
    color: '#274f94',
    fontFamily: 'Montserrat-700',
    marginLeft: 10,
  },
})
