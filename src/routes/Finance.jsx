import React from "react";
import { Route, Routes } from "react-router-dom";

import FinancePage from "@/pages/finance/FinancePage";

const Finance = () => {
  return (
    <Routes>
      <Route path="claims" element={<FinancePage />} />
    </Routes>
  );
};

export default Finance;
