<template>
<div v-if="isLoading">Loading...</div>
  <div v-else class="dashboard-container">
  <div class="dashboard-container">
    <!-- Dashboard Header with Add Task and Create Category Buttons -->
    <div class="dashboard-header">
      <h1>Task Dashboard</h1>
      <button @click="openTaskForm" class="add-task-btn">Add Task</button>
      <button @click="showCategoryForm = true" class="add-category-btn">Create Category</button>
    </div>

    <!-- Task Filter Component -->
    <TaskFilter @filter="handleFilter" />

    <!-- No Categories Popup -->
    <div v-if="showNoCategoriesPopup" class="modal-overlay">
      <div class="modal-content">
        <h2>No Categories Available</h2>
        <p>Currently, there are no categories. Kindly create a category first to create a task.</p>
        <button @click="showNoCategoriesPopup = false" class="close-btn">Close</button>
      </div>
    </div>

    <!-- Delete Confirmation Popup -->
    <div v-if="showDeleteConfirmPopup" class="modal-overlay">
      <div class="modal-content">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this task?</p>
        <div class="form-actions">
          <button @click="confirmDeleteTask" class="delete-btn">Delete</button>
          <button @click="showDeleteConfirmPopup = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Success Message Popup -->
    <div v-if="showSuccessPopup" class="modal-overlay">
      <div class="modal-content">
        <h2>Success</h2>
        <p>Your task has been deleted successfully.</p>
        <button @click="showSuccessPopup = false" class="close-btn">OK</button>
      </div>
    </div>

    <!-- No tasks message if no tasks exist in any category -->
    <div v-if="filteredTasks?.length === 0" class="no-tasks-message">
      <p>Currently, there are no tasks matching the criteria.</p>
    </div>

    <!-- Tasks Organized by Category -->
    <div v-else class="tasks-by-category">
      <div v-for="category in categories" :key="category" class="category-section">
        <h2>{{ category }}</h2>
        <div v-if="tasksByCategory(category).length === 0" class="no-tasks-in-category">
          <p>No tasks available in this category.</p>
        </div>
        <div class="tasks-list">
          <TaskItem
            v-for="task in tasksByCategory(category)"
            :key="task.id"
            :task="task"
            @edit="handleEditTask"
            @delete="triggerDeleteConfirmPopup(task)"
          />
        </div>
      </div>
    </div>

    <!-- Task Form Popup -->
    <div v-if="showTaskForm" class="modal-overlay">
      <div class="modal-content form-content">
        <h2>{{ isEditMode ? 'Edit Task' : 'Create Task' }}</h2>
        <form @submit.prevent="submitTask">
          <div class="form-group">
            <label for="task-id">Task ID</label>
            <input id="task-id" v-model="newTask.id" type="text" :disabled="isEditMode" required />
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
          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" v-model="newTask.category" required>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn">{{ isEditMode ? 'Update' : 'Submit' }}</button>
            <button type="button" @click="showTaskForm = false" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Category Popup -->
    <div v-if="showCategoryForm" class="modal-overlay">
      <div class="modal-content form-content">
        <h2>Create Category</h2>
        <form @submit.prevent="addCategory">
          <div class="form-group">
            <label for="category-name">Category Name</label>
            <input id="category-name" v-model="newCategory" type="text" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn">Add Category</button>
            <button type="button" @click="showCategoryForm = false" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db, auth, provider, signInWithPopup } from '../Services/firebase';
import TaskItem from './TaskItem.vue';
import TaskFilter from './TaskFilter.vue';

export default {
  components: {
    TaskItem,
    TaskFilter,
  },
  setup() {
    const tasks = ref([]);
    const categories = ref([]);
    const user = ref(null);
    const isLoading = ref(true);
    const showTaskForm = ref(false);
    const showCategoryForm = ref(false);
    const showNoCategoriesPopup = ref(false);
    const showDeleteConfirmPopup = ref(false);
    const showSuccessPopup = ref(false);
    const isEditMode = ref(false);
    const newCategory = ref('');
    const newTask = ref({
      id: '',
      name: '',
      description: '',
      dueDate: '',
      priority: 'Low',
      status: 'To-do',
      category: '',
      userId: '' 
    });
    const taskToDelete = ref(null);
    const filterCriteria = ref({ status: '', query: '' });

    const loginUser = async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        user.value = result.user;
        fetchTasks();
      } catch (error) {
        console.error("Error logging in:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const fetchTasks = async () => {
      if (!user.value) return;

      const q = query(collection(db, 'tasks'), where('userId', '==', user.value.uid));
      const querySnapshot = await getDocs(q);
      tasks.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const addTaskToFirestore = async () => {
      await addDoc(collection(db, 'tasks'), { ...newTask.value, userId: user.value.uid });
      fetchTasks();
    };

    const updateTaskInFirestore = async () => {
      const taskDoc = doc(db, 'tasks', newTask.value.id);
      await updateDoc(taskDoc, { ...newTask.value });
      fetchTasks();
    };

    const deleteTaskFromFirestore = async (taskId) => {
      const taskDoc = doc(db, 'tasks', taskId);
      await deleteDoc(taskDoc);
      fetchTasks();
    };

    onMounted(() => {
      if (!user.value) {
        loginUser();
      } else {
        fetchTasks();
        isLoading.value = false;
      }
    });

    const openTaskForm = () => {
      if (categories.value.length === 0) {
        showNoCategoriesPopup.value = true;
      } else {
        showTaskForm.value = true;
      }
    };

    const submitTask = () => {
      if (isEditMode.value) {
        updateTaskInFirestore();
      } else {
        addTaskToFirestore();
      }
      showTaskForm.value = false;
      resetForm();
    };

    const addCategory = () => {
      if (!categories.value.includes(newCategory.value)) {
        categories.value.push(newCategory.value);
        newCategory.value = '';
        showCategoryForm.value = false;
      } else {
        alert('Category already exists.');
      }
    };

    const handleEditTask = (task) => {
      isEditMode.value = true;
      showTaskForm.value = true;
      newTask.value = { ...task };
    };

    const triggerDeleteConfirmPopup = (task) => {
      taskToDelete.value = task;
      showDeleteConfirmPopup.value = true;
    };

    const confirmDeleteTask = () => {
      deleteTaskFromFirestore(taskToDelete.value.id);
      showDeleteConfirmPopup.value = false;
      showSuccessPopup.value = true;
      taskToDelete.value = null;
    };

    const resetForm = () => {
      newTask.value = { id: '', name: '', description: '', dueDate: '', priority: 'Low', status: 'To-do', category: '', userId: user.value ? user.value.uid : '' };
      isEditMode.value = false;
    };

    const handleFilter = (criteria) => {
      filterCriteria.value = criteria;
    };

    const filteredTasks = computed(() => {
      return tasks.value.filter((task) => {
        const matchesStatus = !filterCriteria.value.status || task.status === filterCriteria.value.status;
        const matchesQuery = !filterCriteria.value.query || task.name.toLowerCase().includes(filterCriteria.value.query.toLowerCase()) || task.id.toLowerCase().includes(filterCriteria.value.query.toLowerCase());
        return matchesStatus && matchesQuery;
      });
    });

    const tasksByCategory = (category) => {
      return filteredTasks.value.filter((task) => task.category === category);
    };

    return {
      tasks,
      categories,
      user,
      loginUser,
      isLoading,
      showTaskForm,
      showCategoryForm,
      showNoCategoriesPopup,
      showDeleteConfirmPopup,
      showSuccessPopup,
      newTask,
      newCategory,
      isEditMode,
      submitTask,
      addCategory,
      openTaskForm,
      tasksByCategory,
      handleEditTask,
      triggerDeleteConfirmPopup,
      confirmDeleteTask,
      handleFilter,
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

.add-category-btn {
  background-color: #ff9800;
  color: white;
}

/* Modal and Form Styling */
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
  z-index: 10;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

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
  height: 80px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.submit-btn, .cancel-btn, .close-btn, .delete-btn {
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

.cancel-btn, .close-btn {
  background-color: #ff5252;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

/* Category Sections */
.tasks-by-category {
  margin-top: 20px;
}

.category-section {
  margin-bottom: 20px;
}

.category-section h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.tasks-list {
  display: flex;
  overflow-x: auto;
  gap: 15px;
  padding-bottom: 10px;
}

.task-item {
  min-width: 250px;
  flex-shrink: 0;
}
</style>
