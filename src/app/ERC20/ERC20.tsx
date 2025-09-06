import Header from "../component/Header";
import { useEffect, useState } from "react";
import type { ByteString } from "../../lib/types";
import { detectProvider } from "../../lib/helperFunctions";
export default function ERC20() {
    const [accounts, setAccounts] = useState<Array<ByteString>>([]);
    useEffect(() => {
        detectProvider().then(({ accounts }) => {
            setAccounts(accounts);
        });
    }, []);
    return (
        <div className="w-[100vw] h-[100vh] text-white px-8 py-4">
            <div>
                <Header accounts={accounts} />
            </div>
            <div>
                ERC20
            </div>
        </div>
    );
}