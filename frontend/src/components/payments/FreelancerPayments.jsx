import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getFreelancerPayments } from "../../services/api";
import Alert from "../Alert";

function FreelancerPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedPayments: 0,
    pendingPayments: 0,
    totalPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await getFreelancerPayments();
      setPayments(response.data || []);
      setStats(response.stats || {
        totalEarnings: 0,
        completedPayments: 0,
        pendingPayments: 0,
        totalPayments: 0
      });
    } catch (err) {
      setError("Failed to load payments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { class: 'badge-success', text: 'Completed' },
      'pending': { class: 'badge-warning', text: 'Pending' },
      'processing': { class: 'badge-info', text: 'Processing' },
      'failed': { class: 'badge-error', text: 'Failed' },
      'cancelled': { class: 'badge-neutral', text: 'Cancelled' },
      'refunded': { class: 'badge-secondary', text: 'Refunded' }
    };
    const config = statusConfig[status] || { class: 'badge-neutral', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (user?.role !== 'freelancer') {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-error">
          <span>Only freelancers can access this page.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Earnings</h1>
          <p className="text-gray-600 mt-2">Track your earnings and payment history</p>
        </div>
      </div>

      {error && <Alert alert={error} type="error" />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-success">${stats.totalEarnings?.toFixed(2)}</div>
            <div className="text-gray-600">Total Earnings</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-primary">{stats.totalPayments || 0}</div>
            <div className="text-gray-600">Total Payments</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-info">{stats.completedPayments || 0}</div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-warning">{stats.pendingPayments || 0}</div>
            <div className="text-gray-600">Pending</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl text-gray-500 mb-4">No earnings yet</div>
          <p className="text-gray-600">Your earnings will appear here after clients make payments</p>
        </div>
      ) : (
        <div className="space-y-6">
          {payments.map((payment) => (
            <div key={payment._id} className="card bg-base-100 shadow-lg border">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <h3 className="card-title text-xl">{payment.gig?.title || 'Gig'}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(payment.status)}
                        <span className="text-xl font-bold text-success">
                          ${payment.freelancerEarnings?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full">
                              <img 
                                src={payment.client?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'} 
                                alt={payment.client?.username}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{payment.client?.username || 'Client'}</div>
                            <div className="text-sm text-gray-600">Client</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Total Amount:</span>
                          <span>${payment.amount?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Platform Fee:</span>
                          <span>${payment.platformFee?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Payment Method:</span>
                          <span className="capitalize">{payment.paymentMethod || 'card'}</span>
                        </div>
                      </div>
                    </div>

                    {payment.description && (
                      <p className="text-gray-600 mb-2">{payment.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      {payment.completedAt && (
                        <div>
                          <span className="font-medium">Completed:</span>{' '}
                          {new Date(payment.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FreelancerPayments;
