import { useState, useEffect, useMemo } from "react";
import style from "../styles/Payments.module.css";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabase";

// Mock data for demonstration purposes. Replace with API call.
// const mockPayments = [
//   {
//     id: "pay_1",
//     user: { full_name: "John Doe" },
//     community: { name: "Brookfields" },
//     amount: 50.0,
//     due_date: "2024-08-15",
//     status: "Paid",
//     paid_at: "2024-08-10T10:00:00Z",
//   },
//   {
//     id: "pay_2",
//     user: { full_name: "Jane Smith" },
//     community: { name: "Hill Station" },
//     amount: 75.5,
//     due_date: "2024-07-30",
//     status: "Overdue",
//     paid_at: null,
//   },
//   {
//     id: "pay_3",
//     user: { full_name: "Peter Jones" },
//     community: { name: "Lumley" },
//     amount: 60.0,
//     due_date: "2024-08-20",
//     status: "Pending",
//     paid_at: null,
//   },
//   {
//     id: "pay_4",
//     user: { full_name: "Mary Williams" },
//     community: { name: "Aberdeen" },
//     amount: 120.0,
//     due_date: "2024-08-25",
//     status: "Pending",
//     paid_at: null,
//   },
//   {
//     id: "pay_5",
//     user: { full_name: "David Brown" },
//     community: { name: "Wilberforce" },
//     amount: 45.25,
//     due_date: "2024-08-18",
//     status: "Paid",
//     paid_at: "2024-08-17T14:30:00Z",
//   },
// ];

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    // In a real app, you would fetch this data from Supabase
    fetchPayments();

    // For now, we'll use mock data with a delay to simulate loading
    // setTimeout(() => {
    //   setPayments(fetchPayments);
    //   setLoading(false);
    // }, 1000);
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          
        users(full_name),
        communities(name),
        amount,
        units_purchased,
        created_at,
        meter_number

        `
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPayments(data);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching payments", err);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.users.full_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        payment.community.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || payment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  if (loading) {
    return <div className={style.loadingContainer}>Loading payments...</div>;
  }

  return (
    <div className={style.container}>
      <Toaster position="top-right" />
      <header className={style.header}>
        <h1>Payments Management</h1>
        <p>Track and manage resident payments and billing.</p>
      </header>

      <main className={style.mainContent}>
        <div className={style.tableContainer}>
          <div className={style.tableHeader}>
            <h3>All Transactions</h3>
            <div className={style.controls}>
              <input
                type="text"
                placeholder="Search by name or community..."
                className={style.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className={style.statusFilter}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <table className={style.paymentsTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Community</th>
                <th>Amount</th>
                <th>Payment Date</th>
            
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, id) => (
                <tr key={id}>
                  <td key={payment.id}>{payment.users.full_name}</td>
                  <td key={payment.id}>{payment.communities.name}</td>
                  <td  key={payment.id}>${payment.amount.toFixed(2)}</td>
                
                  
                  <td key={payment.id}>
                    {payment.created_at
                      ? new Date(payment.created_at).toLocaleString()
                      : "N/A"}
                  </td>
                  <td key={payment.id}>
                    {payment.status === "Overdue" && (
                      <button
                        className={style.actionButton}
                        onClick={() => handleSendReminder(payment.id)}
                      >
                        Send Reminder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Payments;
