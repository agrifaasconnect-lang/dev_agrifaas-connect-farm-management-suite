import React, { useMemo, useState } from 'react';
import type { Task } from '../types';

interface OperationalCalendarProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export const OperationalCalendar: React.FC<OperationalCalendarProps> = ({ tasks, onTaskClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { year, month } = useMemo(() => ({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth()
    }), [currentDate]);

    const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
    const firstDayOfMonth = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        tasks.forEach(task => {
            if (task.dueDate) {
                const dateKey = task.dueDate.split('T')[0];
                const existing = map.get(dateKey) || [];
                map.set(dateKey, [...existing, task]);
            }
        });
        return map;
    }, [tasks]);

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const renderCalendarDays = () => {
        const days = [];
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="border border-gray-200 bg-gray-50 min-h-[100px]" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasksByDate.get(dateKey) || [];
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <div key={day} className={`border border-gray-200 p-2 min-h-[100px] ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {dayTasks.slice(0, 3).map(task => (
                            <div
                                key={task.id}
                                onClick={() => onTaskClick?.(task)}
                                className={`text-xs p-1 rounded cursor-pointer truncate ${
                                    task.status === 'Done' ? 'bg-green-100 text-green-800' :
                                    task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}
                                title={task.title}
                            >
                                {task.title}
                            </div>
                        ))}
                        {dayTasks.length > 3 && (
                            <div className="text-xs text-gray-500 font-medium">
                                +{dayTasks.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    {monthNames[month]} {year}
                </h3>
                <div className="flex gap-2">
                    <button onClick={goToPreviousMonth} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                        Previous
                    </button>
                    <button onClick={goToToday} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                        Today
                    </button>
                    <button onClick={goToNextMonth} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                        Next
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-0">
                {dayNames.map(day => (
                    <div key={day} className="border border-gray-200 bg-gray-100 p-2 text-center font-semibold text-sm text-gray-700">
                        {day}
                    </div>
                ))}
                {renderCalendarDays()}
            </div>
        </div>
    );
};