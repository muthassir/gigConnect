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
    try {
          const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
    }

    } catch (err) {
      console.log(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero absolute top-0 z-10 bg-base-200 min-h-screen p-4 flex items-center justify-center">
      <div className="hero-content flex-col flex lg:flex-row gap-8 w-full max-w-6xl">
        <div className="text-center lg:text-left lg:w-1/2">
          <h1 className="text-5xl font-bold text-success">Login now!</h1>
          <p className="py-6 lg:w-auto mx-auto max-w-lg">
            Welcome to <span className="font-semibold text-success">GigConnect</span> — your gateway to connect with talented professionals and exciting opportunities. 
            Sign in to explore, collaborate, and grow together.
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-md shrink-0 shadow-2xl lg:w-1/2">
          <div className="card-body">
            {error && <Alert alert={error} />}
            <fieldset className="fieldset">
              <label className="label">Email</label>
              <input type="email" className="input input-bordered w-full" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
              <label className="label">Password</label>
              <input type="password" className="input input-bordered w-full" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
              <div><a className="link link-hover">Forgot password?</a></div>
              <button className="btn btn-success mt-4 w-full" onClick={handleLogin} disabled={loading}>{loading ? "Loading..." : "Login"}</button>
              <div className="divider">or</div>
              <button className="btn btn-neutral mt-2 w-full" disabled={loading}>
                <Link to="/register" className="w-full">Sign-Up</Link>
              </button>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;