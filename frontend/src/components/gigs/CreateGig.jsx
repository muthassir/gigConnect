import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createGig } from "../../services/api";
import Alert from "../Alert";

const CreateGig = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    budgetType: "fixed",
    location: "",
    skillsRequired: ""
  });

  // if user is not a client
  if (user?.role !== 'client') {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({
      ...prev,
      skillsRequired: skills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // form validation
    if (!formData.title || !formData.description || !formData.category || 
        !formData.budget || !formData.location) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.budget < 1) {
      setError("Budget must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      
      const gigData = {
        ...formData,
        budget: Number(formData.budget),
        skillsRequired: typeof formData.skillsRequired === 'string' 
          ? formData.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill)
          : formData.skillsRequired
      };

      await createGig(gigData);
      
      // Redirect to client dashboard
      navigate('/client/dashboard', { 
        state: { message: 'Gig created successfully!' } 
      });
      
    } catch (err) {
      console.error('Create gig error:', err);
      setError(err.response?.data?.message || "Failed to create gig. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "SEO",
    "Data Entry",
    "Virtual Assistant",
    "Customer Service",
    "Sales & Marketing",
    "Business Consulting",
    "Video Editing",
    "Photography",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-success">Create New Gig</h1>
              <p className="text-gray-600 mt-2">Post a new gig and find talented freelancers</p>
            </div>

            {error && <Alert alert={error} />}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Gig Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Website Redesign for E-commerce Store"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description *</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the gig in detail. Include requirements, expectations, and any specific instructions..."
                  className="textarea textarea-bordered w-full h-32"
                  required
                />
              </div>

              {/* category and budget  */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Category *</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Budget Type *</span>
                  </label>
                  <select
                    name="budgetType"
                    value={formData.budgetType}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>
              </div>

              {/* budget and location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Budget ($) *
                      {formData.budgetType === 'hourly' && '/hour'}
                    </span>
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder={formData.budgetType === 'hourly' ? "e.g., 25" : "e.g., 500"}
                    className="input input-bordered w-full"
                    min="1"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Location *</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Remote, New York, USA"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>

              {/* skills required */}
              <div className="form-control">
      <label className="label">
        <span className="label-text font-semibold">
          Skills Required (comma separated)
        </span>
      </label>
      <input
        type="text"
        name="skillsRequired"
        value={formData.skillsRequired} // Direct string value
        onChange={handleChange} // Use the same handleChange
        placeholder="e.g., React, Node.js, UI Design, Content Writing"
        className="input input-bordered w-full"
      />
      <label className="label">
        <span className="label-text-alt">
          Separate multiple skills with commas
        </span>
      </label>
    </div>
    
              {/* submit fomr */}
              <div className="form-control mt-8">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/client/dashboard')}
                    className="btn btn-ghost flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating Gig...
                      </>
                    ) : (
                      "Create Gig"
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* tips*/}
            <div className="mt-8 p-4 bg-info/10 rounded-lg">
              <h3 className="font-semibold text-info mb-2">Tips for a great gig post:</h3>
              <ul className="text-sm space-y-1">
                <li>• Be specific about your requirements and expectations</li>
                <li>• Include clear deliverables and timelines</li>
                <li>• Set a realistic budget for the scope of work</li>
                <li>• Mention required skills and experience level</li>
                <li>• Specify if the work is remote or location-based</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGig;