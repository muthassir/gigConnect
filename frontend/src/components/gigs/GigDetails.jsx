import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchGig, applyToGig, startConversation, updateApplicationStatus } from "../../services/api";
import Alert from "../Alert";

const GigDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [application, setApplication] = useState({
    proposal: "",
    bidAmount: ""
  });

  useEffect(() => {
    loadGig();
  }, [id]);

  const loadGig = async () => {
    try {
      setLoading(true);
      const response = await fetchGig(id);
      setGig(response.data);
    } catch (err) {
      setError("Failed to load gig details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (receiverId) => {
    try {
      setConversationLoading(true);
      setError("");
      
      await startConversation(receiverId, gig._id);
      navigate('/messages');
      
    } catch (err) {
      console.error('Start conversation error:', err);
      setError(err.response?.data?.message || "Failed to start conversation");
    } finally {
      setConversationLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login', { state: { from: `/gigs/${id}/apply` } });
      return;
    }

    if (user.role !== 'freelancer') {
      setError("Only freelancers can apply to gigs");
      return;
    }

    try {
      setApplyLoading(true);
      await applyToGig(id, application);
      setShowApplyForm(false);
      setApplication({ proposal: "", bidAmount: "" });
      await loadGig();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply to gig");
    } finally {
      setApplyLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId, freelancerId) => {
    try {
      setActionLoading(prev => ({ ...prev, [applicationId]: true }));
      setError("");
      
      const response = await updateApplicationStatus(id, {
        applicationId,
        status: 'accepted'
      });

      if (response.success) {
        await loadGig()
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept application");
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [applicationId]: true }));
      setError("");
      
      const response = await updateApplicationStatus(id, {
        applicationId,
        status: 'rejected'
      });

      if (response.success) {
        await loadGig(); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject application");
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleMakePayment = () => {
    navigate(`/gigs/${id}/payment`);
  };

  if (loading) return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!gig) return <div className="p-8 text-center">Gig not found</div>;

  const hasApplied = gig.applications?.some(app => 
    app.freelancer?._id === user?._id
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && <Alert alert={error} />}
      
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li><Link to="/gigfeeds">Gig Feed</Link></li>
          <li>Gig Details</li>
        </ul>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="card-title text-3xl mb-2">{gig.title}</h1>
              <div className="flex gap-2 mb-4">
                <span className="badge badge-success">{gig.status}</span>
                <span className="badge badge-outline">{gig.category}</span>
                <span className="badge badge-info">{gig.budgetType}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-success">${gig.budget}</div>
              <div className="text-sm text-gray-600">{gig.location}</div>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-lg">{gig.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {gig.skillsRequired.map((skill, index) => (
                  <span key={index} className="badge badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Client Information</h3>
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img 
                      src={gig.client?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'} 
                      alt={gig.client?.username}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold">{gig.client?.username}</div>
                  <div className="text-sm text-gray-600">{gig.client?.email}</div>
                  {user && user._id !== gig.client?._id && (
                    <button 
                      onClick={() => handleStartConversation(gig.client._id)}
                      disabled={conversationLoading}
                      className="btn btn-outline btn-sm mt-2"
                    >
                      {conversationLoading ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Message Client"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          {user?.role === 'client' && user._id === gig.client?._id && gig.hiredFreelancer && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-success">Ready to Pay?</h3>
                  <p className="text-sm text-gray-600">
                    Complete payment to {gig.hiredFreelancer?.username} for this gig
                  </p>
                </div>
                <button 
                  onClick={handleMakePayment}
                  className="btn btn-success"
                >
                  Make Payment - ${gig.budget}
                </button>
              </div>
            </div>
          )}

          {/* Application Section */}
          {user && (
            <div className="border-t pt-6">
              {user.role === 'freelancer' && gig.status === 'open' && (
                <div>
                  {hasApplied ? (
                    <div className="alert alert-info">
                      You have already applied to this gig
                    </div>
                  ) : (
                    <div>
                      {!showApplyForm ? (
                        <button 
                          onClick={() => setShowApplyForm(true)}
                          className="btn btn-success"
                        >
                          Apply to this Gig
                        </button>
                      ) : (
                        <form onSubmit={handleApply} className="space-y-4">
                          <div>
                            <label className="label">
                              <span className="label-text">Your Proposal *</span>
                            </label>
                            <textarea 
                              className="textarea textarea-bordered w-full"
                              placeholder="Describe why you're the best fit for this gig. Include your experience, approach, and why you're interested..."
                              value={application.proposal}
                              onChange={(e) => setApplication({
                                ...application,
                                proposal: e.target.value
                              })}
                              required
                              rows={4}
                            />
                          </div>
                          
                          <div>
                            <label className="label">
                              <span className="label-text">Your Bid Amount ($) *</span>
                            </label>
                            <input 
                              type="number"
                              className="input input-bordered w-full"
                              placeholder="Enter your bid amount"
                              value={application.bidAmount}
                              onChange={(e) => setApplication({
                                ...application,
                                bidAmount: e.target.value
                              })}
                              required
                              min="1"
                              step="0.01"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              type="submit" 
                              className="btn btn-success"
                              disabled={applyLoading}
                            >
                              {applyLoading ? (
                                <>
                                  <span className="loading loading-spinner loading-sm"></span>
                                  Submitting...
                                </>
                              ) : (
                                "Submit Application"
                              )}
                            </button>
                            <button 
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => setShowApplyForm(false)}
                              disabled={applyLoading}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {user.role === 'client' && user._id === gig.client?._id && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Applications ({gig.applications?.length || 0})</h3>
                  {gig.applications?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No applications yet
                    </div>
                  ) : (
                    gig.applications?.map(application => (
                      <div key={application._id} className="border rounded-lg p-4 bg-base-100">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-full">
                                <img 
                                  src={application.freelancer?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'} 
                                  alt={application.freelancer?.username}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold">{application.freelancer?.username}</div>
                              <div className="text-sm text-success font-medium">
                                Bid: ${application.bidAmount}
                              </div>
                              <div className="text-xs text-gray-500">
                                Applied: {new Date(application.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <span className={`badge ${
                            application.status === 'accepted' ? 'badge-success' :
                            application.status === 'rejected' ? 'badge-error' : 'badge-warning'
                          }`}>
                            {application.status}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="font-medium mb-2">Proposal:</h4>
                          <p className="text-sm text-gray-700 bg-base-200 p-3 rounded">
                            {application.proposal}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStartConversation(application.freelancer._id)}
                            disabled={conversationLoading}
                            className="btn btn-outline btn-sm"
                          >
                            {conversationLoading ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              "Message Freelancer"
                            )}
                          </button>
                          
                          {application.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleAcceptApplication(application._id, application.freelancer._id)}
                                disabled={actionLoading[application._id]}
                                className="btn btn-success btn-sm"
                              >
                                {actionLoading[application._id] ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  "Accept"
                                )}
                              </button>
                              <button 
                                onClick={() => handleRejectApplication(application._id)}
                                disabled={actionLoading[application._id]}
                                className="btn btn-error btn-sm"
                              >
                                {actionLoading[application._id] ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  "Reject"
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Gig Stats */}
          <div className="border-t pt-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{gig.applications?.length || 0}</div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">${gig.budget}</div>
                <div className="text-sm text-gray-600">Budget</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-info">{gig.skillsRequired?.length || 0}</div>
                <div className="text-sm text-gray-600">Skills Required</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">
                  {gig.createdAt ? new Date(gig.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Posted</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetails;