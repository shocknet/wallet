/**
 * @format
 */
import React from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from 'react-native'


/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

export const LOADING = 'LOADING'

const SHOCK_LOGO_STYLE = { width: 100, height: 100 }

/** @type {number} */
// @ts-ignore
const shockBG = require('../assets/images/shock-bg.png')

/** @type {number} */
// @ts-ignore
const shockLogo = require('../assets/images/shocklogo.png')

/**
 * A simple loading screen with the shock wallet logo on top.
 */
export default class Loading extends React.PureComponent {
  render() {
    return (
      <ImageBackground
        resizeMode="cover"
        resizeMethod="scale"
        source={shockBG}
        style={styles.container}
      >
        <View style={styles.shockWalletLogoContainer}>
          <Image style={SHOCK_LOGO_STYLE} source={shockLogo} />
          <Text style={styles.logoText}>S H O C K W A L L E T</Text>
        </View>

        <ActivityIndicator animating size="large" color="white" />
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E4674',
    justifyContent: 'space-around',
    paddingLeft: 30,
    paddingRight: 30,
  },
  shockWalletLogoContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 10,
  },
})
