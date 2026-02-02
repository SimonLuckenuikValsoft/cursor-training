import React, { useState } from 'react';
import { Task } from '../types';

interface TaskFormProps {
  onAddTask: (title: string, priority: Task['priority']) => void;
}

/**
 * Task Form Component
 * 
 * ACCESSIBILITY ISSUES:
 * 1. Input field has no associated label
 * 2. Select field has no associated label
 * 3. Button has no accessible name when icon-only
 */

function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim(), priority);
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      {/* ACCESSIBILITY ISSUE: No label for input */}
      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task..."
          className="task-input"
        />
      </div>

      {/* ACCESSIBILITY ISSUE: No label for select */}
      <div className="form-group">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
          className="priority-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button type="submit" className="add-button">
        Add Task
      </button>
    </form>
  );
}

export default TaskForm;
