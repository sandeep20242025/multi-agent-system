import { Routes, Route, Navigate } from "react-router-dom";

import ROUTES from "@/constants/routes";

import Landing          from "@/pages/Landing";
import Login            from "@/pages/Login";
import Register         from "@/pages/Register";
import WorkspaceLayout  from "@/layouts/WorkspaceLayout";
import Dashboard        from "@/pages/Dashboard/Dashboard";
import Workspace        from "@/pages/Workspace/Workspace";
import Files            from "@/pages/Files";
import Agents           from "@/pages/Agents";
import Projects         from "@/pages/Projects";
import Settings         from "@/pages/Settings";
import Notifications    from "@/pages/Notifications";

function AppRoutes() {
    return (
        <Routes>
            <Route path={ROUTES.HOME}      element={<Landing />}   />
            <Route path={ROUTES.LOGIN}     element={<Login />}     />
            <Route path={ROUTES.REGISTER}  element={<Register />}  />
            <Route
                path={ROUTES.WORKSPACE}
                element={
                    <WorkspaceLayout>
                        <Dashboard />
                    </WorkspaceLayout>
                }
            />
            <Route
                path={ROUTES.CHAT}
                element={
                    <WorkspaceLayout>
                        <Workspace />
                    </WorkspaceLayout>
                }
            />
            <Route
                path={ROUTES.FILES}
                element={
                    <WorkspaceLayout>
                        <Files />
                    </WorkspaceLayout>
                }
            />
            <Route
                path={ROUTES.AGENTS}
                element={
                    <WorkspaceLayout>
                        <Agents />
                    </WorkspaceLayout>
                }
            />
            <Route
                path={ROUTES.PROJECTS}
                element={
                    <WorkspaceLayout>
                        <Projects />
                    </WorkspaceLayout>
                }
            />

            <Route
                path={ROUTES.SETTINGS}
                element={
                    <WorkspaceLayout>
                        <Settings />
                    </WorkspaceLayout>
                }
            />

            <Route
                path={ROUTES.NOTIFICATIONS}
                element={
                    <WorkspaceLayout>
                        <Notifications />
                    </WorkspaceLayout>
                }
            />

            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
    );
}

export default AppRoutes;