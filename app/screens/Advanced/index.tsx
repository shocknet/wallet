import React from 'react'
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
  Clipboard,
  EmitterSubscription,
} from 'react-native'
import EntypoIcons from 'react-native-vector-icons/Entypo'
import Feather from 'react-native-vector-icons/Feather'
import Http from 'axios'
import Big from 'big.js'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'
import Modal from 'react-native-modalbox'

import wavesBGDark from '../../assets/images/waves-bg-dark.png'
import * as CSS from '../../res/css'
import Pad from '../../components/Pad'
import Nav from '../../components/Nav'
import {
  fetchChannels,
  fetchPendingChannels,
  fetchInvoices,
  fetchPayments,
  fetchPeers,
  fetchTransactions,
  fetchRecentTransactions,
  fetchHistory,
} from '../../store/actions/HistoryActions'
import { fetchNodeInfo } from '../../store/actions/NodeActions'
import { disconnectPeer } from '../../services/wallet'
import * as Store from '../../store'
import { NODE_INFO } from '../node-info'

import AccordionItem from './Accordion'
import Transaction from './Accordion/Transaction'
import Channel from './Accordion/Channel'
import Peer from './Accordion/Peer'
import InfoModal from './InfoModal'
import AddChannelModal from './Modals/AddChannel'
import InfoChannelModal from './Modals/InfoChannel'
import AddPeerModal from './Modals/AddPeer'
import CloseChannelModal from './Modals/CloseChannel'
import ShockDialog from '../../components/ShockDialog'
import InfoPeerModal from './Modals/infoPeer'
import { WALLET_OVERVIEW } from '../WalletOverview'
import { NavigationEventSubscription } from 'react-navigation'

export const ADVANCED_SCREEN = 'ADVANCED_SCREEN'

type Channel = import('../../services/wallet').Channel
type PendingChannel = import('../../services/wallet').PendingChannel

interface Accordions {
  transactions: boolean
  peers: boolean
  invoices: boolean
  channels: boolean
}

interface ChannelParsed {
  fundingTX: string
  outputIndex: string
  chan_id: string
  local_balance: string
  remote_balance: string
}

export interface State {
  accordions: Accordions
  peerURI: string
  channelPublicKey: string
  channelCapacity: string
  channelPushAmount: string
  err: string
  modalLoading: boolean
  keyboardOpen: boolean
  keyboardHeight: number
  willCloseChannelPoint: ChannelParsed | null
  nodeInfoModal: boolean
  forceCloseChannel: boolean
  channelInfo: Channel
  peerInfo: { pubKey: string }
  confirmCloseChannel: boolean
  confirmCloseChannelText: string
  refreshingChannels: boolean
  refreshingTransactions: boolean
}

type ConnectedRedux = ReturnType<typeof mapStateToProps>

interface PageToFetch {
  page?: number
  itemsPerPage?: number
  reset?: boolean
}

type Navigation = import('react-navigation').NavigationScreenProp<{}>
interface TmpProps {
  fetchChannels: () => void
  fetchPendingChannels: () => void
  fetchInvoices: (invoice: PageToFetch) => void
  fetchPayments: (payment: PageToFetch) => void
  fetchPeers: () => void
  fetchTransactions: (transaction: PageToFetch) => void
  fetchRecentTransactions: () => void
  fetchHistory: () => void
  fetchNodeInfo: () => void
  navigation: Navigation
}

type Props = ConnectedRedux & TmpProps

type NavigationStackOptions = import('react-navigation-stack').NavigationStackOptions

class AdvancedScreen extends React.PureComponent<Props, State> {
  static navigationOptions: NavigationStackOptions = {
    header: () => null,
    headerShown: false,
    // drawerIcon: () => {
    //   return <IconDrawerAdvancedLightning />
    // },
  }

  state: State = {
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
    channelInfo: {
      type: 'channel',
      active: false,
      chan_id: '',
      channel_point: '',
      ip: '',
      local_balance: '',
      remote_balance: '',
      remote_pubkey: '',
    },
    peerInfo: {
      pubKey: '',
    },
    confirmCloseChannel: false,
    confirmCloseChannelText: '',
    refreshingChannels: false,
    refreshingTransactions: false,
  }

  backToOverview = () => this.props.navigation.navigate(WALLET_OVERVIEW)

  addChannelModal: React.RefObject<Modal> = React.createRef()

  infoChannelModal: React.RefObject<Modal> = React.createRef()

  closeChannelModal: React.RefObject<Modal> = React.createRef()

  addPeerModal: React.RefObject<Modal> = React.createRef()

  infoPeerModal: React.RefObject<Modal> = React.createRef()

  onChange = (key: keyof State) => (value: any) => {
    this.setState(prevState => ({
      ...prevState,
      [key]: value,
    }))
  }

  keyboardDidShow: EmitterSubscription | null = null

  keyboardDidHide: EmitterSubscription | null = null

  didPageFocus: NavigationEventSubscription | null = null

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
    this.didPageFocus = this.props.navigation.addListener(
      'didFocus',
      this.props.fetchPendingChannels,
    )
  }

  componentWillUnmount() {
    if (this.keyboardDidShow) {
      this.keyboardDidShow.remove()
    }

    if (this.keyboardDidHide) {
      this.keyboardDidHide.remove()
    }
    if (this.didPageFocus) {
      this.didPageFocus.remove()
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
      Logger.log('[ADVANCED] Data fetch error:', JSON.stringify(err))
      throw err
    }
  }

  toggleAccordion = (name: keyof Accordions) => () => {
    const { accordions } = this.state
    if (!(name in accordions)) {
      throw new Error(
        '<AdvancedScreen /> -> toggleAccordion -> invalid accordion name  ',
      )
    }
    const updatedAccordions = { ...accordions }

    for (const key of Object.keys(updatedAccordions)) {
      // @ts-expect-error
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

  wait = (ms: number) =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve(true)
      }, ms)
    })

  fetchNextPage = (routeName: string) => () => {
    const {
      history,
      fetchInvoices,
      fetchPayments,
      fetchTransactions,
    } = this.props
    //@ts-expect-error
    const currentData = history[routeName]
    const { page } = currentData
    const pageInt = typeof page === 'number' ? page : parseInt(page, 10)
    if (routeName === 'invoices') {
      fetchInvoices({ page: pageInt + 1 })
    }

    if (routeName === 'payments') {
      fetchPayments({ page: pageInt + 1 })
    }

    if (routeName === 'transactions') {
      fetchTransactions({ page: pageInt + 1 })
    }
  }

  handleInputChange = (
    key:
      | 'peerURI'
      | 'channelPublicKey'
      | 'channelPushAmount'
      | 'channelCapacity',
    value: string,
  ) => {
    // @ts-expect-error
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
      if (this.addPeerModal.current) {
        this.addPeerModal.current.close()
      }
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

  disconnectPeer = async () => {
    this.setState({
      modalLoading: true,
    })
    const { pubKey } = this.state.peerInfo
    try {
      if (pubKey === '') {
        return
      }
      await disconnectPeer(pubKey)
      ToastAndroid.show('Peer disconnected', 800)
      if (this.infoPeerModal.current) {
        this.infoPeerModal.current.close()
      }
    } catch (e) {
      this.setState({ err: e })
    } finally {
      this.setState({
        modalLoading: false,
        peerInfo: { pubKey: '' },
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
      const { fetchChannels, fees } = this.props
      //@ts-expect-error
      if (isNaN(channelCapacity)) {
        return
      }
      this.setState({
        modalLoading: true,
        channelPublicKey: '',
        channelCapacity: '',
        channelPushAmount: '',
      })
      const feesReq = await fetch(fees.feesSource)
      const feesData = await feesReq.json()

      let satXbyte = 0
      switch (fees.feesLevel) {
        case 'MIN': {
          satXbyte = feesData.fastestFee
          break
        }
        case 'MID': {
          satXbyte = feesData.halfHourFee
          break
        }
        case 'MAX': {
          satXbyte = feesData.hourFee
          break
        }
        default: {
          throw new Error('Unset sat_per_byte')
        }
      }
      const payload = {
        pubkey: channelPublicKey,
        channelCapacity,
        channelPushAmount: channelPushAmount === '' ? '0' : channelPushAmount,
        satPerByte: satXbyte,
      }
      await Http.post(`/api/lnd/openchannel`, payload)
      ToastAndroid.show('Added successfully', 800)

      fetchChannels()
      if (this.addChannelModal.current) {
        this.addChannelModal.current.close()
      }
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

  willCloseChannel = (channel: ChannelParsed) => {
    if (this.closeChannelModal.current) {
      this.closeChannelModal.current.open()
    }
    this.setState({
      willCloseChannelPoint: channel,
    })
  }

  confirmCloseChannel = () => {
    const { forceCloseChannel } = this.state
    const force = forceCloseChannel ? 'FORCE ' : ''
    this.setState({
      confirmCloseChannel: true,
      confirmCloseChannelText:
        'This action will ' + force + 'close the channel, Are you sure?',
    })
  }

  confirmedCloseChannel = async () => {
    const { willCloseChannelPoint, forceCloseChannel } = this.state
    const { fetchChannels, fees } = this.props
    this.setState({
      willCloseChannelPoint: null,
      confirmCloseChannel: false,
      modalLoading: true,
    })

    if (willCloseChannelPoint) {
      try {
        const feesReq = await fetch(fees.feesSource)
        const feesData = await feesReq.json()
        let satXbyte = 0
        switch (fees.feesLevel) {
          case 'MIN': {
            satXbyte = feesData.fastestFee
            break
          }
          case 'MID': {
            satXbyte = feesData.halfHourFee
            break
          }
          case 'MAX': {
            satXbyte = feesData.hourFee
            break
          }
          default: {
            throw new Error('Unset sat_per_byte')
          }
        }
        const res = await Http.post(`/api/lnd/closechannel`, {
          channelPoint: willCloseChannelPoint.fundingTX,
          outputIndex: willCloseChannelPoint.outputIndex,
          force: forceCloseChannel,
          satPerByte: satXbyte,
        })

        if (res.status !== 200) {
          throw new Error(res.data.errorMessage || 'Unknown error.')
        }
        this.setState({ modalLoading: false })
        if (this.closeChannelModal.current) {
          this.closeChannelModal.current.close()
        }
        fetchChannels()

        ToastAndroid.show('Closed successfully', 800)
      } catch (err) {
        this.setState({ modalLoading: false })
        this.showErr(err.response.data.errorMessage)
      }
    }
  }

  showErr = (err: string) => {
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
    this.props.navigation.navigate(NODE_INFO)
  }

  closeNodeInfo = () => {
    this.setState({
      nodeInfoModal: false,
    })
  }

  openInfoPeer = (pubKey: string) => {
    if (this.infoPeerModal.current) {
      this.infoPeerModal.current.open()
    }
    this.setState({
      peerInfo: { pubKey },
    })
  }

  closeInfoPeer = () => {
    if (this.infoPeerModal.current) {
      this.infoPeerModal.current.close()
    }
  }

  closeCloseChannelDialog = () => {
    this.setState({
      confirmCloseChannel: false,
    })
  }

  closeAddChannelModal = () => {
    if (this.addChannelModal.current) {
      this.addChannelModal.current.close()
    }
    this.setState({
      modalLoading: true,
      channelPublicKey: '',
      channelCapacity: '',
      channelPushAmount: '',
    })
  }

  closeAddPeerModal = () => {
    if (this.addPeerModal.current) {
      this.addPeerModal.current.close()
    }
    this.setState({
      peerURI: '',
    })
  }

  confirmCloseChoices = {
    Confirm: this.confirmedCloseChannel,
    'Go Back': this.closeCloseChannelDialog,
  }

  onPressCloseChannel = () => {
    if (this.infoChannelModal.current) {
      this.infoChannelModal.current.close()
    }
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

  onPressChannel = (channelString: string) => {
    /**@type {Channel|PendingChannel} channel*/
    const channel = JSON.parse(channelString)
    if (channel.type === 'channel') {
      if (this.infoChannelModal.current) {
        this.infoChannelModal.current.open()
      }
      this.setState({
        channelInfo: channel,
      })
    } else {
      Clipboard.setString(channel.channel_point)
      ToastAndroid.show('Channel Point copied to clipboard', 800)
    }
  }

  closeInfoChannelModal = () => {
    if (this.infoChannelModal.current) {
      this.infoChannelModal.current.close()
    }
    this.setState({
      channelInfo: {
        type: 'channel',
        active: false,
        chan_id: '',
        channel_point: '',
        ip: '',
        local_balance: '',
        remote_balance: '',
        remote_pubkey: '',
      },
    })
  }

  onRefreshChannels = async () => {
    this.setState({
      refreshingChannels: true,
    })
    const { fetchChannels, fetchPendingChannels } = this.props
    await Promise.all([fetchChannels(), fetchPendingChannels()])
    this.setState({ refreshingChannels: false })
  }

  onRefreshTransactions = async () => {
    this.setState({
      refreshingTransactions: true,
    })
    const { fetchRecentTransactions } = this.props
    await fetchRecentTransactions()
    this.setState({ refreshingTransactions: false })
  }

  onChangePeerURI = (text: string) => this.handleInputChange('peerURI', text)

  onChangeChannelPublicKey = (text: string) => {
    this.handleInputChange('channelPublicKey', text)
  }

  onChangeChannelCapacity = (text: string) => {
    this.handleInputChange('channelCapacity', text)
  }

  onChangeChannelPushAmount = (text: string) => {
    this.handleInputChange('channelPushAmount', text)
  }

  startLoading = () => {
    this.setState({ modalLoading: true })
  }

  finishLoading = () => {
    this.setState({ modalLoading: false })
  }

  transactionKeyExtractor = (
    transaction: import('../../services/wallet').Transaction,
  ) => transaction.tx_hash

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
      peerInfo,
      nodeInfoModal,
      confirmCloseChannel,
      confirmCloseChannelText,
      refreshingChannels,
      refreshingTransactions,
    } = this.state

    //Logger.log(history.channels)
    Logger.log(channelPublicKey)
    const { confirmedBalanceUSD, channelBalanceUSD } = this.convertBTCToUSD()
    const theme = 'dark'
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
            source={theme === 'dark' ? wavesBGDark : wavesBGDark}
            resizeMode="cover"
            style={styles.statsHeader}
          >
            <Nav
              title="Advanced"
              style={styles.nav}
              showAvatar
              onPressAvatar={this.backToOverview}
            />
            <View style={styles.statsContainer}>
              <View style={xStyles.channelBalanceContainer}>
                <View style={styles.statIcon}>
                  {theme === 'dark' ? (
                    <EntypoIcons
                      name="flash"
                      color="#4285B9"
                      size={20}
                      style={{ transform: [{ rotate: '-45deg' }] }}
                    />
                  ) : (
                    <EntypoIcons name="flash" color="#F5A623" size={20} />
                  )}
                </View>
                <View>
                  <Text
                    style={
                      theme === 'dark'
                        ? styles.statTextPrimaryDark
                        : styles.statTextPrimary
                    }
                  >
                    {wallet.USDRate
                      ? wallet.channelBalance.replace(
                          /(\d)(?=(\d{3})+$)/g,
                          '$1,',
                        )
                      : 'Loading...'}{' '}
                    {theme === 'dark' ? '' : 'sats'}
                  </Text>
                  <Text
                    style={
                      theme === 'dark'
                        ? styles.statTextSecondaryDark
                        : styles.statTextSecondary
                    }
                  >
                    {wallet.USDRate
                      ? channelBalanceUSD.replace(/\d(?=(\d{3})+\.)/g, '$&,')
                      : 'Loading...'}{' '}
                    USD
                  </Text>
                </View>
              </View>
              <View style={styles.stat}>
                <View style={styles.statIcon}>
                  {theme === 'dark' ? (
                    <EntypoIcons name="link" color="#4285B9" size={20} />
                  ) : (
                    <EntypoIcons name="link" color="#F5A623" size={20} />
                  )}
                </View>
                <View>
                  <Text
                    style={
                      theme === 'dark'
                        ? styles.statTextPrimaryDark
                        : styles.statTextPrimary
                    }
                  >
                    {wallet.USDRate
                      ? wallet.confirmedBalance.replace(
                          /(\d)(?=(\d{3})+$)/g,
                          '$1,',
                        )
                      : 'Loading...'}{' '}
                    {theme === 'dark' ? '' : 'sats'}
                  </Text>
                  <Text
                    style={
                      theme === 'dark'
                        ? styles.statTextSecondaryDark
                        : styles.statTextSecondary
                    }
                  >
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
              //@ts-expect-error
              data={[...history.pendingChannels, ...history.channels]}
              Item={Channel}
              keyExtractor={channelKeyExtractor}
              title="Channels"
              open={accordions.channels}
              menuOptions={[
                {
                  name: 'Add Channel',
                  icon: 'link',
                  action: () => {
                    if (this.addChannelModal.current) {
                      this.addChannelModal.current.open()
                    }
                    this.setState({
                      err: '',
                    })
                  },
                },
              ]}
              toggleAccordion={this.toggleAccordion('channels')}
              onPressItem={this.onPressChannel}
              hideBottomBorder
              onRefresh={this.onRefreshChannels}
              refreshing={refreshingChannels}
            />
            <AccordionItem
              fetchNextPage={this.fetchNextPage('transactions')}
              data={history.recentTransactions}
              Item={Transaction}
              title="Transactions"
              open={accordions.transactions}
              toggleAccordion={this.toggleAccordion('transactions')}
              keyExtractor={this.transactionKeyExtractor}
              onRefresh={this.onRefreshTransactions}
              refreshing={refreshingTransactions}
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
                    if (this.addPeerModal.current) {
                      this.addPeerModal.current.open()
                    }
                  },
                },
              ]}
              onPressItem={this.openInfoPeer}
              toggleAccordion={this.toggleAccordion('peers')}
              keyExtractor={peerKeyExtractor}
            />
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
          chanId={
            willCloseChannelPoint ? willCloseChannelPoint.chan_id : undefined
          }
          localBalance={
            willCloseChannelPoint
              ? willCloseChannelPoint.local_balance
              : undefined
          }
          remoteBalance={
            willCloseChannelPoint
              ? willCloseChannelPoint.remote_balance
              : undefined
          }
        />
        <InfoChannelModal
          modalRef={this.infoChannelModal}
          onChange={this.onChange}
          loading={modalLoading}
          startLoading={this.startLoading}
          finishLoading={this.finishLoading}
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
        <InfoPeerModal
          disconnectPeer={this.disconnectPeer}
          keyboardHeight={keyboardHeight}
          keyboardOpen={keyboardOpen}
          loading={modalLoading}
          modalRef={this.infoPeerModal}
          peer={peerInfo}
          submit={this.closeInfoPeer}
          error={err}
        />
        <ShockDialog
          choiceToHandler={this.confirmCloseChoices}
          onRequestClose={this.closeCloseChannelDialog}
          visible={confirmCloseChannel}
          message={confirmCloseChannelText}
        />
      </>
    )
  }
}

const mapStateToProps = ({ history, node, wallet, fees }: Store.State) => ({
  history,
  node,
  wallet,
  fees,
})

const mapDispatchToProps = {
  fetchChannels,
  fetchPendingChannels,
  fetchInvoices,
  fetchPayments,
  fetchPeers,
  fetchTransactions,
  fetchRecentTransactions,
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
  statTextPrimaryDark: {
    color: CSS.Colors.TEXT_WHITE,
    fontSize: 26,
    fontWeight: '900',
    fontFamily: 'Montserrat-700',
  },
  statTextSecondary: {
    color: CSS.Colors.ORANGE,
    fontSize: 14,
    fontFamily: 'Montserrat-700',
  },
  statTextSecondaryDark: {
    color: '#4285B9',
    fontSize: 12,
    fontFamily: 'Montserrat-600',
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

const channelKeyExtractor = (channel: Channel | PendingChannel) =>
  JSON.stringify(channel) //channel.channel_point

type Peer = import('../../services/wallet').Peer
const peerKeyExtractor = (p: Peer) => p.pub_key
