import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Dropdown, Modal, message } from "antd"; // Add message
import { DUMMY_CLAIMS } from "@/constants/approver";
import { STATUS_COLORS } from "@/constants/common";
import {
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useClaims } from "@/hooks/queries/claims";
import { useUpdateClaimStatus } from "@/hooks/queries/claims";

const ClaimApprovalPage = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const [messageApi, contextHolder] = message.useMessage();

  const { data: claims = [], isLoading } = useClaims(
    ["Pending", "Approved"],
    statusParam,
  );

  const [dataSource, setDataSource] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const updateStatusMutation = useUpdateClaimStatus();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    setDataSource(claims);
  }, [claims]);

  const handleView = (record) => {
    setSelectedClaim(record);
    setViewModalVisible(true);
  };

  const handleStatusAction = (record, action) => {
    setSelectedClaim(record);
    setConfirmAction(action);
    setConfirmModalVisible(true);
  };

  const confirmStatusChange = async () => {
    if (confirmAction && selectedClaim) {
      const statusMap = {
        approve: "Approved",
        reject: "Rejected",
        return: "Draft", // Trả về trạng thái Draft để claimer có thể chỉnh sửa
      };

      try {
        await updateStatusMutation.mutateAsync({
          id: selectedClaim.id,
          status: statusMap[confirmAction],
        });

        messageApi.success(`Claim ${confirmAction}ed successfully`);
        setConfirmModalVisible(false);
        setSelectedClaim(null);
        setConfirmAction(null);
      } catch (error) {
        messageApi.error(`Failed to ${confirmAction} claim`);
      }
    }
  };

  const getActionItems = (record) => {
    const baseActions = [
      {
        key: "view",
        label: "View",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => handleView(record),
      },
    ];

    if (record.status === "Pending") {
      return [
        ...baseActions,
        { type: "divider" },
        {
          key: "approve",
          label: "Approve",
          icon: <CheckCircle className="h-4 w-4" />,
          onClick: () => handleStatusAction(record, "approve"),
        },
        {
          key: "reject",
          label: "Reject",
          icon: <XCircle className="h-4 w-4" />,
          danger: true,
          onClick: () => handleStatusAction(record, "reject"),
        },
        {
          key: "return",
          label: "Return",
          icon: <RotateCcw className="h-4 w-4" />,
          onClick: () => handleStatusAction(record, "return"),
        },
      ];
    }

    return baseActions;
  };

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
          { text: "Pending", value: "Pending" },
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
      {contextHolder}
      <Table
        loading={isLoading || updateStatusMutation.isPending}
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
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Confirm Action"
        open={confirmModalVisible}
        onOk={confirmStatusChange}
        onCancel={() => {
          setConfirmModalVisible(false);
          setSelectedClaim(null);
          setConfirmAction(null);
        }}
        okText="Confirm"
        cancelText="Cancel"
        okButtonProps={{
          danger: confirmAction === "reject" || confirmAction === "return",
          loading: updateStatusMutation.isPending,
        }}
      >
        <p>
          Are you sure you want to {confirmAction} this claim from{" "}
          {selectedClaim?.staffName}?
        </p>
        {confirmAction === "reject" && (
          <p className="text-muted-foreground">
            This action will reject the claim and notify the claimer.
          </p>
        )}
        {confirmAction === "return" && (
          <p className="text-muted-foreground">
            This action will return the claim to draft status for revision.
          </p>
        )}
      </Modal>
    </div>
  );
};

export default ClaimApprovalPage;
