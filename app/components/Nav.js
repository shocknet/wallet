import React from 'react'
import { View, SafeAreaView, Text, StyleSheet } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { toggleDrawer } from '../services/navigation'
import { Colors } from '../res/css'
import ShockAvatar from './ShockAvatar'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {object} Props
 * @prop {(string)=} title
 * @prop {(object)=} style
 * @prop {(boolean)=} backButton
 * @prop {(string|null)=} showAvatar
 * @prop {(Navigation)=} navigation
 */

/**
 * @type {React.FC<Props>}
 */
const Nav = ({ title, style, backButton, showAvatar, navigation }) => {
  const goBack = () => {
    if (navigation) {
      return navigation.goBack()
    }

    return null
  }

  const theme = 'dark'

  return ((
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
        <View
          style={typeof showAvatar === 'undefined' ? navStyles.hidden : null}
        >
          <ShockAvatar
            height={40}
            image={showAvatar || null}
            lastSeenApp={null}
          />
        </View>
      )}
      <Text
        style={theme === 'dark' ? navStyles.navTitleDark : navStyles.navTitle}
      >
        {title ? title.toUpperCase() : ''}
      </Text>
      {!backButton ? (
        <Ionicons
          name="md-menu"
          color={Colors.TEXT_WHITE}
          size={30}
          style={navStyles.navMenu}
          onPress={toggleDrawer}
        />
      ) : (
        <View style={navStyles.balanceComponent} />
      )}
    </SafeAreaView>
  ))
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
  navTitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-700',
    color: Colors.TEXT_WHITE,
  },
  navTitleDark: {
    fontSize: 20,
    fontFamily: 'Montserrat-700',
    color: Colors.TEXT_WHITE,
  },
  navMenu: {
    width: 40,
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  hidden: {
    opacity: 0,
  },
  // An invisible component to center the Nav's text in a responsive way
  balanceComponent: {
    width: 40,
    height: 40,
  },
})

export default Nav
