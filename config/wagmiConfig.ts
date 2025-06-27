import { http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';


export const wagmiConfig = getDefaultConfig({
  chains: [sepolia],
  appName: 'My Zeur App',
  projectId: '70d84c4b83c6e7fb51ae2e5cb40ea84a',
  transports: {
    [sepolia.id]: http(),
  },
})