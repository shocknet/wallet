/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { TextInput as TextInputRN } from 'react-native'

/**
 * A TextInput with no padding.
 * @type {React.FC<import('react-native').TextInputProps>}
 */
const TextInput = React.memo(
  React.forwardRef((props, ref) => (
    <TextInputRN
      // @ts-expect-error
      paddingTop={0}
      paddingBottom={0}
      paddingLeft={0}
      paddingRight={0}
      ref={ref}
      {...props}
    />
  )),
)

export default TextInput
