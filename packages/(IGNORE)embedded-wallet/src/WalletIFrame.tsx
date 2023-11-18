import React, { type FC } from 'react'
import Frame from 'react-frame-component'
import { EmbeddedWallet } from './EmbeddedWallet'

export const WalletIframe: FC = () => {
  return (
    <Frame>
      <EmbeddedWallet />
    </Frame>
  )
}
