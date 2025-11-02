import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyApplications } from "../../services/api";
import Alert from "../Alert";

function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all")

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'badge-warning', text: 'Pending' },
      'accepted': { class: 'badge-success', text: 'Accepted' },
      'rejected': { class: 'badge-error', text: 'Rejected' }
    };
    const config = statusConfig[status] || { class: 'badge-neutral', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getGigStatusBadge = (status) => {
    const statusConfig = {
      'open': { class: 'badge-success', text: 'Open' },
      'in-progress': { class: 'badge-warning', text: 'In Progress' },
      'completed': { class: 'badge-info', text: 'Completed' },
      'cancelled': { class: 'badge-error', text: 'Cancelled' }
    };
    const config = statusConfig[status] || { class: 'badge-neutral', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getMyApplication = (gig) => {
    return gig.applications?.find(app => app.freelancer?._id === user?._id);
  };

  // filtered application based on status
  const filteredApplications = applications.filter(gig => {
    if (filter === "all") return true;
    const myApp = getMyApplication(gig);
    return myApp?.status === filter;
  });

  // status
  const stats = {
    total: applications.length,
    pending: applications.filter(gig => getMyApplication(gig)?.status === 'pending').length,
    accepted: applications.filter(gig => getMyApplication(gig)?.status === 'accepted').length,
    rejected: applications.filter(gig => getMyApplication(gig)?.status === 'rejected').length,
  };

  if (user?.role !== 'freelancer') {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-error">
          <span>Only freelancers can access this page.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Applications</h1>
          <p className="text-gray-600 mt-2">Track your gig applications and their status</p>
        </div>
        <Link to="/gigfeeds" className="btn btn-primary">
          Find More Gigs
        </Link>
      </div>

      {error && <Alert alert={error} />}

      {/* card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4 text-center">
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.accepted}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4 text-center">
            <div className="text-2xl font-bold text-error">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* filter*/}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`btn btn-sm ${filter === "pending" ? "btn-warning" : "btn-ghost"}`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter("accepted")}
          className={`btn btn-sm ${filter === "accepted" ? "btn-success" : "btn-ghost"}`}
        >
          Accepted ({stats.accepted})
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`btn btn-sm ${filter === "rejected" ? "btn-error" : "btn-ghost"}`}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl text-gray-500 mb-4">
            {filter === "all" ? "No applications yet" : `No ${filter} applications`}
          </div>
          <p className="text-gray-600 mb-6">
            {filter === "all" 
              ? "Start applying to gigs to see them here" 
              : `You don't have any ${filter} applications`
            }
          </p>
          {filter === "all" && (
            <Link to="/gigfeeds" className="btn btn-primary btn-lg">
              Browse Available Gigs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map((gig) => {
            const myApplication = getMyApplication(gig);
            
            return (
              <div key={gig._id} className="card bg-base-100 shadow-lg border">
                <div className="card-body">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* gig info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <h3 className="card-title text-xl">{gig.title}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(myApplication?.status)}
                          {getGigStatusBadge(gig.status)}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{gig.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Budget:</span>
                          <span className="text-success">
                            ${gig.budget} ({gig.budgetType})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Category:</span>
                          <span className="badge badge-ghost">{gig.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Location:</span>
                          <span>{gig.location}</span>
                        </div>
                      </div>

                      {/* client info */}
                      <div className="flex items-center gap-3 p-3 bg-base-200 rounded">
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            <img 
                              src={gig.client?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'} 
                              alt={gig.client?.username}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">{gig.client?.username}</div>
                          <div className="text-xs text-gray-600">{gig.client?.email}</div>
                        </div>
                      </div>

                      {/* my application detail */}
                      <div className="mt-4 p-3 bg-base-200 rounded">
                        <h4 className="font-semibold mb-2">Your Application:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-semibold">Bid Amount:</span>
                            <div className="text-success font-medium">${myApplication?.bidAmount}</div>
                          </div>
                          <div>
                            <span className="font-semibold">Applied On:</span>
                            <div className="text-gray-600">
                              {myApplication?.appliedAt ? new Date(myApplication.appliedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="font-semibold">Proposal:</span>
                          <p className="text-gray-700 mt-1">{myApplication?.proposal}</p>
                        </div>
                      </div>

                      {/* Skills */}
                      {gig.skillsRequired && gig.skillsRequired.length > 0 && (
                        <div className="mt-3">
                          <span className="font-semibold text-sm">Skills Required:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {gig.skillsRequired.map((skill, index) => (
                              <span key={index} className="badge badge-outline badge-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>



                    <div className="flex flex-col gap-2 lg:w-48">
                      <Link 
                        to={`/gigs/${gig._id}`}
                        className="btn btn-outline btn-sm w-full"
                      >
                        View Gig Details
                      </Link>
                      
                      {myApplication?.status === 'accepted' && gig.status === 'in-progress' && (
                        <button className="btn btn-success btn-sm w-full">
                          Gig In Progress
                        </button>
                      )}
                      
                      {myApplication?.status === 'accepted' && gig.status === 'completed' && (
                        <button className="btn btn-info btn-sm w-full">
                          Gig Completed
                        </button>
                      )}

                      <div className="text-xs text-gray-500 text-center mt-2">
                        Applied: {myApplication?.appliedAt ? new Date(myApplication.appliedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* if accepted*/}
                  {myApplication?.status === 'accepted' && gig.hiredFreelancer && (
                    <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-success font-semibold">🎉 Congratulations!</span>
                      </div>
                      <p className="text-success/80 text-sm">
                        You have been hired for this gig! The client has selected your proposal. 
                        {gig.status === 'in-progress' && " Start working on the project and communicate with the client through messages."}
                        {gig.status === 'completed' && " This gig has been marked as completed."}
                      </p>
                    </div>
                  )}

                  {/* if rejected */}
                  {myApplication?.status === 'rejected' && (
                    <div className="mt-4 p-4 bg-error/10 rounded-lg border border-error/20">
                      <p className="text-error/80 text-sm">
                        Your application was not selected for this gig. Don't worry! Keep applying to other opportunities.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyApplications;