import { NavLink, useNavigate } from "react-router-dom";
import style from "../styles/SideBar.module.css";
import { supabase } from "../supabase";
import powerIcon from "../assets/icons/power.png";

// To install lucide-react: npm install lucide-react
import {
  LayoutDashboard,
  FileText,
  Zap,
  Settings,
  LogOut,
  Wallet
} from "lucide-react";

const navLinks = [
  { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { to: "/dashboard/reports", icon: <FileText size={20} />, label: "Reports" },
  { to: "/dashboard/outages", icon: <Zap size={20} />, label: "Outages" },
  {to: "/dashboard/payments", icon:<Wallet size={20}/>, label: "Payments" }
];

function SideBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className={style.sidebar}>
      <div className={style.logoContainer}>
        <img src={powerIcon} alt="App Logo" className={style.logoIcon} />
        <h1 className={style.logoText}> Admin</h1>
      </div>

      <nav className={style.nav}>
        <ul className={style.navList}>
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/dashboard"} // `end` ensures only exact match for dashboard
                className={({ isActive }) =>
                  `${style.navLink} ${isActive ? style.active : ""}`
                }
              >
                {link.icon}
                <span className={style.navLabel}>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={style.footer}>
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `${style.navLink} ${isActive ? style.active : ""}`
          }
        >
          <Settings size={20} />
          <span className={style.navLabel}>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className={style.logoutButton}>
          <LogOut size={20} />
          <span className={style.navLabel}>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default SideBar;
    
