import React, { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { PDFUploader } from './components/PDFUploader';
import { PDFViewer } from './components/PDFViewer';
import { pdfjs } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setFile(file);
    setSelectedPages(new Set());
  }, []);

  const handlePageSelect = useCallback((pageNumber: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) {
        next.delete(pageNumber);
      } else {
        next.add(pageNumber);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await pdfjs.getDocument(typedarray).promise;
      setSelectedPages(new Set(Array.from({ length: pdf.numPages }, (_, i) => i + 1)));
    };
    reader.readAsArrayBuffer(file);
  }, [file]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  const handleExtractPages = useCallback(async () => {
    if (!file || selectedPages.size === 0 || isExtracting) return;
    
    try {
      setIsExtracting(true);
      
      // Read the PDF file
      const fileBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(fileBuffer);
      
      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();
      
      // Copy selected pages to the new document
      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
      for (const pageNumber of sortedPages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
        newPdfDoc.addPage(copiedPage);
      }
      
      // Save the new PDF
      const pdfBytes = await newPdfDoc.save();
      
      // Create a blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extracted_pages_${sortedPages.join('-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error extracting PDF pages:', error);
    } finally {
      setIsExtracting(false);
    }
  }, [file, selectedPages, isExtracting]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              PDF Page Extractor
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!file ? (
          <PDFUploader onFileSelect={handleFileSelect} />
        ) : (
          <div className="space-y-6">
            <PDFViewer
              file={file}
              selectedPages={selectedPages}
              onPageSelect={handlePageSelect}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
            
            <div className="fixed bottom-6 right-6">
              <button
                onClick={handleExtractPages}
                disabled={selectedPages.size === 0 || isExtracting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isExtracting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Extracting...</span>
                  </>
                ) : (
                  <span>Extract {selectedPages.size} Page{selectedPages.size !== 1 ? 's' : ''}</span>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;