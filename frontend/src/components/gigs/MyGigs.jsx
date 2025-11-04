import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyGigs, updateGigStatus, deleteGig } from "../../services/api";
import Alert from "../Alert";

function MyGigs() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadMyGigs();
  }, []);

  const loadMyGigs = async () => {
    try {
      setLoading(true);
      const response = await getMyGigs();
      setGigs(response.data || []);
    } catch (err) {
      setError("Failed to load your gigs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (gigId, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [gigId]: true }));
      await updateGigStatus(gigId, { status: newStatus });
      await loadMyGigs()
      setError("")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update gig status");
    } finally {
      setActionLoading(prev => ({ ...prev, [gigId]: false }));
    }
  };

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm("Are you sure you want to delete this gig? This action cannot be undone.")) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [gigId]: true }));
      await deleteGig(gigId);
      await loadMyGigs(); 
      setError(""); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete gig");
    } finally {
      setActionLoading(prev => ({ ...prev, [gigId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'open': { class: 'badge-success', text: 'Open' },
      'in-progress': { class: 'badge-warning', text: 'In Progress' },
      'completed': { class: 'badge-info', text: 'Completed' },
      'cancelled': { class: 'badge-error', text: 'Cancelled' }
    };
    const config = statusConfig[status] || { class: 'badge-neutral', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getApplicationsCount = (gig) => {
    return gig.applications?.filter(app => app.status === 'pending').length || 0;
  };

  if (user?.role !== 'client') {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-error">
          <span>Only clients can access this page.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-success">My Gigs</h1>
          <p className="text-gray-600 mt-2">Manage your posted gigs and applications</p>
        </div>
        <Link to="/create-gig" className="btn btn-success">
          Post New Gig
        </Link>
      </div>

      {error && <Alert alert={error} />}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl text-gray-500 mb-4">No gigs yet</div>
          <p className="text-gray-600 mb-6">Start by posting your first gig to find freelancers</p>
          <Link to="/create-gig" className="btn btn-success btn-lg">
            Post Your First Gig
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {gigs.map((gig) => (
            <div key={gig._id} className="card bg-base-100 shadow-lg border">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* gig info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <h3 className="card-title text-xl">{gig.title}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(gig.status)}
                        <span className="badge badge-outline">
                          ${gig.budget} ({gig.budgetType})
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{gig.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Category:</span>
                        <span className="badge badge-ghost">{gig.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Location:</span>
                        <span>{gig.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Applications:</span>
                        <span className="badge badge-primary">
                          {getApplicationsCount(gig)} pending
                        </span>
                      </div>
                      {gig.hiredFreelancer && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Hired:</span>
                          <span>{gig.hiredFreelancer.username}</span>
                        </div>
                      )}
                    </div>

                    {/* skills */}
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
                      View Details
                    </Link>
                    
                    {/* ADDED: Payment Button */}
                    {gig.status === 'in-progress' && gig.hiredFreelancer && (
                      <Link 
                        to={`/gigs/${gig._id}/payment`}
                        className="btn btn-success btn-sm w-full"
                      >
                        Make Payment
                      </Link>
                    )}
                    
                    {gig.status === 'open' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(gig._id, 'in-progress')}
                          disabled={actionLoading[gig._id]}
                          className="btn btn-warning btn-sm w-full"
                        >
                          {actionLoading[gig._id] ? 'Updating...' : 'Mark In Progress'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(gig._id, 'cancelled')}
                          disabled={actionLoading[gig._id]}
                          className="btn btn-error btn-sm w-full"
                        >
                          {actionLoading[gig._id] ? 'Cancelling...' : 'Cancel Gig'}
                        </button>
                      </>
                    )}
                    
                    {gig.status === 'in-progress' && (
                      <button
                        onClick={() => handleStatusUpdate(gig._id, 'completed')}
                        disabled={actionLoading[gig._id]}
                        className="btn btn-success btn-sm w-full"
                      >
                        {actionLoading[gig._id] ? 'Updating...' : 'Mark Completed'}
                      </button>
                    )}

                    {(gig.status === 'open' || gig.status === 'cancelled') && (
                      <button
                        onClick={() => handleDeleteGig(gig._id)}
                        disabled={actionLoading[gig._id]}
                        className="btn btn-error btn-outline btn-sm w-full"
                      >
                        {actionLoading[gig._id] ? 'Deleting...' : 'Delete Gig'}
                      </button>
                    )}

                    <div className="text-xs text-gray-500 text-center mt-2">
                      Created: {new Date(gig.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* preview */}
                {gig.applications && gig.applications.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Recent Applications:</h4>
                    <div className="space-y-2">
                      {gig.applications.slice(0, 3).map((application) => (
                        <div key={application._id} className="flex justify-between items-center p-2 bg-base-200 rounded">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-8 h-8 rounded-full">
                                <img 
  src={application.freelancer?.avatar || 'https://via.placeholder.com/32x32?text=U'} 
  alt={application.freelancer?.username}
  className="w-8 h-8 rounded-full"
/>
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">{application.freelancer?.username}</div>
                              <div className="text-xs">Bid: ${application.bidAmount}</div>
                            </div>
                          </div>
                          <span className={`badge ${
                            application.status === 'accepted' ? 'badge-success' :
                            application.status === 'rejected' ? 'badge-error' : 'badge-info'
                          }`}>
                            {application.status}
                          </span>
                        </div>
                      ))}
                      {gig.applications.length > 3 && (
                        <div className="text-center text-sm text-gray-600">
                          + {gig.applications.length - 3} more applications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyGigs;