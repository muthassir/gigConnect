import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer"; 
import Dashboard from "./pages/Dashboard"; 
import Login from "./pages/Login"; 
import Register from "./pages/Register"; 
import Messages from "./pages/Messages";
import GigFeed from "./pages/GigFeed";
import GigDetails from "./components/gigs/GigDetails"; 
import CreateGig from "./components/gigs/CreateGig"; 
import MyGigs from "./components/gigs/MyGigs";
import MyApplications from "./components/gigs/MyApplications";
import { AuthProvider, useAuth } from "./context/AuthContext"; 
import Profile from "./components/Profile";
import { SocketProvider } from "./context/socketContext";
import ClientPayments from "./pages/ClientPayments";
import FreelancerPayments from "./pages/FreelancerPayments";
import PaymentPage from "./pages/PaymentPage";
import MyReviews from "./pages/MyReviews";
import About from "./pages/About";
import Contact from "./pages/Contact"

// protected route
const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return element;
};

const App = () => {
  return (
    <div>
      <Router>
        <SocketProvider>
        <AuthProvider>
          <Navbar />
          <div className="pt-16 min-h-screen"> 
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              {/* protected route */}
              <Route 
                path="/login" 
                element={<ProtectedRoute element={<Login />} />} 
              />
              <Route 
                path="/register" 
                element={<ProtectedRoute element={<Register />} />} 
              />

              {/* general routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/client/dashboard" element={<Dashboard />} />
              <Route path="/freelancer/dashboard" element={<Dashboard />} />
              <Route path="/messages" element={<Messages />} />
               {/* gig routes */}
              <Route path="/gigfeeds" element={<GigFeed />} />
              <Route path="/gigs/:id" element={<GigDetails />} />
              <Route path="/gigs/:id/apply" element={<GigDetails />} />
              <Route path="/create-gig" element={<CreateGig />} />
              <Route path="/client/my-gigs" element={<MyGigs />} />
              <Route path="/freelancer/my-applications" element={<MyApplications />} />
              <Route path="/profile" element={<Profile />} />

              {/* payments */}
              <Route path="/client/payments" element={<ClientPayments />} />
              <Route path="/freelancer/earnings" element={<FreelancerPayments />} />
              <Route path="/gigs/:id/payment" element={<PaymentPage />} />

              {/* reviews */}
              <Route path="/my-reviews" element={<MyReviews />} />

            </Routes>
          </div>
          <Footer />
        </AuthProvider>
        </SocketProvider>
      </Router>
    </div>
  );
};

export default App;