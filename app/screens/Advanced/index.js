/**
 * @format
 */
import React, { Component } from 'react'
import {
  // Clipboard,
  Image,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  TouchableOpacity,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import EntypoIcons from 'react-native-vector-icons/Entypo'
import Feather from 'react-native-vector-icons/Feather'
import Http from 'axios'
import Big from 'big.js'

import * as CSS from '../../css'
import * as Wallet from '../../services/wallet'
import * as Cache from '../../services/cache'
import BasicDialog from '../../components/BasicDialog'
import ShockInput from '../../components/ShockInput'
import IGDialogBtn from '../../components/IGDialogBtn'
import Pad from '../../components/Pad'
import ShockDialog from '../../components/ShockDialog'

import AccordionItem from './Accordion'
// import Transaction from './Accordion/Transaction'
import Channel from './Accordion/Channel'
// import Invoice from './Accordion/Invoice'
import Peer from './Accordion/Peer'
import InfoModal from './InfoModal'
// import { Icon } from 'react-native-elements'
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
 * @prop {Wallet.PaginatedTransactionsResponse} transactions
 * @prop {Wallet.Peer[]} peers
 * @prop {Wallet.PaginatedListInvoicesResponse} invoices
 * @prop {Wallet.Channel[]} channels
 * @prop {string} confirmedBalance
 * @prop {string} channelBalance
 * @prop {null|number} USDRate
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
 * @prop {import('./InfoModal').Info|null} nodeInfo
 * @prop {boolean} nodeInfoModal
 */

/**
 * @augments React.Component<{}, State>
 */
export default class AdvancedScreen extends Component {
  /** @type {State} */
  state = {
    accordions: {
      transactions: true,
      peers: false,
      invoices: false,
      channels: false,
    },
    transactions: {
      content: [],
      page: 0,
      totalPages: 0,
      totalItems: 0,
    },
    peers: [],
    invoices: {
      content: [],
      page: 0,
      totalPages: 0,
    },
    channels: [],
    confirmedBalance: '0',
    channelBalance: '0',
    USDRate: null,
    addPeerOpen: false,
    addChannelOpen: false,
    peerPublicKey: '',
    host: '',
    channelPublicKey: '',
    channelCapacity: '',
    channelPushAmount: '',
    err: '',
    willCloseChannelPoint: null,

    nodeInfo: null,
    nodeInfoModal: false,
  }

  componentDidMount() {
    this.getUserBalance()
    this.fetchData()
  }

  getUserBalance = async () => {
    try {
      const [walletBalance, USDRate] = await Promise.all([
        Wallet.balance(),
        Wallet.USDExchangeRate(),
      ])
      console.log(walletBalance, USDRate)

      const parsedChannelBalance = new Big(walletBalance.channel_balance)
      const parsedOpenBalance = new Big(walletBalance.pending_channel_balance)
      this.setState({
        USDRate,
        confirmedBalance: walletBalance.confirmed_balance,
        channelBalance: parsedChannelBalance.plus(parsedOpenBalance).toFixed(2),
      })
    } catch (err) {
      console.error(err)
    }
  }

  convertBTCToUSD = () => {
    const { confirmedBalance, channelBalance, USDRate } = this.state
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
      const [invoices, peers, channels] = await Promise.all([
        Wallet.listInvoices({
          itemsPerPage: 20,
          page: 1,
        }),
        Wallet.listPeers(),
        Wallet.listChannels(),
      ])
      Http.get('/healthz')
        .then(res => res.data)
        .then(data => {
          if (typeof data !== 'object') {
            console.warn(`Error fetching /healthz: data not an object`)
            return
          }
          const { LNDStatus } = data
          if (typeof LNDStatus !== 'object') {
            console.warn(
              `Error fetching /healthz: data.LNDStatus not an object`,
            )
            return
          }

          const { message } = LNDStatus
          if (typeof message !== 'object') {
            console.warn(
              `Error fetching /healthz: data.LNDStatus.message not an object`,
            )
            return
          }

          const { identity_pubkey } = message
          if (typeof identity_pubkey !== 'string') {
            console.warn(
              `Error fetching /healthz: data.LNDStatus.message.identity_pubkey not an string`,
            )
            return
          }
          this.setState({
            nodeInfo: message,
          })
        })
        .catch(e => {
          console.warn(
            `Error fetching /healthz: ${e.message}, status: ${e.status}`,
          )
        })

      console.log({
        invoices,
        peers,
        channels,
      })

      this.setState({
        invoices,
        peers,
        channels,
      })
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * @param {keyof Accordions} name
   */
  toggleAccordion = name => {
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
   * @param {'invoices'|'transactions'} stateName
   */
  fetchNextPage = async (routeName, stateName) => {
    const currentData = this.state[stateName]
    await this.wait(2000)
    const { data } = await Http.get(
      `/api/lnd/list${routeName}?page=${currentData.page + 1}`,
    )

    if (stateName === 'invoices') {
      this.setState(({ invoices }) => ({
        invoices: {
          ...data,
          content: [...invoices.content, ...data.content],
        },
      }))
    }

    if (stateName === 'transactions') {
      this.setState(({ transactions }) => ({
        transactions: {
          ...data,
          content: [...transactions.content, ...data.content],
        },
      }))
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
        throw new Error(res.data.errorMessage)
      }

      ToastAndroid.show('Added successfully', 800)

      const newPeers = await Http.get('/api/lnd/listpeers')

      console.log('newPeers', newPeers)

      this.setState({
        peers: newPeers.data.peers,
      })
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
        throw new Error(res.data.errorMessage)
      }

      ToastAndroid.show('Added successfully', 800)

      const newChannels = await Wallet.listChannels()

      this.setState({
        channels: newChannels,
      })
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

  render() {
    const {
      accordions,
      // transactions,
      peers,
      // invoices,
      channels,
      addPeerOpen,
      addChannelOpen,
      peerPublicKey,
      channelPublicKey,
      host,
      USDRate,
      confirmedBalance,
      channelBalance,
      channelCapacity,
      channelPushAmount,

      willCloseChannelPoint,

      nodeInfo,
      nodeInfoModal,
    } = this.state
    const { confirmedBalanceUSD, channelBalanceUSD } = this.convertBTCToUSD()
    return (
      <View style={styles.container}>
        <InfoModal
          visible={nodeInfoModal}
          info={nodeInfo}
          onRequestClose={this.closeNodeInfo}
        />
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['#194B93', '#4285B9']}
          style={styles.statsHeader}
        >
          <View style={styles.nav}>
            <View>
              <Image style={styles.navAvatar} source={{}} />
            </View>

            <Text style={styles.navText}>Channels</Text>
            <View style={styles.settingsBtn}>
              <EntypoIcons name="cog" size={30} color="white" />
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={xStyles.channelBalanceContainer}>
              <View style={styles.statIcon}>
                <EntypoIcons name="flash" color="#F5A623" size={20} />
              </View>
              <View>
                <Text style={styles.statTextPrimary}>
                  {USDRate
                    ? channelBalance.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
                    : 'Loading...'}{' '}
                  sats
                </Text>
                <Text style={styles.statTextSecondary}>
                  {USDRate
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
                  {USDRate
                    ? confirmedBalance.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
                    : 'Loading...'}{' '}
                  sats
                </Text>
                <Text style={styles.statTextSecondary}>
                  {USDRate
                    ? confirmedBalanceUSD.replace(/\d(?=(\d{3})+\.)/g, '$&,')
                    : 'Loading...'}{' '}
                  USD
                </Text>
              </View>
            </View>
            <View style={styles.getInfoHolder}>
              {nodeInfo !== null ? (
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
        </LinearGradient>
        <View style={styles.accordionsContainer}>
          {/* <AccordionItem
            fetchNextPage={() => this.fetchNextPage('payments', 'transactions')}
            data={transactions}
            Item={Transaction}
            title="Transactions"
            open={accordions['transactions']}
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
            toggleAccordion={() => this.toggleAccordion('transactions')}
            keyExtractor={transaction => transaction.tx_hash}
          /> */}
          <AccordionItem
            data={peers}
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
            toggleAccordion={this.togglePeerAccordion}
            keyExtractor={peerKeyExtractor}
          />
          {/* <AccordionItem
            fetchNextPage={() => this.fetchNextPage('invoices', 'invoices')}
            data={invoices}
            Item={Invoice}
            title="Invoices"
            open={accordions['invoices']}
            toggleAccordion={() => this.toggleAccordion('invoices')}
            keyExtractor={inv => inv.r_hash.data.join('-')}
          /> */}
          <AccordionItem
            data={channels}
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
            toggleAccordion={this.toggleChannelsAccordion}
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
                    throw new Error(res.data.errorMessage)
                  }

                  this.setState({
                    channels: [],
                  })

                  Wallet.listChannels().then(channels => {
                    this.setState({
                      channels,
                    })
                  })

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
  },
  marginBottom15: { marginBottom: 15 },
  nav: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  navAvatar: {
    width: 60,
    height: 60,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BLUE_LIGHT,
  },
  navText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CSS.Colors.TEXT_WHITE,
  },
  settingsBtn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
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
 * @param {Wallet.Channel} channel
 */
const channelKeyExtractor = channel => channel.channel_point

/**
 * @param {Wallet.Peer} p
 */
const peerKeyExtractor = p => p.pub_key
