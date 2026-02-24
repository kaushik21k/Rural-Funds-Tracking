'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/src/lib/api';
import { User } from '@/app/page';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = apiService.getToken();
      const savedUser = localStorage.getItem('currentUser');
      
      // Check if token exists
      if (!token || !apiService.isTokenValid()) {
        console.log('No valid token found, redirecting to home');
        router.push('/');
        return;
      }

      // Check if user data exists
      if (!savedUser) {
        console.log('No user data found, redirecting to home');
        apiService.removeToken();
        router.push('/');
        return;
      }

      try {
        // Verify token with backend
        const response = await apiService.getCurrentUser();
        const userData = response.user;
        
        // Check role requirement if specified
        if (requiredRole && userData.role !== requiredRole) {
          console.log(`Access denied: Required role ${requiredRole}, user has ${userData.role}`);
          router.push('/');
          return;
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Update localStorage with fresh user data
        localStorage.setItem('currentUser', JSON.stringify(userData));
      } catch (error) {
        console.error('Token verification failed:', error);
        // Clear invalid token and redirect
        apiService.removeToken();
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to home
  }

  return <>{children}</>;
}
