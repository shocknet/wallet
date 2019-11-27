/**
 * @format
 */
import React from 'react'

import { BackHandler, StyleSheet, Text, View } from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'
import Feather from 'react-native-vector-icons/Feather'

import { Colors } from '../css'

/**
 * @typedef {object} Props
 * @prop {(e: { data: any }) => void} onRead
 * @prop {() => void} onRequestClose Called when user presses on back button.
 */

/**
 * @augments React.PureComponent<Props>
 */
export default class QRScanner extends React.PureComponent {
  onBackBtn = () => {
    this.props.onRequestClose()

    return true
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackBtn)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackBtn)
  }

  render() {
    const { onRead, onRequestClose } = this.props

    return (
      <QRCodeScanner
        onRead={onRead}
        showMarker
        topContent={
          <View style={styles.header}>
            <Feather
              name="arrow-left"
              color={Colors.BLUE_DARK}
              size={48}
              onPress={onRequestClose}
            />
            <Text style={styles.text}>Point your Camera to the QR Code</Text>
          </View>
        }
        topViewStyle={styles.scannerTopView}
      />
    )
  }
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 64,
    width: '100%',
  },

  text: {
    color: Colors.BLUE_DARK,
    fontSize: 24,
  },

  scannerTopView: {
    backgroundColor: Colors.TEXT_WHITE,
    justifyContent: 'flex-start',
  },
})
