import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GigCard = ({ gig }) => {
  const { user } = useAuth();

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="card-body">
        <div className="flex justify-between items-start mb-2">
          <h3 className="card-title text-lg">{gig.title}</h3>
          <span className="badge badge-success">{gig.status}</span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{gig.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Budget:</span>
            <span className="text-success">
              ${gig.budget} ({gig.budgetType})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Category:</span>
            <span className="badge badge-outline">{gig.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Location:</span>
            <span>{gig.location}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="font-semibold mb-1">Skills Required:</div>
          <div className="flex flex-wrap gap-1">
            {gig.skillsRequired.map((skill, index) => (
              <span key={index} className="badge badge-primary badge-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="card-actions justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full">
                <img 
                  src={gig.client?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'} 
                  alt={gig.client?.name}
                />
              </div>
            </div>
            <span className="text-sm">{gig.client?.name}</span>
          </div>
          
          <div className="flex gap-2">
            <Link 
              to={`/gigs/${gig._id}`} 
              className="btn btn-ghost btn-sm"
            >
              View Details
            </Link>
            {user?.role === 'freelancer' && gig.status === 'open' && (
              <Link 
                to={`/gigs/${gig._id}/apply`} 
                className="btn btn-success btn-sm"
              >
                Apply Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigCard;