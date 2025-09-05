import { Link } from "react-router-dom";

export default function Header() {
    return (
        <div>
            <div className='flex justify-start gap-6 w-full p-2'>
                <Link to="/">Home</Link>
                <Link to="/todo">Todo</Link>
                <Link to="/erc20">ERC20</Link>
                <Link to="/contract-interact">Contract Interaction</Link>
            </div>
        </div>
    );
}