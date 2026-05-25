import * as SecureStore from 'expo-secure-store';
import type { TokenCache } from '@clerk/clerk-expo';
import { Platform } from 'react-native';

const createTokenCache = ():TokenCache => {
    return {
        getToken: async (key: string) => {
            try {
                const item = await SecureStore.getItemAsync(key);
                if (item) {
                    console.log(`${key} was used 🔐`);
                } else {
                    console.log('No value found for key:' + key);
                }
                return item;
            } catch (error) {
                console.log('Error getting token', error);
            }
        },
        saveToken: async (key: string, token: string) => {
            try {
                return await SecureStore.setItemAsync(key, token);
            } catch (error) {
                console.log('Error saving token', error);
            }
        }
    }
}

export const tokenCache = Platform.OS === 'web' ? undefined : createTokenCache();