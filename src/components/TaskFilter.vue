<template>
  <div class="filter-bar">
    <input
      v-model="searchQuery"
      placeholder="Search tasks by name or ID"
      @input="applyFilter"
      class="search-input"
    />
    <select v-model="statusFilter" @change="applyFilter" class="status-select">
      <option value="">All Statuses</option>
      <option value="To-do">To-do</option>
      <option value="In Progress">In Progress</option>
      <option value="Done">Done</option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    initialStatusFilter: {
      type: String,
      default: ""
    },
    initialSearchQuery: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      searchQuery: this.initialSearchQuery,
      statusFilter: this.initialStatusFilter
    };
  },
  methods: {
    applyFilter() {
      this.$emit("filter", {
        status: this.statusFilter,
        query: this.searchQuery
      });
    }
  }
};
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.status-select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
