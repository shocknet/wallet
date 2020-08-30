import React, { Component } from 'react'
import { DrawerItems } from 'react-navigation'
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { LNURL_SCREEN } from '../screens/LNURL'

//@ts-ignore
import IconDrawerScan from '../assets/images/drawer-icons/icon-drawer-scan.svg'
//@ts-ignore
import IconDrawerPower from '../assets/images/drawer-icons/icon-drawer-power.svg'
import ShockAvatar from './ShockAvatar'
import * as ContactAPI from '../services/contact-api'

/**
 * @typedef {import('react-navigation').DrawerItemsProps} DrawerItemsProps
 */
/**
 * @extends Component<DrawerItemsProps>
 */
export default class CustomDrawer extends Component {
  state = {
    avatar: ContactAPI.Events.getAvatar(),
  }

  moveToQr = () => {
    this.props.navigation.navigate(LNURL_SCREEN, { qrRequest: true })
  }

  moveToClip = () => {
    this.props.navigation.navigate(LNURL_SCREEN, { clipboardRequest: true })
  }

  render() {
    const { avatar } = this.state

    return (
      // <View style={styles.flexBetween}>
      <View style={styles.flexBetweenDark}>
        <View style={styles.customDrawerContainer}>
          <TouchableOpacity>
            <ShockAvatar
              height={40}
              image={avatar}
              avatarStyle={styles.avatarStyle}
              disableOnlineRing
              lastSeenApp={null}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.customDrawerScrollView}>
          <DrawerItems
            {...this.props}
            labelStyle={styles.drawItemLabelDark}
            itemsContainerStyle={styles.drawerItemContainer}
            itemStyle={styles.drawerItem}
          />
        </ScrollView>
        <View style={styles.extraBitDark}>
          <View style={styles.extraBitDarkView}>
            <TouchableOpacity onPress={this.moveToQr}>
              <IconDrawerScan />
            </TouchableOpacity>
          </View>
          <View style={styles.extraBitDarViewFlexEnd}>
            <TouchableOpacity onPress={this.moveToClip}>
              <IconDrawerPower />
            </TouchableOpacity>
          </View>

          {/*<AntDesign*/}
          {/*  name="qrcode"*/}
          {/*  size={25}*/}
          {/*  style={styles.icon}*/}
          {/*  onPress={this.moveToQr}*/}
          {/*/>*/}
          {/*<AntDesign*/}
          {/*  name="copy1"*/}
          {/*  size={25}*/}
          {/*  style={styles.icon}*/}
          {/*  onPress={this.moveToClip}*/}
          {/*/>*/}
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
  drawItemLabelDark: {
    color: '#ffffff',
    textAlign: 'right',
    fontFamily: 'Montserrat-700',
    fontSize: 15,
  },
  flexBetweenDark: {
    display: 'flex',
    flexDirection: 'column',
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
  avatarStyle: {
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  customDrawerContainer: {
    alignItems: 'flex-end',
    marginTop: 60,
    marginBottom: 40,
    paddingRight: 50,
  },
  customDrawerScrollView: { flex: 1, paddingRight: 30 },
  drawerItemContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  drawerItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  extraBitDarkView: { flex: 1, alignItems: 'flex-start' },
  extraBitDarViewFlexEnd: { flex: 1, alignItems: 'flex-end' },
})
