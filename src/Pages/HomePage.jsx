import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HomePage.module.css';
import { supabase } from '../supabase';

function HomePage() {
  const [adminExists, setAdminExists] = useState(false);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate();

  useEffect(()=>{

    checkForAdmin()

  },[])

  const checkForAdmin = async ()=>{
    try{
      setLoading(true);
      const {data, error} = await supabase.from("admin").select("id").limit(1)
      if(error) throw error

    if(data && data.length > 0){
      setAdminExists(true)
    }else{
      setAdminExists(false)
    }
    setLoading(false)
    


    }catch(err){
      console.error('Error checking admin:', err)
      setError(err.message)
    }finally{
      setLoading(false)

    }



  }

 
 

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span role="img" aria-label="lightning bolt">⚡</span>
          <h1>Power Supply Management System</h1>
        </div>
      </header>

      <main className={styles.mainContent}>
        <h2 className={styles.title}>Efficiently Manage Freetown Power Grid</h2>
        <p className={styles.subtitle}>
          The admin portal for monitoring, managing, and reporting on electricity distribution and usage.
        </p>

        <div className={styles.ctaButtons}>
        
        {adminExists && (
            <button 
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={() => navigate('/login')}
            >
              Admin Login
            </button>
        )}
         {!adminExists && (
          <button 
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={() => navigate('/signup')}
          >
            Admin Sign Up
          </button>
         )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Electricity Distribution and Supply Authority. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;