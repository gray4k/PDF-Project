import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
}

export function PDFUploader({ onFileSelect }: PDFUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full max-w-2xl mx-auto p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <label className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
        <Upload className="w-12 h-12 text-gray-400" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">Drop your PDF here</p>
          <p className="text-sm text-gray-500">or click to browse</p>
        </div>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </div>
  );
}