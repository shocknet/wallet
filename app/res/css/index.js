import { Dimensions, StyleSheet, StatusBar } from 'react-native'
export const HEIGHT = Dimensions.get('screen').height
export const WIDTH = Dimensions.get('window').width
// If we use the actual height from the design art (68pt) the bar looks too big,
// let's use a percentage instead
export const BOTTOM_BAR_HEIGHT = Math.round(HEIGHT * 0.085)

/**
 * @prettier
 */
export const Colors = {
  BACKDROP: 'rgba(0, 0, 0, 0.4)',
  /**
   * Blue when used as a background.
   */
  BACKGROUND_BLUE: '#4285B9',
  /**
   * Black when used as a background.
   */
  BACKGROUND_BLACK: '#000000',
  /**
   * White when used as a background.
   */
  BACKGROUND_WHITE: '#FFFFFF',
  BACKGROUND_NEAR_WHITE: '#EFEFEF',
  BORDER_WHITE: '#FFFFFF',
  BORDER_NEAR_WHITE: '#DDD',
  BLUE_MEDIUM_DARK: '#294F93',
  BLUE_DARK: '#2E4674',
  BLUE_LIGHTEST: '#F4F6FA',
  BLUE_LIGHT: '#267ADB',
  BLUE_GRAY: '#50668F',
  GRAY_MEDIUM_LIGHT: '#BCBCBC',
  GRAY_DARK: '#4E4E4E',
  GRAY_MEDIUM: '#F5F5F5',
  GRAY_D9: '#D9D9D9',
  GRAY_LIGHT: '#CDCDCD',
  ORANGE: '#F5A623',
  TEAL: '#4285B9',
  TEXT_LIGHTEST: '#979797',
  TEXT_LIGHT: '#787878',
  TEXT_STANDARD: '#404040',
  TEXT_WHITE: '#FFFFFF',
  TEXT_GRAY: '#7B7B7B',
  TEXT_GRAY_LIGHT: '#9A9696',
  TEXT_GRAY_LIGHTEST: '#B6B4B4',
  SUCCESS_GREEN: '#39B54A',
  FAILURE_RED: '#C1272D',
  CAUTION_YELLOW: '#EFC238',
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
  backgroundWhite: { backgroundColor: Colors.BACKGROUND_WHITE },
  backgroundBlueGray: { backgroundColor: Colors.BLUE_GRAY },
  textBold: { fontWeight: 'bold' },
  flex: { flex: 1 },
  flexBasisZero: { flexBasis: 0 },
  flexShrinkZero: { flexShrink: 0 },
  flexZero: { flex: 0 },
  flexRow: { flexDirection: 'row' },
  fontMontserrat: { fontFamily: 'Montserrat-500' },
  fontMontserratBold: { fontFamily: 'Montserrat-700' },
  fontSize10: { fontSize: 10 },
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
  textWhite: { color: Colors.TEXT_WHITE },
  width0: { width: '0%' },
  width100: { width: '100%' },
})

export const SCREEN_PADDING = 30
