import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux'
// @ts-ignore
import { Dropdown } from 'react-native-material-dropdown'
import * as CSS from '../../../res/css'
import InputGroup from '../../../components/InputGroup'
import {
  setAmount,
  setDescription,
  setUnitSelected,
} from '../../../actions/InvoiceActions'

/**
 * @typedef {ReturnType<typeof mapStateToProps>} ConnectedRedux
 */
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {object} TmpProps
 * @prop {Navigation} navigation
 * @prop {(amount:string)=>void} setAmount
 * @prop {(description:string)=>void} setDescription
 * @prop {(unit:import('../../../actions/InvoiceActions').SelectedUnit)=>void} setUnitSelected
 * @prop {(string)=} theme
 */
/**
 * @typedef {ConnectedRedux & TmpProps} Props
 */

/**
 * @type {React.FC<Props>}
 */
const AmountStep = ({
  setAmount,
  setDescription,
  setUnitSelected,
  invoice,
  theme = 'dark',
}) => ((
  <>
    {theme === 'dark' ? null : (
      <Text style={styles.stepTitle}>Enter Amount</Text>
    )}
    <View>
      <View style={styles.amountContainer}>
        <InputGroup
          label={theme === 'dark' ? 'Enter Amount' : 'Amount'}
          value={invoice.amount}
          onChange={setAmount}
          style={styles.amountInput}
          type="numeric"
        />
        <Dropdown
          data={[
            {
              value: 'sats',
            },
            {
              value: 'BTC',
            },
          ]}
          onChangeText={setUnitSelected}
          containerStyle={
            theme === 'dark' ? styles.amountSelectDark : styles.amountSelect
          }
          value={invoice.unitSelected ? 'sats' : invoice.unitSelected}
          lineWidth={0}
          inputContainerStyle={
            theme === 'dark'
              ? styles.amountSelectInputDark
              : styles.amountSelectInput
          }
          rippleOpacity={0}
          pickerStyle={
            theme === 'dark' ? styles.amountPickerDark : styles.amountPicker
          }
          dropdownOffset={
            theme === 'dark' ? { top: 0, left: 0 } : { top: 8, left: 0 }
          }
          rippleInsets={
            theme === 'dark'
              ? { top: 0, bottom: 0, right: 0, left: 0 }
              : { top: 8, bottom: 0, right: 0, left: 0 }
          }
          textColor={theme === 'dark' ? '#EBEBEB' : 'rgba(0,0,0, .87)'}
          itemColor={theme === 'dark' ? '#CBCBCB' : 'rgba(0,0,0, .54)'}
          selectedItemColor={theme === 'dark' ? '#EBEBEB' : 'rgba(0,0,0, .87)'}
          baseColor={theme === 'dark' ? '#4285B9' : 'rgba(0,0,0, .38)'}
        />
      </View>
      <View>
        <InputGroup
          label="Description"
          value={invoice.description}
          onChange={setDescription}
          placeholder="(Optional)"
          inputStyle={
            theme === 'dark' ? styles.descInputDark : styles.descInput
          }
          multiline
        />
      </View>
    </View>
  </>
))

/**
 * @param {{
 * invoice:import('../../../../reducers/InvoiceReducer').State}} state
 */
const mapStateToProps = ({ invoice }) => ({ invoice })

const mapDispatchToProps = {
  setAmount,
  setDescription,
  setUnitSelected,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AmountStep)

const styles = StyleSheet.create({
  stepTitle: {
    fontFamily: 'Montserrat-700',
    textAlign: 'center',
    fontSize: 22,
  },
  amountContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  amountInput: {
    width: '60%',
    marginBottom: 0,
  },
  amountSelect: {
    width: '35%',
    marginBottom: 0,
    height: 45,
  },
  amountSelectDark: {
    width: '35%',
    marginTop: 0,
    height: 45,
  },
  amountSelectInput: {
    borderBottomColor: CSS.Colors.TRANSPARENT,
    elevation: 4,
    paddingHorizontal: 15,
    borderRadius: 100,
    height: 45,
    alignItems: 'center',
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
  },
  amountSelectInputDark: {
    paddingHorizontal: 15,
    height: 45,
    alignItems: 'center',
    backgroundColor: CSS.Colors.TRANSPARENT,
    fontFamily: 'Montserrat-700',
    color: '#EBEBEB',
    fontSize: 20,
  },
  amountPicker: { borderRadius: 15 },
  amountPickerDark: {
    borderRadius: 0,
    backgroundColor: '#212937',
  },
  descInput: { height: 100, borderRadius: 15, textAlignVertical: 'top' },
  descInputDark: { height: 100, borderRadius: 0, textAlignVertical: 'top' },
})
