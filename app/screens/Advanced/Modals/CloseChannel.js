import React from 'react'
import { View, StyleSheet, Text, ActivityIndicator, Switch } from 'react-native'
import Modal from 'react-native-modalbox'
import Icon from 'react-native-vector-icons/Ionicons'
import Head from '../../../components/PopupModal/Head'
import Body from '../../../components/PopupModal/Body'
import Footer from '../../../components/PopupModal/Footer'
import { Colors } from '../../../res/css'

/**
 * @typedef {object} Props
 * @prop {React.RefObject<any>} modalRef
 * @prop {(key: keyof import("../index").State) => (value: any) => void} onChange
 * @prop {boolean} forceCloseChannel
 * @prop {() => void} submit
 * @prop {boolean} keyboardOpen
 * @prop {number} keyboardHeight
 * @prop {boolean} loading
 * @prop {string} error
 */

/**
 * @augments React.Component<Props, {}, never>
 */
class CloseChannelModal extends React.Component {
  render() {
    const {
      modalRef,
      onChange,
      forceCloseChannel,
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
        <Head>
          <Icon name="ios-link" color="white" size={35} />
        </Head>
        <Body>
          <Text style={styles.modalTitle}>Close Channel?</Text>
          {error ? <Text style={styles.modalError}>{error}</Text> : null}
          <View style={styles.switch}>
            <Text>Force</Text>
            <Switch
              value={forceCloseChannel}
              onValueChange={onChange('forceCloseChannel')}
            />
          </View>
        </Body>
        <Footer value="Close Channel" onPress={submit} />
      </Modal>
    )
  }
}

export default CloseChannelModal

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    zIndex: 100,
    height: 200,
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
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
  switch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
})
