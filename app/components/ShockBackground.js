import React from 'react'
import { ImageBackground, StatusBar, StyleSheet } from 'react-native'

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
})
