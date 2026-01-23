import React, { useRef, useState } from 'react';
import { Card } from './Card';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  return (
    <div>
      <Card
        className={`cursor-pointer border-2 border-dashed transition-colors ${
          isDragOver ? 'border-tomato-500 bg-tomato-50' : 'border-gray-300 hover:border-tomato-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="p-8 text-center">
          {selectedFile ? (
            <div>
              <p className="text-lg font-medium text-charcoal-900">File Selected</p>
              <p className="text-sm text-charcoal-600">{selectedFile.name}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-charcoal-900">Drag and drop your file here</p>
              <p className="text-sm text-charcoal-600">or click to select from device</p>
            </div>
          )}
        </div>
      </Card>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" // Add accepted file types as needed
      />
    </div>
  );
};
