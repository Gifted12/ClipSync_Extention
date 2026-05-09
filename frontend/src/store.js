import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        document.documentElement.setAttribute('data-theme', user?.theme || 'light');
      },
      updateUser: (user) => {
        set({ user });
        document.documentElement.setAttribute('data-theme', user?.theme || 'light');
      },
      logout: () => set({ user: null, token: null }),

   
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },

     
      appLoading: true,
      setAppLoading: (v) => set({ appLoading: v }),
    }),
    {
      name: 'clipsync-store',
      partialize: (state) => ({ user: state.user, token: state.token, theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const theme = state.user?.theme || state.theme || 'light';
          document.documentElement.setAttribute('data-theme', theme);
        }
        setTimeout(() => useStore.getState().setAppLoading(false), 0);
      },
    }
  )
);
export default useStore;
