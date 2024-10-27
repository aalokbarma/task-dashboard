<template>
  <div class="task-item">
    <!-- Task Info -->
    <h3>{{ task.name }}</h3>
    <p><strong>ID:</strong> {{ task.taskId }}</p>
    <p><strong>Description:</strong> {{ task.description }}</p>
    <p><strong>Due Date:</strong> {{ task.dueDate }}</p>
    <p><strong>Priority:</strong> {{ task.priority }}</p>
    <p><strong>Status:</strong> {{ task.status }}</p>
  
    <!-- Three Dots Menu Button -->
    <div class="menu-wrapper">
      <button class="menu-btn" @click="toggleMenu">⋮</button>
      <div v-if="showMenu" class="menu-popup">
        <button @click="editTask">Edit</button>
        <button @click="deleteTask">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showMenu: false
    };
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    editTask() {
      this.$emit('edit', this.task);
      this.showMenu = false;
    },
    deleteTask() {
      this.$emit('delete', this.task);
      this.showMenu = false;
    }
  }
};
</script>

<style scoped>
.task-item {
  position: relative;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  text-align: left;
}

h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

p {
  margin: 5px 0;
}

.menu-wrapper {
  position: absolute;
  top: 10px;
  right: 10px;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
}

.menu-popup {
  position: absolute;
  top: 30px;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.menu-popup button {
  display: block;
  width: 100%;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.menu-popup button:hover {
  background-color: #f5f5f5;
}
</style>
