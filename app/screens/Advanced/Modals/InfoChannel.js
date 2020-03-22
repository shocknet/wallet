import React from 'react'
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native'
import Modal from 'react-native-modalbox'
import Logger from 'react-native-file-log'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Head from '../../../components/PopupModal/Head'
import Body from '../../../components/PopupModal/Body'
import Footer from '../../../components/PopupModal/Footer'
import { Colors } from '../../../res/css'
import { getChaninfo } from '../../../services/wallet'

/**
 * @typedef {import('../../../services/wallet').Channel} Channel
 * @typedef {import('../../../services/wallet').ChanInfo} ChanInfo
 * @typedef {import('../../../services/wallet').RoutingPolicy} RoutingPolicy
 */
/**
 * @typedef {object} Props
 * @prop {React.RefObject<any>} modalRef
 * @prop {(key: keyof import("../index").State) => (value: any) => void} onChange
 * @prop {() => void} submit
 * @prop {() => void} closeChannel
 * @prop {boolean} keyboardOpen
 * @prop {number} keyboardHeight
 * @prop {boolean} loading
 * @prop {string} error
 * @prop {Channel} channel
 */

/**
 * @typedef {object} State
 * @prop {ChanInfo} chanInfo
 * @prop {boolean} chanInfoReady
 * @prop {RoutingPolicy} myPolicy
 * @prop {RoutingPolicy} otherPolicy
 */
/**
 * @type {RoutingPolicy} defaultPolicy
 */
const defaultPolicy = {
  disabled: false,
  fee_base_msat: 0,
  fee_rate_milli_msat: 0,
  last_update: 0,
  min_htlc: 0,
  time_lock_delta: 0,
}
/**
 * @augments React.Component<Props, State, never>
 */

class InfoChannelModal extends React.Component {
  /** @type {State} */
  state = {
    chanInfoReady: false,
    chanInfo: {
      capacity: 0,
      chan_point: '',
      channel_id: 0,
      last_update: 0,
      node1_policy: defaultPolicy,
      node1_pub: '',
      node2_policy: defaultPolicy,
      node2_pub: '',
    },
    myPolicy: defaultPolicy,
    otherPolicy: defaultPolicy,
  }

  /**
   * @param {Props} prevProps
   */
  componentDidUpdate(prevProps) {
    if (this.props.channel !== prevProps.channel) {
      const { channel } = this.props
      getChaninfo(channel.chan_id)
        .then(res => {
          if (channel.remote_pubkey === res.node1_pub) {
            this.setState({
              chanInfo: res,
              chanInfoReady: true,
              otherPolicy: res.node1_policy,
              myPolicy: res.node2_policy,
            })
          } else {
            this.setState({
              chanInfo: res,
              chanInfoReady: true,
              myPolicy: res.node1_policy,
              otherPolicy: res.node2_policy,
            })
          }
        })
        .catch(e => {
          Logger.log(e)
        })
    }
  }

  render() {
    const {
      modalRef,
      submit,
      closeChannel,
      keyboardHeight = 0,
      keyboardOpen,
      loading,
      error,
      channel,
    } = this.props
    const { chanInfo, chanInfoReady, myPolicy, otherPolicy } = this.state
    return (
      <Modal
        position="center"
        style={[
          styles.modal,
          keyboardOpen
            ? {
                marginTop: -1 * (keyboardHeight / 2),
              }
            : null,
        ]}
        ref={modalRef}
        backButtonClose
        useNativeDriver
      >
        {loading ? (
          <View style={styles.modalLoading}>
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : null}
        <Head
          closeModal={modalRef.current ? modalRef.current.close : undefined}
        >
          {/* <Icon name="ios-link" color="white" size={35} /> */}
          <Text style={styles.modalTitle}>{channel.chan_id}</Text>
        </Head>
        <Body>
          {/*<Text style={styles.modalTitle}>Close Channel?</Text>*/}
          {error ? <Text style={styles.modalError}>{error}</Text> : null}
          {chanInfoReady && (
            <>
              <View style={styles.content}>
                <Text>Capacity:</Text>
                <Text style={styles.bold}>{chanInfo.capacity}</Text>
              </View>
              <View style={styles.hr} />
              <Text>My Policy</Text>
              <View style={styles.content}>
                <Text>Disabled:</Text>
                <Text style={styles.bold}>
                  {myPolicy.disabled ? 'true' : 'false'}
                </Text>
              </View>
              <View style={styles.content}>
                <Text>Fee base msat:</Text>
                <Text style={styles.bold}>{myPolicy.fee_base_msat}</Text>
              </View>
              <View style={styles.content}>
                <Text>Fee rate milli mstat:</Text>
                <Text style={styles.bold}>{myPolicy.fee_rate_milli_msat}</Text>
              </View>
              <View style={styles.content}>
                <Text>Last update:</Text>
                <Text style={styles.bold}>
                  {new Date(myPolicy.last_update * 1000).toISOString()}
                </Text>
              </View>
              <View style={styles.hr} />
              <Text>Other node Policy</Text>
              <View style={styles.content}>
                <Text>Disabled:</Text>
                <Text style={styles.bold}>
                  {otherPolicy.disabled ? 'true' : 'false'}
                </Text>
              </View>
              <View style={styles.content}>
                <Text>Fee base msat:</Text>
                <Text style={styles.bold}>{otherPolicy.fee_base_msat}</Text>
              </View>
              <View style={styles.content}>
                <Text>Fee rate milli mstat:</Text>
                <Text style={styles.bold}>
                  {otherPolicy.fee_rate_milli_msat}
                </Text>
              </View>
              <View style={styles.content}>
                <Text>Last update:</Text>
                <Text style={styles.bold}>
                  {new Date(otherPolicy.last_update * 1000).toISOString()}
                </Text>
              </View>
              <View style={styles.hr} />
              <View style={styles.content}>
                <Text>Close channel</Text>
                <Ionicons
                  name="ios-close-circle-outline"
                  color="#222"
                  size={22}
                  onPress={closeChannel}
                />
              </View>
            </>
          )}
        </Body>
        <Footer value="OK" onPress={submit} />
      </Modal>
    )
  }
}

export default InfoChannelModal

const styles = StyleSheet.create({
  hr: {
    height: 1,
    backgroundColor: '#222',
    width: '80%',
  },
  modal: {
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    zIndex: 100,
    height: 400,
    width: '80%',
    borderRadius: 15,
  },
  modalLoading: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.LOADING_BACKDROP,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalTitle: {
    fontFamily: 'Montserrat-800',
    color: Colors.TEXT_GRAY,
    textAlign: 'center',
    width: '100%',
    fontSize: 16,
  },
  modalError: {
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: Colors.ICON_RED,
    color: Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    width: '90%',
    borderRadius: 15,
    fontSize: 11,
  },
  content: {
    width: '80%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bold: {
    fontWeight: 'bold',
  },
})
