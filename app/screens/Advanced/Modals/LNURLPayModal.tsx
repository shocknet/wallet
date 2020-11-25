import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Logger from 'react-native-file-log'
import MemoizedDarkModal from '../../../components/dark-modal'
import Pad from '../../../components/Pad'
import ShockButton from '../../../components/ShockButton'
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
  payData: (request: string) => void
}

type State = {
  payAmount: number
  didChange: boolean
  loading: boolean
  done: string | null
  error: string | null
}

class LNURLPayModal extends React.PureComponent<Props, State> {
  state: State = {
    didChange: false,
    done: null,
    error: null,
    loading: false,
    payAmount: 0,
  }

  setPayAmount = (text: string) => {
    this.setState({
      payAmount: Number(text),
      didChange: true,
    })
  }

  confirmPayReq = async () => {
    try {
      if (!this.props.LNURLdata) {
        return
      }
      this.setState({ loading: true })
      const { callback } = this.props.LNURLdata
      const { payAmount } = this.state
      const completeUrl = `${callback}?amount=${payAmount * 1000}`
      Logger.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      Logger.log(json)
      if (json.status === 'ERROR') {
        this.setState({
          error: json.reason,
          loading: false,
        })
        return
      }
      this.setState({ loading: false })
      Logger.log(json.pr)
      this.props.payData(json.pr)
      this.props.onClose()
      /*this.props.navigation.navigate(SEND_SCREEN, {
        isRedirect: true,
        data: { type: 'ln', request: json.pr },
      })*/
      //this.props.requestClose()
      //this.props.payInvoice({ invoice: json.pr })
    } catch (e) {
      Logger.log(e)
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
    const { payAmount, didChange } = this.state
    let pay = payAmount
    if (!didChange && LNURLdata.minSendable === LNURLdata.maxSendable) {
      pay = LNURLdata.minSendable / 1000
    }
    return (
      <View>
        <Text style={styles.bigBold}>LNURL Pay Request </Text>
        <Pad amount={10} />
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>Min </Text>
          Sendable :
        </Text>
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>
            {LNURLdata.minSendable / 1000}{' '}
          </Text>
          Satoshi
        </Text>
        <Pad amount={10} />

        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>Max </Text>
          Sendable :
        </Text>
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>
            {LNURLdata.maxSendable / 1000}{' '}
          </Text>
          Satoshi
        </Text>

        <Pad amount={10} />

        <ShockInput
          keyboardType="numeric"
          onChangeText={this.setPayAmount}
          value={pay.toString()}
        />

        <Pad amount={10} />
        <ShockButton onPress={this.confirmPayReq} title="SEND" />
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
)(LNURLPayModal)*/
export default LNURLPayModal

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
