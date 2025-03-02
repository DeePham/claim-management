import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Dropdown, Modal, message } from "antd";
import { Eye, Printer, DollarSign, MoreHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { STATUS_COLORS } from "@/constants/common";
import { useClaims } from "@/hooks/queries/claims";
import { useUpdateClaimStatus } from "@/hooks/queries/claims";

const FinancePage = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const [messageApi, contextHolder] = message.useMessage();

  const { data: claims = [], isLoading } = useClaims(
    ["Approved", "Paid"],
    statusParam,
  );

  const [dataSource, setDataSource] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printingClaim, setPrintingClaim] = useState(null);
  const updateStatusMutation = useUpdateClaimStatus();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    setDataSource(claims);
  }, [claims]);

  const handlePaid = (record) => {
    setSelectedClaim(record);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (selectedClaim) {
      try {
        await updateStatusMutation.mutateAsync({
          id: selectedClaim.id,
          status: "Paid",
        });

        messageApi.success("Payment marked as successful");
        setIsModalOpen(false);
        setSelectedClaim(null);
      } catch (error) {
        messageApi.error("Failed to update payment status");
      }
    }
  };

  const handlePrintClick = (record) => {
    setPrintingClaim(record);
    setIsPrintModalOpen(true);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Claim Receipt - ${printingClaim.id}</title>
          <meta charset="UTF-8">
          <link rel="stylesheet" href="/src/index.css">
        </head>
        <body>
          <div class="print-page">
            <div class="print-header">
              <h1>Claim Receipt</h1>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="print-grid">
              <div class="print-section">
                <h3>Claim Information</h3>
                <p>
                  <span class="print-label">Claim ID:</span>
                  <span class="print-value">${printingClaim.id}</span>
                </p>
                <p>
                  <span class="print-label">Status:</span>
                  <span class="print-value" style="color: ${STATUS_COLORS[printingClaim.status]}">
                    ${printingClaim.status}
                  </span>
                </p>
                <p>
                  <span class="print-label">Total Hours:</span>
                  <span class="print-value">${printingClaim.totalWorking} hours</span>
                </p>
              </div>

              <div class="print-section">
                <h3>Staff Information</h3>
                <p>
                  <span class="print-label">Name:</span>
                  <span class="print-value">${printingClaim.staffName}</span>
                </p>
                <p>
                  <span class="print-label">Project:</span>
                  <span class="print-value">${printingClaim.projectName}</span>
                </p>
              </div>
            </div>

            <div class="print-section">
              <h3>Project Duration</h3>
              <p>
                <span class="print-label">Period:</span>
                <span class="print-value">
                  ${new Date(printingClaim.startDate).toLocaleDateString()} to 
                  ${new Date(printingClaim.endDate).toLocaleDateString()}
                </span>
              </p>
            </div>

            <div class="print-signature">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="print-label">Signature</span>
                <div style="width: 200px; border-bottom: 1px dashed #000;"></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      requestAnimationFrame(() => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
          setIsPrintModalOpen(false);
          setPrintingClaim(null);
        };
      });
    };
  };

  const getActionItems = (record) => {
    const baseActions = [
      {
        key: "print",
        label: "Print",
        icon: <Printer className="h-4 w-4" />,
        onClick: () => handlePrintClick(record),
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
      render: (_text, _record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
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

  const PrintComponent = () => (
    <div className="p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Claim Receipt</h1>
        <p className="text-muted-foreground">
          Generated on: {new Date().toLocaleDateString()}
        </p>
      </div>

      {printingClaim && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="mb-2 font-semibold">Claim Information</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-muted-foreground py-1">Claim ID:</td>
                    <td className="font-medium">{printingClaim.id}</td>
                  </tr>
                  <tr>
                    <td className="text-muted-foreground py-1">Status:</td>
                    <td>
                      <Tag color={STATUS_COLORS[printingClaim.status]}>
                        {printingClaim.status}
                      </Tag>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted-foreground py-1">Total Hours:</td>
                    <td className="font-medium">
                      {printingClaim.totalWorking} hours
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Staff Information</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-muted-foreground py-1">Name:</td>
                    <td className="font-medium">{printingClaim.staffName}</td>
                  </tr>
                  <tr>
                    <td className="text-muted-foreground py-1">Project:</td>
                    <td className="font-medium">{printingClaim.projectName}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Project Duration</h3>
            <p>
              From{" "}
              <span className="font-medium">
                {new Date(printingClaim.startDate).toDateString()}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {new Date(printingClaim.endDate).toDateString()}
              </span>
            </p>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Signature</p>
              <div className="h-8 w-48 border-b border-dashed"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

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

      <Modal
        title="Confirm Payment"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedClaim(null);
        }}
        okText="Confirm"
        cancelText="Cancel"
        confirmLoading={updateStatusMutation.isPending}
      >
        <p>Are you sure you want to mark this claim as paid?</p>
      </Modal>

      <Modal
        title="Print Preview"
        open={isPrintModalOpen}
        onCancel={() => {
          setIsPrintModalOpen(false);
          setPrintingClaim(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsPrintModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="print"
            type="primary"
            onClick={handlePrint}
            disabled={!printingClaim}
          >
            Print
          </Button>,
        ]}
        width={800}
      >
        <PrintComponent />
      </Modal>
    </div>
  );
};

export default FinancePage;
