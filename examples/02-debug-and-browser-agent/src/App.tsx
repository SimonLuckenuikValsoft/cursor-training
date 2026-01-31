import { useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { Task } from './types';

/**
 * Task Manager Application
 * 
 * TRAINING NOTE: This app contains intentional accessibility issues
 * and UI bugs for the Browser Agent exercise.
 * 
 * INTENTIONAL ISSUES:
 * 1. Missing form labels (accessibility)
 * 2. Low contrast text (accessibility) 
 * 3. Incorrect heading hierarchy (accessibility)
 * 4. Broken layout at narrow viewport (UI bug)
 * 5. Click handler bug - wrong task gets deleted
 */

function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Review pull request', completed: false, priority: 'high' },
    { id: '2', title: 'Write documentation', completed: true, priority: 'medium' },
    { id: '3', title: 'Update dependencies', completed: false, priority: 'low' },
  ]);

  const addTask = (title: string, priority: Task['priority']) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority,
    };
    setTasks([...tasks, newTask]);
  };

  // BUG: This delete function has an off-by-one error
  const deleteTask = (id: string) => {
    const index = tasks.findIndex(t => t.id === id);
    // BUG: Deletes the wrong task (next one instead of selected)
    const wrongIndex = index + 1;
    if (wrongIndex < tasks.length) {
      setTasks(tasks.filter((_, i) => i !== wrongIndex));
    } else {
      // Falls back to correct behavior at end of list
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="app">
      {/* ACCESSIBILITY ISSUE: Should be h1, not h3 */}
      <h3 className="app-title">Task Manager</h3>
      
      {/* ACCESSIBILITY ISSUE: Using h5 before h4 breaks heading hierarchy */}
      <h5 className="section-subtitle">Manage your daily tasks</h5>
      
      <main className="main-content">
        <TaskForm onAddTask={addTask} />
        <TaskList 
          tasks={tasks} 
          onDeleteTask={deleteTask}
          onToggleTask={toggleTask}
        />
      </main>
      
      {/* ACCESSIBILITY ISSUE: Low contrast footer text */}
      <footer className="footer">
        <p className="footer-text">Built for Cursor Training</p>
      </footer>
    </div>
  );
}

export default App;
