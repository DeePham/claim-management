import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ClaimsPage from '@/pages/approver/ClaimApprovalPage'

const Approver = () => {
  return (
    <Routes>
      <Route path="claims" element={<ClaimsPage />} />
    </Routes>
  )
}

export default Approver
