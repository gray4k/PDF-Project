import React from 'react';

interface SelectionControlsProps {
  selectedCount: number;
  totalPages: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SelectionControls({
  selectedCount,
  totalPages,
  onSelectAll,
  onDeselectAll,
}: SelectionControlsProps) {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">
        {selectedCount} of {totalPages} pages selected
      </span>
      <div className="flex space-x-2">
        <button
          onClick={onSelectAll}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Select All
        </button>
        <button
          onClick={onDeselectAll}
          disabled={selectedCount === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Deselect All
        </button>
      </div>
    </div>
  );
}