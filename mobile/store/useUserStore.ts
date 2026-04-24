import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserStore {
  userRole: string | null;
  setUserRole: (role: string | null) => void;
  clearUserRole: () => void;
  resetStore: () => void;
}

export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
      userRole: null,
      setUserRole: (role) => set({ userRole: role }),
      clearUserRole: () => set({ userRole: null }),
      resetStore: async () => {
        set({ userRole: null });
        await AsyncStorage.removeItem('user-storage');
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
