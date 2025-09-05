import './App.css';
import { Link } from 'react-router-dom';
function App() {



  return (
    <div className=''>
      <div className='flex justify-start gap-6 w-full'>
        <Link to="/">Home</Link>
        <Link to="/todo">Todo</Link>
        <Link to="/erc20">ERC20</Link>
      </div>
      <div>
        <div>
          Block Chain DApp
        </div>
        <div>
          Wallet
        </div>
      </div>
    </div>

  );
}

export default App;