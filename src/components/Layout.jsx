import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import SideBar from './SideBar';
import { supabase } from '../supabase';
import style from '../styles/Layout.module.css';

function Layout() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user has a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('No valid session, redirecting to login');
        navigate('/login');
        return;
      }

      // Check if the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (adminError || !adminData) {
        console.log('User is not an admin, redirecting to login');
        // Log out the non-admin user
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      // User is authenticated and is an admin
      setIsAuthenticated(true);
      setLoading(false);

    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/login');
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Checking authentication...
      </div>
    );
  }

  // Only render the layout if user is authenticated and is admin
  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className={style.layoutContainer}>
      <NavBar />
      <div>
        <SideBar />
      </div>
      <div className={style.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;