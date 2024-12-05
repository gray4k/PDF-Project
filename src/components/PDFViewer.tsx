import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { ZoomIn, ZoomOut, Minus, Plus, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { SelectionControls } from './SelectionControls';

interface PDFViewerProps {
  file: File;
  selectedPages: Set<number>;
  onPageSelect: (pageNumber: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function PDFViewer({
  file,
  selectedPages,
  onPageSelect,
  onSelectAll,
  onDeselectAll,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1);
  const [columns, setColumns] = useState(3);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(scale);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setScale(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(scale);
    if (currentIndex > 0) {
      setScale(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handleColumnsChange = (delta: number) => {
    setColumns((prev) => Math.max(1, Math.min(4, prev + delta)));
  };

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 bg-white shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                disabled={scale === ZOOM_LEVELS[0]}
                className="p-2 rounded-md hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                className="p-2 rounded-md hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleColumnsChange(-1)}
                disabled={columns === 1}
                className="p-2 rounded-md hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                title="Decrease Columns"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium min-w-[40px] text-center">
                {columns}col
              </span>
              <button
                onClick={() => handleColumnsChange(1)}
                disabled={columns === 4}
                className="p-2 rounded-md hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                title="Increase Columns"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          <SelectionControls
            selectedCount={selectedPages.size}
            totalPages={numPages}
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
          />
        </div>
      </div>

      <div 
        className={clsx(
          'grid gap-6 p-4',
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-1 sm:grid-cols-2',
          columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        )}
      >
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (_, index) => (
            <div
              key={`page_${index + 1}`}
              onClick={() => onPageSelect(index + 1)}
              className={clsx(
                'relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]',
                selectedPages.has(index + 1) && 'ring-2 ring-blue-500'
              )}
            >
              <div className="bg-gray-100 rounded-lg">
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="!w-full !h-auto"
                  loading={
                    <div className="w-full h-[400px] animate-pulse bg-gray-200 rounded-lg" />
                  }
                />
              </div>
              {selectedPages.has(index + 1) && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                Page {index + 1}
              </div>
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}