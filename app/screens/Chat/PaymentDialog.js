import React from 'react'
import { Text, ActivityIndicator } from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'

import { Actions } from '../../services/contact-api'

import { Colors } from '../../res/css'

import BasicDialog from '../../components/BasicDialog'
import ShockInput from '../../components/ShockInput'
import Pad from '../../components/Pad'
import ShockButton from '../../components/ShockButton'

/**
 * @typedef {object} Props
 * @prop {string} recipientPublicKey
 */

/**
 * @typedef {object} State
 * @prop {number} amount
 * @prop {string} memo
 * @prop {string} err
 * @prop {'processing'|'result'|'input'|'closed'} state
 */

/**
 * @augments React.Component<Props, State>
 */
export default class PaymentDialog extends React.Component {
  /** @type {State} */
  state = {
    amount: 0,
    memo: '',
    err: '',
    state: 'closed',
  }

  //////////////////////////////////////////////////////////////////////////////

  open = () => {
    this.setState({
      state: 'input',
    })
  }

  close = () => {
    this.setState({
      amount: 0,
      memo: '',
      err: '',
      state: 'closed',
    })
  }

  onRequestClose = () => {
    if (this.state.state !== 'processing') {
      this.close()
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  /**
   * @type {import('../../components/ShockInput').Props['onChangeText']}
   */
  onChangeAmount = amount => {
    const numbers = '0123456789'.split('')

    const chars = amount.split('')

    if (!chars.every(c => numbers.includes(c))) {
      return
    }

    this.setState({
      amount: Number(amount),
    })
  }

  /**
   * @type {import('../../components/ShockInput').Props['onChangeText']}
   */
  onChangeMemo = memo => {
    this.setState({
      memo,
    })
  }

  //////////////////////////////////////////////////////////////////////////////

  onPressSend = async () => {
    this.setState({
      state: 'processing',
    })

    try {
      await Actions.sendPayment(
        this.props.recipientPublicKey,
        this.state.amount,
        this.state.memo,
      )

      this.setState({
        state: 'result',
      })
    } catch (err) {
      this.setState({
        err: err.message,
        state: 'result',
      })
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  render() {
    const { amount, memo, err, state } = this.state

    return (
      <BasicDialog
        title="Send Money"
        onRequestClose={this.onRequestClose}
        visible={state !== 'closed'}
      >
        {(() => {
          if (err) return <Text>{err}</Text>

          switch (state) {
            default:
            case 'closed':
              return null
            case 'input':
              return (
                <>
                  <ShockInput
                    placeholder="Memo (optional)"
                    onChangeText={this.onChangeMemo}
                    value={memo}
                  />

                  <Pad amount={10} />

                  <ShockInput
                    keyboardType="number-pad"
                    onChangeText={this.onChangeAmount}
                    placeholder="Amount (in sats)"
                    value={
                      amount === 0
                        ? undefined // allow placeholder to show
                        : amount.toString()
                    }
                  />
                </>
              )

            case 'processing':
              return <ActivityIndicator />

            case 'result':
              return (
                <Entypo size={22} color={Colors.SUCCESS_GREEN} name="check" />
              )
          }
        })()}

        {state !== 'processing' && (
          <>
            <Pad amount={10} />
            <ShockButton
              onPress={state === 'input' ? this.onPressSend : this.close}
              title={state === 'input' ? 'Send' : 'Ok'}
            />
          </>
        )}
      </BasicDialog>
    )
  }
}
