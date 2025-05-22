
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_ROLE, SUPER_ADMIN_ROLE, USER_ROLE } from '@/types/UserRole';

export const useRoleNavigation = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const navigateByRole = () => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === USER_ROLE) {
        navigate("/my-exams");
      } else if (currentUser.role === ADMIN_ROLE || currentUser.role === SUPER_ADMIN_ROLE) {
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  };

  return { navigateByRole };
};
