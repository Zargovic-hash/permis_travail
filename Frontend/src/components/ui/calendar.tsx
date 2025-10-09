import React from 'react';
import { cn } from '@/lib/utils';

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date | Date[] | { from: Date; to: Date };
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, mode = 'single', selected, onSelect, initialFocus = false, ...props }, ref) => {
    const [currentDate, setCurrentDate] = React.useState(selected instanceof Date ? selected : new Date());
    
    const handleDateClick = (date: Date) => {
      if (onSelect) {
        onSelect(date);
      }
    };

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }
      
      return days;
    };

    const days = getDaysInMonth(currentDate);
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    return (
      <div
        ref={ref}
        className={cn('p-3', className)}
        {...props}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-1 hover:bg-muted rounded"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-1 hover:bg-muted rounded"
            >
              →
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-xs font-medium text-muted-foreground text-center p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index} className="text-center">
              {day ? (
                <button
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'w-8 h-8 text-sm rounded hover:bg-muted',
                    selected instanceof Date && day.getTime() === selected.getTime() && 'bg-primary text-primary-foreground',
                    day.getMonth() !== currentDate.getMonth() && 'text-muted-foreground'
                  )}
                >
                  {day.getDate()}
                </button>
              ) : (
                <div className="w-8 h-8" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
Calendar.displayName = 'Calendar';

export { Calendar };