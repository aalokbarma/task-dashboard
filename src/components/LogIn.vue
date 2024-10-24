<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Login to Your Account</h1>
      <p>Log in to manage your tasks and stay organized!</p>

      <button @click="loginWithGoogle" class="google-login-btn">
        <img src="@/assets/google-icon.png" alt="Google Icon" class="google-icon" />
        Login with Google
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { auth, provider, signInWithPopup } from '../Services/firebase';
import { useRouter } from 'vue-router';


export default {
  setup() {
    const errorMessage = ref('');
    const router = useRouter();

    const loginWithGoogle = async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('User logged in:', result.user);
        router.push({ name: "Dashboard" });
      } catch (error) {
        errorMessage.value = 'Failed to log in with Google';
        console.error('Google login error:', error);
      }
    };

    return {
      loginWithGoogle,
      errorMessage
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

h1 {
  font-size: 24px;
  margin-bottom: 16px;
}

p {
  margin-bottom: 20px;
  color: #666;
}

.google-login-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  max-width: 100%;
}

.google-login-btn:hover {
  background-color: #357ae8;
}

.google-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.terms {
  font-size: 12px;
  color: #888;
  margin-top: 10px;
}

.terms a {
  color: #42b983;
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
}
</style>
