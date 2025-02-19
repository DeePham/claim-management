import React, { useState } from "react";
import { Modal, Table } from "antd";

const FinancePage = () => {
  const [approvedClaims, setApprovedClaims] = useState([
    { 
      id: 1, 
      claimName: "Partime", 
      staffName: "Hung Dung", 
      status: "Approved",
      projectDuration: "2 weeks",
      totalWorkingHours: 80,
      totalClaimAmount: "$800"
    },
    { id: 2, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
    { id: 3, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
    { id: 4, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
    { id: 5, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
    { id: 6, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
    { id: 7, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
    { id: 8, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
    { id: 9, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
    { id: 10, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
    { id: 11, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
    { id: 12, claimName: "Partime", staffName: "Hung Dung", status: "Approved" },
  ]);

  const [paidClaims, setPaidClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handlePaid = (record) => {
    setSelectedClaim(record);
    setIsModalOpen(true);
  };

  const handleViewClaim = (record) => {
    setSelectedClaim(record);
    setIsViewModalOpen(true);
  };

  const handleOk = () => {
    if (selectedClaim) {
      setApprovedClaims((prevClaims) => 
        prevClaims.filter(c => c.id !== selectedClaim.id)
      );
      
      setPaidClaims((prevPaidClaims) => [
        ...prevPaidClaims,
        { ...selectedClaim, status: "Paid" }
      ]);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Claim Name',
      dataIndex: 'claimName',
      key: 'claimName',
    },
    {
      title: 'Staff Name',
      dataIndex: 'staffName',
      key: 'staffName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          status === 'Approved' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value === "paid") {
              handlePaid(record);
            } else if (e.target.value === "view") {
              handleViewClaim(record);
            }
            e.target.value = "";
          }}
          className="border border-gray-300 p-1 rounded"
        >
          <option value="">Select Action</option>
          <option value="view">View Claim</option>
          <option value="print">Print Claim</option>
          <option value="paid">Paid</option>
        </select>
      ),
    },
  ];

  const paidColumns = columns.filter(col => col.key !== 'action');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Approved Claims</h1>
      </div>
      
      <Table
        columns={columns}
        dataSource={approvedClaims}
        rowKey="id"
        pagination={{
          total: approvedClaims.length,
          pageSize: 10,
          position: ['bottomCenter'],
          className: "my-custom-pagination"
        }}
      />

      <div className="mt-8">
        <h1 className="text-2xl font-semibold mb-4">Paid Claims</h1>
        <Table
          columns={paidColumns}
          dataSource={paidClaims}
          rowKey="id"
          pagination={{
            total: paidClaims.length,
            pageSize: 10,
            position: ['bottomCenter'],
            className: "my-custom-pagination"
          }}
        />
      </div>

      <Modal
        title="Confirm Payment"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="OK"
        okButtonProps={{
          style: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' }
        }}
        cancelText="Cancel"
      >
        <p>{selectedClaim ? `Are you sure you want to Paid ID ${selectedClaim.id} ?` : ''}</p>
      </Modal>

      <Modal
        title={<h1 className="text-xl font-semibold">View Claim Request</h1>}
        open={isViewModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        {selectedClaim && (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 font-medium">Claim ID</p>
                <p className="text-gray-900">{selectedClaim.id}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Staff Name</p>
                <p className="text-gray-900">{selectedClaim.staffName}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Claim Name</p>
                <p className="text-gray-900">{selectedClaim.claimName}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Project Duration</p>
                <p className="text-gray-900">{selectedClaim.projectDuration}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Total Working Hours</p>
                <p className="text-gray-900">{selectedClaim.totalWorkingHours} hours</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Total Claim Amount</p>
                <p className="text-gray-900">{selectedClaim.totalClaimAmount}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FinancePage; 