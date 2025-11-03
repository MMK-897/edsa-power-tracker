import style from "../styles/Dashboard.module.css";
import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";
import alertIcon from "../assets/icons/alert.png";
import notesIcon from "../assets/icons/note.png";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import checkbox from "../assets/icons/check-box.png";

function DashBoard() {
  const [totalReports, setTotalReports] = useState(0); // Initialize with a default value
  const [activeIssues, setActiveIssues] = useState(0);
  const [resolvedToday, setResolvedToday] = useState(0);
  const [avgResolutionTime, setAvgResolutionTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data when the component mounts
    fetchTotalReports(); // call the function Fetch total reports today
    fetchActiveIssues(); // call the function Fetch active issues
    fetchResolvedToday(); // call the function Fetch resolved today
  }, []);

  //Fuction to get todays date
  const getTodaysDate = () => {
    const now = new Date();

    const startOfToday = new Date(); // Create a new date object
    startOfToday.setHours(0, 0, 0, 0); // Set the time to midnight

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999); // Set the time to the end of the day

    return {
      start: startOfToday.toISOString(), // Convert the date to a string
      end: endOfToday.toISOString(), // Convert the date to a string
    };
  };

  //Function to fetch total reports today
  const fetchTotalReports = async () => {
    // try catch block to handle errors
    try {
      const { start, end } = getTodaysDate(); //Get todays date
      setLoading(true); // Set loading to true
      const { count, error } = await supabase
        .from("reports") //Select the reports table
        .select("*", { count: "exact" }) // Select everthing in the reports table and count the number of rows
        .gte("created_at", start) // Greater than or equal to the start date
        .lte("created_at", end); // Less than or equal to the end date
      if (error) throw error;
      setTotalReports(count || 0); // Set the total reports to the count or 0 if count is undefined
    } catch (err) {
      console.error("Error fetching total reports:", err);
      setError(err.message || "Failed to fetch total reports");
      setTotalReports(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveIssues = async () => {
    try {
      const { start, end } = getTodaysDate();
      setLoading(true);
      const { count, error } = await supabase
        .from("reports")
        .select("*", { count: "exact" })
        .eq("status", "Pending") // Filter by status where it is pending
        .gte("created_at", start) // Greater than or equal to the start date
        .lte("created_at", end); // Less than or equal to the end date
      if (error) throw error;

      setActiveIssues(count || 0);
    } catch (err) {
      console.error("Error fetching active issues:", err);
      setError(err.message || "Failed to fetch active issues");
      setActiveIssues(0);
    }
  };

  const fetchResolvedToday = async () => {
    try {
      const { start, end } = getTodaysDate();
      setLoading(true);
      const { count, error } = await supabase
        .from("outages")
        .select("*", { count: "exact" })
        .eq("status", "Resolved") // Filter by status where it is resolved
        .gte("created_at", start)
        .lte("created_at", end);
      setResolvedToday(count || 0);
    } catch (err) {
      console.error("Error fetching resolved today:", err);
      setError(err.message || "Failed to fetch resolved today");
      setResolvedToday(0);
    }
  };

  if (loading) {
    return (
      <>
        <div className={style.loadingContainer}>
          <div className={style.spinner}></div>
          <p>Loading Dashboard...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className={style.errorContainer}>
          <p>Error: {error}</p>
          <button
            onClick={() => {
              fetchTotalReports();
              fetchActiveIssues();
              fetchResolvedToday();
            }}
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  const cardsData = [
    {
      image: notesIcon,
      title: "Total Reports Today",
      number: totalReports,
    },
    {
      image: alertIcon,
      title: "Active Issues",
      number: activeIssues,
    },
    {
      image: checkbox,
      title: "Resolved Today",
      number: resolvedToday,
    },
    // {
    //   title: "Avg Resoultion Time",
    //   number: "15",
    // },
  ];
  const recentNotifications = [
    {
      title: "Critical Report - Ward 5",
      description:
        "New critical power outage report from Ward 5. Immediate attention required.",
    },
    {
      title: "Scheduled Outage Reminder ",
      description:
        "Reminder: Scheduled outage in Ward 2 tomorrow at 9:00 AM. Notification sent to residents.",
    },
    {
      title: "Multiple Reports - Ward 3",
      description:
        "5 new reports received from Ward 3 regarding low voltage. Pattern detected.",
    },
  ];
  return (
    <>
      <div className={style.container}>
        <div className={style.topContent}>
          <div className={style.titleContainer}>
            <h2>DashBoard Overview</h2>
            <p>Monitor and manage community power issues</p>
          </div>

          <div className={style.cards}>
            {cardsData.map((cardsData, index) => (
              <div className={style.card} key={index}>
                <div>
                  <h3>{cardsData.title}</h3>
                  <p>{cardsData.number}</p>
                </div>
                <div>
                  <img
                    src={cardsData.image}
                    alt=""
                    width="20px"
                    height="20px"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={style.recentNotifications}>
            <h2>Recent Notifications</h2>
            {recentNotifications.map((notification, index) => (
              <div className={style.notificationCard} key={index}>
                <h3>{notification.title}</h3>
                <p>{notification.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
export default DashBoard;
