import { PropsWithChildren } from "react";

import "@rainbow-me/rainbowkit/styles.css";

import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { foundry } from "@wagmi/core/chains";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import { mockWallet } from "../lib/mockWallet";
import { TESTNET_URL } from "../lib/const";

const { chains, provider } = configureChains(
  [foundry],
  [jsonRpcProvider({ rpc: () => ({ http: TESTNET_URL }) })]
);

const connectors = connectorsForWallets([
  {
    groupName: "Testing",
    wallets: [mockWallet()],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WalletProvider;
