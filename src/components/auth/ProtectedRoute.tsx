import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    const roleRedirects = {
      [UserRole.ADMIN]: '/admin',
      [UserRole.SUPPLIER]: '/supplier',
      [UserRole.BUYER]: '/buyer',
    };
    
    return <Navigate to={roleRedirects[user.role] || '/'} replace />;
  }

  return <>{children}</>;
};

interface RoleBasedRouteProps {
  children: React.ReactNode;
  role: UserRole;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, role }) => {
  return (
    <ProtectedRoute allowedRoles={[role]}>
      {children}
    </ProtectedRoute>
  );
};

// Route guards for specific roles
export const SupplierRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute role={UserRole.SUPPLIER}>{children}</RoleBasedRoute>
);

export const BuyerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute role={UserRole.BUYER}>{children}</RoleBasedRoute>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute role={UserRole.ADMIN}>{children}</RoleBasedRoute>
);

// Public route that redirects authenticated users to their dashboard
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const roleRedirects = {
      [UserRole.ADMIN]: '/admin',
      [UserRole.SUPPLIER]: '/supplier',
      [UserRole.BUYER]: '/buyer',
    };
    
    return <Navigate to={roleRedirects[user.role] || '/'} replace />;
  }

  return <>{children}</>;
};