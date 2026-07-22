import { Routes, Route, Navigate } from "react-router-dom";

import ROUTES from "@/constants/routes";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Workspace from "@/pages/Workspace";

function AppRoutes() {
    return (
        <Routes>
            <Route path={ROUTES.HOME} element={<Landing />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.WORKSPACE} element={<Workspace />} />

            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
    );
}

export default AppRoutes;