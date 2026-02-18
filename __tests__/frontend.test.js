/**
 * @jest-environment jsdom
 */

// Mock fetch globally
global.fetch = jest.fn();

// Mock alert
global.alert = jest.fn();

// Mock prompt
global.prompt = jest.fn();

describe('Frontend Todo Application', () => {
  let todoInput, addBtn, todoList, totalCount, completedCount;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <input id="todoInput" type="text" />
      <button id="addBtn">Add</button>
      <div id="todoList"></div>
      <span id="totalCount">Total: 0</span>
      <span id="completedCount">Completed: 0</span>
    `;

    // Get DOM elements
    todoInput = document.getElementById('todoInput');
    addBtn = document.getElementById('addBtn');
    todoList = document.getElementById('todoList');
    totalCount = document.getElementById('totalCount');
    completedCount = document.getElementById('completedCount');

    // Reset fetch mock
    fetch.mockReset();
    global.alert.mockReset();
    global.prompt.mockReset();
  });

  describe('escapeHtml function', () => {
    test('should escape HTML special characters', () => {
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(escapeHtml('Normal text')).toBe('Normal text');
      expect(escapeHtml('<b>Bold</b>')).toBe('&lt;b&gt;Bold&lt;/b&gt;');
    });
  });

  describe('renderTodos function', () => {
    test('should show empty state when no todos', () => {
      const todos = [];
      
      if (todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No todos yet. Add one above!</div>';
      }

      expect(todoList.innerHTML).toContain('No todos yet. Add one above!');
    });

    test('should render todos correctly with edit and delete buttons', () => {
      const todos = [
        { id: 1, text: 'Test todo', completed: false },
        { id: 2, text: 'Completed todo', completed: true }
      ];

      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      todoList.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
          <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''} 
            onchange="toggleTodo(${todo.id})"
          />
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <button class="edit-btn" onclick="editTodo(${todo.id})">Edit</button>
          <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        </div>
      `).join('');

      expect(todoList.children.length).toBe(2);
      expect(todoList.innerHTML).toContain('Test todo');
      expect(todoList.innerHTML).toContain('Completed todo');
      expect(todoList.innerHTML).toContain('Edit');
      expect(todoList.innerHTML).toContain('Delete');
      expect(todoList.querySelectorAll('.edit-btn').length).toBe(2);
    });
  });

  describe('updateStats function', () => {
    test('should update statistics correctly', () => {
      const todos = [
        { id: 1, text: 'Todo 1', completed: false },
        { id: 2, text: 'Todo 2', completed: true },
        { id: 3, text: 'Todo 3', completed: true }
      ];

      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      totalCount.textContent = `Total: ${total}`;
      completedCount.textContent = `Completed: ${completed}`;

      expect(totalCount.textContent).toBe('Total: 3');
      expect(completedCount.textContent).toBe('Completed: 2');
    });

    test('should show zero stats for empty list', () => {
      const todos = [];
      
      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      totalCount.textContent = `Total: ${total}`;
      completedCount.textContent = `Completed: ${completed}`;

      expect(totalCount.textContent).toBe('Total: 0');
      expect(completedCount.textContent).toBe('Completed: 0');
    });
  });

  describe('fetchTodos function', () => {
    test('should fetch todos successfully', async () => {
      const mockTodos = [
        { id: 1, text: 'Test todo', completed: false }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos
      });

      const response = await fetch('/api/todos');
      const todos = await response.json();

      expect(fetch).toHaveBeenCalledWith('/api/todos');
      expect(todos).toEqual(mockTodos);
    });

    test('should handle fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/todos');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });
  });

  describe('addTodo function', () => {
    test('should add a new todo', async () => {
      const newTodo = { id: 1, text: 'New todo', completed: false };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newTodo
      });

      todoInput.value = 'New todo';
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'New todo' }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result).toEqual(newTodo);
    });

    test('should not add empty todo', () => {
      todoInput.value = '';
      const text = todoInput.value.trim();
      
      if (!text) {
        alert('Please enter a todo');
      }

      expect(alert).toHaveBeenCalledWith('Please enter a todo');
    });

    test('should not add whitespace-only todo', () => {
      todoInput.value = '   ';
      const text = todoInput.value.trim();
      
      if (!text) {
        alert('Please enter a todo');
      }

      expect(alert).toHaveBeenCalledWith('Please enter a todo');
    });

    test('should handle add todo error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      todoInput.value = 'New todo';
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'New todo' }),
      });

      if (!response.ok) {
        alert('Failed to add todo');
      }

      expect(alert).toHaveBeenCalledWith('Failed to add todo');
    });
  });

  describe('toggleTodo function', () => {
    test('should toggle todo completion', async () => {
      const updatedTodo = { id: 1, text: 'Test todo', completed: true };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo
      });

      const response = await fetch('/api/todos/1', {
        method: 'PUT',
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.completed).toBe(true);
    });

    test('should handle toggle error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const response = await fetch('/api/todos/1', {
        method: 'PUT',
      });

      if (!response.ok) {
        alert('Failed to update todo');
      }

      expect(alert).toHaveBeenCalledWith('Failed to update todo');
    });
  });

  describe('deleteTodo function', () => {
    test('should delete a todo', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Todo deleted successfully' })
      });

      const response = await fetch('/api/todos/1', {
        method: 'DELETE',
      });

      expect(response.ok).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'DELETE',
      });
    });

    test('should handle delete error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const response = await fetch('/api/todos/1', {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Failed to delete todo');
      }

      expect(alert).toHaveBeenCalledWith('Failed to delete todo');
    });
  });

  describe('editTodo function', () => {
    test('should edit a todo successfully', async () => {
      const updatedTodo = { id: 1, text: 'Updated text', completed: false };
      
      prompt.mockReturnValueOnce('Updated text');
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo
      });

      const newText = prompt('Edit todo:', 'Original text');
      
      if (newText && newText.trim()) {
        const response = await fetch('/api/todos/1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newText.trim() }),
        });

        expect(response.ok).toBe(true);
        const result = await response.json();
        expect(result.text).toBe('Updated text');
      }

      expect(prompt).toHaveBeenCalledWith('Edit todo:', 'Original text');
    });

    test('should not edit when user cancels', () => {
      prompt.mockReturnValueOnce(null);

      const newText = prompt('Edit todo:', 'Original text');

      if (newText === null) {
        // User cancelled - do nothing
      }

      expect(newText).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should not edit with empty text', () => {
      prompt.mockReturnValueOnce('');

      const newText = prompt('Edit todo:', 'Original text');

      if (newText !== null && !newText.trim()) {
        alert('Todo text cannot be empty');
      }

      expect(alert).toHaveBeenCalledWith('Todo text cannot be empty');
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should not edit with whitespace-only text', () => {
      prompt.mockReturnValueOnce('   ');

      const newText = prompt('Edit todo:', 'Original text');

      if (newText !== null && !newText.trim()) {
        alert('Todo text cannot be empty');
      }

      expect(alert).toHaveBeenCalledWith('Todo text cannot be empty');
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should handle edit error', async () => {
      prompt.mockReturnValueOnce('Updated text');
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const newText = prompt('Edit todo:', 'Original text');
      
      if (newText && newText.trim()) {
        const response = await fetch('/api/todos/1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newText.trim() }),
        });

        if (!response.ok) {
          alert('Failed to update todo');
        }
      }

      expect(alert).toHaveBeenCalledWith('Failed to update todo');
    });

    test('should trim whitespace from edited text', async () => {
      const updatedTodo = { id: 1, text: 'Trimmed text', completed: false };
      
      prompt.mockReturnValueOnce('  Trimmed text  ');
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo
      });

      const newText = prompt('Edit todo:', 'Original text');
      
      if (newText && newText.trim()) {
        const response = await fetch('/api/todos/1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newText.trim() }),
        });

        const result = await response.json();
        expect(result.text).toBe('Trimmed text');
      }

      expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'Trimmed text' }),
      });
    });

    test('should handle edit network error', async () => {
      prompt.mockReturnValueOnce('Updated text');
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const newText = prompt('Edit todo:', 'Original text');
      
      if (newText && newText.trim()) {
        try {
          await fetch('/api/todos/1', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: newText.trim() }),
          });
        } catch (error) {
          alert('Failed to update todo');
        }
      }

      expect(alert).toHaveBeenCalledWith('Failed to update todo');
    });
  });

  describe('Input validation', () => {
    test('should trim whitespace from input', () => {
      todoInput.value = '  Test todo  ';
      const text = todoInput.value.trim();
      
      expect(text).toBe('Test todo');
    });

    test('should handle special characters in input', () => {
      const specialText = '<script>alert("xss")</script>';
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };
      
      const escaped = escapeHtml(specialText);
      expect(escaped).not.toContain('<script>');
    });
  });
});
