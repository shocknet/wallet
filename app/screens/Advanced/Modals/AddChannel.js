import React from 'react'
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native'
// @ts-expect-error
import { Dropdown } from 'react-native-material-dropdown'
import Modal from 'react-native-modalbox'
import ModalInput from '../../../components/PopupModal/Input'
import Head from '../../../components/PopupModal/Head'
import Body from '../../../components/PopupModal/Body'
import Footer from '../../../components/PopupModal/Footer'
import { Colors } from '../../../res/css'
/**
 * @typedef {object} Props
 * @prop {React.RefObject<any>} modalRef
 * @prop {(key: keyof import("../index").State) => (value: any) => void} onChange
 * @prop {import('../../../services/wallet').Peer[]} peers
 * @prop {string} channelCapacity
 * @prop {string} channelPushAmount
 * @prop {() => void} submit
 * @prop {boolean} keyboardOpen
 * @prop {number} keyboardHeight
 * @prop {boolean} loading
 * @prop {string} error
 * @prop {() => void} closeModal
 */

/**
 * @augments React.Component<Props, {}, never>
 */
class AddChannelModal extends React.Component {
  render() {
    const {
      modalRef,
      onChange,
      channelCapacity,
      channelPushAmount,
      peers,
      submit,
      keyboardHeight = 0,
      keyboardOpen,
      loading,
      error,
    } = this.props
    /**
     * @var {[{value : string}]} peersData
     */
    const peersData = [{ value: 'choose a peer' }]
    peers.map(peer => {
      peersData.push({ value: peer.pub_key })
      return {}
    })
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
          <Text style={styles.modalTitle}>Add Channel</Text>
        </Head>
        <Body>
          {error ? <Text style={styles.modalError}>{error}</Text> : null}
          <Dropdown
            data={peersData}
            onChangeText={onChange('channelPublicKey')}
            containerStyle={styles.dropdown}
            value="choose a peer"
            lineWidth={0}
            rippleOpacity={0}
            dropdownOffset={{ top: 8, left: 0 }}
            rippleInsets={{ top: 8, bottom: 0, right: 0, left: 0 }}
          />
          <ModalInput
            placeholder="Capacity"
            value={channelCapacity}
            onChange={onChange('channelCapacity')}
          />
          <ModalInput
            placeholder="Push Amount"
            value={channelPushAmount}
            onChange={onChange('channelPushAmount')}
          />
        </Body>
        <Footer value="Add Channel" onPress={submit} />
      </Modal>
    )
  }
}

export default AddChannelModal

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    zIndex: 100,
    height: 280,
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
  dropdown: {
    width: '80%',
    textAlign: 'center',
  },
})
