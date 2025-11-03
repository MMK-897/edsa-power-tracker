import style from "../styles/Report.module.css";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import toast, { Toaster } from "react-hot-toast";
function Report() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); //To search for something
  const [searchHistory, setSearchHistory] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [realTimeConnected, setRealTimeConnected] = useState()

  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel("reports")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
        },
        (payload) => {
          console.log("Real-time change received!", payload);
          fetchReports(); // Re-fetch reports on any change
        }
      )
      .subscribe((status) => {
        setRealTimeConnected(status === "SUBSCRIBED");
      });

    // Cleanup function to remove the channel subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(
          `
        id,
        communities!inner(id, name), 
        users(
        full_name
        ),
        meter_number, 
        type, 
        notes, 
        status, 
        created_at`
        ) //This is getting the reports in the reports table
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReports(data); //set the reports to the data
      setLoading(false);
      console.log(data);

    } catch (err) {
      console.log("Error fetching reports", err); //if we get an error while getting the reports
      setError(err.message || "Failed to fetch reports");
      setLoading(false);
    }
  };
  //This is to shown a loading spinner while the reports are being fetched
  if (loading) {
    return (
      <>
        <div className={style.loadingContainer}>
          <div className={style.spinner}></div>
          <p>Loading Reports...</p>
        </div>
      </>
    );
  }
  //This is to show an error message if there is an error while fetching the reports
  if (error) {
    return (
      <div className={style.container}>
        <div className={`${style.centeredMessage} ${style.error}`}>
          <p>Error: {error}</p>
          <button onClick={fetchReports} className={style.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }
  //This is to send to notifications when a report is resolved
  const handleResolveReport = async (reportId) => {
    try {
      const { data: report, error: fetchError } = await supabase
        //We are getting the reports f
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .single();

      const { error: updateError } = await supabase
        .from("reports")
        .update({
          status: "Resolved",
        })
        .eq("id", reportId);
      if (updateError) throw updateError;

      await supabase.from("notifications").insert({
        recipient_community_id: report.community_id,
        recipient_user_id: report.user_id,
        type: "ReportResolved",
        title: "Report Resolved",
        message: "Your report has been resolved",
        related_report_id: reportId,
        sent_time: new Date().toISOString(),
      });

      toast.success("Report has been resolved");
      fetchReports(); // Manually refetch for immediate UI update
    } catch (err) {
      console.error("Error resolving report", err);
      setError(err.message || "Failed to resolved report");
    }
  };
  const filteredReports = reports.filter((report) => {
    const query = searchQuery.toLowerCase();
    const communityName = report.communities?.name?.toLowerCase() || "";
    const status = report.status?.toLowerCase();

    const matchesSearch = communityName.includes(query);
    const matchesStatus =
      !statusFilter || status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });
    

  return (
    <>
     <Toaster position="top-right" />
      <div className={style.container}>
        <div className={style.topContent}>
          <div className={style.titleContainer}>
            <h1>Reports Management</h1>
            <p>View and manage resident power issue reports</p>
          </div>

          <div className={style.header}>
            <input
              type="text"
              placeholder="Search reports..."
              className={style.searchInput}
              value={searchQuery}
              onChange={(e) =>setSearchQuery(e.target.value)}
             


            />
            <select
              name="status"
              id="status"
              className={style.statusFilter}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {!filteredReports|| filteredReports.length === 0 ? (
            <div className={style.centeredMessage}>
              <p>No reports found</p>
            </div>
          ) : (
            <div className={style.cards}>
              {filteredReports.map((report, index) => {
                return (
                  <div className={style.card} key={report.id}>
                    <div className={style.cardHeader}>
                      <h3>{report.users?.full_name || "Unknown"}</h3>
                      <span
                        className={`${style.status} ${
                          style[report.status.toLowerCase()]
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className={style.cardBody}>
                      <p>
                        <strong>Report ID:</strong>{" "}
                        {report.id.split("-")[(4, 3)]}
                      </p>
                      <p>
                        <strong>Community:</strong>{" "}
                        {report.communities?.name || "Unknown"}
                      </p>
                      <p>
                        <strong>Issue:</strong> {report.type}
                      </p>
                      <p>
                        <strong>Notes:</strong> {report.notes}
                      </p>
                    </div>
                    <div className={style.cardFooter}>
                      <p>Meter: {report.meter_number}</p>
                      {report.status !== "Resolved" ? (
                        <button
                          className={style.detailsButton}
                          onClick={() => handleResolveReport(report.id)}
                        >
                          {""}
                          Resolve{""}
                        </button>
                      ) : (
                        <span className={style.resolvedText}>Resolved</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Report;
