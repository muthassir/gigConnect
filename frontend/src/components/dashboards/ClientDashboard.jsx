import React, { useState, useEffect } from "react";
import { FaTasks, FaComments, FaCheckCircle, FaDollarSign, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyGigs } from "../../services/api";
import Alert from "../Alert";

function ClientDashboard() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyGigs();
  }, []);

  const loadMyGigs = async () => {
    try {
      setLoading(true);
      const response = await getMyGigs();
      setGigs(response.data || []);
    } catch (err) {
      console.error('Failed to load gigs:', err);
      setError("Failed to load your gigs. Showing demo data.");
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };


  //status
  const activeGigs = gigs.filter(gig => gig.status === 'open').length;
  const completedGigs = gigs.filter(gig => gig.status === 'completed').length;
  const pendingApplications = gigs.reduce((total, gig) => {
    return total + (gig.applications?.filter(app => app.status === 'pending').length || 0);
  }, 0);
  
  // total-spent
  const totalSpent = gigs
    .filter(gig => gig.status === 'completed')
    .reduce((total, gig) => total + (gig.budget || 0), 0);

  const stats = [
    { key: "active", title: "Active Gigs", value: activeGigs, icon: <FaTasks size={24} /> },
    { key: "applications", title: "Pending Applications", value: pendingApplications, icon: <FaComments size={24} /> },
    { key: "completed", title: "Completed Gigs", value: completedGigs, icon: <FaCheckCircle size={24} /> },
    { key: "spent", title: "Total Spent", value: `$${totalSpent}`, icon: <FaDollarSign size={24} /> },
  ];

  const recentGigs = gigs.slice(0, 3);

  return (
    <div className="container p-8 lg:h-screen h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Client Dashboard</h2>
        <Link to="/create-gig" className="btn btn-success">
          <FaPlus className="mr-2" />
          Post New Gig
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
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
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
            <h3 className="card-title">Recent Gigs</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner"></span>
              </div>
            ) : recentGigs.length > 0 ? (
              <div className="space-y-4">
                {recentGigs.map(gig => (
                  <div key={gig._id} className="flex justify-between items-center p-3 bg-base-200 rounded">
                    <span className="truncate">{gig.title}</span>
                    <span className={`badge ${
                      gig.status === 'open' ? 'badge-success' :
                      gig.status === 'in-progress' ? 'badge-warning' :
                      gig.status === 'completed' ? 'badge-info' : 'badge-error'
                    }`}>
                      {gig.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No gigs yet
              </div>
            )}
            <Link to="/client/my-gigs" className="btn btn-ghost btn-sm mt-4">
              View All Gigs
            </Link>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/create-gig" className="btn btn-outline btn-block justify-start">
                Post New Gig
              </Link>
              <Link to="/client/my-gigs" className="btn btn-outline btn-block justify-start">
                Manage Gigs
              </Link>
              <Link to="/gigfeeds" className="btn btn-outline btn-block justify-start">
                Browse Marketplace
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

export default ClientDashboard;