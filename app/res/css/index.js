import { Dimensions, StyleSheet, StatusBar } from 'react-native'
export const HEIGHT = Dimensions.get('screen').height
export const WIDTH = Dimensions.get('window').width
// If we use the actual height from the design art (68pt) the bar looks too big,
// let's use a percentage instead
export const BOTTOM_BAR_HEIGHT = Math.round(HEIGHT * 0.085)

import * as Common from 'shock-common'

export const Colors = {
  ...Common.Constants.Color,
  DARK_MODE_TEXT_NEAR_WHITE: '#EBEBEB',
  DARK_MODE_TEXT_GRAY: '#9C9C9C',
  DARK_MODE_BACKGROUND_DARK: '#16191C',
  DARK_MODE_CYAN: '#4285B9',
  DARK_MODE_BACKGROUND_BLUEISH_GRAY: '#212937',
  DARK_MODE_BORDER_GRAY: '#707070',
}

export const styles = StyleSheet.create({
  absolutelyCentered: {
    position: 'absolute',
    top: '50%',
  },
  alignItemsCenter: { alignItems: 'center' },
  alignItemsEnd: { alignItems: 'flex-end' },
  alignSelfStart: { alignSelf: 'flex-start' },
  alignSelfEnd: { alignSelf: 'flex-end' },
  width70: { width: '70%' },
  backgroundBlueGray: { backgroundColor: Colors.BLUE_GRAY },
  backgroundRed: { backgroundColor: Colors.FAILURE_RED },
  backgroundGreen: { backgroundColor: Colors.SUCCESS_GREEN },
  backgroundOrange: { backgroundColor: Colors.ORANGE },
  backgroundWhite: { backgroundColor: Colors.BACKGROUND_WHITE },
  backgroundWhiteDark: { backgroundColor: '#1A2028' },
  backgroundBlack: { backgroundColor: 'black' },
  textBold: { fontWeight: 'bold' },
  flex: { flex: 1 },
  flexBasisZero: { flexBasis: 0 },
  flexShrinkZero: { flexShrink: 0 },
  flexZero: { flex: 0 },
  flexRow: { flexDirection: 'row' },
  fontMontserrat: { fontFamily: 'Montserrat-500' },
  fontMontserratBold: { fontFamily: 'Montserrat-700' },
  fontSize8: { fontSize: 8 },
  fontSize9: { fontSize: 9 },
  fontSize10: { fontSize: 10 },
  fontSize11: { fontSize: 11 },
  fontSize12: { fontSize: 12 },
  fontSize14: { fontSize: 14 },
  fontSize16: { fontSize: 16 },
  fontSize18: { fontSize: 18 },
  fontSize20: { fontSize: 20 },
  fontSize22: { fontSize: 22 },
  fontSize24: { fontSize: 24 },
  height0: { height: '0%' },
  height100: { height: '100%' },
  justifyCenter: { justifyContent: 'center' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifySpaceBetween: { justifyContent: 'space-between' },
  justifySpaceEvenly: { justifyContent: 'space-evenly' },
  deadCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  traslucentStatusBarPadding: { paddingTop: StatusBar.currentHeight },
  positionAbsolute: { position: 'absolute' },
  textAlignCenter: { textAlign: 'center' },
  textUnderlined: { textDecorationLine: 'underline' },
  textGray: { color: Colors.TEXT_GRAY },
  textWhite: { color: Colors.TEXT_WHITE },
  width0: { width: '0%' },
  width100: { width: '100%' },
  empty: {},
  opacityZero: { opacity: 0 },
  rowCentered: { flexDirection: 'row', alignItems: 'center' },
  rowCenteredSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  square32: { width: 32, height: 32 },
  displayNone: {
    display: 'none',
  },
})

export const SCREEN_PADDING = 30
