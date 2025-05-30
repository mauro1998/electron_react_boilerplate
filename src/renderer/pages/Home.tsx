import { InboxOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Empty, message, Typography, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CaptureScreen from '../components/CaptureScreen';
import CapturedImageViewer from '../components/CapturedImageViewer';
import ProjectCard from '../components/ProjectCard';
import { Project } from '../services/models';
import storageService from '../services/storage_service';
import { base64ToFile } from '../services/util';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function Home() {
  const navigate = useNavigate();
  const [isCapturingModal, setIsCapturingModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load recent projects from storage
    setRecentProjects(storageService.getRecentProjects(5));
  }, []);

  const handleUpload = (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    const flow = storageService.createDefaultFlow(blobUrl);
    navigate(`/flows/${flow.id}`);
    return false; // Prevent default upload behavior
  };

  const handleImageCaptured = (imageData: string) => {
    setCapturedImage(imageData);
    setIsCapturingModal(false);
  };

  const handleCapturedScreenshotConfirmation = () => {
    if (capturedImage) {
      message.success('Screenshot added to project');
      const file = base64ToFile(capturedImage, 'screenshot.png', 'image/png');
      const blobUrl = URL.createObjectURL(file);
      const flow = storageService.createDefaultFlow(blobUrl);
      setCapturedImage(null);
      navigate(`/flows/${flow.id}`);
    }
  };

  const handleCaptureScreenLinkClick = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCapturingModal(true);
  };

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mx-auto mb-12">
          <Title>Welcome to GeniePilot</Title>
          <div className="w-[520px]">
            <Text className="text-lg">
              Transform your apps into testable flows in minutes. Simply upload
              screenshots and let GeniePilot create intelligent test scenarios
              powered by AI.
            </Text>
          </div>
        </div>

        <div className="w-full mb-12 max-w-[670px]">
          <Dragger
            accept=".png,.jpg,.jpeg"
            showUploadList={false}
            beforeUpload={handleUpload}
            className="p-8 bg-[#141414] my-4"
          >
            <p className="text-6xl">
              <InboxOutlined />
            </p>
            <p className="text-lg mt-4">
              Click or drag images here, or{' '}
              <button
                type="button"
                onClick={handleCaptureScreenLinkClick}
                className="text-blue-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                capture your screen
              </button>
            </p>
            <p className="text-gray-400">Support for PNG, JPG</p>
          </Dragger>

          <div className="text-center mt-4">
            <Text className="mr-2">or</Text>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => navigate('/projects')}
            >
              Start New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full mb-12">
        <Title level={3}>Recent Projects</Title>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <Empty
            description="No recent projects"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>

      {/* Screen Capture Modal */}
      <CaptureScreen
        isOpen={isCapturingModal}
        onClose={() => setIsCapturingModal(false)}
        onCapture={handleImageCaptured}
      />

      {/* Display captured image if available */}
      <CapturedImageViewer
        imageData={capturedImage}
        onClose={() => setCapturedImage(null)}
        onUse={handleCapturedScreenshotConfirmation}
        onRecapture={() => {
          setCapturedImage(null);
          setIsCapturingModal(true);
        }}
      />
    </>
  );
}
