import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import DashBoard from "./Pages/Dashboard";
import Layout from "./components/Layout";
import Report from "./Pages/Report";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import HomePage from "./Pages/HomePage";
import Outages from "./Pages/Outages";
import Settings from "./Pages/Settings";
import Payments from "./Pages/Payments";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<DashBoard />} />
            <Route path="reports" element={<Report />} />
            <Route path="outages" element={<Outages/>} />
            <Route path="payments" element={<Payments/>}/>
            <Route path="settings" element={<Settings/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
