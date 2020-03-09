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
  Keyboard,
} from 'react-native'
import EntypoIcons from 'react-native-vector-icons/Entypo'
import Feather from 'react-native-vector-icons/Feather'
import Http from 'axios'
import Big from 'big.js'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'
import wavesBG from '../../assets/images/waves-bg.png'

import * as CSS from '../../res/css'
import Pad from '../../components/Pad'
import Nav from '../../components/Nav'

import AccordionItem from './Accordion'
import Transaction from './Accordion/Transaction'
import Channel from './Accordion/Channel'
// import Invoice from './Accordion/Invoice'
import Peer from './Accordion/Peer'
import InfoModal from './InfoModal'
import AddChannelModal from './Modals/AddChannel'
import InfoChannelModal from './Modals/InfoChannel'
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
import AddPeerModal from './Modals/AddPeer'
import CloseChannelModal from './Modals/CloseChannel'
import ShockDialog from '../../components/ShockDialog'
export const ADVANCED_SCREEN = 'ADVANCED_SCREEN'
/**
 * @typedef {import('../../services/wallet').Channel} ChannelInfo
 */
/**
 * @typedef {object} Accordions
 * @prop {boolean} transactions
 * @prop {boolean} peers
 * @prop {boolean} invoices
 * @prop {boolean} channels
 */

/**
 * @typedef {object} Channel
 * @prop {string} fundingTX
 * @prop {string} outputIndex
 * @prop {string} chan_id
 * @prop {string} local_balance
 * @prop {string} remote_balance
 */

/**
 * @typedef {object} State
 * @prop {Accordions} accordions
 * @prop {string} peerURI
 * @prop {string} channelPublicKey
 * @prop {string} channelCapacity
 * @prop {string} channelPushAmount
 * @prop {string} err
 * @prop {boolean} modalLoading
 * @prop {boolean} keyboardOpen
 * @prop {number} keyboardHeight
 * @prop {Channel|null} willCloseChannelPoint
 *
 * @prop {boolean} nodeInfoModal
 * @prop {boolean} forceCloseChannel
 *
 * @prop {ChannelInfo|null} channelInfo
 * @prop {string|null} confirmCloseChannel
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
      transactions: false,
      peers: false,
      invoices: false,
      channels: true,
    },
    keyboardOpen: false,
    modalLoading: false,
    keyboardHeight: 0,
    peerURI: '',
    channelPublicKey: '',
    channelCapacity: '',
    channelPushAmount: '',
    err: '',
    willCloseChannelPoint: null,

    nodeInfoModal: false,
    forceCloseChannel: false,
    channelInfo: null,
    confirmCloseChannel: null,
  }

  addChannelModal = React.createRef()

  infoChannelModal = React.createRef()

  closeChannelModal = React.createRef()

  addPeerModal = React.createRef()

  /**
   * @param {keyof State} key
   * @returns {(value: any) => void}
   */
  onChange = key => value => {
    this.setState(prevState => ({
      ...prevState,
      [key]: value,
    }))
  }

  componentDidMount() {
    this.fetchData()
    this.keyboardDidShow = Keyboard.addListener('keyboardDidShow', e => {
      Logger.log(e.endCoordinates.height)
      this.setState({
        keyboardOpen: true,
        keyboardHeight: e.endCoordinates.height,
      })
    })
    this.keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      this.setState({
        keyboardOpen: false,
        keyboardHeight: 0,
      })
    })
  }

  componentWillUnmount() {
    if (this.keyboardDidShow) {
      this.keyboardDidShow.remove()
    }

    if (this.keyboardDidHide) {
      this.keyboardDidHide.remove()
    }
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
      Logger.log('[ADVANCED] Data fetch error:', err?.response?.data ?? err)
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
   * @param {'peerURI'|'channelPublicKey'|'channelPushAmount'|'channelCapacity'} key
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
      const { peerURI } = this.state
      const { fetchPeers } = this.props
      const [pubkey, host] = peerURI.split('@')
      this.setState({
        modalLoading: true,
        peerURI: '',
      })

      const res = await Http.post(`/api/lnd/connectpeer`, {
        host,
        pubkey,
      })

      if (res.status !== 200) {
        throw new Error(res.data.errorMessage || 'Unknown error.')
      }

      ToastAndroid.show('Added successfully', 800)

      fetchPeers()
      this.addPeerModal.current.close()
    } catch (err) {
      this.showErr(err.response.data.errorMessage)
      Logger.log(Http.defaults.baseURL, err.response)
    } finally {
      this.setState({
        modalLoading: false,
        peerURI: '',
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
        modalLoading: true,
        channelPublicKey: '',
        channelCapacity: '',
        channelPushAmount: '',
      })

      await Http.post(`/api/lnd/openchannel`, {
        pubkey: channelPublicKey,
        channelCapacity,
        channelPushAmount,
      })

      ToastAndroid.show('Added successfully', 800)

      fetchChannels()

      this.addChannelModal.current.close()
    } catch (err) {
      this.showErr(err.response.data.errorMessage)
    } finally {
      this.setState({
        modalLoading: false,
        channelPublicKey: '',
        channelCapacity: '',
        channelPushAmount: '',
      })
    }
  }

  /**
   * @param {Channel} channel
   */
  willCloseChannel = channel => {
    this.closeChannelModal.current.open()
    this.setState({
      willCloseChannelPoint: channel,
    })
  }

  confirmCloseChannel = () => {
    const { forceCloseChannel } = this.state
    const force = forceCloseChannel ? 'FORCE ' : ''
    this.setState({
      confirmCloseChannel:
        'This action will ' + force + 'close the channel, Are you sure?',
    })
  }

  confirmedCloseChannel = async () => {
    const { willCloseChannelPoint, forceCloseChannel } = this.state
    const { fetchChannels } = this.props
    this.setState({
      willCloseChannelPoint: null,
    })

    if (willCloseChannelPoint) {
      try {
        const res = await Http.post(`/api/lnd/closechannel`, {
          channelPoint: willCloseChannelPoint.fundingTX,
          outputIndex: willCloseChannelPoint.outputIndex,
          force: forceCloseChannel,
        })

        if (res.status !== 200) {
          throw new Error(res.data.errorMessage || 'Unknown error.')
        }
        this.closeChannelModal.current.close()
        fetchChannels()

        ToastAndroid.show('Closed successfully', 800)
      } catch (err) {
        this.showErr(err.response.data.errorMessage)
      }
    }
  }

  /**
   * @param {string} err
   */
  showErr = err => {
    Logger.log('Setting Error message:', err)
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
      channelPublicKey: pubKey,
    })
  }

  closeCloseChannelDialog = () => {
    this.setState({
      confirmCloseChannel: null,
    })
  }

  closeAddChannelModal = () => {
    this.addChannelModal.current.close()
    this.setState({
      modalLoading: true,
      channelPublicKey: '',
      channelCapacity: '',
      channelPushAmount: '',
    })
  }

  closeAddPeerModal = () => {
    this.addPeerModal.current.close()
    this.setState({
      peerURI: '',
    })
  }

  confirmCloseChoices = {
    Confirm: this.confirmedCloseChannel,
    'Go Back': this.closeCloseChannelDialog,
  }

  onPressCloseChannel = () => {
    this.infoChannelModal.current.close()
    const { channelInfo } = this.state
    Logger.log('close channel')
    Logger.log(channelInfo)
    if (channelInfo === null) {
      return
    }
    const channelPoint = channelInfo.channel_point
    const [fundingTX, outputIndex] = channelPoint.split(':')
    this.willCloseChannel({
      fundingTX,
      outputIndex,
      chan_id: channelInfo.chan_id,
      local_balance: channelInfo.local_balance,
      remote_balance: channelInfo.remote_balance,
    })
  }

  /**
   * @param {string} channelString
   *
   */
  onPressChannel = channelString => {
    /**@var {ChannelInfo} channel*/
    const channel = JSON.parse(channelString)
    this.infoChannelModal.current.open()
    this.setState({
      channelInfo: channel,
    })
  }

  closeInfoChannelModal = () => {
    this.infoChannelModal.current.close()
  }

  /** @param {string} text */
  onChangePeerURI = text => this.handleInputChange('peerURI', text)

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
    const { node, wallet, history } = this.props
    const {
      accordions,
      peerURI,
      channelPublicKey,
      channelCapacity,
      channelPushAmount,
      keyboardOpen,
      keyboardHeight,
      modalLoading,
      err,
      forceCloseChannel,
      willCloseChannelPoint,
      channelInfo,

      nodeInfoModal,
      confirmCloseChannel,
    } = this.state
    //Logger.log(history.channels)
    Logger.log(channelPublicKey)
    const { confirmedBalanceUSD, channelBalanceUSD } = this.convertBTCToUSD()
    return (
      <>
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
                      ? wallet.channelBalance.replace(
                          /(\d)(?=(\d{3})+$)/g,
                          '$1,',
                        )
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
                    this.addChannelModal.current.open()
                    this.setState({
                      err: '',
                    })
                  },
                },
              ]}
              toggleAccordion={this.toggleAccordion('channels')}
              onPressItem={this.onPressChannel}
              hideBottomBorder
            />
            <AccordionItem
              fetchNextPage={this.fetchNextPage('transactions')}
              data={history.transactions}
              Item={Transaction}
              title="Transactions"
              open={accordions.transactions}
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
                    Logger.log('addPeerOpen')
                    this.addPeerModal.current.open()
                  },
                },
              ]}
              onPressItem={this.openChannelPeer}
              toggleAccordion={this.toggleAccordion('peers')}
              keyExtractor={peerKeyExtractor}
            />
            {/* 
              <AccordionItem
                fetchNextPage={() => this.fetchNextPage('invoices', 'invoices')}
                data={history.invoices}
                Item={Invoice}
                title="Invoices"
                open={accordions['invoices']}
                toggleAccordion={() => this.toggleAccordion('invoices')}
                keyExtractor={inv => inv.r_hash.data.join('-')}
              /> 
            */}
          </View>
        </View>
        <CloseChannelModal
          modalRef={this.closeChannelModal}
          onChange={this.onChange}
          loading={modalLoading}
          submit={this.confirmCloseChannel}
          error={err}
          keyboardOpen={keyboardOpen}
          keyboardHeight={keyboardHeight}
          forceCloseChannel={forceCloseChannel}
          chanId={willCloseChannelPoint?.chan_id}
          localBalance={willCloseChannelPoint?.local_balance}
          remoteBalance={willCloseChannelPoint?.remote_balance}
        />
        <InfoChannelModal
          modalRef={this.infoChannelModal}
          onChange={this.onChange}
          loading={modalLoading}
          closeChannel={this.onPressCloseChannel}
          submit={this.closeInfoChannelModal}
          error={err}
          keyboardOpen={keyboardOpen}
          keyboardHeight={keyboardHeight}
          channel={channelInfo}
        />
        <AddChannelModal
          modalRef={this.addChannelModal}
          onChange={this.onChange}
          loading={modalLoading}
          channelCapacity={channelCapacity}
          channelPushAmount={channelPushAmount}
          peers={history.peers}
          submit={this.addChannel}
          error={err}
          keyboardOpen={keyboardOpen}
          keyboardHeight={keyboardHeight}
          closeModal={this.closeAddChannelModal}
        />
        <AddPeerModal
          modalRef={this.addPeerModal}
          onChange={this.onChange}
          loading={modalLoading}
          peerURI={peerURI}
          submit={this.addPeer}
          error={err}
          keyboardOpen={keyboardOpen}
          keyboardHeight={keyboardHeight}
          closeModal={this.closeAddPeerModal}
        />
        <ShockDialog
          choiceToHandler={this.confirmCloseChoices}
          onRequestClose={this.closeCloseChannelDialog}
          visible={confirmCloseChannel !== null}
          message={confirmCloseChannel}
        />
      </>
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
const channelKeyExtractor = channel => JSON.stringify(channel) //channel.channel_point

/**
 * @param {import('../../services/wallet').Peer} p
 */
const peerKeyExtractor = p => p.pub_key
