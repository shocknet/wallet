/**
 * @format
 */
import React, { Component } from 'react'
import {
  // Clipboard,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native'
import EntypoIcons from 'react-native-vector-icons/Entypo'
import Feather from 'react-native-vector-icons/Feather'
import Http from 'axios'
import Big from 'big.js'
import { connect } from 'react-redux'
import wavesBG from '../../assets/images/waves-bg.png'

import * as CSS from '../../res/css'
import * as Cache from '../../services/cache'
import BasicDialog from '../../components/BasicDialog'
import ShockInput from '../../components/ShockInput'
import IGDialogBtn from '../../components/IGDialogBtn'
import Pad from '../../components/Pad'
import ShockDialog from '../../components/ShockDialog'
import Nav from '../../components/Nav'

import AccordionItem from './Accordion'
import Transaction from './Accordion/Transaction'
import Channel from './Accordion/Channel'
// import Invoice from './Accordion/Invoice'
import Peer from './Accordion/Peer'
import InfoModal from './InfoModal'
// import { Icon } from 'react-native-elements'
import {
  fetchChannels,
  fetchInvoices,
  fetchPayments,
  fetchPeers,
  fetchTransactions,
  fetchHistory,
} from '../../actions/HistoryActions'
import { fetchNodeInfo } from '../../actions/NodeActions'
export const ADVANCED_SCREEN = 'ADVANCED_SCREEN'

/**
 * @typedef {object} Accordions
 * @prop {boolean} transactions
 * @prop {boolean} peers
 * @prop {boolean} invoices
 * @prop {boolean} channels
 */

/**
 * @typedef {object} ChannelPoint
 * @prop {string} fundingTX
 * @prop {string} outputIndex
 */

/**
 * @typedef {object} State
 * @prop {Accordions} accordions
 * @prop {boolean} addPeerOpen
 * @prop {boolean} addChannelOpen: false,
 * @prop {string} peerPublicKey
 * @prop {string} host
 * @prop {string} channelPublicKey
 * @prop {string} channelCapacity
 * @prop {string} channelPushAmount
 * @prop {string} err
 * @prop {ChannelPoint|null} willCloseChannelPoint
 *
 * @prop {boolean} nodeInfoModal
 */

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @typedef {object} Props
 */

/**
 * @augments React.Component<ConnectedRedux & Props, State, never>
 */
class AdvancedScreen extends Component {
  /** @type {State} */
  state = {
    accordions: {
      transactions: true,
      peers: false,
      invoices: false,
      channels: false,
    },
    addPeerOpen: false,
    addChannelOpen: false,
    peerPublicKey: '',
    host: '',
    channelPublicKey: '',
    channelCapacity: '',
    channelPushAmount: '',
    err: '',
    willCloseChannelPoint: null,

    nodeInfoModal: false,
  }

  componentDidMount() {
    this.fetchData()
  }

  convertBTCToUSD = () => {
    const { confirmedBalance, channelBalance, USDRate } = this.props.wallet
    if (USDRate !== null) {
      const parsedConfirmedBalance = new Big(confirmedBalance)
      const parsedChannelBalance = new Big(channelBalance)
      const parsedUSDRate = new Big(USDRate)
      const satoshiUnit = new Big(0.00000001)
      const confirmedBalanceUSD = parsedConfirmedBalance
        .times(satoshiUnit)
        .times(parsedUSDRate)
        .toFixed(2)
      const channelBalanceUSD = parsedChannelBalance
        .times(satoshiUnit)
        .times(parsedUSDRate)
        .toFixed(2)

      return {
        confirmedBalanceUSD,
        channelBalanceUSD,
      }
    }

    return {
      confirmedBalanceUSD: '0',
      channelBalanceUSD: '0',
    }
  }

  fetchData = async () => {
    try {
      const { fetchHistory, fetchNodeInfo } = this.props
      await Promise.all([fetchHistory(), fetchNodeInfo()])
      return true
    } catch (err) {
      console.error(err.response)
      throw err
    }
  }

  /**
   * @param {keyof Accordions} name
   */
  toggleAccordion = name => () => {
    const { accordions } = this.state
    if (!(name in accordions)) {
      throw new Error(
        '<AdvancedScreen /> -> toggleAccordion -> invalid accordion name  ',
      )
    }
    const updatedAccordions = { ...accordions }

    for (const key of Object.keys(updatedAccordions)) {
      // @ts-ignore
      updatedAccordions[key] = key === name
    }

    this.setState({
      accordions: updatedAccordions,
    })
  }

  toggleChannelsAccordion = () => {
    this.toggleAccordion('channels')
  }

  togglePeerAccordion = () => {
    this.toggleAccordion('peers')
  }

  /**
   * @param {number} ms
   */
  wait = ms =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve(true)
      }, ms)
    })

  /**
   *
   * @param {string} routeName
   */
  fetchNextPage = routeName => () => {
    const {
      history,
      fetchInvoices,
      fetchPayments,
      fetchTransactions,
    } = this.props
    const currentData = history[routeName]

    if (routeName === 'invoices') {
      fetchInvoices({ page: currentData.page + 1 })
    }

    if (routeName === 'payments') {
      fetchPayments({ page: currentData.page + 1 })
    }

    if (routeName === 'transactions') {
      fetchTransactions({ page: currentData.page + 1 })
    }
  }

  /**
   * @param {'peerPublicKey'|'host'|'channelPublicKey'|'channelPushAmount'|'channelCapacity'} key
   * @param {string} value
   */
  handleInputChange = (key, value) => {
    // @ts-ignore
    this.setState({
      [key]: value,
    })
  }

  addPeer = async () => {
    try {
      const { peerPublicKey, host } = this.state
      const { fetchPeers } = this.props
      this.setState({
        addPeerOpen: false,
        peerPublicKey: '',
        host: '',
      })

      const token = await Cache.getToken()

      const res = await Http.post(
        `/api/lnd/connectpeer`,
        {
          host,
          pubkey: peerPublicKey,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      )

      if (res.status !== 200) {
        throw new Error(res.data.errorMessage || 'Unknown error.')
      }

      ToastAndroid.show('Added successfully', 800)

      fetchPeers()
    } catch (err) {
      this.showErr(err.message)
      console.error(Http.defaults.baseURL, err.response)
    } finally {
      this.setState({
        host: '',
        peerPublicKey: '',
      })
    }
  }

  addChannel = async () => {
    try {
      const {
        channelPublicKey,
        channelCapacity,
        channelPushAmount,
      } = this.state
      const { fetchChannels } = this.props

      this.setState({
        addChannelOpen: false,
        channelPublicKey: '',
        channelCapacity: '',
        channelPushAmount: '',
      })

      const res = await Http.post(`/api/lnd/openchannel`, {
        pubkey: channelPublicKey,
        channelCapacity,
        channelPushAmount,
      })

      if (res.status !== 200) {
        throw new Error(res.data.errorMessage || 'Unknown error.')
      }

      ToastAndroid.show('Added successfully', 800)

      fetchChannels()
    } catch (err) {
      this.setState({
        addChannelOpen: false,
      })

      this.showErr(err.message)
    } finally {
      this.setState({
        addChannelOpen: false,
        channelPublicKey: '',
        channelCapacity: '',
        channelPushAmount: '',
      })
    }
  }

  /**
   * @param {ChannelPoint} channelPoint
   */
  willCloseChannel = channelPoint => {
    this.setState({
      willCloseChannelPoint: channelPoint,
    })
  }

  /**
   * @param {string} err
   */
  showErr = err => {
    this.setState({
      err,
    })
  }

  dismissErr = () => {
    this.setState({
      err: '',
    })
  }

  openNodeInfo = () => {
    this.setState({
      nodeInfoModal: true,
    })
  }

  closeNodeInfo = () => {
    this.setState({
      nodeInfoModal: false,
    })
  }

  /**
   * @param {string} pubKey
   */
  openChannelPeer = pubKey => {
    this.setState({
      addChannelOpen: true,
      channelPublicKey: pubKey,
    })
  }

  closeCloseChannelDialog = () => {
    this.setState({
      willCloseChannelPoint: null,
    })
  }

  /**
   * @param {string} channelPoint
   */
  onPressChannel = channelPoint => {
    const [fundingTX, outputIndex] = channelPoint.split(':')
    this.willCloseChannel({ fundingTX, outputIndex })
  }

  closeAddChannelDialog = () => {
    this.setState({
      addChannelOpen: false,
    })
  }

  closeAddPeerDialog = () => {
    this.setState({
      addPeerOpen: false,
    })
  }

  /** @param {string} text */
  onChangePeerPublicKey = text => this.handleInputChange('peerPublicKey', text)

  /** @param {string} text */
  onChangeHost = text => this.handleInputChange('host', text)

  /** @param {string} text */
  onChangeChannelPublicKey = text => {
    this.handleInputChange('channelPublicKey', text)
  }

  /** @param {string} text */
  onChangeChannelCapacity = text => {
    this.handleInputChange('channelCapacity', text)
  }

  /** @param {string} text */
  onChangeChannelPushAmount = text => {
    this.handleInputChange('channelPushAmount', text)
  }

  /**
   * @param {import('../../services/wallet').Transaction} transaction
   */
  transactionKeyExtractor = transaction => transaction.tx_hash

  render() {
    const { node, wallet, history, fetchChannels } = this.props
    const {
      accordions,
      addPeerOpen,
      addChannelOpen,
      peerPublicKey,
      channelPublicKey,
      host,
      channelCapacity,
      channelPushAmount,

      willCloseChannelPoint,

      nodeInfoModal,
    } = this.state
    const { confirmedBalanceUSD, channelBalanceUSD } = this.convertBTCToUSD()
    return (
      <View style={styles.container}>
        <InfoModal
          visible={nodeInfoModal}
          info={node.nodeInfo}
          onRequestClose={this.closeNodeInfo}
        />
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <ImageBackground
          source={wavesBG}
          resizeMode="cover"
          style={styles.statsHeader}
        >
          <Nav title="Advanced" style={styles.nav} />
          <View style={styles.statsContainer}>
            <View style={xStyles.channelBalanceContainer}>
              <View style={styles.statIcon}>
                <EntypoIcons name="flash" color="#F5A623" size={20} />
              </View>
              <View>
                <Text style={styles.statTextPrimary}>
                  {wallet.USDRate
                    ? wallet.channelBalance.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
                    : 'Loading...'}{' '}
                  sats
                </Text>
                <Text style={styles.statTextSecondary}>
                  {wallet.USDRate
                    ? channelBalanceUSD.replace(/\d(?=(\d{3})+\.)/g, '$&,')
                    : 'Loading...'}{' '}
                  USD
                </Text>
              </View>
            </View>
            <View style={styles.stat}>
              <View style={styles.statIcon}>
                <EntypoIcons name="link" color="#F5A623" size={20} />
              </View>
              <View>
                <Text style={styles.statTextPrimary}>
                  {wallet.USDRate
                    ? wallet.confirmedBalance.replace(
                        /(\d)(?=(\d{3})+$)/g,
                        '$1,',
                      )
                    : 'Loading...'}{' '}
                  sats
                </Text>
                <Text style={styles.statTextSecondary}>
                  {wallet.USDRate
                    ? confirmedBalanceUSD.replace(/\d(?=(\d{3})+\.)/g, '$&,')
                    : 'Loading...'}{' '}
                  USD
                </Text>
              </View>
            </View>
            <View style={styles.getInfoHolder}>
              {node.nodeInfo !== null ? (
                <TouchableOpacity onPress={this.openNodeInfo}>
                  <View style={styles.centeredRow}>
                    <Text style={styles.getInfoText}>Get Info</Text>
                    <Pad insideRow amount={10} />
                    <Feather
                      name="info"
                      color={CSS.Colors.TEXT_WHITE}
                      size={24}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <Text style={styles.whiteText}>Loading...</Text>
              )}
            </View>
          </View>
        </ImageBackground>
        <View style={styles.accordionsContainer}>
          <AccordionItem
            fetchNextPage={this.fetchNextPage('transactions')}
            data={history.transactions}
            Item={Transaction}
            title="Transactions"
            open={accordions.transactions}
            menuOptions={[
              {
                name: 'Generate',
                icon: 'link',
              },
              {
                name: 'Send',
                icon: 'flash',
              },
            ]}
            toggleAccordion={this.toggleAccordion('transactions')}
            keyExtractor={this.transactionKeyExtractor}
          />
          <AccordionItem
            data={history.peers}
            Item={Peer}
            title="Peers"
            open={accordions.peers}
            menuOptions={[
              {
                name: 'Add Peer',
                icon: 'link',
                action: () => {
                  console.log('addPeerOpen')
                  this.setState({
                    addPeerOpen: true,
                  })
                },
              },
            ]}
            onPressItem={this.openChannelPeer}
            toggleAccordion={this.toggleAccordion('peers')}
            keyExtractor={peerKeyExtractor}
          />
          {/* <AccordionItem
            fetchNextPage={() => this.fetchNextPage('invoices', 'invoices')}
            data={history.invoices}
            Item={Invoice}
            title="Invoices"
            open={accordions['invoices']}
            toggleAccordion={() => this.toggleAccordion('invoices')}
            keyExtractor={inv => inv.r_hash.data.join('-')}
          /> */}
          <AccordionItem
            data={history.channels}
            Item={Channel}
            keyExtractor={channelKeyExtractor}
            title="Channels"
            open={accordions.channels}
            menuOptions={[
              {
                name: 'Add Channel',
                icon: 'link',
                action: () => {
                  this.setState({
                    addChannelOpen: true,
                  })
                },
              },
            ]}
            toggleAccordion={this.toggleAccordion('channels')}
            onPressItem={this.onPressChannel}
            hideBottomBorder
          />
        </View>
        <BasicDialog
          onRequestClose={this.closeAddPeerDialog}
          visible={addPeerOpen}
        >
          <View>
            <ShockInput
              placeholder="Public Key"
              onChangeText={this.onChangePeerPublicKey}
              value={peerPublicKey}
            />

            <Pad amount={10} />

            <ShockInput
              placeholder="Host"
              onChangeText={this.onChangeHost}
              value={host}
            />

            <IGDialogBtn
              disabled={!host || !peerPublicKey}
              onPress={this.addPeer}
              title="Add Peer"
            />
          </View>
        </BasicDialog>
        <BasicDialog
          onRequestClose={this.closeAddChannelDialog}
          visible={addChannelOpen}
        >
          <View>
            <ShockInput
              placeholder="Public Key"
              onChangeText={this.onChangeChannelPublicKey}
              value={channelPublicKey}
            />

            <ShockInput
              placeholder="Channel Capacity"
              keyboardType="number-pad"
              onChangeText={this.onChangeChannelCapacity}
              value={channelCapacity}
            />

            <ShockInput
              placeholder="Push Amount"
              keyboardType="number-pad"
              onChangeText={this.onChangeChannelPushAmount}
              value={channelPushAmount}
            />

            <IGDialogBtn
              disabled={
                !channelPublicKey || !channelCapacity || !channelPushAmount
              }
              onPress={this.addChannel}
              title="Add Channel"
            />
          </View>
        </BasicDialog>
        <BasicDialog
          onRequestClose={this.dismissErr}
          visible={!!this.state.err}
        >
          <View>
            <Text>{this.state.err}</Text>
          </View>
        </BasicDialog>

        <ShockDialog
          choiceToHandler={{
            Confirm: async () => {
              this.setState({
                willCloseChannelPoint: null,
              })

              if (willCloseChannelPoint) {
                try {
                  const res = await Http.post(`/api/lnd/closechannel`, {
                    channelPoint: willCloseChannelPoint.fundingTX,
                    outputIndex: willCloseChannelPoint.outputIndex,
                  })

                  if (res.status !== 200) {
                    throw new Error(res.data.errorMessage || 'Unknown error.')
                  }

                  fetchChannels()

                  ToastAndroid.show('Closed successfully', 800)
                } catch (err) {
                  this.showErr(err.message)
                }
              }
            },
            'Go back': this.closeCloseChannelDialog,
          }}
          onRequestClose={this.closeCloseChannelDialog}
          message="Close this channel?"
          visible={!!willCloseChannelPoint}
        />
      </View>
    )
  }
}

/**
 * @param {typeof import('../../../reducers/index').default} state
 */
const mapStateToProps = ({ history, node, wallet }) => ({
  history,
  node,
  wallet,
})

const mapDispatchToProps = {
  fetchChannels,
  fetchInvoices,
  fetchPayments,
  fetchPeers,
  fetchTransactions,
  fetchHistory,
  fetchNodeInfo,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdvancedScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  statsHeader: {
    width: '100%',
    elevation: 1,
    zIndex: 10,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: CSS.Colors.FUN_BLUE,
  },
  marginBottom15: { marginBottom: 15 },
  nav: {
    marginBottom: 25,
  },
  statsContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  stat: {
    flexDirection: 'row',
  },
  statIcon: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: CSS.Colors.BORDER_WHITE,
    borderStyle: 'solid',
  },
  statTextPrimary: {
    color: CSS.Colors.TEXT_WHITE,
    fontSize: 25,
    fontWeight: '900',
  },
  statTextSecondary: {
    color: CSS.Colors.ORANGE,
    fontSize: 14,
  },
  accordionsContainer: {
    width: '100%',
    flex: 1,
  },
  getInfoHolder: {
    alignSelf: 'flex-end',
    textDecorationLine: 'underline',
  },
  centeredRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  getInfoText: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
  },
  whiteText: {
    color: CSS.Colors.TEXT_WHITE,
  },
})

const xStyles = {
  channelBalanceContainer: [styles.stat, styles.marginBottom15],
}

/**
 * @param {import('../../services/wallet').Channel} channel
 */
const channelKeyExtractor = channel => channel.channel_point

/**
 * @param {import('../../services/wallet').Peer} p
 */
const peerKeyExtractor = p => p.pub_key
