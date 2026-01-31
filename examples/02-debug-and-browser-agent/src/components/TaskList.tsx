import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
}

/**
 * Task List Component
 * 
 * ACCESSIBILITY ISSUES:
 * 1. Delete buttons lack descriptive accessible names
 * 2. Checkbox inputs have no labels
 * 3. Priority indicators rely only on color (no text alternative)
 */

function TaskList({ tasks, onDeleteTask, onToggleTask }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty-message">No tasks yet. Add one above!</p>;
  }

  return (
    <div className="task-list">
      {/* ACCESSIBILITY ISSUE: Using h6 breaks hierarchy further */}
      <h6 className="list-title">Your Tasks ({tasks.length})</h6>
      
      <ul className="tasks">
        {tasks.map((task) => (
          <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            {/* ACCESSIBILITY ISSUE: Checkbox has no label */}
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleTask(task.id)}
              className="task-checkbox"
            />
            
            <span className="task-title">{task.title}</span>
            
            {/* ACCESSIBILITY ISSUE: Color-only priority indicator */}
            <span className={`priority-badge priority-${task.priority}`}>
              {/* No text, only background color */}
            </span>
            
            {/* ACCESSIBILITY ISSUE: Button has no descriptive text */}
            <button
              onClick={() => onDeleteTask(task.id)}
              className="delete-button"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
