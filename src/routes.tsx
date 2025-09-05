import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import CreateTask from "./CreateTask";
import GetTask from "./GetTask";
import CompleteTask from "./CompleteTask";
import UpdateTask from "./UpdateTask";

const AppRoutes = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/create-task" element={<CreateTask accounts={[]} />} />
                    <Route path="/get-task" element={<GetTask />} />
                    <Route path="/complete-task" element={<CompleteTask accounts={[]} />} />
                    <Route path="/update-task" element={<UpdateTask accounts={[]} />} />
                </Routes>
            </Router>
        </>
    );
};

export default AppRoutes;
