import React from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import moment from 'moment'
import Octicons from 'react-native-vector-icons/Octicons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'

import * as CSS from '../../res/css'
import * as RES from '../../res'
import Pad from '../../components/Pad'

/**
 * @typedef {'payment-received'|'invoice'|'invoice-unk'|'invoice-settling'|'invoice-settled'|'invoice-err'|'payment-sending'|'payment-sent'|'payment-err'} Type
 */

/**
 * @typedef {object} Props
 * @prop {number=} amt
 * @prop {(() => void)=} onPress
 * @prop {(() => void)=} onPressDetails
 * @prop {string|null} otherDisplayName The other user's display name. Will be
 * used only for invoice types.
 * @prop {boolean} outgoing
 * @prop {string} preimage
 * @prop {number} timestamp
 * @prop {Type} type
 */

/**
 * @augments React.PureComponent<Props>
 */
export default class TXBase extends React.PureComponent {
  componentDidMount() {
    /**
     * Force-updates every minute so moment-formatted dates refresh.
     */
    this.intervalID = setInterval(() => {
      this.forceUpdate()
    }, 60000)
  }

  componentWillUnmount() {
    typeof this.intervalID === 'number' && clearInterval(this.intervalID)
  }

  render() {
    const {
      amt,
      otherDisplayName,
      outgoing,
      preimage,
      timestamp,
      type,
    } = this.props

    const indicator = (() => {
      if (type === 'invoice') {
        return (
          <View style={xStyles.iconCircleOrange}>
            <Feather
              color={CSS.Colors.TEXT_WHITE}
              name="menu"
              size={ICON_CIRCLE_SIZE * 0.7}
            />
          </View>
        )
      }

      if (
        type === 'payment-err' ||
        type === 'invoice-err' ||
        type === 'invoice-unk'
      ) {
        return (
          <View style={xStyles.iconCircleRed}>
            <MaterialIcons
              color={CSS.Colors.BORDER_WHITE}
              name="error-outline"
              size={ICON_CIRCLE_SIZE}
            />
          </View>
        )
      }

      if (type === 'payment-sending' || type === 'invoice-settling') {
        return (
          <View style={xStyles.iconCircleGreen}>
            <Octicons
              color={CSS.Colors.TEXT_WHITE}
              name="arrow-up"
              size={ICON_CIRCLE_SIZE * 0.75}
            />
          </View>
        )
      }

      if (
        type === 'payment-sent' ||
        type === 'invoice-settled' ||
        type === 'payment-received'
      ) {
        return (
          <View style={xStyles.iconCircleGreen}>
            <FontAwesome5
              color={CSS.Colors.TEXT_WHITE}
              name="check"
              size={ICON_CIRCLE_SIZE * 0.6}
            />
          </View>
        )
      }

      throw new TypeError('Invalid type prop passed in to <TXBase />')
    })()

    const otherName = (() => {
      if (typeof otherDisplayName !== 'string') {
        return 'They'
      }

      if (otherDisplayName.length === 0) {
        return 'They'
      }

      if (otherDisplayName.length > 20) {
        return 'They'
      }

      return otherDisplayName
    })()

    return (
      <TouchableWithoutFeedback onPress={this.props.onPress}>
        <View style={styles.container}>
          <View style={styles.sheet}>
            <Image source={RES.bLogoSmall} style={styles.bLogo} />

            <Text style={xStyles.sheetText}>
              <Text style={CSS.styles.fontMontserratBold}>
                {outgoing ? 'You' : otherName}
              </Text>

              <Text>
                {(() => {
                  if (
                    type === 'invoice' ||
                    type === 'invoice-err' ||
                    type === 'invoice-settled' ||
                    type === 'invoice-unk' ||
                    type === 'invoice-settling'
                  ) {
                    return outgoing ? ` sent an ` : ` sent you an `
                  }

                  if (type === 'payment-received') {
                    return ` sent you a `
                  }

                  if (type === 'payment-sending') {
                    return ' are sending a '
                  }

                  if (type === 'payment-sent' || type === 'payment-err') {
                    return ' sent a '
                  }

                  throw new Error(
                    `Please pass correct type prop to <TXBase />, got: ${type}`,
                  )
                })()}
              </Text>

              <Text style={CSS.styles.fontMontserratBold}>
                {type.indexOf('invoice') === 0 ? 'Invoice' : 'Payment'}
              </Text>
            </Text>

            {indicator}
          </View>

          <Pad amount={INSIDE_PAD} insideRow />

          <View style={xStyles.overview}>
            <View>
              <Pad amount={14} />

              <Text style={xStyles.timestamp}>
                {moment(timestamp).format('hh:mm')}
              </Text>

              {typeof amt === 'number' && (
                <Text style={xStyles.amt}>{`${amt.toString()} Sats`}</Text>
              )}

              {type !== 'invoice-settling' && type !== 'payment-sending' && (
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={2}
                  style={xStyles.preimage}
                >
                  {preimage}
                </Text>
              )}
            </View>

            <Text
              onPress={this.props.onPressDetails}
              style={styles.detailsTextLink}
            >
              Details >
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const CONTAINER_H_PAD = CSS.WIDTH * 0.043

const CONTAINER_WIDTH = CSS.WIDTH * 0.65
const CONTAINER_HEIGHT = CONTAINER_WIDTH * 0.67

const SHEET_W = CSS.WIDTH * 0.24
const SHEET_H_PAD = SHEET_W * 0.2
const SHEET_V_PAD = 20

const ICON_CIRCLE_SIZE = SHEET_W * 0.35

const INSIDE_PAD = CONTAINER_WIDTH * 0.09

const styles = StyleSheet.create({
  bLogo: {
    height: CSS.HEIGHT * 0.052,
    width: CSS.WIDTH * 0.085,
  },

  container: {
    height: CONTAINER_HEIGHT,
    width: CONTAINER_WIDTH,

    backgroundColor: CSS.Colors.GRAY_LIGHTEST,
    borderRadius: 14,

    alignItems: 'center',
    flexDirection: 'row',

    paddingTop: CONTAINER_HEIGHT * 0.1,
    paddingBottom: CONTAINER_HEIGHT * 0.15,
    paddingLeft: CONTAINER_H_PAD,
    paddingRight: CONTAINER_H_PAD,
  },

  detailsTextLink: {
    color: CSS.Colors.BLUE_MEDIUM_DARK,
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },

  iconCircleBase: {
    borderRadius: ICON_CIRCLE_SIZE / 2,

    height: ICON_CIRCLE_SIZE,
    width: ICON_CIRCLE_SIZE,

    position: 'absolute',

    top: -(ICON_CIRCLE_SIZE / 4),
    right: -(ICON_CIRCLE_SIZE / 4),

    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewTextBase: {
    color: CSS.Colors.TEXT_GRAY,
    marginTop: 1,
    marginBottom: 1,
  },

  sheet: {
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,

    elevation: 16,

    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,

    paddingLeft: SHEET_H_PAD,
    paddingRight: SHEET_H_PAD,

    paddingBottom: SHEET_V_PAD,
    paddingTop: SHEET_V_PAD,

    height: '100%',
    width: SHEET_W,
  },
})

const xStyles = {
  amt: [
    styles.overviewTextBase,
    CSS.styles.fontMontserratBold,
    CSS.styles.fontSize16,
  ],

  iconCircleGreen: [styles.iconCircleBase, CSS.styles.backgroundGreen],
  iconCircleOrange: [styles.iconCircleBase, CSS.styles.backgroundOrange],
  iconCircleRed: [styles.iconCircleBase, CSS.styles.backgroundOrange],

  overview: [
    CSS.styles.justifySpaceBetween,
    CSS.styles.height100,
    // needed fpr text ellipsis wrap
    CSS.styles.flex,
  ],

  preimage: [
    styles.overviewTextBase,
    CSS.styles.fontMontserrat,
    CSS.styles.fontSize10,
  ],

  sheetText: [
    CSS.styles.fontMontserrat,
    CSS.styles.fontSize9,
    CSS.styles.textAlignCenter,
    CSS.styles.textGray,
  ],

  timestamp: [
    styles.overviewTextBase,
    CSS.styles.fontMontserrat,
    CSS.styles.fontSize11,
  ],
}
