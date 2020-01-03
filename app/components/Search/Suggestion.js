import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import * as CSS from '../../res/css'

const Suggestion = ({ name = '', style = {} }) => (
  <View style={[styles.inputSuggestion, style]}>
    <View style={styles.suggestionAvatar} />
    <Text style={styles.suggestionName}>{name}</Text>
  </View>
)

export default Suggestion

const styles = StyleSheet.create({
  inputSuggestion: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionAvatar: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BUTTON_BLUE,
    marginRight: 11,
  },
  suggestionName: {
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_GRAY,
    fontSize: 12,
  },
})
