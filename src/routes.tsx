import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import ToDo from "./todo/ToDo";
import ERC20 from "./ERC20/ERC20";
import CompleteTask from "./todo/CompleteTask";
import UpdateTask from "./todo/UpdateTask";

const AppRoutes = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/todo" element={<ToDo />} />
                    <Route path="/erc20" element={<ERC20 />} />
                    <Route path="/complete-task" element={<CompleteTask accounts={[]} />} />
                    <Route path="/update-task" element={<UpdateTask accounts={[]} />} />
                </Routes>
            </Router>
        </>
    );
};

export default AppRoutes;
