import RevenueCell from './RevenueCell'
import RevenueRow from './RevenueRow'
import React from 'react'
import { RevenueCellFormat } from './types'

interface Props {
  text?: React.ReactNode
  total?: React.ReactNode
  manager?: React.ReactNode
  owner?: React.ReactNode
}

const GenericRow = ({ text, total, manager, owner }: Props) => {
  return (
    <RevenueRow>
      <RevenueCell>{text}</RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>{total}</RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>{manager}</RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>{owner}</RevenueCell>
    </RevenueRow>
  )
}

export default GenericRow
