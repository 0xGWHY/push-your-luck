import "./App.css";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useSendTransaction, usePrepareSendTransaction } from "wagmi";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useBalance } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { useWaitForTransaction } from "wagmi";
import { useContractEvent } from "wagmi";
import { useNetwork } from "wagmi";
import { useSwitchNetwork } from "wagmi";

const ceilFunc = (value, position) => {
  let pos = 10 ** position;
  let result = Math.ceil((value + Number.EPSILON) * pos) / pos;
  return result;
};

function App() {
  const [price, setPrice] = useState(0);
  const [UserAddress, setUserAddress] = useState("Connect Wallet");
  const [result, setResult] = useState("");

  const currentNetwork = useNetwork();
  const { switchNetwork, isLoading } = useSwitchNetwork({
    chainId: 69,
  });

  const { data, refetch } = useBalance({
    address: "0x4f5CAfdf1469ad9211630f027182837DF821Bc97",
    chainId: 5,
  });

  useEffect(() => {
    setPrice(ceilFunc(Number(data?.formatted) / 2, 4));
  }, [data?.formatted]);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: new InjectedConnector() });
  const { disconnect } = useDisconnect();

  if (isConnected && currentNetwork.chain.network !== "goerli" && !isLoading) {
    switchNetwork?.(5);
  }

  useEffect(() => {
    if (isConnected) {
      setUserAddress(`...${address.slice(31)}`);
    } else {
      setUserAddress("Connect Wallet");
    }
  }, [address]);

  const walletFunc = () => {
    if (address !== undefined) {
      disconnect();
    } else {
      connect();
    }
  };

  const { config } = usePrepareSendTransaction({
    request: {
      to: "0x4f5CAfdf1469ad9211630f027182837DF821Bc97",
      value: BigNumber.from(ethers.utils.parseEther(price?.toString())),
      data: 0x4771c626,
      gasLimit: "70000",
    },
  });
  const requestedTx = useSendTransaction(config);

  const completeTx = useWaitForTransaction({
    hash: requestedTx?.data?.hash,
  });

  const option = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_winningPercent",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_feePercent",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Deposit",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "loser",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Lose",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "got",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "given",
          type: "uint256",
        },
      ],
      name: "Reveal",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "winner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Win",
      type: "event",
    },
    {
      stateMutability: "payable",
      type: "fallback",
    },
    {
      inputs: [],
      name: "feePercent",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "toss",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "winningPercent",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  useContractEvent({
    address: "0x4f5CAfdf1469ad9211630f027182837DF821Bc97",
    eventName: "Lose",
    abi: JSON.stringify(option),
    listener(node, label, owner) {
      console.log(node, label, owner);
      setResult("Lose haha XD");
    },
  });
  useContractEvent({
    address: "0x4f5CAfdf1469ad9211630f027182837DF821Bc97",
    eventName: "Win",
    abi: JSON.stringify(option),
    listener(node, label, owner) {
      console.log(node, label, owner);
      setResult("Win!! :)");
    },
  });

  completeTx.isSuccess && refetch();

  useEffect(() => {
    if (completeTx.isLoading || requestedTx.isLoading) {
      setResult("");
    }
  }, [completeTx.isLoading, requestedTx.isLoading]);

  return (
    <div className="App">
      <div className="connect-wallet-wrapper">
        <div className="connect-wallet" onClick={walletFunc}>
          {UserAddress}
        </div>
      </div>
      <div className={result.includes("Lose") ? "indicator lose" : "indicator"}>
        <p className="indicator-restEth">
          <img alt="ether" src="https://static.nftgo.io/icon/token/ETH.svg"></img>
          {ceilFunc(Number(data?.formatted), 4)}
        </p>
        <p className={result.includes("Lose") ? "indicator-result lose" : "indicator-result win"}>{result}</p>
        <p className="indicator-price">price: {price} eth</p>
      </div>
      <div className="push-button-wrapper">
        <button
          className="push-botton"
          onClick={() => {
            requestedTx.sendTransaction?.();
          }}
          disabled={Boolean(completeTx.isLoading)}
        >
          {completeTx.isLoading ? "Pending...." : "!! Push Your Luck !!"}
        </button>
      </div>
    </div>
  );
}

export default App;
