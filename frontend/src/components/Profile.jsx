import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";
import Alert from "../components/Alert";

function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    location: "",
    skills: "",
    avatar: "",
  });
  const [originalData, setOriginalData] = useState({});

  // Cloudinary
  const cloudName = "de13d1vnc";
  const uploadPreset = "my_upload_preset";

  useEffect(() => {
    if (user) {
      const userData = {
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        skills: user.skills ? user.skills.join(", ") : "",
        avatar: user.avatar || "",
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("upload_preset", uploadPreset);
      uploadFormData.append("cloud_name", cloudName);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setFormData((prev) => ({
          ...prev,
          avatar: data.secure_url,
        }));
        setSuccess("Image uploaded successfully!");
      } else {
        setError("Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const profileData = {
      ...formData,
      skills: formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill),
    };

    const response = await updateProfile(profileData);

    // Update the user in context and localStorage
    const updatedUser = {
      ...user,
      ...formData,
      skills: formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill),
    };
    
    updateUser(updatedUser)

    setSuccess("Profile updated successfully!");
    setEditMode(false);
    setOriginalData(formData);
    
  } catch (err) {
    setError(err.response?.data?.message || "Failed to update profile");
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    setFormData(originalData);
    setEditMode(false);
    setError("");
    setSuccess("");
  };

  const handleEdit = () => {
    setEditMode(true);
    setError("");
    setSuccess("");
  };

  const handleImageError = (e) => {
    e.target.src =
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80";
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-warning">
          <span>Please log in to view your profile.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-success">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>
        {!editMode && (
          <button onClick={handleEdit} className="btn btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {error && <Alert alert={error} type="error" />}
      {success && <Alert alert={success} type="success" />}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="avatar relative">
              <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                <img
                  src={
                    formData.avatar ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                  }
                  alt={formData.username}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  onLoad={() => setImageLoading(false)}
                  style={{ display: imageLoading ? "none" : "block" }}
                />
                {imageLoading && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="loading loading-spinner"></span>
                  </div>
                )}
              </div>
              {editMode && (
                <button
                  type="button"
                  onClick={handleFileSelect}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 btn btn-circle btn-sm btn-primary"
                  title="Upload new photo"
                >
                  {uploading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{formData.username}</h2>
              <p className="text-gray-600 capitalize">{user.role}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge badge-primary capitalize">
                  {user.role}
                </span>
                <span className="badge badge-ghost">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Username *</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email *</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Location</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., New York, USA"
                  className="input input-bordered"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself, your experience, and what you're looking for..."
                  className="textarea textarea-bordered h-24"
                  rows={4}
                />
              </div>

              {user.role === "freelancer" && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Skills</span>
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., React, Node.js, UI Design, Content Writing"
                    className="input input-bordered"
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      Separate skills with commas
                    </span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading || uploading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode - Display Only */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">
                        Username:
                      </span>
                      <p className="mt-1">{formData.username}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <p className="mt-1">{formData.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Location:
                      </span>
                      <p className="mt-1">
                        {formData.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">About</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Bio:</span>
                      <p className="mt-1">
                        {formData.bio || "No bio added yet"}
                      </p>
                    </div>
                    {user.role === "freelancer" && formData.skills && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Skills:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.skills.split(",").map((skill, index) => (
                            <span
                              key={index}
                              className="badge badge-outline badge-sm"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Completeness */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-4">Profile Completeness</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Basic Info</span>
                <span className="badge badge-success">Complete</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Profile Picture</span>
                <span
                  className={`badge ${
                    formData.avatar ? "badge-success" : "badge-warning"
                  }`}
                >
                  {formData.avatar ? "Added" : "Missing"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Bio</span>
                <span
                  className={`badge ${
                    formData.bio ? "badge-success" : "badge-warning"
                  }`}
                >
                  {formData.bio ? "Added" : "Missing"}
                </span>
              </div>
              {user.role === "freelancer" && (
                <div className="flex justify-between items-center">
                  <span>Skills</span>
                  <span
                    className={`badge ${
                      formData.skills ? "badge-success" : "badge-warning"
                    }`}
                  >
                    {formData.skills ? "Added" : "Missing"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
