import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Dropdown, Modal } from "antd";
import { Eye, Printer, DollarSign, MoreHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DUMMY_CLAIMS } from "@/constants/finance";
import { STATUS_COLORS } from "@/constants/common";

const FinancePage = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const [dataSource, setDataSource] = useState(DUMMY_CLAIMS);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (statusParam) {
      setDataSource(
        DUMMY_CLAIMS.filter(
          (item) => item.status.toLowerCase() === statusParam.toLowerCase(),
        ),
      );
    } else {
      setDataSource(DUMMY_CLAIMS);
    }
  }, [statusParam]);

  const handlePaid = (record) => {
    setSelectedClaim(record);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (selectedClaim) {
      setDataSource((prev) =>
        prev.filter((item) => item.id !== selectedClaim.id),
      );
    }
    setIsModalOpen(false);
  };

  const getActionItems = (record) => {
    const baseActions = [
      {
        key: "view",
        label: "View",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => console.log("View", record),
      },
      {
        key: "print",
        label: "Print",
        icon: <Printer className="h-4 w-4" />,
        onClick: () => console.log("Print", record),
      },
    ];

    if (record.status === "Paid") {
      return baseActions;
    }

    return [
      ...baseActions,
      {
        type: "divider",
      },
      {
        key: "paid",
        label: "Paid",
        icon: <DollarSign className="h-4 w-4" />,
        onClick: () => handlePaid(record),
      },
    ];
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Status",
      dataIndex: "status",
      ...(!statusParam && {
        filters: [
          { text: "Approved", value: "Approved" },
          { text: "Paid", value: "Paid" },
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
        size="small"
        columns={columns}
        dataSource={dataSource}
        pagination={{
          size: "default",
          pageSize: 10,
        }}
      />

      <Modal
        title="Confirm Payment"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you want to mark claim #{selectedClaim?.id} as paid?</p>
      </Modal>
    </div>
  );
};

export default FinancePage;
