import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
    // ── Guest routes ─────────────────────────────────────────────────────────
    { path: '/login',    component: () => import('@/pages/Auth/Login.vue'),          meta: { guest: true } },
    { path: '/register', component: () => import('@/pages/Auth/Register.vue'),       meta: { guest: true } },
    { path: '/forgot-password', component: () => import('@/pages/Auth/ForgotPassword.vue'), meta: { guest: true } },
    { path: '/reset-password',  component: () => import('@/pages/Auth/ResetPassword.vue'),  meta: { guest: true } },
    { path: '/verify-otp',      component: () => import('@/pages/Auth/VerifyOtp.vue'),      meta: { guest: true } },

    // ── Auth routes ───────────────────────────────────────────────────────────
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import('@/pages/Dashboard.vue'), meta: { auth: true } },

    // Invoices
    { path: '/invoices',          component: () => import('@/pages/Invoices/Index.vue'),  meta: { auth: true } },
    { path: '/invoices/create',   component: () => import('@/pages/Invoices/Create.vue'), meta: { auth: true } },
    { path: '/invoices/:id',      component: () => import('@/pages/Invoices/Show.vue'),   meta: { auth: true } },
    { path: '/invoices/:id/edit', component: () => import('@/pages/Invoices/Create.vue'), meta: { auth: true } },

    // Customers
    { path: '/customers',                   component: () => import('@/pages/Customers/Index.vue'),     meta: { auth: true } },
    { path: '/customers/:id/statement',     component: () => import('@/pages/Customers/Statement.vue'), meta: { auth: true } },

    // Products
    { path: '/products',  component: () => import('@/pages/Products/Index.vue'),  meta: { auth: true } },

    // Suppliers
    { path: '/suppliers', component: () => import('@/pages/Suppliers/Index.vue'), meta: { auth: true } },

    // Quotations
    { path: '/quotations',          component: () => import('@/pages/Quotations/Index.vue'),  meta: { auth: true } },
    { path: '/quotations/create',   component: () => import('@/pages/Quotations/Create.vue'), meta: { auth: true } },
    { path: '/quotations/:id',      component: () => import('@/pages/Quotations/Show.vue'),   meta: { auth: true } },
    { path: '/quotations/:id/edit', component: () => import('@/pages/Quotations/Create.vue'), meta: { auth: true } },

    // Purchases
    { path: '/purchases',          component: () => import('@/pages/Purchases/Index.vue'),  meta: { auth: true } },
    { path: '/purchases/create',   component: () => import('@/pages/Purchases/Create.vue'), meta: { auth: true } },
    { path: '/purchases/:id',      component: () => import('@/pages/Purchases/Show.vue'),   meta: { auth: true } },
    { path: '/purchases/:id/edit', component: () => import('@/pages/Purchases/Create.vue'), meta: { auth: true } },

    // Credit Notes
    { path: '/credit-notes',        component: () => import('@/pages/CreditNotes/Index.vue'),  meta: { auth: true } },
    { path: '/credit-notes/create', component: () => import('@/pages/CreditNotes/Create.vue'), meta: { auth: true } },
    { path: '/credit-notes/:id',    component: () => import('@/pages/CreditNotes/Show.vue'),   meta: { auth: true } },

    // Debit Notes
    { path: '/debit-notes',        component: () => import('@/pages/DebitNotes/Index.vue'),  meta: { auth: true } },
    { path: '/debit-notes/create', component: () => import('@/pages/DebitNotes/Create.vue'), meta: { auth: true } },
    { path: '/debit-notes/:id',    component: () => import('@/pages/DebitNotes/Show.vue'),   meta: { auth: true } },

    // Recurring Invoices
    { path: '/recurring-invoices',          component: () => import('@/pages/RecurringInvoices/Index.vue'),  meta: { auth: true } },
    { path: '/recurring-invoices/create',   component: () => import('@/pages/RecurringInvoices/Create.vue'), meta: { auth: true } },
    { path: '/recurring-invoices/:id/edit', component: () => import('@/pages/RecurringInvoices/Create.vue'), meta: { auth: true } },

    // Reports
    { path: '/reports/gstr1',  component: () => import('@/pages/Reports/GSTR1.vue'),  meta: { auth: true } },
    { path: '/reports/gstr3b', component: () => import('@/pages/Reports/GSTR3B.vue'), meta: { auth: true } },
    { path: '/reports/aging',  component: () => import('@/pages/Reports/Aging.vue'),  meta: { auth: true } },

    // Billing
    { path: '/billing', component: () => import('@/pages/Billing/Index.vue'), meta: { auth: true } },

    // Profile & Settings
    { path: '/profile',   component: () => import('@/pages/Profile/Edit.vue'),    meta: { auth: true } },
    { path: '/settings',  component: () => import('@/pages/Settings/Index.vue'),  meta: { auth: true } },

    // Admin
    { path: '/admin',                 component: () => import('@/pages/Admin/Dashboard.vue'),    meta: { auth: true, admin: true } },
    { path: '/admin/tenants',         component: () => import('@/pages/Admin/Tenants/Index.vue'), meta: { auth: true, admin: true } },
    { path: '/admin/tenants/:id',     component: () => import('@/pages/Admin/Tenants/Show.vue'),  meta: { auth: true, admin: true } },
    { path: '/admin/plans',           component: () => import('@/pages/Admin/Plans/Index.vue'),   meta: { auth: true, admin: true } },
    { path: '/admin/system-settings', component: () => import('@/pages/Admin/SystemSettings.vue'), meta: { auth: true, admin: true } },

    // 404
    { path: '/:pathMatch(.*)*', component: () => import('@/pages/NotFound.vue') },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, _from, next) => {
    const auth = useAuthStore()

    // Restore user on first load if token exists but user not loaded
    if (auth.token && !auth.user) {
        try {
            await auth.fetchUser()
        } catch {
            auth._clearToken()
        }
    }

    if (to.meta.auth  && !auth.isAuthenticated) return next('/login')
    if (to.meta.guest && auth.isAuthenticated)  return next('/dashboard')
    if (to.meta.admin && !auth.isSuperAdmin)    return next('/dashboard')

    next()
})

export default router
