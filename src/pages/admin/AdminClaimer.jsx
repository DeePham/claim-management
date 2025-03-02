import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Dropdown, Modal } from "antd";
import { STATUS_COLORS } from "@/constants/common";
import { Eye, MoreHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useClaims } from "@/hooks/queries/claims";

const AdminClaimer = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data: claims = [], isLoading } = useClaims(
    ["Pending", "Approved", "Paid", "Rejected"],
    statusParam,
  );

  useEffect(() => {
    setDataSource(claims);
  }, [claims]);

  const handleView = (record) => {
    setSelectedClaim(record);
    setViewModalVisible(true);
  };

  const getActionItems = (record) => [
    {
      key: "view",
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => handleView(record),
    },
  ];

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      render: (_text, _record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      ...(!statusParam && {
        filters: [
          { text: "Draft", value: "Draft" },
          { text: "Pending", value: "Pending" },
          { text: "Approved", value: "Approved" },
          { text: "Rejected", value: "Rejected" },
        ],
        onFilter: (value, record) => record.status === value,
      }),
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || STATUS_COLORS.default}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Staff Name",
      dataIndex: "staffName",
      sorter: (a, b) => a.staffName.localeCompare(b.staffName),
    },
    {
      title: "Project Name",
      dataIndex: "projectName",
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
    },
    {
      title: "Project Duration",
      render: (_, record) => {
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);
        return `From ${startDate.toDateString()} to ${endDate.toDateString()}`;
      },
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      width: 350,
    },
    {
      title: "Total Working",
      dataIndex: "totalWorking",
      sorter: (a, b) => a.totalWorking - b.totalWorking,
      render: (number) => `${number} hours`,
      width: 150,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record), style: { width: "160px" } }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreHorizontal className="h-4 w-4" />}
            className="flex items-center justify-center"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-6">
      <Table
        loading={isLoading}
        size="small"
        columns={columns}
        dataSource={dataSource}
        pagination={{
          size: "default",
          pageSize: 10,
        }}
        onChange={(pagination) => setPagination(pagination)}
      />

      {/* View Modal */}
      <Modal
        title="View Claim Details"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedClaim(null);
        }}
        footer={null}
        width={700}
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Claim ID</p>
                <p className="font-medium">{selectedClaim.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Staff Name</p>
                <p className="font-medium">{selectedClaim.staffName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Staff Department</p>
                <p className="font-medium">{selectedClaim.staffDepartment}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Project Name</p>
                <p className="font-medium">{selectedClaim.projectName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Tag color={STATUS_COLORS[selectedClaim.status]}>
                  {selectedClaim.status}
                </Tag>
              </div>
              <div>
                <p className="text-muted-foreground">Project Duration</p>
                <p className="font-medium">
                  From {new Date(selectedClaim.startDate).toDateString()} to{" "}
                  {new Date(selectedClaim.endDate).toDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Working Hours</p>
                <p className="font-medium">
                  {selectedClaim.totalWorking} hours
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {new Date(selectedClaim.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminClaimer;
