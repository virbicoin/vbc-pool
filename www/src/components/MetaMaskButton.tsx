"use client";

import Image from "next/image";

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

    const chainId = "0x149"; // 329 in decimal

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
                chainName: "VirBiCoin",
                nativeCurrency: {
                  name: "VirBiCoin",
                  symbol: "VBC",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.digitalregion.jp"],
                blockExplorerUrls: ["https://explorer.digitalregion.jp"],
              },
            ],
          });
        } catch (addError: unknown) {
          console.error("Failed to add the VirBiCoin network:", addError);
          alert("Failed to add the VirBiCoin network. See console for details.");
        }
      } else {
        console.error("Could not switch to the VirBiCoin network:", switchError);
        alert("Failed to switch to the VirBiCoin network. See console for details.");
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
      Add VirBiCoin
    </button>
  );
};

export default MetaMaskButton;
