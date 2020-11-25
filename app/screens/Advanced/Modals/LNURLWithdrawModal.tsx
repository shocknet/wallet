import React from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'
import Logger from 'react-native-file-log'
import MemoizedDarkModal from '../../../components/dark-modal'
import Pad from '../../../components/Pad'
import ShockButton from '../../../components/ShockButton'
import { addInvoice } from '../../../services/wallet'
import ShockInput from '../../../components/ShockInput'
import * as CSS from '../../../res/css'

export type LNURLdataType = {
  tag: string
  uri: string
  metadata: string
  callback: string
  minSendable: number
  maxSendable: number
  maxWithdrawable: number
  shockPubKey: string
  k1: string
}

type Props = {
  onClose: () => void
  visible: boolean
  LNURLdata?: LNURLdataType
}

type State = {
  didChange: boolean
  loading: boolean
  done: string | null
  error: string | null
  hasMemo: boolean
  memo: string
  withdrawAmount: number
}

class LNURLWithdrawModal extends React.PureComponent<Props, State> {
  state: State = {
    withdrawAmount: 0,
    didChange: false,
    done: null,
    error: null,
    loading: false,
    hasMemo: false,
    memo: '',
  }

  setWithdrawAmount = (text: string) => {
    this.setState({
      withdrawAmount: Number(text),
      didChange: true,
    })
  }

  setHasMemo = (bool: boolean) => {
    this.setState({
      hasMemo: bool,
    })
  }

  setMemo = (text: string) => {
    this.setState({
      memo: text,
    })
  }

  confirmWithdrawReq = async () => {
    try {
      if (!this.props.LNURLdata) {
        return
      }
      this.setState({ loading: true })
      const { callback, k1 } = this.props.LNURLdata
      const payReq = await addInvoice({
        value: this.state.withdrawAmount,
        memo: this.state.memo,
        expiry: 1800,
      })
      const completeUrl = `${callback}?k1=${k1}&pr=${payReq.payment_request}`
      Logger.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      Logger.log(json)
      if (json.status === 'OK') {
        this.setState({
          done: 'Withdraw request sent correctly',
          loading: false,
        })
        setTimeout(this.props.onClose, 1000)
      } else {
        this.setState({
          error: json.reason,
          loading: false,
        })
      }
    } catch (e) {
      this.setState({
        error: e,
        loading: false,
      })
    }
  }

  renderContent() {
    if (this.state.done) {
      return (
        <View>
          <Text style={styles.textWhite}>{this.state.done}</Text>
        </View>
      )
    }
    if (this.state.error) {
      return (
        <View>
          <Text style={styles.textWhite}>{this.state.error}</Text>
        </View>
      )
    }
    const { LNURLdata } = this.props
    if (!LNURLdata) {
      return null
    }
    const { withdrawAmount, didChange, hasMemo, memo } = this.state
    let withdrawal = withdrawAmount
    if (!didChange) {
      withdrawal = LNURLdata.maxWithdrawable / 1000
    }
    return (
      <View>
        <Text style={styles.bigBold}>LNURL Withdraw Request </Text>
        <Pad amount={10} />
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>Max</Text> Withdrawable:
        </Text>
        <Text style={styles.selfCenter}>
          {' '}
          <Text style={CSS.styles.textBold}>
            {LNURLdata.maxWithdrawable / 1000}
          </Text>{' '}
          Satoshi
        </Text>
        <Pad amount={10} />
        <ShockInput
          keyboardType="numeric"
          onChangeText={this.setWithdrawAmount}
          value={withdrawal.toString()}
        />
        <View style={styles.switch}>
          <Text>add Memo</Text>
          <Switch value={hasMemo} onValueChange={this.setHasMemo} />
        </View>
        {hasMemo && (
          <ShockInput onChangeText={this.setMemo} value={memo} multiline />
        )}
        <Pad amount={10} />
        <ShockButton onPress={this.confirmWithdrawReq} title="RECEIVE" />
      </View>
    )
  }

  render() {
    const { onClose, visible } = this.props
    return (
      <MemoizedDarkModal onRequestClose={onClose} visible={visible}>
        {this.renderContent()}
      </MemoizedDarkModal>
    )
  }
}
/*
type ReducerState = import('../../../store/reducers/HistoryReducer').State
const mapStateToProps = ({ history }:{history:ReducerState}) => ({ history })

const mapDispatchToProps = {
  fetchPeers,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LNURLWithdrawModal)*/
export default LNURLWithdrawModal

const styles = StyleSheet.create({
  textWhite: {
    color: 'white',
  },
  bigBold: {
    fontWeight: 'bold',
    fontSize: 24,
    color: 'white',
  },
  selfCenter: {
    alignSelf: 'center',
    color: 'white',
  },
  flexCenter: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerBold: {
    alignSelf: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
})
