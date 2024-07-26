import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { initReCAPTCHASiteKey } from "./services/ReCAPTCHAService";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Register from "./components/Register";
const SharedAircraftGroup = lazy(
  () => import("./components/SharedAircraftGroup")
);
const SharedAircraftDetails = lazy(
  () => import("./components/SharedAircraftDetails")
);
const FleetDashboard = lazy(() => import("./components/FleetDashboard"));
const AircraftDetails = lazy(() => import("./components/AircraftDetails"));
const AircraftGroupList = lazy(() => import("./components/AircraftGroupList"));
const AircraftGroupForm = lazy(() => import("./components/AircraftGroupForm"));
const AircraftGroupDetails = lazy(
  () => import("./components/AircraftGroupDetails")
);
const Admin = lazy(() => import("./components/Admin"));
import LoadingFallback from "./components/LoadingFallback";
import CustomNavbar from "./components/CustomNavbar";
import CustomFooter from "./components/CustomFooter";

const App: React.FC = () => {
  initReCAPTCHASiteKey();
  return (
    <AuthProvider>
      <Router>
        <CustomNavbar />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/sharedGroups/:user/:groupId"
              element={<SharedAircraftGroup />}
            />
            <Route
              path="/sharedGroups/:user/:groupId/:aircraftId"
              element={<SharedAircraftDetails />}
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
        <CustomFooter />
      </Router>
    </AuthProvider>
  );
};

export default App;
