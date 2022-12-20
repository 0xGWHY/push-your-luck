import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createStorage, WagmiConfig, createClient, configureChains, mainnet, goerli } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
// import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { InjectedConnector } from "wagmi/connectors/injected";
import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const root = ReactDOM.createRoot(document.getElementById("root"));
const { chains, provider } = configureChains([mainnet, goerli], [alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY })]);
const client = createClient({
  autoConnect: true,
  connector: new InjectedConnector(),
  provider,
});

console.log(chains);

root.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
