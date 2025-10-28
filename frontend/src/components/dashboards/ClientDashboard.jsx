import { FaTasks, FaComments, FaCheckCircle, FaDollarSign, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

function ClientDashboard() {
  const stats = [
    { key: "active", title: "Active Gigs", value: 5, icon: <FaTasks size={24} /> },
    { key: "applications", title: "Pending Applications", value: 12, icon: <FaComments size={24} /> },
    { key: "completed", title: "Completed Gigs", value: 8, icon: <FaCheckCircle size={24} /> },
    { key: "spent", title: "Total Spent", value: "$2,400", icon: <FaDollarSign size={24} /> },
  ];

  return (
    <div className="container p-8 lg:h-screen h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Client Dashboard</h2>
        <Link to="/create-gig" className="btn btn-success">
          <FaPlus className="mr-2" />
          Post New Gig
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
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-base-200 rounded">
                <span>Website Redesign</span>
                <span className="badge badge-success">Active</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-base-200 rounded">
                <span>Logo Design</span>
                <span className="badge badge-warning">In Progress</span>
              </div>
            </div>
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