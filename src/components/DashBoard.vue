<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else class="dashboard-container">
    <!-- Header with Add Task and Create Category Buttons -->
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
      <div v-for="category in categories" :key="category.id" class="category-section">
        <h2>{{ category.name }}</h2>
        <div v-if="tasksByCategory(category.name).length === 0" class="no-tasks-in-category">
          <p>No tasks available in this category.</p>
        </div>
        <div class="tasks-list">
          <TaskItem v-for="task in tasksByCategory(category.name)" :key="task.id" :task="task" @edit="handleEditTask"
            @delete="triggerDeleteConfirmPopup(task)" />
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
            <input id="task-id" v-model.number="newTask.taskId" type="number" :disabled="isEditMode" required
              class="no-arrows" />
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
              <option v-for="category in categories" :key="category.id" :value="category.name">{{ category.name }}
              </option>
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
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
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
      userId: '',
      taskId: '',
    });
    const taskToDelete = ref(null);
    const filterCriteria = ref({ status: '', query: '' });

    // Log in the user using Google Auth
    const loginUser = async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        user.value = result.user;
        fetchCategoriesAndTasks();
      } catch (error) {
        console.error("Error logging in:", error);
      } finally {
        isLoading.value = false;
      }
    };

    // Fetch categories and tasks for the logged-in user
    const fetchCategoriesAndTasks = async () => {
      if (!user.value) return;

      // Fetch categories for the logged-in user
      const categoryQuery = query(collection(db, 'categories'), where('userId', '==', user.value.uid));
      const categorySnapshot = await getDocs(categoryQuery);

      // Map through the categories and retrieve tasks for each category
      const categoriesArray = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      categories.value = categoriesArray;

      // Initialize an array to store all tasks
      const allTasks = [];

      // Fetch tasks for each category
      for (const category of categoriesArray) {
        console.warn("CategoryId => " + JSON.stringify(category))
        const tasksCollectionRef = collection(db, `categories/${category.name}/tasks`);
        const tasksSnapshot = await getDocs(tasksCollectionRef);

        tasksSnapshot.forEach((taskDoc) => {
          allTasks.push({
            id: taskDoc.id,
            ...taskDoc.data(),
            category: category.name, // Associate task with its category name
          });
        });
      }

      tasks.value = allTasks;
    };

    // Add a new task under a specific category
    const addTaskToFirestore = async () => {
      const categoryDocRef = doc(db, 'categories', newTask.value.category);
      const tasksCollectionRef = collection(categoryDocRef, 'tasks');

      // Add the new task to Firestore and capture the reference
      const taskDocRef = await addDoc(tasksCollectionRef, {
        name: newTask.value.name,
        description: newTask.value.description,
        dueDate: newTask.value.dueDate,
        priority: newTask.value.priority,
        status: newTask.value.status,
        userId: user.value.uid,
        category: newTask.value.category,
        taskId: newTask.value.taskId
      });
      newTask.value.id = taskDocRef.id;

      fetchCategoriesAndTasks();
    };

    const updateTaskInFirestore = async () => {
      console.warn("newTask.value.category => " + JSON.stringify(newTask.value))
      const { id, category, name, description, dueDate, priority, status, userId, taskId } = newTask.value;

      if (!id) {
        console.error("No valid document ID found for the task update.");
        return;
      }

      const originalTask = tasks.value.find(task => task.id === id);
      const originalCategory = originalTask?.category;

      try {
        if (originalCategory && originalCategory !== category) {
          const newCategoryDocRef = doc(db, 'categories', category);
          const newTasksCollectionRef = collection(newCategoryDocRef, 'tasks');

          await addDoc(newTasksCollectionRef, {
            name,
            description,
            dueDate,
            priority,
            status,
            userId,
            category,
            taskId
          });

          const oldCategoryDocRef = doc(db, 'categories', originalCategory);
          const oldTaskDocRef = doc(oldCategoryDocRef, 'tasks', id);
          await deleteDoc(oldTaskDocRef);
        } else {
          const categoryDocRef = doc(db, 'categories', category);
          const taskDocRef = doc(categoryDocRef, 'tasks', id);
          await updateDoc(taskDocRef, {
            name,
            description,
            dueDate,
            priority,
            status,
            userId,
            category,
            taskId
          });
        }

        fetchCategoriesAndTasks();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    };
    const deleteTaskFromFirestore = async (taskId, category) => {
      try {
        const categoryDocRef = doc(db, 'categories', category);
        const taskDocRef = doc(categoryDocRef, 'tasks', taskId);
        await deleteDoc(taskDocRef);
        fetchCategoriesAndTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    };

    onMounted(async () => {
      if (!user.value) {
        await loginUser();
      } else {
        await fetchCategoriesAndTasks();
        console.log("Fetched tasks:", tasks.value); // Check tasks in the console
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

    const addCategory = async () => {
      if (!categories.value.find(cat => cat.name === newCategory.value)) {
        const categoryRef = doc(collection(db, 'categories'), newCategory.value);
        await setDoc(categoryRef, { name: newCategory.value, userId: user.value.uid });
        fetchCategoriesAndTasks();
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
      deleteTaskFromFirestore(taskToDelete.value.id, taskToDelete.value.category);
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
      console.warn("Category =>" + JSON.stringify(tasks.value))
      return filteredTasks.value.filter((task) => task.category == category);
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

.add-task-btn,
.add-category-btn {
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

input,
textarea,
select {
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

.submit-btn,
.cancel-btn,
.close-btn,
.delete-btn {
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

.cancel-btn,
.close-btn {
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


.no-arrows::-webkit-inner-spin-button,
.no-arrows::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-arrows {
  -moz-appearance: textfield;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }

  .tasks-list {
    flex-direction: column;
  }

  .task-item {
    width: 100%;
    min-width: 0;
  }

  .modal-content {
    width: 100%;
    padding: 15px;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .submit-btn,
  .cancel-btn,
  .close-btn,
  .delete-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    text-align: center;
  }

  .add-task-btn,
  .add-category-btn {
    font-size: 14px;
    padding: 8px 15px;
  }

  .category-section h2 {
    font-size: 18px;
  }

  .submit-btn,
  .cancel-btn,
  .close-btn,
  .delete-btn {
    padding: 8px 15px;
  }
}
</style>
