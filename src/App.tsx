import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
const FleetDashboard = lazy(() => import("./components/FleetDashboard"));
const AircraftDetails = lazy(() => import("./components/AircraftDetails"));
import Login from "./components/Login";
import Register from "./components/Register";
import Admin from "./components/Admin";
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
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/" element={<FleetDashboard />} />
              <Route path="/aircraft/:id" element={<AircraftDetails />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
