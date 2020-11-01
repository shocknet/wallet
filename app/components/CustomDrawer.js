import React from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
} from 'react-native'
import { DrawerActions } from 'react-navigation-drawer'
import { LNURL_SCREEN } from '../screens/LNURL'
import Pad from './Pad'
import { ADVANCED_SCREEN } from '../screens/Advanced'
import { SEED_BACKUP } from '../screens/SeedBackup'
import { WALLET_SETTINGS } from '../screens/WalletSettings'

import { Colors } from '../res/css'
import ShockIcon from '../res/icons'

// import * as ContactAPI from '../services/contact-api'

/**
 * @typedef {object} DrawerItem
 * @prop {string} name
 * @prop {string} iconName
 * @prop {(string)=} screen
 */

/** @type {DrawerItem[]} */
const drawerTopItems = [
  {
    name: 'Wallet Settings',
    iconName: 'solid-wallet',
    screen: WALLET_SETTINGS,
  },
  {
    name: 'Spending Rules',
    iconName: 'solid-spending-rule',
    screen: WALLET_SETTINGS,
  },
  {
    name: 'Advanced Lightning',
    iconName: 'solid-lightning',
    screen: ADVANCED_SCREEN,
  },
  {
    name: 'Seed Backup',
    iconName: 'solid-help',
    screen: SEED_BACKUP,
  },
]

/** @type {DrawerItem[]} */
const drawerBottomItems = [
  {
    name: 'Help Resources',
    iconName: 'solid-help',
  },
  {
    name: 'Buy Bitcoin',
    iconName: 'solid-help',
  },
]

/**
 * @typedef {import('react-navigation-drawer').DrawerContentComponentProps} DrawerContentComponentProps
 */
/**
 * @extends React.PureComponent<DrawerContentComponentProps>
 */

export default class CustomDrawer extends React.PureComponent {
  moveToQr = () => {
    this.props.navigation.navigate(LNURL_SCREEN, { qrRequest: true })
  }

  moveToClip = () => {
    this.props.navigation.navigate(LNURL_SCREEN, { clipboardRequest: true })
  }

  /**
   * @argument {(string)=} screenName
   * @returns {() => void}
   */
  navigateScreen = screenName => () => {
    const { navigation } = this.props

    if (!screenName) {
      return
    }

    navigation.navigate(screenName)
    navigation.dispatch(DrawerActions.closeDrawer())
  }

  /** @argument {DrawerItem[]} items */
  renderDrawerItems = (items = []) => {
    return items.map(({ name, iconName, screen }) => (
      <TouchableOpacity
        style={[
          styles.drawerItemContainer,
          !screen ? styles.drawerItemDisabled : null,
        ]}
        key={name}
        disabled={!screen}
        onPress={this.navigateScreen(screen)}
      >
        <Text style={styles.drawerItemTitle}>{name}</Text>
        <View style={styles.drawerItemIcon}>
          <ShockIcon name={iconName} size={18} color={Colors.BUTTON_BLUE} />
        </View>
      </TouchableOpacity>
    ))
  }

  render() {
    return (
      <View style={styles.flexBetweenDark}>
        <Pad amount={50} />

        <ScrollView style={styles.customDrawerScrollView}>
          {this.renderDrawerItems(drawerTopItems)}
        </ScrollView>
        <View style={styles.pinnedDrawerItems}>
          {this.renderDrawerItems(drawerBottomItems)}
        </View>
        <View style={styles.extraBitDark}>
          <View style={styles.extraBitDarkView}>
            <TouchableOpacity onPress={this.moveToQr}>
              <ShockIcon
                name="solid-scan"
                color={Colors.BUTTON_BLUE}
                size={20}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.extraBitDarViewFlexEnd}>
            <TouchableOpacity onPress={this.moveToClip}>
              <ShockIcon
                name="solid-power"
                color={Colors.BUTTON_BLUE}
                size={20}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  // flexBetween: {
  //   display: 'flex',
  //   flexDirection: 'column',
  //   justifyContent: 'space-between',
  //   height: '100%',
  // },
  flexBetweenDark: {
    justifyContent: 'space-between',
    height: '100%',
    backgroundColor: '#16191c',
  },
  // extraBit: {
  //   margin: 3,
  //   display: 'flex',
  //   flexDirection: 'row',
  // },
  extraBitDark: {
    paddingBottom: 5,
    height: 70,
    paddingHorizontal: 25,
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  // icon: {
  //   margin: 5,
  // },
  customDrawerScrollView: { flex: 1, paddingRight: 20 },
  drawerItemDisabled: {
    opacity: 0.5,
  },
  drawerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 0,
    width: '100%',
  },
  drawerItemTitle: {
    fontSize: 14,
    color: Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-600',
    opacity: 0.8,
  },
  pinnedDrawerItems: {
    flexShrink: 0,
    borderTopColor: Colors.BORDER_WHITE,
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  drawerItemIcon: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  extraBitDarkView: { flex: 1, alignItems: 'flex-start' },
  extraBitDarViewFlexEnd: { flex: 1, alignItems: 'flex-end' },
})
