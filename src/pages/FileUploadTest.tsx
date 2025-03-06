import React, { useState } from 'react';
import { Card, Typography, Space, Divider } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import FileUpload from '../components/FileUpload';

const { Title, Paragraph } = Typography;

const FileUploadTest: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleFileChange = (newFileList: UploadFile[]) => {
    console.log('文件列表已更新:', newFileList);
    setFileList(newFileList);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography>
        <Title level={2}>文件上传测试</Title>
        <Paragraph>
          这是一个文件上传组件的测试页面。您可以上传文件，查看上传结果，并测试删除功能。
        </Paragraph>
      </Typography>

      <Divider />

      <Card title="文件上传组件" bordered={false}>
        <FileUpload 
          fileList={fileList} 
          onChange={handleFileChange} 
          maxCount={5}
        />
      </Card>

      <Divider />

      <Card title="上传结果" bordered={false}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Text strong>已上传文件数: {fileList.length}</Typography.Text>
          {fileList.length > 0 && (
            <>
              <Typography.Text>文件详情:</Typography.Text>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(fileList, null, 2)}
              </pre>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default FileUploadTest; 