import React from 'react'
import { View, SafeAreaView, Text, StyleSheet } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Colors } from '../css'

const Nav = ({ title = '', style = {} }) => (
  <SafeAreaView style={[navStyles.container, style]}>
    <View style={navStyles.avatarContainer} />
    <Text style={navStyles.navTitle}>
      {title ? title.toUpperCase() : 'WALLET'}
    </Text>
    <Ionicons
      name="md-menu"
      color={Colors.TEXT_WHITE}
      size={40}
      style={navStyles.navMenu}
    />
  </SafeAreaView>
)

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
})

export default Nav
