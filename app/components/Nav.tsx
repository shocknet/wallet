import React from 'react'
import { View, SafeAreaView, Text, StyleSheet } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { NavigationScreenProp } from 'react-navigation'
import { connect } from 'react-redux'

import { toggleDrawer } from '../services/navigation'
import { Colors } from '../res/css'
import * as Store from '../store'

import { ConnectedShockAvatar } from './ShockAvatar'

type Navigation = NavigationScreenProp<{}, {}>

interface DispatchProps {}

interface StateProps {
  publicKey: string
  isOnline: boolean
}

interface OwnProps {
  title?: string
  style?: object
  backButton?: boolean | null
  showAvatar?: string | null
  navigation?: Navigation
  onPressAvatar?: () => void
}

type Props = DispatchProps & StateProps & OwnProps

const Nav: React.FC<Props> = ({
  title,
  style,
  backButton,
  showAvatar,
  navigation,
  onPressAvatar,
  isOnline,
  publicKey,
}) => {
  const goBack = () => {
    if (navigation) {
      return navigation.goBack()
    }

    return null
  }

  const theme = 'dark'

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
        <View
          style={typeof showAvatar === 'undefined' ? navStyles.hidden : null}
        >
          <ConnectedShockAvatar
            height={40}
            publicKey={publicKey}
            onPress={onPressAvatar}
            disableOnlineRing={!isOnline}
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

const mapState = (state: Store.State): StateProps => {
  const isOnline = Store.isOnline(state)
  const publicKey = Store.getMyPublicKey(state)

  return {
    isOnline,
    publicKey,
  }
}

const ConnectedNav = connect(mapState)(Nav)

export default ConnectedNav
