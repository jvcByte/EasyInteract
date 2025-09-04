import './App.css';
import GetTask from './GetTask';
import CreateTask from './CreateTask';
import { connectWallet, detectProvider, ethereum_window } from './lib/helperFunctions';
import type { ByteString } from './lib/types';
import { useEffect, useState } from 'react';
import { celoChainId, celoRPCUrl } from './constants/contract';
import CompleteTask from './CompleteTask';
import UpdateTask from './UpdateTask';
function App() {

  const [accounts, setAccounts] = useState<Array<ByteString>>([]);
  const [chainId, setChainId] = useState<ByteString>();

  useEffect(() => {
    detectProvider().then(({ accounts, chainId }) => {
      setAccounts(accounts);
      setChainId(chainId);
    });
    ethereum_window?.on?.("accountsChanged", (accounts: Array<ByteString>) =>
      setAccounts(accounts)
    );
    ethereum_window?.on?.("chainChanged", (chainId: ByteString) =>
      setChainId(chainId)
    );
  }, []);

  useEffect(() => {
    if (accounts[0] && chainId && parseInt(chainId) === parseInt(celoChainId)) {
      console.log("Chain Matched");
    } else {
      if (!ethereum_window) {
        alert("Wallet not Found");
      } else {
        ethereum_window
          .request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: celoChainId }],
          })
          .catch((switchError) => {
            console.log({ switchError });

            if (
              switchError.code === 4902 ||
              switchError.data.originalError.code === 4902
            ) {
              ethereum_window?.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: celoChainId,
                    chainName: "Celo Alfajores Testnet",
                    rpcUrls: [celoRPCUrl],
                  },
                ],
              });
            }
          });
      }
    }
  }, [accounts, chainId]);

  return (
    <div className=''>
      {accounts.length > 0 ? (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="font-medium text-green-800">Connected Wallet:</p>
          <p className="text-sm font-mono text-gray-600 break-all">{accounts[0]}</p>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-center">
          <p className="text-yellow-800 mb-2">Wallet not connected</p>
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      )}

      <div className='flex justify-center flex-col wrap items-center md:h-screen md:flex-row gap-2'>
        <CreateTask accounts={accounts} />
        <GetTask />
        <CompleteTask accounts={accounts} />
        <UpdateTask accounts={accounts} />
      </div>
    </div>

  );
}

export default App;