import { useAuth } from "../context/AuthContext";
import PublicDashboard from "../components/dashboards/PublicDashboard";
import ClientDashboard from "../components/dashboards/ClientDashboard";
import FreelancerDashboard from "../components/dashboards/FreelancerDashboard";

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <PublicDashboard />;
  }

  if (user.role === 'client') {
    return <ClientDashboard />;
  }

  if (user.role === 'freelancer') {
    return <FreelancerDashboard />;
  }

  return <PublicDashboard />;
}

export default Dashboard;