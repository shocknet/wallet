import { StyleSheet } from 'react-native'

/**
 * @prettier
 */
export const Colors = {
  BACKDROP: 'rgba(0, 0, 0, 0.4)',
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
  BLUE_DARK: '#2E4674',
  BLUE_LIGHTEST: '#F4F6FA',
  BLUE_LIGHT: '#267ADB',
  BLUE_GRAY: '#50668F',
  GRAY_DARK: '#4E4E4E',
  GRAY_MEDIUM: '#F5F5F5',
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
}

export const styles = StyleSheet.create({
  alignItemsEnd: { alignItems: 'flex-end' },
  alignSelfEnd: { alignSelf: 'flex-end' },
  textBold: { fontWeight: 'bold' },
  backgroundBlueGray: { backgroundColor: Colors.BLUE_GRAY },
  flex: { flex: 1 },
  flexZero: { flex: 0 },
  fontSize24: { fontSize: 24 },
  deadCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWhite: { color: Colors.TEXT_WHITE },
  width0: { width: '0%' },
  width100: { width: '100%' },
})

export const SCREEN_PADDING = 30
