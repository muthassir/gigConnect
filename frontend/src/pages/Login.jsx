import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

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
   <div className="hero bg-base-200 min-h-screen">
  <div className="hero-content flex-col lg:flex-row-reverse">
    <div className="text-center lg:text-left">
      <h1 className="text-5xl font-bold">Login now!</h1>
      <p className="py-6">
        Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
        quasi. In deleniti eaque aut repudiandae et a id nisi.
      </p>
    </div>
    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <div className="card-body">
        {error && <div>{error}</div>}
        <fieldset className="fieldset">
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
          <label className="label">Password</label>
          <input type="password" className="input" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <div><a className="link link-hover">Forgot password?</a></div>
          <button className="btn btn-neutral mt-4" onClick={handleLogin} disabled={loading}>{loading ? "loading" : "login"}</button>
        </fieldset>
      </div>
    </div>
  </div>
</div>
  );
};
export default Login;