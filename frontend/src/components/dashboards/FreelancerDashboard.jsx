import React from "react";
import { FaTasks, FaComments, FaCheckCircle, FaDollarSign, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

function FreelancerDashboard() {
  const stats = [
    { key: "applications", title: "Active Applications", value: 3, icon: <FaTasks size={24} /> },
    { key: "messages", title: "Unread Messages", value: 5, icon: <FaComments size={24} /> },
    { key: "completed", title: "Completed Gigs", value: 15, icon: <FaCheckCircle size={24} /> },
    { key: "earned", title: "Total Earned", value: "$3,800", icon: <FaDollarSign size={24} /> },
  ];

  return (
    <div className="container p-8 lg:h-screen h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Freelancer Dashboard</h2>
        <Link to="/gigfeeds" className="btn btn-success">
          <FaSearch className="mr-2" />
          Find Gigs
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <div
            key={s.key}
            className="card bg-base-100 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
          >
            <div className="card-body p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {s.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-sm text-gray-600">{s.title}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">Recent Applications</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-base-200 rounded">
                <span>Mobile App Development</span>
                <span className="badge badge-info">Pending</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-base-200 rounded">
                <span>UI/UX Design</span>
                <span className="badge badge-success">Accepted</span>
              </div>
            </div>
            <Link to="/freelancer/my-applications" className="btn btn-ghost btn-sm mt-4">
              View All Applications
            </Link>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/gigfeeds" className="btn btn-outline btn-block justify-start">
                Browse Gigs
              </Link>
              <Link to="/freelancer/my-applications" className="btn btn-outline btn-block justify-start">
                My Applications
              </Link>
              <Link to="/messages" className="btn btn-outline btn-block justify-start">
                View Messages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FreelancerDashboard;