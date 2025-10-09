import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  startLabel?: string;
  endLabel?: string;
  error?: string;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = 'Date de début',
  endLabel = 'Date de fin',
  error,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date début */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {startLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Date fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {endLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate}
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};