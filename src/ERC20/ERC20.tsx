import { Link } from "react-router-dom";
export default function ERC20() {
    return (
        <div>

            <div className='flex justify-start gap-6 w-full'>
                <Link to="/">Home</Link>
                <Link to="/todo">Todo</Link>
                <Link to="/erc20">ERC20</Link>
            </div>
            ERC20
        </div>
    );
}