import React from 'react'
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native'
import Modal from 'react-native-modal'
import * as CSS from '../../res/css'
import Pad from '../../components/Pad'
import InputGroup from '../../components/InputGroup'
// @ts-ignore
import ArrowLeft from '../../assets/images/arrow-left.svg'

// @ts-ignore
export default function MetaConfigModal(props) {
  return (
    <View style={{ flex: 1 }}>
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
        <ScrollView>
          <StatusBar
            translucent
            backgroundColor="rgba(22, 25, 28, .94)"
            barStyle="light-content"
          />
          <View style={styles.subContainerDark}>
            <View style={styles.backButton}>
              <TouchableOpacity onPress={props.toggleModal}>
                <ArrowLeft size={19} />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.caption}>Meta</Text>
            </View>
            <Pad amount={40} />
            <TouchableOpacity style={styles.touchableOpacity}>
              <Text style={styles.touchableButton}>Offer Shipping_to Geo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity}>
              <Text style={styles.touchableButton}>Physical Location_ Geo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity}>
              <Text style={styles.touchableButton}>Service to Geo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity}>
              <Text style={styles.touchableButton}>Hours</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity}>
              <Text style={styles.touchableButton}>Security</Text>
            </TouchableOpacity>
            <InputGroup
              label="Web"
              value=""
              // onChange={}
              style={{ marginBottom: 20 }}
              placeholder="https://satoshi.watch/users_pubkey"
            />
            <InputGroup
              label="Torrent Seed"
              value=""
              // onChange={}
              style={{ marginBottom: 20 }}
              placeholder="gun_uid_of_service |or| self-hosted"
            />
            <View style={styles.actionButtonsDark}>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={props.onPressCancel}
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
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  subContainerDark: {
    flexDirection: 'column',
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
