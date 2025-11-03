import style from "../styles/Outages.module.css";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabase";

function Outages() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [type, setType] = useState("Scheduled");
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [outages, setOutages] = useState([]);
  const [outagesLoading, setOutagesLoading] = useState("");
  const [outagesError, setOutagesError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCommunities();
    fetchOutages();

    const channel = supabase
      .channel("outages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "outages",
        },
        (payload) => {
          console.log("Real-time outage change received!", payload);
          fetchOutages();
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    // Clear the error message once all fields are filled
    if (selectedCommunityId && startTime && endTime && reason && outagesError) {
      setOutagesError(null);
    }
  }, [selectedCommunityId, startTime, endTime, reason, outagesError]);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from("communities")
        .select(`id, name`) //Should the name and the id
        .order("name", { ascending: true });
      if (error) throw error;
      setCommunities(data);
      setLoading(false);
      // console.log(data);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError(err.message || "Failed to fetch communities");
      setLoading(false);
    }
  };
  // A function to get the outages and display it on page or table
  const fetchOutages = async () => {
    try {
      setOutagesLoading(true);
      const { data, error } = await supabase
        .from("outages")
        .select(
          ` id, type, start_time, end_time, reason, status, created_at,
        communities!inner(name)`
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOutages(data || []);
      console.log(data);
    } catch (err) {
      console.error("Error Fetching the outages:", err);
      setError(err.message || "Failed to fetch outages");
    } finally {
      setOutagesLoading(false);
    }
  };
  // A function for the resolved button
  const handleResolveOutage = async (outageId) => {
    try {
      //Getting the outaged data from the database with the outaged id
      const { data: outage, error: fetchError } = await supabase
        .from("outages")
        .select("*, communities(name)")
        .eq("id", outageId)
        .single();

      const { error: updateError } = await supabase
        .from("outages")
        .update({
          status: "Resolved",
          end_time: new Date().toISOString(),
        })
        .eq("id", outageId);
      if (updateError) throw updateError;
      //Inserting the outages in notifications table
      await supabase.from("notifications").insert({
        //The community outage id should match the community id
        recipient_community_id: outage.community_id,
        type: "PowerRestored", //This is setting type to show power on in the user app
        title: "Power Restored",
        message: "Power has been restored in your community.", //A message for the user
        related_outage_id: outageId,
        sent_time: new Date().toISOString(),
      });
      fetchOutages();
      toast.success("Outage has been resolved");
    } catch (err) {
      console.error("Error resolving outage", err);
      setError(err.message || "Failed to resolved outage");
    }
  };

  //A function to make sure all fields are filled before submitting the form
  const validateForm = () => {
    if (!selectedCommunityId || !startTime || !endTime || !reason) {
      setOutagesError("All fields are required");
      return false;
    }
    return true;
  };

  //
  const handleSubmit = async (e) => {
    e.preventDefault();
    setOutagesError(null);
    setError(null);
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    //
    try {
      //Checking if it is the admin that has been logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Admmin not logged in ");

      //Inserting the the data in to the columns
      const { data: outageData, error: outageError } = await supabase
        .from("outages")
        .insert({
          community_id: selectedCommunityId,
          type: type,
          start_time: startTime,
          end_time: endTime,
          reason: reason,
          created_by_admin: session.user.id,
        })
        .select()
        .single();
      if (outageError) throw outageError;
      //
      await supabase.from("notifications").insert({
        recipient_community_id: selectedCommunityId,
        type: type === "Scheduled" ? "ScheduledOutage" : "UnscheduledOutage",
        title: `${type} Power Outage`,
        message: `A
          type === "Emergency" ? "n" : ""
        } ${type.toLowerCase()} power outage is planned from ${startTime} to ${endTime}. Reason: ${reason}`,
        related_outage_id: outageData.id,
        sent_time: new Date().toISOString(),
      });
      fetchOutages(); // Re-fetch outages to show the new one immediately
      setSelectedCommunityId("");
      setStartTime("");
      setEndTime("");
      setReason("");
      setType("Scheduled");
      toast.success("Outage created successfully!");
      setIsModalOpen(false); // Close modal on success
    } catch (err) {
      console.error("Error creating outage:", err);
      setError(err.message || "Failed to create outage");
      setLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setSelectedCommunityId("");
    setStartTime("");
    setEndTime("");
    setReason("");
    setType("Scheduled");
    setOutagesError(null);
    setIsModalOpen(false); // Also close modal on cancel
  };
  return (
    <div className={style.container}>
      <Toaster position="top-right" />
      <header className={style.header}>
        <h1>Power Outage Management</h1>
        <p>Schedule, track, and notify residents about power outages.</p>
      </header>

      <main className={style.mainContent}>
        {isModalOpen && (
          <div className={style.modalOverlay}>
            <div className={style.modalContent}>
              <div className={style.formContainer}>
                <h2>Create New Outage</h2>
                <p>Notify residents of a new power outage.</p>
                <form>
                  <div className={style.formGroup}>
                    <label htmlFor="community">Community</label>
                    <select
                      id="community"
                      name="community"
                      className={style.selectInput}
                      value={selectedCommunityId}
                      onChange={(e) => setSelectedCommunityId(e.target.value)}
                    >
                      <option value="" disabled>
                        Select a community
                      </option>
                      {communities.map((community) => (
                        <option key={community.id} value={community.id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={style.formGroup}>
                    <label htmlFor="type">Type</label>
                    <select
                      id="type"
                      name="type"
                      className={style.selectInput}
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>

                  <div className={`${style.formGroup} ${style.timeSelector}`}>
                    <div>
                      <label htmlFor="startTime">Start Time</label>
                      <input
                        type="datetime-local"
                        id="startTime"
                        name="startTime"
                        className={style.textInput}
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="endTime">End Time</label>
                      <input
                        type="datetime-local"
                        id="endTime"
                        name="endTime"
                        className={style.textInput}
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={style.formGroup}>
                    <label htmlFor="reason">Reason/Notes for Outage</label>
                    <textarea
                      id="reason"
                      name="reason"
                      rows="4"
                      className={style.textareaInput}
                      placeholder="E.g., Scheduled maintenance on the main transformer."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                  </div>

                  {outagesError && (
                    <div className={style.formError}>
                      <p>{outagesError}</p>
                    </div>
                  )}

                  <div className={style.formActions}>
                    <button
                      className={style.cancelButton}
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={style.submitButton}
                      disabled={loading}
                      onClick={handleSubmit}
                    >
                      {loading ? "Creating..." : "Create Outage"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className={style.tableContainer}>
          <div className={style.tableHeader}>
            <h3>Existing Outages</h3>
            <button
              className={style.createButton}
              onClick={() => setIsModalOpen(true)}
            >
              + Create New Outage
            </button>
          </div>
          {outagesLoading ? (
            <p>Loading outages...</p>
          ) : outages.length === 0 ? (
            <p>No current outages.</p>
          ) : (
            <table className={style.outagesTable}>
              <thead>
                <tr>
                  <th>Community</th>
                  <th>Type</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {outages.map((outage) => (
                  <tr key={outage.id}>
                    <td>{outage.communities?.name || "Unknown"}</td>
                    <td>{outage.type}</td>
                    <td>
                      {outage.start_time
                        ? new Date(outage.start_time)
                            .toISOString()
                            .replace("T", " ")
                            .substring(0, 19) 
                        : "N/A"}
                    </td>
                    <td>
                      {outage.end_time
                        ? new Date(outage.end_time)
                            .toISOString()
                            .replace("T", " ")
                            .substring(0, 19) 
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`${style.status} ${
                          style[outage.status.toLowerCase()]
                        }`}
                      >
                        {outage.status}
                      </span>
                    </td>
                    <td>{outage.reason}</td>
                    <td>
                      {outage.status !== "Resolved" ? (
                        <button
                          className={style.resolveButton}
                          onClick={() => handleResolveOutage(outage.id)}
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className={style.resolvedText}>Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default Outages;
