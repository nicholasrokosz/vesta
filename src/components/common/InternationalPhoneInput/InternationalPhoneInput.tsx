import PhoneInput from 'react-phone-number-input'
import type { E164Number } from 'libphonenumber-js/types'
import { Flex, Text, createStyles } from '@mantine/core'
import type { ReactNode } from 'react'
import React from 'react'

interface Props {
  onChange: (val: E164Number) => void
  label: string
  value: E164Number
  required?: boolean
  placeholder?: string
  width?: string
  error?: ReactNode
}

const useStyles = createStyles((theme) => ({
  error: {
    color: theme.colors.red[6],
  },
}))

const InternationalPhoneInput = ({
  width = '100%',
  label,
  value,
  placeholder,
  required = false,
  error,
  onChange,
}: Props) => {
  const { classes } = useStyles()
  return (
    <Flex w={width} direction="column">
      <Text m={0} fw={500} fz={'sm'}>
        {label}
        {required && <span className={classes.error}> *</span>}
      </Text>
      <div className={error ? 'error' : ''}>
        <PhoneInput
          defaultCountry="US"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <Text fz={14} className={classes.error}>
          {error}
        </Text>
      </div>
    </Flex>
  )
}

export default InternationalPhoneInput
