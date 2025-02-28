import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, Select, Modal, notification } from "antd";
import { HEADER_TEXTS } from "@/constants/header";
import { JOD_RANKS } from "@/constants/common";
import { projectService } from "@/services/project";
import { claimService } from "@/services/claim";
import { calculateWorkingHours } from "@/utils";

const { RangePicker } = DatePicker;

export const ClaimModal = ({
  isModalVisible,
  setIsModalVisible,
  form,
  staffInfo,
  isEditing = false,
  onFinish,
  onSuccess,
}) => {
  const [api, contextHolder] = notification.useNotification();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await projectService.getProjects();
        setProjects(projectsData);
      } catch (error) {
        api.error({
          message: "Error",
          description: "Failed to fetch projects",
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleCreateClaim = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.projectDuration;

      if (isEditing) {
        onFinish?.(values);
      } else {
        setLoading(true);
        const totalWorking = calculateWorkingHours(startDate, endDate);

        const newClaim = await claimService.createClaim({
          ...values,
          staffId: staffInfo.uid,
          staffName: staffInfo.name,
          staffDepartment: staffInfo.department,
          totalWorking,
        });

        console.log(newClaim);

        setIsModalVisible(false);
        form.resetFields();
        api.success({
          message: "Success",
          description: "Claim created successfully!",
          duration: 3,
        });
        onSuccess?.({
          ...newClaim,
          id: newClaim.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalWorking,
          status: "Pending",
        });
      }
    } catch (error) {
      if (!error.errorFields) {
        api.error({
          message: "Error",
          description: "Failed to create claim",
          duration: 3,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.getFieldsValue();
      const [startDate, endDate] = values.projectDuration || [];
      setLoading(true);

      const totalWorking =
        startDate && endDate ? calculateWorkingHours(startDate, endDate) : 0;

      const newDraft = await claimService.saveDraft({
        ...values,
        staffId: staffInfo.uid,
        staffName: staffInfo.name,
        staffDepartment: staffInfo.department,
        totalWorking,
      });

      setIsModalVisible(false);
      form.resetFields();
      api.success({
        message: "Success",
        description: "Draft saved successfully!",
        duration: 3,
      });
      onSuccess?.({
        ...newDraft,
        id: newDraft.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalWorking,
        status: "Draft",
      });
    } catch (error) {
      api.error({
        message: "Error",
        description: "Failed to save draft",
        duration: 3,
      });
    } finally {
      setLoading(false);
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
        confirmLoading={loading}
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
        <Form disabled={loading} form={form} layout="vertical">
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
