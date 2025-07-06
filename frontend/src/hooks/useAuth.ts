'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ApiError } from '@/types/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Auth query keys
const authKeys = {
  user: ['auth', 'user'],
};

// Simulated API functions - replace with actual API calls
const fetchCurrentUser = async (): Promise<User | null> => {
  // Check for token in localStorage
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  
  // This would be a real API call in production
  console.log('Fetching current user');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate user data
  return {
    id: 'user123',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user',
    avatar: 'https://via.placeholder.com/150'
  };
};

const loginUser = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  // This would be a real API call in production
  console.log('Logging in user:', credentials.email);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate successful login
  if (credentials.email === 'error@example.com') {
    throw new Error('Invalid credentials');
  }
  
  return {
    user: {
      id: 'user123',
      email: credentials.email,
      name: 'John Doe',
      role: 'user',
      avatar: 'https://via.placeholder.com/150'
    },
    token: 'simulated-jwt-token'
  };
};

const registerUser = async (data: RegisterData): Promise<{ user: User; token: string }> => {
  // This would be a real API call in production
  console.log('Registering user:', data.email);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate successful registration
  if (data.email === 'taken@example.com') {
    throw new Error('Email already in use');
  }
  
  return {
    user: {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'user'
    },
    token: 'simulated-jwt-token'
  };
};

const logoutUser = async (): Promise<void> => {
  // This would be a real API call in production
  console.log('Logging out user');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clear token from localStorage
  localStorage.removeItem('auth_token');
};

/**
 * Custom hook for authentication using React Query
 * Handles login, registration, logout, and current user state
 * Compatible with Next.js App Router and hydration
 */
export const useAuth = (): UseAuthReturn => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize auth state - only runs on client
  useEffect(() => {
    setIsInitialized(true);
  }, []);
  
  // Query to fetch current user
  const { 
    data: user = null, 
    isLoading, 
    isError, 
    error 
  } = useQuery<User | null, ApiError>({
    queryKey: authKeys.user,
    queryFn: fetchCurrentUser,
    // Only run the query on the client and after initialization
    enabled: typeof window !== 'undefined' && isInitialized,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
      
      // Update user data in cache
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
      
      // Update user data in cache
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(authKeys.user, null);
      
      // Invalidate all queries to force refetch
      queryClient.invalidateQueries();
    },
  });
  
  // Wrapper functions with better error handling
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      await loginMutation.mutateAsync(credentials);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  const register = async (data: RegisterData): Promise<void> => {
    try {
      await registerMutation.mutateAsync(data);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };
  
  return {
    user,
    isLoading,
    isError,
    error: error as Error | null,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
};
