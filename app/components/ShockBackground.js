import React from 'react'
import { ImageBackground, StatusBar, StyleSheet, View } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from '../res/css'
import * as RES from '../res'

export default React.memo(function ShockBackground({ children }) {
  return (
    <ImageBackground
      resizeMode="cover"
      resizeMethod="scale"
      source={RES.shockBG2}
      style={styles.container}
    >
      <>
        {/* We could use translucent here but the background image is not drawn below the status bar. */}
        <StatusBar
          backgroundColor={CSS.Colors.BACKGROUND_BLUE}
          barStyle="light-content"
        />
        {children}
      </>
    </ImageBackground>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CSS.Colors.BACKGROUND_BLUE,
  },

  headerBackImage: {
    paddingLeft: 12,
  },
})

/**
 * @type {import('react-navigation-stack').NavigationStackOptions}
 */
export const stackNavConfigHeaderMixin = {
  headerStyle: {
    backgroundColor: CSS.Colors.BACKGROUND_BLUE,
    elevation: 0,
    shadowOpacity: 0,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },

  headerTitleAlign: 'center',

  headerBackImage: () => ((
    <View style={styles.headerBackImage}>
      <Ionicons
        suppressHighlighting
        color="white"
        name="ios-arrow-round-back"
        size={48}
      />
    </View>
  )),

  headerTitleStyle: {
    // design has regular (400 weight) font but 600 looks more like the
    // rendered design
    fontFamily: 'Montserrat-700',
    fontSize: 15,
    // https://github.com/react-navigation/react-navigation/issues/542#issuecomment-283663786
    fontWeight: 'normal',
  },

  headerTintColor: CSS.Colors.BACKGROUND_WHITE,
}
