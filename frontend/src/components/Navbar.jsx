import React from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="navbar bg-base-100 shadow-sm fixed absolute top-0 z-10">
      {/* Left: Dropdown Menu */}
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-success btn-circle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li><Link to="/">Home</Link></li>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/message">Message</Link></li>
            <li><Link to="/gigs">Gigs</Link></li>
            <li><Link to="/about">About</Link></li>
            {!user && <li><Link to="/login">Login</Link></li>}
          </ul>
        </div>
      </div>

      {/* Center: Brand Name */}
      <div className="navbar-center">
        <Link to="/" className="btn btn-ghost text-xl text-success">
          <p>GigConnect</p>
        </Link>
      </div>

      <div className="navbar-end">
       
        {user ? (
          <div className="flex items-center gap-2">
             <button className="btn btn-neutral btn-circle mr-3">
          <FaSearch size={20} />
        </button>

           <Modal />
          </div>
        ) : (
          <Link to="/login">
            <button className="btn btn-success rounded mr-6">
              Sign In
            </button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;