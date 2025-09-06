import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./app/App";
import ToDo from "./app/todo/ToDo";
import ERC20 from "./app/ERC20/ERC20";
import UpdateTask from "./app/todo/UpdateTask";
import Interact from "./app/contract-interact/Interact";

const AppRoutes = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/todo" element={<ToDo />} />
                    <Route path="/erc20" element={<ERC20 />} />
                    <Route path="/contract-interact" element={<Interact />} />
                    <Route path="/update-task" element={<UpdateTask accounts={[]} />} />
                </Routes>
            </Router>
        </>
    );
};

export default AppRoutes;
