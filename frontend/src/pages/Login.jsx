import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {login} = useAuth()

  const handleLogin = async(e) => {
    e.preventDefault();
     
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError("");
    setLoading(true);
     const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
   <div className="absolute top-0 z-10 hero bg-base-200 h-screen">
  <div className="hero-content flex-col flex md:flex-row gap-18">
    <div className="text-center lg:text-left">
      <h1 className="text-5xl font-bold text-success">Login now!</h1>
      <p className="py-6 w-96">
        Welcome to <span className="font-semibold text-success">GigConnect</span> — your gateway to connect with talented professionals and exciting opportunities. 
  Sign in to explore, collaborate, and grow together.
      </p>
    </div>
    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <div className="card-body">
        {error && <Alert alert={error} />}
        <fieldset className="fieldset">
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
          <label className="label">Password</label>
          <input type="password" className="input" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <div><a className="link link-hover">Forgot password?</a></div>
          <button className="btn btn-success mt-4" onClick={handleLogin} disabled={loading}>{loading ? "loading" : "login"}</button>
          <div className="divider">or</div>
          <button className="btn btn-neutral mt-2" disabled={loading}>
            <Link to="/register">Sign-Up</Link>
          </button>
        </fieldset>
      </div>
    </div>
  </div>
</div>
  );
};
export default Login;