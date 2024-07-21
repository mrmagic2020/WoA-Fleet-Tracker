import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import SharedAircraftGroup from "./components/SharedAircraftGroup";
const FleetDashboard = lazy(() => import("./components/FleetDashboard"));
const AircraftDetails = lazy(() => import("./components/AircraftDetails"));
const AircraftGroupList = lazy(() => import("./components/AircraftGroupList"));
const AircraftGroupForm = lazy(() => import("./components/AircraftGroupForm"));
const AircraftGroupDetails = lazy(
  () => import("./components/AircraftGroupDetails")
);
const Admin = lazy(() => import("./components/Admin"));
import Container from "react-bootstrap/Container";
import CustomNavbar from "./components/CustomNavbar";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <CustomNavbar />
        <Suspense fallback={<Container>Loading...</Container>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/sharedGroups/:user/:groupId"
              element={<SharedAircraftGroup />}
            />
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/" element={<FleetDashboard />} />
              <Route path="/aircraft/:id" element={<AircraftDetails />} />
              <Route path="/aircraftGroups" element={<AircraftGroupList />} />
              <Route
                path="/aircraftGroups/new"
                element={<AircraftGroupForm />}
              />
              <Route
                path="/aircraftGroups/edit/:id"
                element={<AircraftGroupForm />}
              />
              <Route
                path="/aircraftGroups/:id"
                element={<AircraftGroupDetails />}
              />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
