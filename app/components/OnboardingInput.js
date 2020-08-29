// eslint-disable no-inline-styles
import React from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Entypo from 'react-native-vector-icons/Entypo'
import { Svg, Polygon } from 'react-native-svg'

import * as CSS from '../res/css'
import Pad from '../components/Pad'

/**
 * @typedef {import('react-native').TextInputProps} TextInputProps
 */

/**
 * @typedef {object} Props
 * @prop {TextInputProps['autoCapitalize']=} autoCapitalize
 * @prop {TextInputProps['autoCorrect']=} autoCorrect
 * @prop {(boolean|null)=} disable
 * @prop {TextInputProps['keyboardType']=} keyboardType
 * @prop {(string|boolean|null)=} label
 * @prop {TextInputProps['onChangeText']} onChangeText
 * @prop {TextInputProps['onSubmitEditing']=} onSubmitEditing
 * @prop {TextInputProps['placeholder']} placeholder
 * @prop {TextInputProps['returnKeyType']=} returnKeyType
 * @prop {TextInputProps['secureTextEntry']=} secureTextEntry
 * @prop {((() => void) | boolean | null)=} onPressQRBtn If provided, a QR Btn
 * will be shown inside the input.
 * @prop {TextInputProps['textContentType']=} textContentType
 * @prop {string=} tooltip
 * @prop {TextInputProps['value']} value
 */

/**
 * @typedef {object} State
 * @prop {import('react-native').LayoutRectangle} layout
 * @prop {boolean} tooltipOpen
 */

/**
 * @augments React.Component<Props & {innerRef: React.Ref<TextInput>}, State>
 */
class OnboardingInput extends React.Component {
  /** @type {State} */
  state = {
    layout: {
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    },
    tooltipOpen: false,
  }

  theme = 'dark'

  closeTooltip = () => {
    this.setState({
      tooltipOpen: false,
    })
  }

  openTooltip = () => {
    this.setState({
      tooltipOpen: true,
    })
  }

  componentWillUnmount() {
    this.closeTooltip()
  }

  /** @type {import('react-native').ViewProps['onLayout']} */
  onLayout = e => {
    this.setState({
      layout: e.nativeEvent.layout,
    })
  }

  render() {
    const {
      autoCapitalize,
      autoCorrect,
      disable,
      keyboardType,
      label,
      onChangeText,
      onPressQRBtn,
      onSubmitEditing,
      placeholder,
      returnKeyType,
      secureTextEntry,
      textContentType,
      tooltip,
      value,

      innerRef,
    } = this.props

    const SVG_EDGE = 25
    const UNIT = SVG_EDGE / 5
    const ZERO = UNIT * 0
    const TWO = UNIT * 2
    const THREE = UNIT * 3
    const FOUR = UNIT * 4
    const FIVE = UNIT * 5

    return (
      <>
        {label && <Text style={styles.textInputFieldLabel}>{label}</Text>}

        {this.state.tooltipOpen && (
          <>
            <View>
              <View
                style={[
                  styles.tooltipBubble,
                  {
                    width: this.state.layout.width * 0.9,
                  },
                ]}
              >
                <Text style={xStyles.tooltipText}>{this.props.tooltip}</Text>
              </View>

              <Svg height={SVG_EDGE} width={SVG_EDGE} style={styles.arrow}>
                <Polygon
                  points={`${ZERO},${THREE} ${FOUR},${ZERO} ${FIVE},${FIVE}`}
                  fill="grey"
                  strokeWidth="0"
                />
              </Svg>
            </View>

            <Pad amount={20} />
          </>
        )}

        <View
          onLayout={this.onLayout}
          style={
            this.theme === 'dark'
              ? styles.textInputFieldContainerDark
              : styles.textInputFieldContainer
          }
        >
          <TextInput
            editable={!disable}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            placeholder={placeholder}
            placeholderTextColor={
              this.theme === 'dark' ? CSS.Colors.TEXT_WHITE : ''
            }
            returnKeyType={returnKeyType}
            ref={innerRef}
            secureTextEntry={secureTextEntry}
            style={
              this.theme === 'dark'
                ? styles.textInputFieldDark
                : styles.textInputField
            }
            textContentType={textContentType}
            value={value}
          />

          {typeof onPressQRBtn === 'function' && (
            <TouchableOpacity style={styles.scanBtn} onPress={onPressQRBtn}>
              <Ionicons
                name="ios-barcode"
                style={CSS.styles.positionAbsolute}
                size={10}
                color="#808080"
              />
              <Ionicons
                name="md-qr-scanner"
                style={CSS.styles.positionAbsolute}
                size={20}
                color="#808080"
              />
            </TouchableOpacity>
          )}

          {tooltip && (
            <TouchableOpacity
              style={
                this.theme === 'dark'
                  ? styles.tooltipBtnDark
                  : styles.tooltipBtn
              }
              onPress={this.openTooltip}
            >
              <Entypo name="help" size={20} color={CSS.Colors.TEXT_WHITE} />
            </TouchableOpacity>
          )}
        </View>

        <Modal
          onRequestClose={this.closeTooltip}
          transparent
          visible={this.state.tooltipOpen}
        >
          <TouchableWithoutFeedback onPress={this.closeTooltip}>
            <View style={CSS.styles.flex} />
          </TouchableWithoutFeedback>
        </Modal>
      </>
    )
  }
}

/**
 * @param {Props} props
 * @param {React.Ref<TextInput>} ref
 */
const ForwardedOnboardingInput = (props, ref) => (
  <OnboardingInput innerRef={ref} {...props} />
)

export default React.forwardRef(ForwardedOnboardingInput)

const TOOLTIP_V_PAD = 14
const TOOLTIP_H_PAD = 18

const BUBBLE_TRIANGLE_VERTICAL_OFFSET = 6

const styles = StyleSheet.create({
  scanBtn: {
    width: 35,
    height: 35,
    flexShrink: 0,
    backgroundColor: CSS.Colors.GRAY_D9,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  textInputField: {
    fontSize: 14,
    fontFamily: 'Montserrat-600',
    flex: 1,
  },
  textInputFieldDark: {
    fontSize: 14,
    fontFamily: 'Montserrat-600',
    flex: 1,
    color: CSS.Colors.TEXT_WHITE,
  },

  textInputFieldContainer: {
    height: 64,
    backgroundColor: CSS.Colors.TEXT_WHITE,
    borderRadius: 100,
    elevation: 3,
    paddingLeft: 25,
    alignItems: 'center',
    flexDirection: 'row',
  },
  textInputFieldContainerDark: {
    height: 64,
    backgroundColor: '#212937',
    borderWidth: 1,
    borderColor: '#4285B9',
    paddingLeft: 25,
    alignItems: 'center',
    flexDirection: 'row',
  },

  textInputFieldLabel: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 24,
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-600',
  },

  tooltipBtn: {
    width: 35,
    height: 35,
    flexShrink: 0,
    backgroundColor: CSS.Colors.ORANGE,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  tooltipBtnDark: {
    width: 35,
    height: 35,
    flexShrink: 0,
    backgroundColor: '#4285B9',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  tooltipBubble: {
    backgroundColor: 'grey',
    paddingLeft: TOOLTIP_H_PAD,
    paddingRight: TOOLTIP_H_PAD,
    paddingBottom: TOOLTIP_V_PAD,
    paddingTop: TOOLTIP_V_PAD,
    borderRadius: 20,
  },

  arrow: {
    position: 'absolute',
    bottom: -BUBBLE_TRIANGLE_VERTICAL_OFFSET,
    right: 14,
  },
})

const xStyles = {
  tooltipText: [
    CSS.styles.fontMontserrat,
    CSS.styles.textWhite,
    CSS.styles.fontSize10,
  ],
}
