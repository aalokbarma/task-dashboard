import Dashboard from './components/DashBoard.vue';
import Login from './components/LogIn.vue';

import {createRouter, createWebHistory} from 'vue-router';


const routes = [
    {
        name: "Dashboard",
        component: Dashboard,
        path: '/',
    },
    {
        name: "Login",
        component: Login,
        path: '/login',
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
