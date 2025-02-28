import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Dropdown, Modal, Form, message } from "antd";
import { STATUS_COLORS } from "@/constants/common";
import { Delete, Edit, Eye, Send, MoreHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ClaimModal } from "@/components/claimer/ClaimModal";
import { useAuth } from "@/contexts/AuthProvider";
import dayjs from "dayjs";
import { claimService } from "@/services/claim";

const ViewClaim = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const [dataSource, setDataSource] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState(null);
  const [sendConfirmVisible, setSendConfirmVisible] = useState(false);
  const [claimToSend, setClaimToSend] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const claims = await claimService.getUserClaims(user.uid);

        if (statusParam) {
          setDataSource(
            claims.filter(
              (item) => item.status.toLowerCase() === statusParam.toLowerCase(),
            ),
          );
        } else {
          setDataSource(claims);
        }
      } catch (error) {
        messageApi.error("Failed to fetch claims");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [statusParam, user.uid, messageApi]);

  const handleView = (record) => {
    setSelectedClaim(record);
    setViewModalVisible(true);
  };

  const handleDelete = (record) => {
    setClaimToDelete(record);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = () => {
    setDataSource((prev) =>
      prev.filter((item) => item.id !== claimToDelete.id),
    );
    setDeleteConfirmVisible(false);
    setClaimToDelete(null);
  };

  const handleSend = (record) => {
    setClaimToSend(record);
    setSendConfirmVisible(true);
  };

  const confirmSend = () => {
    setDataSource((prev) =>
      prev.map((item) =>
        item.id === claimToSend.id ? { ...item, status: "Pending" } : item,
      ),
    );
    setSendConfirmVisible(false);
    setClaimToSend(null);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      staffName: user.name,
      staffId: user.id,
      staffDepartment: user.department,
      projectName: record.projectName,
      role: record.role,
      projectDuration: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setSelectedClaim(record);
    setIsEditModalVisible(true);
  };

  const handleClaimSuccess = (newClaim) => {
    console.log(newClaim);

    // if (
    //   statusParam &&
    //   statusParam.toLowerCase() !== newClaim.status.toLowerCase()
    // ) {
    //   return;
    // }


    // setDataSource((prev) => [
    //   {
    //     ...newClaim,
    //     key: newClaim.id,
    //     projectDuration: [dayjs(newClaim.startDate), dayjs(newClaim.endDate)],
    //   },
    //   ...prev,
    // ]);
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

  return (
    <div className="flex flex-col gap-4 p-6">
      {contextHolder}
      <Table
        loading={loading}
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
        onSuccess={handleClaimSuccess}
        onFinish={(values) => {
          const { projectDuration, ...rest } = values;
          const [startDate, endDate] = projectDuration;

          setDataSource((prev) =>
            prev.map((item) =>
              item.id === selectedClaim.id
                ? {
                    ...item,
                    ...rest,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                  }
                : item,
            ),
          );
          setIsEditModalVisible(false);
          setSelectedClaim(null);
          form.resetFields();
        }}
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
        <p>Are you sure you want to delete claim #{claimToDelete?.id}?</p>
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
        <p>
          Are you sure you want to send claim #{claimToSend?.id} for approval?
        </p>
      </Modal>
    </div>
  );
};

export default ViewClaim;
