/**
 * @format
 */
import React, { Component } from 'react'
import {
  // Clipboard,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
} from 'react-native'
// @ts-ignore
import { Dropdown } from 'react-native-material-dropdown'
// @ts-ignore
import SwipeVerify from 'react-native-swipe-verify'
import wavesBG from '../../assets/images/shock-bg.png'
import Nav from '../../components/Nav'

import * as CSS from '../../css'
import Ionicons from 'react-native-vector-icons/Ionicons'
import InputGroup from './components/InputGroup'
export const SEND_SCREEN = 'SEND_SCREEN'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {object} Props
 * @prop {(Navigation)=} navigation
 */

/**
 * @augments React.Component<Props, {}, never>
 */
class SendScreen extends Component {
  state = {
    destination: '',
    unitSelected: 'Sats',
  }

  amountOptionList = React.createRef()

  onChange = (key = '') => (value = '') => {
    this.setState({
      [key]: value,
    })
  }

  render() {
    const { destination, unitSelected } = this.state
    const { navigation } = this.props
    const { width, height } = Dimensions.get('window')
    return (
      <ImageBackground
        source={wavesBG}
        resizeMode="cover"
        style={styles.container}
      >
        <Nav backButton title="Send" navigation={navigation} />
        <View
          style={[
            styles.sendContainer,
            {
              width: width - 50,
              height: height - 134,
            },
          ]}
        >
          <View style={styles.scanBtn}>
            <Text style={styles.scanBtnText}>SCAN QR</Text>
            <Ionicons name="md-qr-scanner" color="white" size={24} />
          </View>
          <InputGroup
            label="Recipient Address"
            value={destination}
            onChange={this.onChange('destination')}
          />
          <InputGroup
            label="Select Contact"
            value={destination}
            onChange={this.onChange('destination')}
            icon="md-search"
            disabled
          />
          <View style={styles.amountContainer}>
            <InputGroup
              label="Amount"
              value={destination}
              onChange={this.onChange('destination')}
              style={styles.amountInput}
            />
            <Dropdown
              data={[
                {
                  value: 'Sats',
                },
                {
                  value: 'Bits',
                },
                {
                  value: 'BTC',
                },
              ]}
              onChangeText={this.onChange('unitSelected')}
              containerStyle={styles.amountSelect}
              value={unitSelected}
              lineWidth={0}
              inputContainerStyle={styles.amountSelectInput}
              rippleOpacity={0}
              pickerStyle={styles.amountPicker}
              dropdownOffset={{ top: 8, left: 0 }}
              rippleInsets={{ top: 8, bottom: 0, right: 0, left: 0 }}
            />
          </View>
          <View style={styles.sendSwipeContainer}>
            <SwipeVerify
              width={width - 50}
              buttonSize={52}
              buttonColor={CSS.Colors.BUTTON_BLUE}
              borderColor={CSS.Colors.BUTTON_BLUE}
              backgroundColor={CSS.Colors.FUN_BLUE}
              textColor="#37474F"
              borderRadius={100}
            >
              <Text style={styles.sendSwipeText}>Swipe to send</Text>
            </SwipeVerify>
          </View>
        </View>
      </ImageBackground>
    )
  }
}

export default SendScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  sendContainer: {
    height: '100%',
    width: '100%',
    marginTop: 5,
    paddingVertical: 25,
    paddingHorizontal: 35,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    borderRadius: 40,
  },
  scanBtn: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: CSS.Colors.BUTTON_BLUE,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginBottom: 60,
    elevation: 10,
  },
  scanBtnText: {
    color: CSS.Colors.TEXT_WHITE,
    fontSize: 14,
    fontFamily: 'Montserrat-700',
    marginRight: 10,
  },
  amountContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountInput: {
    width: '60%',
    marginBottom: 0,
  },
  amountSelect: {
    width: '35%',
    marginBottom: 0,
    height: 45,
  },
  amountSelectInput: {
    borderBottomColor: CSS.Colors.TRANSPARENT,
    elevation: 4,
    paddingHorizontal: 15,
    borderRadius: 100,
    height: 45,
    alignItems: 'center',
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
  },
  amountPicker: { borderRadius: 15 },
  sendSwipeContainer: {
    position: 'absolute',
    bottom: 25,
    left: 35,
    width: '100%',
    height: 60,
    justifyContent: 'center',
  },
  sendSwipeText: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    opacity: 0.7,
    fontSize: 12,
  },
})
