import { defineStore } from 'pinia'
import api from '@/api/index.js'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user:  null,
        token: localStorage.getItem('token') ?? null,
    }),

    getters: {
        isAuthenticated: s => !!s.token,
        isSuperAdmin: s => !!s.user?.is_super_admin,
    },

    actions: {
        async login(credentials) {
            const { data } = await api.post('/auth/login', credentials)
            if (data.requires_otp) return data   // caller handles OTP step
            this._setToken(data.token, data.user)
            return data
        },

        async verifyOtp(payload) {
            const { data } = await api.post('/auth/verify-otp', payload)
            this._setToken(data.token, data.user)
            return data
        },

        async register(payload) {
            const { data } = await api.post('/auth/register', payload)
            this._setToken(data.token, data.user)
            return data
        },

        async logout() {
            await api.post('/auth/logout').catch(() => {})
            this._clearToken()
        },

        async fetchUser() {
            const { data } = await api.get('/auth/me')
            this.user = data.user
        },

        _setToken(token, user) {
            this.token = token
            this.user  = user
            localStorage.setItem('token', token)
        },

        _clearToken() {
            this.token = null
            this.user  = null
            localStorage.removeItem('token')
        },
    },
})
