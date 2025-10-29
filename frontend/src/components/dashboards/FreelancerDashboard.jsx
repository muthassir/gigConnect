import React, { useState, useEffect } from "react";
import { FaTasks, FaComments, FaCheckCircle, FaDollarSign, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyApplications } from "../../services/api";
import Alert from "../Alert";

function FreelancerDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyApplications();
  }, []);

  const loadMyApplications = async () => {
    try {
      setLoading(true);
      const response = await getMyApplications();
      setApplications(response.data || []);
    } catch (err) {
      setError("Failed to load your applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // status
  const activeApplications = applications.filter(app => 
    app.applications?.some(a => a.status === 'pending')
  ).length;
  
  const completedGigs = applications.filter(app => 
    app.status === 'completed'
  ).length;
  
  const totalEarned = applications
    .filter(app => app.status === 'completed')
    .reduce((total, app) => {
      const myApp = app.applications?.find(a => a.freelancer?._id === user?._id);
      return total + (myApp?.bidAmount || 0);
    }, 0);

  const stats = [
    { key: "applications", title: "Active Applications", value: activeApplications, icon: <FaTasks size={24} /> },
    { key: "messages", title: "Unread Messages", value: 0, icon: <FaComments size={24} /> },
    { key: "completed", title: "Completed Gigs", value: completedGigs, icon: <FaCheckCircle size={24} /> },
    { key: "earned", title: "Total Earned", value: `$${totalEarned}`, icon: <FaDollarSign size={24} /> },
  ];

  const recentApplications = applications.slice(0, 3);

  return (
    <div className="container p-8 lg:h-screen h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Freelancer Dashboard</h2>
        <Link to="/gigfeeds" className="btn btn-success">
          <FaSearch className="mr-2" />
          Find Gigs
        </Link>
      </div>

      {error && <Alert alert={error} />}

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
            {loading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner"></span>
              </div>
            ) : recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map(gig => {
                  const myApplication = gig.applications?.find(app => app.freelancer?._id === user?._id);
                  return (
                    <div key={gig._id} className="flex justify-between items-center p-3 bg-base-200 rounded">
                      <span className="truncate">{gig.title}</span>
                      <span className={`badge ${
                        myApplication?.status === 'accepted' ? 'badge-success' :
                        myApplication?.status === 'rejected' ? 'badge-error' : 'badge-info'
                      }`}>
                        {myApplication?.status || 'pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No applications yet
              </div>
            )}
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
              <Link to="/profile" className="btn btn-outline btn-block justify-start">
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FreelancerDashboard;