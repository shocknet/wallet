import React from 'react'
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native'
import Modal from 'react-native-modalbox'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Head from '../../../components/PopupModal/Head'
import Body from '../../../components/PopupModal/Body'
import Footer from '../../../components/PopupModal/Footer'
import { Colors } from '../../../res/css'

/**
 * @typedef {object} Props
 * @prop {React.RefObject<any>} modalRef
 * @prop {() => void} submit
 * @prop {() => void} disconnectPeer
 * @prop {boolean} keyboardOpen
 * @prop {number} keyboardHeight
 * @prop {boolean} loading
 * @prop {string} error
 * @prop {{pubKey:string}} peer
 */

/**
 * @extends React.PureComponent<Props, {}, never>
 */
class InfoPeerModal extends React.PureComponent {
  render() {
    const {
      modalRef,
      submit,
      disconnectPeer,
      keyboardHeight = 0,
      keyboardOpen,
      loading,
      peer,
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
          {/* <Icon name="ios-link" color="white" size={35} /> */}
          <Text style={styles.modalTitle}>PEER</Text>
        </Head>
        <Body>
          {error ? <Text style={styles.modalError}>{error}</Text> : null}
          <View style={styles.content}>
            <Text style={styles.bold}>{peer.pubKey}</Text>
          </View>
          <View style={styles.hr} />
          <View style={styles.content}>
            <Text>Disconnect Peer</Text>
            <Ionicons
              name="ios-close-circle-outline"
              color="#222"
              size={22}
              onPress={disconnectPeer}
            />
          </View>
        </Body>
        <Footer value="OK" onPress={submit} />
      </Modal>
    )
  }
}

export default InfoPeerModal

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
    height: 200,
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
