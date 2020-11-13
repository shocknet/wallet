import React from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
// @ts-expect-error
import SwipeVerify from 'react-native-swipe-verify'
import isFinite from 'lodash/isFinite'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'

import * as CSS from '../../res/css'
import DarkModal from '../dark-modal'
import TextInput from '../TextInput'
import BitcoinAccepted from '../../assets/images/bitcoin-accepted.png'
import Pad from '../Pad'
import * as Store from '../../store'
import * as Services from '../../services'

interface OwnProps {
  onRequestClose(): void
  postID: string
  visible: boolean
}

interface StateProps {
  authorPublicKey: string
  absoluteFee: string
  relativeFee: string
}

interface DispatchProps {
  forcePaymentsRefresh(): void
}

type Props = OwnProps & StateProps & DispatchProps

interface State {
  tipAmt: string
  tipping: boolean
  justTipped: boolean
}

class TipPopup extends React.PureComponent<Props, State> {
  state: State = {
    tipAmt: '',
    tipping: false,
    justTipped: false,
  }

  mounted = false

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
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

    this.setState(
      { tipAmt: '', tipping: false, justTipped: false },
      onRequestClose,
    )
  }

  onSlideToSend = () => {
    const { absoluteFee, relativeFee } = this.props
    const { tipAmt } = this.state

    const asNumber = Number(tipAmt)

    if (!isFinite(asNumber) || asNumber === 0) {
      ToastAndroid.show('Invalid Amt', 800)
      return
    }

    this.setState(
      {
        tipping: true,
      },
      () => {
        const { authorPublicKey, postID } = this.props
        const { tipAmt } = this.state

        Services.tipPost(
          authorPublicKey,
          postID,
          Number(tipAmt),
          absoluteFee,
          relativeFee,
        )
          .then(() => {
            this.props.forcePaymentsRefresh()
            if (this.mounted) {
              this.setState({
                tipping: false,
                justTipped: true,
              })
            } else {
              ToastAndroid.show('Tipped post!', 800)
            }
          })
          .catch(e => {
            if (this.mounted) {
              this.onRequestClose()
            }
            Logger.log(
              `Could not tip post: ${postID} by author: ${authorPublicKey} with amount: ${tipAmt} because: ${e.message}`,
            )
            ToastAndroid.show('Could not tip post: ' + e.message, 800)
          })
      },
    )
  }

  renderOnInput() {
    return (
      <>
        <Text style={styles.tipPopupTitle}>Tip Amount (Sats)</Text>

        <Pad amount={24} />

        <TextInput
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
      </>
    )
  }

  render() {
    const { visible } = this.props
    const { justTipped, tipping } = this.state

    return (
      <DarkModal onRequestClose={this.onRequestClose} visible={visible}>
        <>
          {(() => {
            if (justTipped) {
              return (
                <AntDesign
                  size={48}
                  name="checkcircleo"
                  color={CSS.Colors.DARK_MODE_CYAN}
                />
              )
            }

            if (tipping) {
              return (
                <ActivityIndicator
                  color={CSS.Colors.DARK_MODE_CYAN}
                  size="large"
                />
              )
            }

            return this.renderOnInput()
          })()}

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
    // make it easier to touch
    textAlign: 'center',
    width: '100%',
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

const mapState = (state: Store.State, props: OwnProps): StateProps => {
  const post = Store.getPost(state, props.postID)
  const { absoluteFee, relativeFee } = Store.selectFees(state)

  if (!post) {
    Logger.log(`Could not find post via postID in TipPopup->connect`)
    return {
      authorPublicKey: '',
      absoluteFee,
      relativeFee,
    }
  }

  return {
    authorPublicKey: post.author,
    absoluteFee,
    relativeFee,
  }
}

const mapDispatch = {
  forcePaymentsRefresh: Store.paymentsRefreshForced,
}

const ConnectedTipPopup = connect(
  mapState,
  mapDispatch,
)(TipPopup)

export default ConnectedTipPopup
