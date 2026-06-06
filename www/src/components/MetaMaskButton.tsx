"use client";

import Image from "next/image";
import poolConfig from "@/lib/poolConfig";

// MetaMaskのEthereum型を定義
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const MetaMaskButton = () => {
  const addNetwork = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    const chainId = `0x${poolConfig.coin.chainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }],
      });
    } catch (switchError: unknown) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (
        typeof switchError === "object" &&
        switchError !== null &&
        "code" in switchError &&
        (switchError as { code: number }).code === 4902
      ) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainId,
                chainName: poolConfig.coin.name,
                nativeCurrency: {
                  name: poolConfig.coin.name,
                  symbol: poolConfig.coin.symbol,
                  decimals: 18,
                },
                rpcUrls: [poolConfig.coin.rpcUrl],
                blockExplorerUrls: poolConfig.links.explorer ? [poolConfig.links.explorer] : [],
              },
            ],
          });
        } catch (addError: unknown) {
          console.error(`Failed to add the ${poolConfig.coin.name} network:`, addError);
          alert(`Failed to add the ${poolConfig.coin.name} network. See console for details.`);
        }
      } else {
        console.error(`Could not switch to the ${poolConfig.coin.name} network:`, switchError);
        alert(`Failed to switch to the ${poolConfig.coin.name} network. See console for details.`);
      }
    }
  };

  return (
    <button
      className="flex items-center bg-gray-900 text-white border-2 border-blue-600 hover:bg-blue-600 rounded px-4 py-2 transition-colors duration-200"
      onClick={addNetwork}
      style={
        {
          // display: 'flex',
          // alignItems: 'center',
          // backgroundColor: '#2c2c2c',
          // color: '#fff',
        }
      }
    >
      <Image
        src="/MetaMask.svg"
        alt="MetaMask Icon"
        width={20}
        height={20}
        style={{ marginRight: "10px" }}
      />
      Add {poolConfig.coin.name}
    </button>
  );
};

export default MetaMaskButton;
