<template>
  <div class="not-found-container">
    <h1>404 - Page Not Found</h1>
    <p>Sorry, the page you are looking for does not exist.</p>
    <router-link to="/" class="home-link">Go Back Home</router-link>
  </div>
</template>

<script>
export default {
  name: "NotFound"
};
</script>

<style scoped>
.not-found-container {
  text-align: center;
  margin-top: 100px;
}

.not-found-container h1 {
  font-size: 2.5rem;
  color: #e74c3c;
}

.not-found-container p {
  margin: 20px 0;
  font-size: 1.25rem;
  color: #333;
}

.home-link {
  color: #42b983;
  font-weight: bold;
  text-decoration: none;
  border: 1px solid #42b983;
  padding: 10px 20px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.home-link:hover {
  background-color: #42b983;
  color: white;
}
</style>
