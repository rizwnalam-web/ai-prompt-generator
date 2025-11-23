
import { User } from '../types';
import { encryptData, decryptData } from './cryptoUtils';

const USERS_STORAGE_KEY = 'promptGenUsers';
const CURRENT_USER_STORAGE_KEY = 'promptGenCurrentUser';
const USERS_FILE_PATH = '/users.json';

// Helper to fetch and decrypt users from the JSON file
const fetchRemoteUsers = async (): Promise<(User & { passwordHash: string })[]> => {
    try {
        const response = await fetch(USERS_FILE_PATH);
        if (!response.ok) {
            console.warn("Could not load users.json");
            return [];
        }
        const fileContent = await response.json();
        if (fileContent && fileContent.payload) {
            return decryptData(fileContent.payload);
        }
        return [];
    } catch (error) {
        console.error("Error loading remote users:", error);
        return [];
    }
};

// Load users from both LocalStorage (new/session users) and users.json (persistent users)
const getAllUsers = async (): Promise<(User & { passwordHash: string })[]> => {
    // 1. Get local users
    let localUsers: (User & { passwordHash: string })[] = [];
    try {
        const localUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
        localUsers = localUsersJson ? JSON.parse(localUsersJson) : [];
    } catch (e) {
        localUsers = [];
    }

    // 2. Get remote users from file
    const remoteUsers = await fetchRemoteUsers();

    // 3. Merge lists (prefer local if ID conflict, though IDs should be unique)
    // We map by email to ensure no duplicates
    const userMap = new Map();
    
    [...remoteUsers, ...localUsers].forEach(user => {
        userMap.set(user.email.toLowerCase(), user);
    });

    return Array.from(userMap.values());
};

// Save to localStorage (Browser cannot write to server file system directly)
const saveLocalUsers = (users: (User & { passwordHash: string })[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    // In a real app, this would be a POST request to the backend to update users.json
    // For this demo, we log the encrypted payload that would be written to the file.
    console.log("To update users.json manually, paste this payload:", JSON.stringify({ payload: encryptData(users) }));
};

export const register = async (email: string, password: string): Promise<User> => {
    const users = await getAllUsers();
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists.');
    }

    const newUser: User & { passwordHash: string } = {
        id: `user-${Date.now()}`,
        email,
        passwordHash: password, // Note: In production, use proper hashing (e.g., bcrypt)
    };

    const updatedUsers = [...users, newUser];
    saveLocalUsers(updatedUsers);
    
    const { passwordHash, ...userToReturn } = newUser;
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToReturn));
    return userToReturn;
};

export const login = async (email: string, password: string): Promise<User> => {
    const users = await getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
        throw new Error('Invalid email or password.');
    }
    
    const { passwordHash, ...userToReturn } = user;
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToReturn));
    return userToReturn;
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
