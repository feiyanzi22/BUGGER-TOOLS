import * as React from 'react';
import { Upload, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

// 显式导入 ElectronAPI 类型
interface ElectronAPI {
  uploadFile: (buffer: ArrayBuffer, filename: string) => Promise<{
    path: string;
    filename: string;
  }>;
  deleteFile: (path: string) => Promise<void>;
}

interface FileUploadProps {
  fileList: UploadFile[];
  onChange: (fileList: UploadFile[]) => void;
  maxCount?: number;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  fileList,
  onChange,
  maxCount = 5,
  disabled = false
}) => {
  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      if (!(file instanceof File)) {
        throw new Error('Invalid file type');
      }

      const buffer = await file.arrayBuffer();
      // 使用双重类型断言确保正确的类型
      const result = await (window.electronAPI as unknown as ElectronAPI).uploadFile(buffer, file.name);
      
      onSuccess?.(result);
    } catch (error) {
      console.error('上传文件失败:', error);
      message.error(error instanceof Error ? error.message : '上传文件失败');
      onError?.(error as Error);
    }
  };

  const handleRemove = async (file: UploadFile) => {
    if (file.response?.path) {
      try {
        // 使用双重类型断言确保正确的类型
        await (window.electronAPI as unknown as ElectronAPI).deleteFile(file.response.path);
      } catch (error) {
        console.error('删除文件失败:', error);
        message.error('删除文件失败');
        return false; // 阻止删除
      }
    }
    return true;
  };

  return (
    <Upload
      multiple
      maxCount={maxCount}
      fileList={fileList}
      onChange={({ fileList }) => onChange(fileList)}
      customRequest={handleUpload}
      onRemove={handleRemove}
      disabled={disabled}
      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
    >
      {fileList.length >= maxCount ? null : (
        <div>
          <Button icon={<UploadOutlined />} disabled={disabled}>
            上传附件
          </Button>
          <div style={{ marginTop: 8, color: '#666' }}>
            支持上传{maxCount}个文件，单个文件不超过10MB
          </div>
        </div>
      )}
    </Upload>
  );
};

export default FileUpload; 