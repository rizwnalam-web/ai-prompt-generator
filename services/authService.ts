import { User } from '../types';

const USERS_STORAGE_KEY = 'promptGenUsers';
const CURRENT_USER_STORAGE_KEY = 'promptGenCurrentUser';

// In a real app, this would be a secure, server-side operation.
// For this demo, we store users in localStorage.
const getUsers = (): (User & { passwordHash: string })[] => {
    try {
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
        return [];
    }
};

const saveUsers = (users: (User & { passwordHash: string })[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const register = (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network delay
            const users = getUsers();
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                reject(new Error('An account with this email already exists.'));
                return;
            }

            // In a real app, you'd securely hash the password.
            // Here, we'll just store it directly for simplicity. This is NOT secure.
            const newUser: User & { passwordHash: string } = {
                id: `user-${Date.now()}`,
                email,
                passwordHash: password, // This should be a hash!
            };

            users.push(newUser);
            saveUsers(users);
            
            const { passwordHash, ...userToReturn } = newUser;
            localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToReturn));
            resolve(userToReturn);
        }, 500);
    });
};

export const login = (email: string, password: string): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network delay
            const users = getUsers();
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user || user.passwordHash !== password) {
                reject(new Error('Invalid email or password.'));
                return;
            }
            
            const { passwordHash, ...userToReturn } = user;
            localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToReturn));
            resolve(userToReturn);
        }, 500);
    });
};

export const logout = (): void => {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
};

export const getCurrentUser = (): User | null => {
    try {
        const userJson = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
        return null;
    }
};
