/* eslint-disable  */
import React from 'react'
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
// @ts-expect-error
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from '../res/css'
import * as RES from '../res'

import Pad from './Pad'
import FlexCenter from './FlexCenter'

/**
 * @typedef {object} Props
 * @prop {(boolean|null)=} centerContent Content will be laid out in the center
 * of the screen. Be careful as too much content can overlap with the logo.
 * @prop {(boolean|null)=} loading Hides content and shows an spinner.
 * @prop {(() => void | null | boolean)=} onPressBack Hack needed for the
 * transparent header until we upgrade react-navigation. If provided a back
 * arrow will be shown.
 */

const theme = 'dark'

export default /** @type {React.FC<Props>} */ (React.memo(
  ({ centerContent, children, loading, onPressBack }) => (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground
        resizeMode="cover"
        resizeMethod="scale"
        source={theme === 'dark' ? RES.shockBGDark : RES.shockBG}
        style={styles.container}
      >
        <View style={CSS.styles.width100}>
          <Pad amount={48} />
          {/* ensure the logo always appears on the same place regardless of content */}

          {theme === 'dark' ? (
            <View style={xStyles.logo}>
              <View style={styles.shockLogoContainerDark}>
                <Image style={styles.shockLogoDark} source={RES.newLogoDark} />
              </View>
              <Pad amount={12} />
            </View>
          ) : (
            <View style={xStyles.logo}>
              <View style={styles.shockLogoContainer}>
                <Image style={styles.shockLogo} source={RES.newLogo} />
              </View>
              <Pad amount={12} />
              {/* S H O C K W A L L E T*/}
              <Text style={xStyles.logoText}>SHOCKWALLET</Text>)
            </View>
          )}
        </View>

        {centerContent ? (
          <FlexCenter>
            {loading ? (
              <ActivityIndicator size="large" />
            ) : (
              <View style={xStyles.content}>
                {loading ? <ActivityIndicator size="large" /> : children}
              </View>
            )}
          </FlexCenter>
        ) : loading ? (
          <View style={xStyles.content}>
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <KeyboardAwareScrollView
            contentContainerStyle={xStyles.keyboardAwareContent}
            style={CSS.styles.width70}
          >
            {children}
          </KeyboardAwareScrollView>
        )}

        {typeof onPressBack === 'function' && (
          <Ionicons
            suppressHighlighting
            color="white"
            name="ios-arrow-round-back"
            size={48}
            onPress={onPressBack}
            style={styles.headerBackImage}
          />
        )}
      </ImageBackground>
    </>
  ),
))

/**
 * Spacing (for <Pad />) between items.
 */
export const ITEM_SPACING = 18

const WIDTH = Dimensions.get('window').width

const IMG_SIZE = Math.round(WIDTH * 0.2)

const LETTERS_IN_SHOCKWALLET = 11
/** Obtained from design */
const PERCENTAGE_LOGO_TEXT_WIDTH = 0.45

/**
 * Parent container has padding but we are calculating it from the window
 * width, which we know grandparent fills.
 **/
const RENDERED_LOGO_TEXT_WIDTH = WIDTH * PERCENTAGE_LOGO_TEXT_WIDTH

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    // when status bar is set to transparent, content is rendered below it
    paddingTop: StatusBar.currentHeight || 0,

    justifyContent: 'space-between',

    // Padding caused the scrollview to be cut-off from the bottom
    // on smaller screens
    // paddingBottom: 48,
  },

  shockLogo: { height: IMG_SIZE, width: IMG_SIZE },
  shockLogoDark: { height: IMG_SIZE * 3, width: IMG_SIZE * 3 },

  shockLogoContainer: {
    borderRadius: IMG_SIZE / 2,
    elevation: 24,
    height: IMG_SIZE,
    width: IMG_SIZE,
  },
  shockLogoContainerDark: {
    borderRadius: IMG_SIZE / 2,

    height: IMG_SIZE * 3,
    width: IMG_SIZE * 3,
  },

  contentBase: {
    paddingLeft: '16%',
    paddingRight: '16%',
  },

  headerBackImage: {
    position: 'absolute',
    left: 28,
    top: (StatusBar.currentHeight || 0) + 24,
  },

  logoTextBase: {
    // TODO: I think there's no condensed variant for montserrat. Design
    // probably condensed it through pixel manipulation.
    // fontStretch: 'condensed',
    /**
     * https://stackoverflow.com/questions/24557411/css-letter-spacing-percent-to-completely-fit-the-div-container
     * Yes the 4 is a magic number.
     */
    letterSpacing: RENDERED_LOGO_TEXT_WIDTH / LETTERS_IN_SHOCKWALLET / 4,
  },
})

const xStyles = {
  content: [
    styles.contentBase,
    CSS.styles.deadCenter,
    CSS.styles.width100,
    CSS.styles.flex,
  ],

  keyboardAwareContent: [CSS.styles.deadCenter, CSS.styles.flex],

  logo: [
    CSS.styles.deadCenter,
    CSS.styles.flexShrinkZero,
    // needed for allowing percentage width for logotext
    CSS.styles.width100,
  ],

  logoText: [
    CSS.styles.textWhite,
    CSS.styles.fontSize16,
    CSS.styles.textAlignCenter,
    CSS.styles.fontMontserratBold,
    styles.logoTextBase,
  ],
}

export const titleTextStyle = [
  CSS.styles.textWhite,
  CSS.styles.fontMontserratBold,
  CSS.styles.fontSize18,
  CSS.styles.textAlignCenter,
]

export const linkTextStyle = [
  CSS.styles.textWhite,
  CSS.styles.fontMontserrat,
  CSS.styles.fontSize18,
  CSS.styles.textAlignCenter,
  CSS.styles.textUnderlined,
]

/**
 * @type {import('react-navigation-stack').NavigationStackOptions}
 */
export const stackNavConfigMixin = {
  header: () => null,

  // Deprecated in react-navigation v4
  // transitionConfig: () => ({
  //   transitionSpec: {
  //     duration: 0,
  //     timing: Animated.timing,
  //     easing: Easing.step0,
  //   },
  // }),
}
