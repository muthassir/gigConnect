import { FaTasks, FaUsers, FaRocket, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

function PublicDashboard() {
  const stats = [
    { key: "gigs", title: "Active Gigs", value: "100+", icon: <FaTasks size={24} /> },
    { key: "freelancers", title: "Freelancers", value: "500+", icon: <FaUsers size={24} /> },
    { key: "clients", title: "Clients", value: "200+", icon: <FaRocket size={24} /> },
    { key: "success", title: "Projects Done", value: "1000+", icon: <FaSearch size={24} /> },
  ];

  return (
    <div className="p-8 lg:h-screen h-full bg-base-100">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-success mb-4">Welcome to GigConnect</h1>
        <p className="text-lg text-gray-600 mb-8">
          Connect with talented freelancers or find amazing gig opportunities
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="btn btn-success btn-lg">
            Get Started
          </Link>
          <Link to="/gigfeeds" className="btn btn-outline btn-lg">
            Browse Gigs
          </Link>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-center mb-8">Platform Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {stats.map((s) => (
          <div
            key={s.key}
            className="card bg-base-100 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
          >
            <div className="card-body p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success">
                  {s.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-success">{s.value}</div>
              <div className="text-sm text-gray-600">{s.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold mb-4">Ready to get started?</h3>
        <div className="flex gap-4 justify-center">
          <Link to="/register?role=freelancer" className="btn btn-primary">
            Join as Freelancer
          </Link>
          <Link to="/register?role=client" className="btn btn-secondary">
            Hire as Client
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PublicDashboard;