import React from 'react'
import { View, ToastAndroid } from 'react-native'
import { Button, Text } from 'react-native-elements'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import Logger from 'react-native-file-log'

import * as Store from '../../store'
import * as Actions from '../actions'
import * as Thunks from '../thunks'
import PaymentDialog from '../components/PaymentDialog'

interface OwnProps {
  recipientsPublicKey: string
}

interface StateProps {
  lastAmount: number | null
  state: 'processing' | 'wentThrough' | 'err'
  lastError: string
}

interface DispatchProps {
  onSend(amount: number, memo: string): void
}

type Props = OwnProps & StateProps & DispatchProps

export class TipBtn extends React.PureComponent<Props> {
  payDialog: React.RefObject<PaymentDialog> = React.createRef()

  openSendPaymentDialog = () => {
    const { current } = this.payDialog

    current && current.open()
  }

  onPress = () => {
    if (this.props.state == 'processing') {
      return
    }

    this.openSendPaymentDialog()
  }

  onPressSendPayment = (amount: number, memo: string) => {
    this.props.onSend(amount, memo)
  }

  onPressLastTip = () => {
    if (this.props.state === 'err') {
      ToastAndroid.show(this.props.lastError, ToastAndroid.LONG)
    }
  }

  render() {
    const { state, recipientsPublicKey, lastAmount } = this.props

    const title = (() => {
      switch (state) {
        case 'processing':
          return 'Tipping...'
        case 'err':
        case 'wentThrough':
          return 'Tip'
      }
    })()

    return (
      <>
        <View>
          <Button
            onPress={this.onPress}
            title={title}
            disabled={state === 'processing'}
          />
          {lastAmount && (
            <Text
              onPress={this.onPressLastTip}
              style={state === 'err' ? styles.lastTipErr : styles.lastTip}
            >{`Last Tip: ${lastAmount} (Tap for Details)`}</Text>
          )}
        </View>

        <PaymentDialog
          recipientPublicKey={recipientsPublicKey}
          ref={this.payDialog}
          onPressSend={this.onPressSendPayment}
        />
      </>
    )
  }
}

const styles = {
  lastTip: {},
  lastTipErr: {
    color: 'red',
  },
}

const mapState = (state: Store.State, ownProps: OwnProps): StateProps => {
  const stateProps: StateProps = {
    lastAmount: null,
    lastError: '',
    state: 'wentThrough',
  }

  try {
    const tipOrUndef = state.tips[ownProps.recipientsPublicKey]

    if (tipOrUndef) {
      stateProps.lastAmount = tipOrUndef.amount
      stateProps.lastError = tipOrUndef.lastErr
      stateProps.state = tipOrUndef.state
    }
  } catch (err) {
    Logger.log(`TipBtn -> mapState -> ${err.message}`)
  } finally {
    return stateProps
  }
}

const mapDispatch = (
  dispatch: Dispatch<Actions.Action>,
  ownProps: OwnProps,
): DispatchProps => ({
  onSend(amount: number, memo: string) {
    // @ts-expect-error
    dispatch(Thunks.tip(amount, ownProps.recipientsPublicKey, memo))
  },
})

export default connect(
  mapState,
  mapDispatch,
)(TipBtn)
