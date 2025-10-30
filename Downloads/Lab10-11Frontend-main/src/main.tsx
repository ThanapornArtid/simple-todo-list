import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import App from "./App";
import "./index.css";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import AboutUsPage from "@/pages/AboutUsPage";
// import InvoicePage from "@/pages/InvoicePage";
import QuotationPage from "@/pages/QuotationPage";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/invoice" element={<InvoicePage />} /> */}
        <Route path="/quotation/*" element={<QuotationPage />} />
        <Route path="/aboutus" element={<AboutUsPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
