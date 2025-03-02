import React, {useEffect } from "react";
import { Form, Input, DatePicker, Select, Modal, message } from "antd";
import { HEADER_TEXTS } from "@/constants/header";
import { JOD_RANKS } from "@/constants/common";
import { calculateWorkingHours } from "@/utils";
import { useCreateClaim, useSaveDraft } from "@/hooks/queries/claims";
import { useProjects } from "@/hooks/queries/projects";

const { RangePicker } = DatePicker;

export const ClaimModal = ({
  isModalVisible,
  setIsModalVisible,
  form,
  staffInfo,
  isEditing = false,
  onFinish,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const createClaimMutation = useCreateClaim();
  const saveDraftMutation = useSaveDraft();

  const { data: projects = [], isLoading, error } = useProjects();

  useEffect(() => {
    if (error) {
      messageApi.error("Failed to fetch projects");
    }
  }, [error, messageApi]);

  const handleCreateClaim = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.projectDuration;

      if (isEditing) {
        onFinish(values);
      } else {
        const totalWorking = calculateWorkingHours(startDate, endDate);

        await createClaimMutation.mutateAsync({
          ...values,
          staffId: staffInfo.uid,
          staffName: staffInfo.name,
          staffDepartment: staffInfo.department,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalWorking,
        });

        setIsModalVisible(false);
        form.resetFields();
        messageApi.success("Claim created successfully!");
      }
    } catch (error) {
      if (!error.errorFields) {
        messageApi.error("Failed to create claim");
      }
    }
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.getFieldsValue();
      const [startDate, endDate] = values.projectDuration || [];

      const totalWorking =
        startDate && endDate ? calculateWorkingHours(startDate, endDate) : 0;

      await saveDraftMutation.mutateAsync({
        ...values,
        staffId: staffInfo.uid,
        staffName: staffInfo.name,
        staffDepartment: staffInfo.department,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        totalWorking,
      });

      setIsModalVisible(false);
      form.resetFields();
      messageApi.success("Draft saved successfully!");
    } catch (error) {
      messageApi.error("Failed to save draft");
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={isEditing ? "Edit Claim" : HEADER_TEXTS.createClaimTitle}
        open={isModalVisible}
        onOk={handleCreateClaim}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={
          isLoading ||
          createClaimMutation.isPending ||
          saveDraftMutation.isPending
        }
        okText={isEditing ? "Save Changes" : HEADER_TEXTS.createClaimButton}
        cancelText={isEditing ? "Cancel" : HEADER_TEXTS.saveDraftButton}
        style={{ top: 40 }}
        cancelButtonProps={{
          onClick: isEditing ? () => setIsModalVisible(false) : handleSaveDraft,
        }}
      >
        <p className="mb-4 text-gray-500">
          {HEADER_TEXTS.createClaimDescription}
        </p>
        <Form
          disabled={
            isLoading ||
            createClaimMutation.isPending ||
            saveDraftMutation.isPending
          }
          form={form}
          layout="vertical"
        >
          <div className="flex-wrap gap-4">
            <Form.Item
              label="Staff Name"
              name="staffName"
              initialValue={staffInfo?.name}
              rules={[
                { required: true, message: "Please input the staff name!" },
              ]}
            >
              <Input disabled className="w-50 md:w-1/2" />
            </Form.Item>
            <Form.Item
              label="Staff ID"
              name="staffId"
              initialValue={staffInfo?.uid}
              rules={[
                { required: true, message: "Please input the staff ID!" },
              ]}
            >
              <Input disabled className="w-full md:w-1/2" />
            </Form.Item>
            <Form.Item
              label="Staff Department"
              name="staffDepartment"
              initialValue={staffInfo?.department}
              rules={[
                { required: true, message: "Please input the staff ID!" },
              ]}
            >
              <Input disabled className="w-full md:w-1/2" />
            </Form.Item>
            <Form.Item
              label="Project Name"
              name="projectName"
              rules={[
                {
                  required: true,
                  message: "Please select the project name!",
                },
              ]}
            >
              <Select
                placeholder="Select a project"
                className="w-full md:w-1/2"
                loading={isLoading}
              >
                {projects.map((project) => (
                  <Select.Option key={project.id} value={project.projectName}>
                    {project.projectName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Please select the role!" }]}
            >
              <Select placeholder="Select the role" className="w-full md:w-1/2">
                {JOD_RANKS.map((rank) => (
                  <Select.Option key={rank.value} value={rank.value}>
                    {rank.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Project Duration"
              name="projectDuration"
              rules={[
                {
                  required: true,
                  message: "Please select the project duration!",
                },
              ]}
            >
              <RangePicker className="w-full" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};
