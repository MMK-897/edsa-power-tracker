import style from "../styles/Settings.module.css";
import user from "../assets/icons/user-round.png";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabase";

function Settings() {
  const [currentName, setCurrentName] = useState("");
  const [id, setId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null)
  useEffect(() => {
    fetchUserDetail()
  }, []);

  const fetchUserDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("admin")
        .select("*")
        .single()
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCurrentName(data);
      setId(data.id);
      setFullName(data.full_name);
      setEmail(data.email)
      console.log(data);
    } catch (err) {
      console.log("Error fetching reports", err); //if we get an error while getting the reports
      setError(err.message || "Failed to fetch reports");
    }
  };



  const handleSubmit = async (e) => {
      e.preventDefault();
    try {
      const {data, error} = await supabase
      .from("admin")
     
      .update({
        full_name: fullName,
        email: email

      })
       .eq("id", id)
        .select("*")
      if(error) throw error
      toast.success("Profile updated successfully!");
      fetchUserDetail(); // Re-fetch to show the updated name in the title

    } catch (err) {
      console.log("Error failed updating the name", err); //if we get an error while getting the reports
      setError(err.message || "Failed to update name");
    }



    }
  

  return (
    <>
      <Toaster position="top-right" />
      <div className={style.container}>
        <header>
          <h1>Admin Profile</h1>
          <p>Manage your account settings</p>
        </header>

        <main>
          <form action="" className={style.personalInfo} onSubmit={handleSubmit}>
            <div className={style.titleContainer}>
              <div className={style.title}>
                <img src={user} alt="" width="20px" height="20px" />
                <span>Personal Information</span>
              </div>

              <div className={style.edit}>
                <div className={style.imageContainer}>
                  <img src={user} alt="Admin profile" width="40" height="40" />
                </div>

                <div className={style.profileContainer}>
                  <label htmlFor="" className={style.titleName}>
                    {currentName.full_name}
                  </label>
                  <label htmlFor="" className={style.title}>
                    System Adminstrator
                  </label>
                </div>
              </div>
            </div>
            <div className={style.inputsContainer}>
              <label htmlFor="">Full Name</label>
              <input type="text" className={style.name} 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              />
              <label htmlFor="">Email</label>
              <input type="text" name="" id="" className={style.email}
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
               />
              <div>
                <button type="submit">Save Changes</button>
                <button>Cancel</button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}

export default Settings;
