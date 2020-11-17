/**
 * @format
 */
import React, { PureComponent } from 'react'
import {
  // Clipboard,
  StyleSheet,
  View,
  TextInput,
  FlatList,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'
import Suggestion from './Suggestion'
import { selectContact } from '../../store/actions/ChatActions'
import { decodePaymentRequest } from '../../store/actions/InvoiceActions'

import * as CSS from '../../res/css'
// import InputGroup from '../InputGroup'

/**
 * @typedef {import('../../store/actions/ChatActions').SelectedContact} ContactTypes
 */

/**
 * @typedef {'btc'|'invoice'|'contacts'|'keysend'} EnabledFeatures
 */

/**
 * @typedef {({ type: 'error', error: Error }|undefined)} DecodeResponse
 */

/**
 * @typedef {object} Props
 * @prop {string} value
 * @prop {(text: string) => void} onChange
 * @prop {((error: string|undefined) => void)=} onError
 * @prop {(object)=} style
 * @prop {(object)=} inputStyle
 * @prop {(string)=} icon
 * @prop {(boolean)=} disabled
 * @prop {(boolean)=} multiline
 * @prop {(EnabledFeatures[])=} enabledFeatures
 * @prop {(string)=} placeholder
 * @prop {(string)=} type
 * @prop {(contact: ContactTypes) => void} selectContact
 * @prop {(paymentRequest: string) => DecodeResponse} decodePaymentRequest
 * @prop {(() => void)=} startDecoding
 * @prop {{ contacts: import('../../store/actions/ChatActions').Contact[] }} chat
 * @prop {import('../../store/reducers/UsersReducer').State} users
 */

/**
 * @augments PureComponent<Props, {}, never>
 */
class ContactsSearch extends PureComponent {
  // state = {
  //   focused: false,
  // }

  // setFocus = (focused = false) => () => {
  //   this.setState({
  //     focused,
  //   })
  // }

  theme = 'dark'

  defaultFeatures = ['btc', 'invoice', 'contacts']

  /**
   * @param {import('../../store/actions/ChatActions').SelectedContact} item
   * @param {number} index
   * @returns {string}
   */
  contactKeyExtractor = (item, index) => {
    if ('pk' in item) {
      return item.pk
    }

    if ('address' in item) {
      return item.address
    }

    if ('paymentRequest' in item) {
      return item.paymentRequest
    }
    if ('dest' in item) {
      return item.dest
    }

    return index.toString()
  }

  decodeInvoice = () => {
    const { decodePaymentRequest, value, onError, startDecoding } = this.props
    try {
      if (startDecoding) {
        startDecoding()
      }
      const data = decodePaymentRequest(value)
      Logger.log(data)
      if (data && data.type === 'error') {
        if (onError) {
          onError(data.error.message)
        }
      }
    } catch (err) {
      Logger.log('Decode Invoice Error:', err)
      if (onError) {
        onError(err)
      }
    }
  }

  /** @type {import('react-native').ListRenderItem<any>} */
  contactRender = contact => {
    if (contact.item.type === 'btc') {
      return ((
        <Suggestion
          name={contact.item.address}
          type="btc"
          onPress={this.setBTCAddress}
        />
      ))
    }

    if (contact.item.type === 'invoice') {
      return ((
        <Suggestion
          name={contact.item.paymentRequest}
          type="invoice"
          onPress={this.decodeInvoice}
        />
      ))
    }

    if (contact.item.type === 'keysend') {
      return ((
        <Suggestion
          name={contact.item.dest}
          type="keysend"
          onPress={this.selectContact({ ...contact.item, type: 'keysend' })}
        />
      ))
    }

    return ((
      <Suggestion
        name={contact.item.displayName}
        avatar={{ uri: contact.item.avatar }}
        type="contact"
        onPress={this.selectContact({ ...contact.item, type: 'contact' })}
      />
    ))
  }

  isBTCAddress = () => {
    const { value } = this.props
    //as in app/screens/Send/index.js
    return /^(bc(1|r)|[123]|m|n|((t|x)pub)|(tb1))[a-zA-HJ-NP-Z0-9]{25,90}$/.test(
      value,
    )
  }

  isLightningInvoice = () => {
    const { value } = this.props
    return /^(ln(tb|bc|bcrt))[0-9][a-z0-9]{180,7089}$/.test(value.toLowerCase())
  }

  isLnPubKey = () => {
    const { value } = this.props
    return /^[a-f0-9]{66}$/.test(value.toLowerCase())
  }

  setBTCAddress = () => {
    const { selectContact, value } = this.props
    selectContact({ address: value, type: 'btc' })
  }

  /**
   * @param {ContactTypes} contact
   */
  selectContact = contact => () => {
    const { selectContact } = this.props
    selectContact(contact)
  }

  filterContacts = () => {
    const { value, chat } = this.props
    const { contacts } = chat
    /** @type import('../../store/actions/ChatActions').Contact[] */
    const filtered = []
    contacts.forEach(contact => {
      const uInfo = this.props.users[contact.pk]

      if (!uInfo || !uInfo.displayName) {
        return
      }
      if (!uInfo.displayName.toLowerCase().includes(value.toLowerCase())) {
        return
      }
      filtered.push({
        displayName: uInfo.displayName,
        avatar: uInfo.avatar ? uInfo.avatar : '',
        pk: contact.pk,
        type: 'contact',
      })
    })
    return filtered
  }

  /**
   * @returns {ContactTypes[]}
   */
  getContacts = () => {
    const { value, enabledFeatures = this.defaultFeatures } = this.props
    Logger.log('Enabled Features:', enabledFeatures)
    const filteredContacts = enabledFeatures.includes('contacts')
      ? this.filterContacts()
      : []

    if (enabledFeatures.includes('btc') && this.isBTCAddress()) {
      return [{ address: value, type: 'btc' }, ...filteredContacts]
    }

    if (enabledFeatures.includes('invoice') && this.isLightningInvoice()) {
      return [{ paymentRequest: value, type: 'invoice' }, ...filteredContacts]
    }

    if (enabledFeatures.includes('keysend') && this.isLnPubKey()) {
      return [{ dest: value, type: 'keysend' }, ...filteredContacts]
    }
    return filteredContacts
  }

  render() {
    const {
      placeholder = 'Search Contacts...',
      value,
      onChange,
      style,
      inputStyle,
      disabled,
      type, //normal or style for Request Step view
    } = this.props
    return (
      <View
        style={[
          styles.inputGroupContainer,
          style,
          disabled ? styles.disabledContainer : null,
        ]}
      >
        <View style={styles.inputGroup}>
          <View
            style={
              this.theme === 'dark'
                ? [
                    type === 'request_step'
                      ? styles.inputContainerDark2
                      : styles.inputContainerDark1,
                    inputStyle,
                    disabled ? styles.disabledInput : null,
                  ]
                : [
                    styles.inputContainer,
                    inputStyle,
                    disabled ? styles.disabledInput : null,
                  ]
            }
          >
            <Ionicons name="md-search" color="#CBC5C5" size={16} />
            <TextInput
              style={
                this.theme === 'dark'
                  ? [
                      styles.inputDark,
                      type === 'request_step' ? { textAlign: 'center' } : null,
                    ]
                  : styles.input
              }
              value={value}
              editable={!disabled}
              onChangeText={onChange}
              placeholder={
                type === 'request_step' ? 'Send to a contact' : placeholder
              }
              placeholderTextColor={this.theme === 'dark' ? '#BCBCBC' : 'grey'}
              // onFocus={this.setFocus(true)}
              // onBlur={value.length === 0 ? this.setFocus(false) : undefined}
            />
          </View>
          {value.length > 0 ? (
            <FlatList
              data={this.getContacts()}
              renderItem={this.contactRender}
              style={
                this.theme === 'dark'
                  ? styles.inputSuggestionsDark
                  : styles.inputSuggestions
              }
              keyExtractor={this.contactKeyExtractor}
            />
          ) : null}
        </View>
      </View>
    )
  }
}

/** @param {import('../../store/reducers/index').default} state */
const mapStateToProps = ({ chat, users }) => ({ chat, users })

const mapDispatchToProps = {
  selectContact,
  decodePaymentRequest,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  // @ts-expect-error
)(ContactsSearch)

const styles = StyleSheet.create({
  inputGroupContainer: {
    width: '100%',
    elevation: 5,
  },
  inputGroup: {
    width: '100%',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 13,
    borderRadius: 100,
    height: 45,
    marginBottom: 10,
    backgroundColor: CSS.Colors.BACKGROUND_LIGHTEST_WHITE,
    overflow: 'hidden',
  },
  inputContainerDark1: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 13,
    height: 45,
    marginBottom: 10,
    backgroundColor: '#212937',
    borderWidth: 1,
    borderColor: '#4285B9',
    overflow: 'hidden',
    opacity: 0.7,
  },
  inputContainerDark2: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 13,
    height: 45,
    marginBottom: 10,
    backgroundColor: '#001220',
    borderWidth: 1,
    borderColor: '#EAEBEB',
    overflow: 'hidden',
    opacity: 1,
  },
  disabledInput: {
    elevation: 0,
  },
  input: {
    flex: 1,
    marginLeft: 5,
  },
  inputDark: {
    flex: 1,
    marginLeft: 5,
    fontFamily: 'Montserrat-600',
    color: CSS.Colors.TEXT_WHITE,
  },
  inputSuggestions: {
    backgroundColor: CSS.Colors.BACKGROUND_LIGHTEST_WHITE,
    width: '100%',
    height: 150,
    borderRadius: 15,
  },
  inputSuggestionsDark: {
    backgroundColor: '#4285B9',
    width: '100%',
    height: 150,
    borderRadius: 15,
  },
})
