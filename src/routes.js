import Dashboard from './components/DashBoard.vue';
import Login from './components/LogIn.vue';
import NotFound from './components/NotFoundScreen.vue';

import { createRouter, createWebHistory } from 'vue-router';


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
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
