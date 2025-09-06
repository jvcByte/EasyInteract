import { Link } from "react-router-dom";
import type { ByteString } from "../lib/types";

export default function Header({accounts}: {accounts: Array<ByteString>}) {
    return (
        <div className="flex justify-between w-full">
            <div className='flex justify-start gap-6 w-full p-2'>
                <Link to="/">Home</Link>
                <Link to="/todo">Todo</Link>
                <Link to="/erc20">ERC20</Link>
                <Link to="/contract-interact">Contract Interaction</Link>
            </div>
            <div className='flex justify-end gap-6 w-full p-2'>
                {accounts.map((account, index) => (
                    <p key={index}>{account}</p>
                ))}
            </div>
        </div>
    );
}