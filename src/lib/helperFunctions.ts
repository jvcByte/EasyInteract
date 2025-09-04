import type { WindowEthereum, ByteString } from "./types";

const ethereum_window = (window as WindowEthereum).ethereum;

const detectProvider = async () => {
    if (typeof ethereum_window !== "undefined") {
        console.log("Wallet Found");

        const [accounts, chainId] = await Promise.all(
            ["eth_accounts", "eth_chainId"].map((method) =>
                ethereum_window.request({ method })
            )
        );

        return { accounts: accounts as Array<ByteString>, chainId: chainId as ByteString };
    } else {
        console.log("No wallet found");
        return {
            accounts: [],
            chainId: undefined,
        };
    }
};

const connectWallet = async () => {
    if (!ethereum_window) {
        alert("Wallet not Found");
    } else {
        await ethereum_window.request({
            method: "eth_requestAccounts",
        });
    }
};

export { ethereum_window, detectProvider, connectWallet };
