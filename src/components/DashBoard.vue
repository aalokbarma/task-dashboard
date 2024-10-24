<template>
  <div class="dashboard-container">
    <!-- Add Task Button -->
    <div class="dashboard-header">
      <h1>Task Dashboard</h1>
      <button @click="showTaskForm = true" class="add-task-btn">Add Task</button>
      <button @click="createCategory" class="add-category-btn">Create Category</button>
    </div>

    <!-- No tasks message -->
    <div v-if="tasks.length === 0" class="no-tasks-message">
      <p>Currently there are no tasks. Kindly create one to see in the dashboard.</p>
    </div>

    <!-- Tasks List -->
    <div v-else class="tasks-list">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @edit="handleEditTask"
        @delete="handleDeleteTask"
      />
    </div>

    <!-- Task Form Popup -->
    <div v-if="showTaskForm" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isEditMode ? 'Edit Task' : 'Create Task' }}</h2>
        <form @submit.prevent="submitTask">
          <div class="form-group">
            <label for="task-id">Task ID</label>
            <input id="task-id" v-model="newTask.id" type="text" required />
          </div>
          <div class="form-group">
            <label for="task-name">Name</label>
            <input id="task-name" v-model="newTask.name" type="text" required />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" v-model="newTask.description" required></textarea>
          </div>
          <div class="form-group">
            <label for="due-date">Due Date</label>
            <input id="due-date" v-model="newTask.dueDate" type="date" required />
          </div>
          <div class="form-group">
            <label for="priority">Priority</label>
            <select id="priority" v-model="newTask.priority" required>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" v-model="newTask.status" required>
              <option value="To-do">To-do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn">{{ isEditMode ? 'Update' : 'Submit' }}</button>
            <button type="button" @click="showTaskForm = false" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import TaskItem from './TaskItem.vue';

export default {
  components: {
    TaskItem
  },
  setup() {
    const tasks = ref([]);
    const showTaskForm = ref(false);
    const isEditMode = ref(false);
    const newTask = ref({
      id: '',
      name: '',
      description: '',
      dueDate: '',
      priority: 'Low',
      status: 'To-do',
    });

    const submitTask = () => {
      if (isEditMode.value) {
        // Update task if edit mode
        const index = tasks.value.findIndex(task => task.id === newTask.value.id);
        if (index !== -1) {
          tasks.value.splice(index, 1, { ...newTask.value });
        }
      } else {
        // Add new task
        tasks.value.push({ ...newTask.value });
      }
      showTaskForm.value = false;
      resetForm();
    };

    const handleEditTask = (task) => {
      // Enter edit mode
      isEditMode.value = true;
      showTaskForm.value = true;
      newTask.value = { ...task };
    };

    const handleDeleteTask = (task) => {
      // Delete task
      tasks.value = tasks.value.filter(t => t.id !== task.id);
    };

    const resetForm = () => {
      newTask.value = { id: '', name: '', description: '', dueDate: '', priority: 'Low', status: 'To-do' };
      isEditMode.value = false;
    };

    const createCategory = () => {
      alert("Create category functionality can be implemented here.");
    };

    return {
      tasks,
      showTaskForm,
      newTask,
      isEditMode,
      submitTask,
      handleEditTask,
      handleDeleteTask,
      createCategory,
    };
  },
};
</script>
<style scoped>
/* General Styles */
.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-task-btn, .add-category-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.add-task-btn {
  background-color: #42b983;
  color: white;
}

.add-task-btn:hover {
  background-color: #3a9f75;
}

.add-category-btn {
  background-color: #ff9800;
  color: white;
}

.add-category-btn:hover {
  background-color: #e68900;
}

/* No tasks message */
.no-tasks-message {
  text-align: center;
  font-size: 18px;
  color: #666;
}

/* Tasks List */
.tasks-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

h2 {
  margin-bottom: 20px;
}

/* Form Styles */
.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input, textarea, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  height: 100px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.submit-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.submit-btn {
  background-color: #42b983;
  color: white;
}

.submit-btn:hover {
  background-color: #3a9f75;
}

.cancel-btn {
  background-color: #ff5252;
  color: white;
}

.cancel-btn:hover {
  background-color: #e54848;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tasks-list {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 90%;
  }
}
</style>
