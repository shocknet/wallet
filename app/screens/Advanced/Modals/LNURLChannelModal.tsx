import React from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'
import Logger from 'react-native-file-log'
import { connect } from 'react-redux'
import MemoizedDarkModal from '../../../components/dark-modal'
import Pad from '../../../components/Pad'
import ShockButton from '../../../components/ShockButton'
import { fetchPeers } from '../../../store/actions/HistoryActions'
import { nodeInfo, addPeer } from '../../../services/wallet'

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
  fetchPeers: () => void
  history: import('../../../store/reducers/HistoryReducer').State
}

type State = {
  privateChannel: boolean
  loading: boolean
  done: string | null
  error: string | null
}

class LNURLChannelModal extends React.PureComponent<Props, State> {
  state: State = {
    privateChannel: true,
    loading: false,
    done: null,
    error: null,
  }

  setPrivate = (bool: boolean) => {
    this.setState({
      privateChannel: bool,
    })
  }

  confirmChannelReq = async () => {
    if (!this.props.LNURLdata) {
      return
    }
    this.setState({ loading: true })
    const { uri, callback, k1 } = this.props.LNURLdata
    let newK1 = k1
    if (k1 === 'gun' && this.props.LNURLdata.shockPubKey) {
      newK1 = `$$__SHOCKWALLET__USER__${this.props.LNURLdata.shockPubKey}`
    }
    const samePeer = (e: { pub_key: string; address: string }) => {
      const localUri = `${e.pub_key}@${e.address}`
      return localUri === uri
    }
    if (this.props.history.peers.length === 0) {
      await this.props.fetchPeers()
    }
    try {
      const alreadyPeer = this.props.history.peers.find(samePeer)
      if (!alreadyPeer) {
        try {
          await addPeer(uri)
        } catch (e) {
          if (!e.toString().contains('already connected to peer')) {
            throw new Error(e)
          }
        }
      }
      const node = await nodeInfo()
      //Logger.log(node)

      const nodeId = node.identity_pubkey
      const priv = this.state.privateChannel ? 1 : 0
      const completeUrl = `${callback}?k1=${newK1}&remoteid=${nodeId}&private=${priv}`
      Logger.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      Logger.log(json)
      if (json.status === 'OK') {
        this.setState({
          done: 'Channel request sent correctly',
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
      Logger.log(e)
      this.setState({
        error: e.toString(),
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

    const { privateChannel } = this.state
    return (
      <View>
        <Text style={styles.bigBold}>LNURL Channel Request</Text>
        <Pad amount={10} />
        <Text style={styles.selfCenter}>Requesting channel from:</Text>
        <Text style={styles.centerBold}>
          {LNURLdata.uri ? LNURLdata.uri : 'ADDRESS NOT FOUND'}
        </Text>
        <View style={styles.switch}>
          <Text style={styles.textWhite}>Private Channel</Text>
          <Switch value={privateChannel} onValueChange={this.setPrivate} />
        </View>
        <Pad amount={10} />
        <ShockButton onPress={this.confirmChannelReq} title="CONNECT" />
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

type ReducerState = import('../../../store/reducers/HistoryReducer').State
const mapStateToProps = ({ history }: { history: ReducerState }) => ({
  history,
})

const mapDispatchToProps = {
  fetchPeers,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LNURLChannelModal)
//export default LNURLChannelModal

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
