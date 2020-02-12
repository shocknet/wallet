import React from 'react'
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native'
import Modal from 'react-native-modalbox'
import Icon from 'react-native-vector-icons/Ionicons'
import ModalInput from '../../../components/PopupModal/Input'
import Head from '../../../components/PopupModal/Head'
import Body from '../../../components/PopupModal/Body'
import Footer from '../../../components/PopupModal/Footer'
import { Colors } from '../../../res/css'

/**
 * @typedef {object} Props
 * @prop {React.RefObject<any>} modalRef
 * @prop {(key: keyof import("../index").State) => (value: any) => void} onChange
 * @prop {string} channelPublicKey
 * @prop {string} channelCapacity
 * @prop {string} channelPushAmount
 * @prop {() => void} submit
 * @prop {boolean} keyboardOpen
 * @prop {number} keyboardHeight
 * @prop {boolean} loading
 * @prop {string} error
 */

/**
 * @augments React.Component<Props, {}, never>
 */
class AddChannelModal extends React.Component {
  render() {
    const {
      modalRef,
      onChange,
      channelPublicKey,
      channelCapacity,
      channelPushAmount,
      submit,
      keyboardHeight = 0,
      keyboardOpen,
      loading,
      error,
    } = this.props
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
          <Icon name="ios-link" color="white" size={35} />
        </Head>
        <Body>
          <Text style={styles.modalTitle}>Add Channel</Text>
          {error ? <Text style={styles.modalError}>{error}</Text> : null}
          <ModalInput
            placeholder="Public Key"
            value={channelPublicKey}
            onChange={onChange('channelPublicKey')}
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
    height: 325,
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
    marginBottom: 15,
    marginTop: 8,
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
})
