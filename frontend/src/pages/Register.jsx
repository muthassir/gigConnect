import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Alert from "../components/Alert";

const Register = () => {
    const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  console.log(role);
  
  const navigate = useNavigate();

  const {register} = useAuth()

 const handleRegister = async (e) => {
  e.preventDefault();

  if (!username || !email || !password) {
    setError("Please fill in all fields");
    return;
  }

  setError("");
  setLoading(true);

  try {
    const result = await register(username, email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/dashboard");
  } catch (err) {
    console.log(err);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
   <div className="absolute top-0 z-10 hero bg-base-200 min-h-screen">
  <div className="hero-content flex-col flex md:flex-row gap-18">
    <div className="text-center lg:text-left">
      <h1 className="text-5xl font-bold text-success">Register now!</h1>
      <p className="py-6 w-96">
        Welcome to <span className="font-semibold text-success">GigConnect</span> — your gateway to connect with talented professionals and exciting opportunities. 
  Sign up to explore, collaborate, and grow together.
      </p>
    </div>
    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <div className="card-body">
        {error && <Alert alert={error} />}
        <fieldset className="fieldset">
          <label className="label">Name</label>
          <input type="text" className="input" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)}/>
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
          <label className="label">Password</label>
          <input type="password" className="input" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
           <label className="block">I am a</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
          <option value="freelancer">freelancer</option>
          <option value="client">client</option>
        </select>
          <button className="btn btn-success mt-4" onClick={handleRegister} disabled={loading}>{loading ? "loading" : "Register"}</button>
          <div className="divider">or</div>
          <button className="btn btn-neutral mt-2" disabled={loading}>
            <Link to="/login">Sign-In</Link>
          </button>
        </fieldset>
      </div>
    </div>
  </div>
</div>
  );
};
export default Register;