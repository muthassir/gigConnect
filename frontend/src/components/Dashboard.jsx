import React from "react";

function Dashboard() {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Dashboard</h2>

      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Total Gigs</h5>
              <p className="card-text fs-4 fw-bold">0</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Messages</h5>
              <p className="card-text fs-4 fw-bold">0</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Completed Gigs</h5>
              <p className="card-text fs-4 fw-bold">0</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Pending Reviews</h5>
              <p className="card-text fs-4 fw-bold">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
