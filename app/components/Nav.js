import React from 'react'
import { View, SafeAreaView, Text, StyleSheet } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { toggleDrawer } from '../services/navigation'
import { Colors } from '../res/css'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {object} Props
 * @prop {(string)=} title
 * @prop {(object)=} style
 * @prop {(boolean)=} backButton
 * @prop {(Navigation)=} navigation
 */

/**
 * @argument {Props} props
 */
const Nav = ({ title = '', style = {}, backButton = false, navigation }) => {
  const goBack = () => {
    if (navigation) {
      return navigation.goBack()
    }

    return null
  }

  return (
    <SafeAreaView style={[navStyles.container, style]}>
      {backButton ? (
        <Ionicons
          name="ios-arrow-round-back"
          color={Colors.TEXT_WHITE}
          size={40}
          style={navStyles.navMenu}
          // eslint-disable-next-line react/jsx-no-bind
          onPress={goBack}
        />
      ) : (
        <View style={navStyles.avatarContainer} />
      )}
      <Text style={navStyles.navTitle}>
        {title ? title.toUpperCase() : 'WALLET'}
      </Text>
      {!backButton ? (
        <Ionicons
          name="md-menu"
          color={Colors.TEXT_WHITE}
          size={40}
          style={navStyles.navMenu}
          onPress={toggleDrawer}
        />
      ) : (
        <View style={navStyles.balanceComponent} />
      )}
    </SafeAreaView>
  )
}

const navStyles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.TRANSPARENT,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: Colors.AVATAR_BG,
  },
  navTitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-700',
    color: Colors.TEXT_WHITE,
  },
  navMenu: {
    width: 40,
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  // An invisible component to center the Nav's text in a responsive way
  balanceComponent: {
    width: 40,
    height: 40,
  },
})

export default Nav
