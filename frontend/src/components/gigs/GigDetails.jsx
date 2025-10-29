import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchGig, applyToGig } from "../../services/api";
import Alert from "../Alert";

const GigDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
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
                      src={gig.client?.avatar || '/default-avatar.png'} 
                      alt={gig.client?.name}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold">{gig.client?.name}</div>
                  <div className="text-sm text-gray-600">{gig.client?.email}</div>
                </div>
              </div>
            </div>
          </div>

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
                              <span className="label-text">Your Proposal</span>
                            </label>
                            <textarea 
                              className="textarea textarea-bordered w-full"
                              placeholder="Describe why you're the best fit for this gig..."
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
                              <span className="label-text">Your Bid Amount ($)</span>
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
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              type="submit" 
                              className="btn btn-success"
                              disabled={applyLoading}
                            >
                              {applyLoading ? "Submitting..." : "Submit Application"}
                            </button>
                            <button 
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => setShowApplyForm(false)}
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
                  {gig.applications?.map(application => (
                    <div key={application._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full">
                              <img 
                                src={application.freelancer?.avatar || '/default-avatar.png'} 
                                alt={application.freelancer?.name}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{application.freelancer?.name}</div>
                            <div className="text-sm">Bid: ${application.bidAmount}</div>
                          </div>
                        </div>
                        <span className={`badge ${
                          application.status === 'accepted' ? 'badge-success' :
                          application.status === 'rejected' ? 'badge-error' : 'badge-warning'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{application.proposal}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetails;