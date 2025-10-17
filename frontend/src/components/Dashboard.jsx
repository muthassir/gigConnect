import React from "react";
import { FaTasks, FaComments, FaCheckCircle, FaStar } from "react-icons/fa";


function Dashboard({ stats }) {
  const defaultStats = [
    { key: "gigs", title: "Total Gigs", value: 0, icon: <FaTasks size={24} /> },
    { key: "messages", title: "Messages", value: 0, icon: <FaComments size={24} /> },
    { key: "completed", title: "Completed Gigs", value: 0, icon: <FaCheckCircle size={24} /> },
    { key: "reviews", title: "Pending Reviews", value: 0, icon: <FaStar size={24} /> },
  ];

  const items = stats && Array.isArray(stats) && stats.length ? stats : defaultStats;

  return (
    <div className="container mx-auto p-4 h-full">
      <h2 className="text-2xl font-semibold mt-12 text-center">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-items-center gap-8 mt-12">
        {items.map((s) => (
          <div
            key={s.key}
            className="card bg-base-100 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 w-56"
          >
            <div className="card-body p-4 flex items-center gap-4">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {s.icon}
                </div>
              </div>

              <div className="flex-1">
                <div className="text-sm text-muted"> {s.title} </div>
                <div className="text-2xl font-bold mt-1">{s.value}</div>
              </div>

              <div className="text-xs text-gray-400"> {/* small chevron or extra */} </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
