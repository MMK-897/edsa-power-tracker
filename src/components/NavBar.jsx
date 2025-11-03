import style from "../styles/NavBar.module.css";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function NavBar() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (path === "dashboard" || path === "") return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
  };

  return (
    <header className={style.navbar}>
      <div className={style.leftSection}>
        <h1 className={style.pageTitle}>{getPageTitle()}</h1>
      </div>
    </header>
  );
}
export default NavBar;
