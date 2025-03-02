import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Dropdown, Modal, Form, message } from "antd";
import { STATUS_COLORS } from "@/constants/common";
import { Delete, Edit, Eye, Send, MoreHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ClaimModal } from "@/components/claimer/ClaimModal";
import { useAuth } from "@/contexts/AuthProvider";
import dayjs from "dayjs";
import {
  useUserClaims,
  useUpdateClaim,
  useDeleteClaim,
  useUpdateClaimStatus,
} from "@/hooks/queries/claims";

const ViewClaim = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const { user } = useAuth();

  const { data: claims = [], isLoading } = useUserClaims(user.uid, statusParam);

  const [dataSource, setDataSource] = useState(claims);

  useEffect(() => {
    setDataSource(claims);
  }, [claims]);

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState(null);
  const [sendConfirmVisible, setSendConfirmVisible] = useState(false);
  const [claimToSend, setClaimToSend] = useState(null);
  const [form] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [messageApi, contextHolder] = message.useMessage();
  const updateClaimMutation = useUpdateClaim();
  const deleteClaimMutation = useDeleteClaim();
  const sendClaimMutation = useUpdateClaimStatus();

  const handleView = (record) => {
    setSelectedClaim(record);
    setViewModalVisible(true);
  };

  const handleDelete = (record) => {
    setClaimToDelete(record);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteClaimMutation.mutateAsync(claimToDelete.id);
      messageApi.success("Claim deleted successfully");
      setDeleteConfirmVisible(false);
      setClaimToDelete(null);
    } catch (error) {
      messageApi.error("Failed to delete claim");
    }
  };

  const handleSend = (record) => {
    setClaimToSend(record);
    setSendConfirmVisible(true);
  };

  const confirmSend = async () => {
    try {
      await sendClaimMutation.mutateAsync({
        id: claimToSend.id,
        status: "Pending",
      });
      messageApi.success("Claim sent for approval");
      setSendConfirmVisible(false);
      setClaimToSend(null);
    } catch (error) {
      messageApi.error("Failed to send claim");
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      staffName: user.name,
      staffId: user.uid,
      staffDepartment: user.department,
      projectName: record.projectName,
      role: record.role,
      projectDuration: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setSelectedClaim(record);
    setIsEditModalVisible(true);
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

    if (record.status === "Draft") {
      return [
        ...baseActions,
        { type: "divider" },
        {
          key: "edit",
          label: "Edit",
          icon: <Edit className="h-4 w-4" />,
          onClick: () => handleEdit(record),
        },
        {
          key: "send",
          label: "Send",
          icon: <Send className="h-4 w-4" />,
          onClick: () => handleSend(record),
        },
        {
          key: "delete",
          label: "Delete",
          icon: <Delete className="h-4 w-4" />,
          danger: true,
          onClick: () => handleDelete(record),
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

  const handleEditFinish = async (values) => {
    try {
      const { projectDuration, ...rest } = values;
      const [startDate, endDate] = projectDuration;

      await updateClaimMutation.mutateAsync({
        id: selectedClaim.id,
        ...rest,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      messageApi.success("Claim updated successfully");
      setIsEditModalVisible(false);
      setSelectedClaim(null);
      form.resetFields();
    } catch (error) {
      console.log(error);
      messageApi.error("Failed to update claim");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {contextHolder}
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

      {/* Edit Modal */}
      <ClaimModal
        isModalVisible={isEditModalVisible}
        setIsModalVisible={setIsEditModalVisible}
        form={form}
        staffInfo={user}
        isEditing={true}
        onFinish={handleEditFinish}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteConfirmVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setDeleteConfirmVisible(false);
          setClaimToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this claim?</p>
        <p className="text-muted-foreground">This action cannot be undone.</p>
      </Modal>

      {/* Send Confirmation Modal */}
      <Modal
        title="Confirm Send"
        open={sendConfirmVisible}
        onOk={confirmSend}
        onCancel={() => {
          setSendConfirmVisible(false);
          setClaimToSend(null);
        }}
        okText="Send"
        cancelText="Cancel"
      >
        <p>Are you sure you want to send this claim for approval?</p>
      </Modal>
    </div>
  );
};

export default ViewClaim;
