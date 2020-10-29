import React from 'react'
import { Image, StyleSheet, Text, ToastAndroid, View } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
// @ts-expect-error
import SwipeVerify from 'react-native-swipe-verify'
import isFinite from 'lodash/isFinite'
import { connect } from 'react-redux'

import * as CSS from '../../res/css'
import DarkModal from '../dark-modal'
import TextInput from '../TextInput'
import BitcoinAccepted from '../../assets/images/bitcoin-accepted.png'
import Pad from '../Pad'
import * as Store from '../../store'

interface OwnProps {
  onRequestClose(): void
  postID: string
  visible: boolean
}

interface StateProps {}

interface DispatchProps {
  tip(postID: string, amount: number): void
}

type Props = OwnProps & StateProps & DispatchProps

interface State {
  tipAmt: string
}

class TipPopup extends React.PureComponent<Props, State> {
  state: State = {
    tipAmt: '',
  }

  onChangeTipAmt = (tipAmt: string) => {
    const numbers = '0123456789'.split('')

    this.setState(() => {
      if (tipAmt.split('').every(char => numbers.includes(char))) {
        return {
          tipAmt,
        }
      }

      return null
    })
  }

  onRequestClose = () => {
    const { onRequestClose } = this.props

    this.setState({ tipAmt: '' }, onRequestClose)
  }

  onSlideToSend = () => {
    const { tipAmt } = this.state

    const asNumber = Number(tipAmt)

    if (!isFinite(asNumber) || asNumber === 0) {
      ToastAndroid.show('Invalid Amt', 800)
      return
    }

    this.props.tip(this.props.postID, asNumber)
    this.onRequestClose()
  }

  render() {
    const { visible } = this.props

    return (
      <DarkModal onRequestClose={this.onRequestClose} visible={visible}>
        <>
          <Text style={styles.tipPopupTitle}>Tip Amount (Sats)</Text>

          <Pad amount={24} />

          <TextInput
            autoFocus
            keyboardType="number-pad"
            onChangeText={this.onChangeTipAmt}
            returnKeyType="done"
            style={styles.tipInput}
            value={this.state.tipAmt.toString()}
          />

          <View style={styles.line} />

          <Pad amount={56} />

          <SwipeVerify
            buttonSize={80}
            height={48}
            backgroundColor="transparent"
            style={styles.swipeBtn}
            buttonColor="#212937"
            borderColor="#4285B9"
            swipeColor={CSS.Colors.GOLD}
            textColor="#EBEBEB"
            borderRadius={100}
            icon={sliderIcon}
            onVerified={this.onSlideToSend}
          >
            {slideToSendText}
          </SwipeVerify>

          <Pad amount={8} />

          <View style={styles.x}>
            <AntDesign
              name="close"
              color={CSS.Colors.DARK_MODE_BORDER_GRAY}
              size={24}
              onPress={this.onRequestClose}
            />
          </View>
        </>
      </DarkModal>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  tipPopupTitle: {
    fontFamily: 'Montserrat-Bold',
    color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
    fontSize: 20,
  },
  tipInput: {
    color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
  },
  line: {
    borderColor: CSS.Colors.DARK_MODE_BORDER_GRAY,
    borderWidth: 0.5,
    width: '80%',
  },
  swipeBtn: {
    backgroundColor: CSS.Colors.DARK_MODE_BORDER_GRAY,
    borderRadius: 60,
    width: '80%',
  },
  btcIconDark: {
    height: 59,
  },
  x: {
    position: 'absolute',
    right: 4,
    top: 4,
  },
})

const slideToSendText = (
  <Text style={CSS.styles.montserratWhite}>SLIDE TO SEND</Text>
)

const sliderIcon = (
  <Image
    source={BitcoinAccepted}
    resizeMethod="resize"
    resizeMode="contain"
    style={styles.btcIconDark}
  />
)

const mapState = null

const mapDispatch = {
  tip: Store.requestedPostTip,
}

const ConnectedTipPopup = connect(
  mapState,
  mapDispatch,
)(TipPopup)

export default ConnectedTipPopup
