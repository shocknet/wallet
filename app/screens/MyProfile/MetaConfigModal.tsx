import React from 'react'
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native'
import Modal from 'react-native-modal'
import * as CSS from '../../res/css'
import Pad from '../../components/Pad'
import InputGroup from '../../components/InputGroup'
import ArrowLeft from '../../assets/images/arrow-left.svg'

interface MetaConfigModalState {}

export default class MetaConfigModal extends React.PureComponent<
  any,
  MetaConfigModalState
> {
  render() {
    const { props } = this

    return (
      <>
        <StatusBar
          translucent
          backgroundColor="rgba(22, 25, 28, .94)"
          barStyle="light-content"
        />

        <View style={CSS.styles.flex}>
          <Modal
            isVisible={props.isModalVisible}
            backdropColor="#16191C"
            backdropOpacity={0.94}
            animationIn="zoomInDown"
            animationOut="zoomOutUp"
            animationInTiming={600}
            animationOutTiming={600}
            backdropTransitionInTiming={600}
            backdropTransitionOutTiming={600}
            onBackdropPress={props.toggleModal}
          >
            <View style={styles.container}>
              <View>
                <View style={styles.backButton}>
                  <TouchableOpacity onPress={props.toggleModal}>
                    <ArrowLeft size={19} />
                  </TouchableOpacity>
                </View>
                <View>
                  <Text style={styles.caption}>Brand Config</Text>
                </View>
                <Pad amount={40} />

                <InputGroup
                  label="Web Client"
                  value=""
                  isWebClientPicker
                  publicKey={props.publicKey}
                />

                <InputGroup
                  label="Webtorrent Seed"
                  value=""
                  placeholder="https://satoshi.watch/users_pubkey"
                />
              </View>

              <View style={CSS.styles.rowCenteredSpaceBetween}>
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={props.toggleModal}
                  style={styles.actionButtonDark1}
                >
                  <Text style={styles.actionButtonTextDark1}>Cancel</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={props.onPressSave}
                  style={[styles.actionButtonDark2]}
                >
                  <Text style={styles.actionButtonTextDark2}>Save</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
        </View>
      </>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'flex-start',
  },
  caption: {
    fontFamily: 'Montserrat-700',
    fontSize: 20,
    color: '#F3EFEF',
    backgroundColor: 'transparent',
    textAlign: 'center',
    width: '100%',
  },
  touchableButton: {
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    color: '#BBB8B8',
    backgroundColor: 'transparent',
    textAlign: 'center',
    width: '100%',
  },
  touchableOpacity: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 15,
  },
  actionButtonsDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  actionButtonDark1: {
    width: '48%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#001220',
    borderColor: '#4285B9',
    borderWidth: 1,
  },
  actionButtonDark2: {
    width: '48%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#4285B9',
    borderColor: CSS.Colors.BACKGROUND_WHITE,
    borderWidth: 1,
  },
  actionButtonTextDark1: {
    color: '#4285B9',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },
  actionButtonTextDark2: {
    color: '#212937',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },
})
