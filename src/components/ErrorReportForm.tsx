import React, { useState } from 'react';
import { Form, Input, Select, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ErrorType, ErrorSeverity, ErrorTypeLabels, ErrorSeverityLabels } from '../modules/error-report/types';
import type { CreateErrorReportRequest } from '../modules/error-report/types';
import FileUpload from './FileUpload';
import type { UploadFile } from 'antd/es/upload/interface';

interface ErrorReportFormProps {
  onSubmit: (values: CreateErrorReportRequest) => Promise<void>;
  loading?: boolean;
  initialValues?: Partial<CreateErrorReportRequest>;
}

const ErrorReportForm: React.FC<ErrorReportFormProps> = ({
  onSubmit,
  loading = false,
  initialValues
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const typeOptions = Object.entries(ErrorTypeLabels).map(([value, label]) => ({
    value,
    label
  }));

  const severityOptions = Object.entries(ErrorSeverityLabels).map(([value, label]) => ({
    value,
    label
  }));

  const handleFinish = async (values: any) => {
    const formData = {
      ...values,
      attachments: fileList.map(file => ({
        filename: file.name,
        path: file.response?.path || ''
      }))
    };
    await onSubmit(formData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={initialValues}
    >
      <Form.Item
        name="title"
        label="标题"
        rules={[{ required: true, message: '请输入标题' }]}
      >
        <Input placeholder="请输入错误报告标题" />
      </Form.Item>

      <Form.Item
        name="type"
        label="类型"
        rules={[{ required: true, message: '请选择错误类型' }]}
      >
        <Select options={typeOptions} placeholder="请选择错误类型" />
      </Form.Item>

      <Form.Item
        name="severity"
        label="严重程度"
        rules={[{ required: true, message: '请选择严重程度' }]}
      >
        <Select options={severityOptions} placeholder="请选择严重程度" />
      </Form.Item>

      <Form.Item
        name="description"
        label="描述"
        rules={[{ required: true, message: '请输入详细描述' }]}
      >
        <Input.TextArea rows={4} placeholder="请详细描述错误情况" />
      </Form.Item>

      <Form.Item label="附件">
        <FileUpload
          fileList={fileList}
          onChange={setFileList}
          disabled={loading}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ErrorReportForm; 