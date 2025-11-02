import React, { useState } from 'react';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="hero min-h-96 ">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6 text-success">About Gig Connect</h1>
            <p className="text-xl opacity-90">
              Bridging Talent with Opportunity in the Modern Gig Economy
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed justify-center -mt-8 z-10 relative px-4">
        <button 
          className={`tab tab-lg ${activeTab === 'mission' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('mission')}
        >
          Our Mission
        </button>
        <button 
          className={`tab tab-lg ${activeTab === 'how-it-works' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('how-it-works')}
        >
          How It Works
        </button>
        <button 
          className={`tab tab-lg ${activeTab === 'why-choose' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('why-choose')}
        >
          Why Choose Us
        </button>
      </div>

      {/* Mission Section */}
      {activeTab === 'mission' && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Empowering Both Sides of the Gig Economy</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our mission is simple yet powerful: to create seamless connections that drive growth.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="card-title text-2xl mb-4">For Clients</h3>
                  <p className="text-lg">
                    Build your dreams by accessing a global pool of vetted freelancers. 
                    Find the perfect talent to bring your projects to life.
                  </p>
                </div>
              </div>
              
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="card-title text-2xl mb-4">For Freelancers</h3>
                  <p className="text-lg">
                    Build your career by finding meaningful work and getting paid fairly and on time. 
                    Take control of your professional journey.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="divider max-w-2xl mx-auto">We are the bridge that turns potential into progress</div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      {activeTab === 'how-it-works' && (
        <section className="py-16 px-4 bg-base-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">How Gig Connect Works</h2>
              <p className="text-lg text-gray-600">
                A two-sided marketplace designed for efficiency and success
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Clients Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-2">For Clients: Post Jobs, Build Your Team</h3>
                  <p className="text-gray-600 italic">
                    You focus on your vision; we'll help you find the talent to execute it.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {[
                    { number: 1, title: "Post a Job", desc: "Easily create detailed job postings with requirements, scope, budget, and deadlines." },
                    { number: 2, title: "Discover Talent", desc: "Get matched with qualified freelancers. Browse profiles, portfolios, and ratings." },
                    { number: 3, title: "Hire the Best", desc: "Interview candidates and select the perfect freelancer or team for your project." },
                    { number: 4, title: "Manage & Pay Securely", desc: "Use our tools for milestone management and communication with secure payment processing." }
                  ].map((step) => (
                    <div key={step.number} className="card bg-base-100 shadow-lg">
                      <div className="card-body">
                        <div className="flex items-start space-x-4">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-12">
                              <span className="text-lg">{step.number}</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="card-title text-lg mb-2">{step.title}</h4>
                            <p>{step.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Freelancers Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-secondary mb-2">For Freelancers: Find Gigs, Get Paid</h3>
                  <p className="text-gray-600 italic">
                    Your skills deserve the right stage and timely rewards.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {[
                    { number: 1, title: "Create Your Profile", desc: "Showcase your skills, experience, and portfolio to attract the right clients." },
                    { number: 2, title: "Browse & Apply", desc: "Discover projects that match your expertise and submit compelling proposals." },
                    { number: 3, title: "Get Hired", desc: "Connect with clients, discuss details, and start working on exciting projects." },
                    { number: 4, title: "Work & Get Paid", desc: "Deliver quality work and get paid securely through our protected payment system." }
                  ].map((step) => (
                    <div key={step.number} className="card bg-base-100 shadow-lg">
                      <div className="card-body">
                        <div className="flex items-start space-x-4">
                          <div className="avatar placeholder">
                            <div className="bg-secondary text-secondary-content rounded-full w-12">
                              <span className="text-lg">{step.number}</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="card-title text-lg mb-2">{step.title}</h4>
                            <p>{step.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      {activeTab === 'why-choose' && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Choose Gig Connect?</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🛡️", title: "Secure Payments", desc: "Escrow protection and milestone-based payments ensure everyone's financial security." },
                { icon: "🌍", title: "Global Reach", desc: "Access talent and opportunities from around the world in one unified platform." },
                { icon: "⚡", title: "Fast Matching", desc: "Smart algorithms connect the right clients with the perfect freelancers quickly." },
                { icon: "💬", title: "Seamless Communication", desc: "Built-in messaging and collaboration tools keep projects on track." },
                { icon: "📊", title: "Project Management", desc: "Tools for milestone tracking, file sharing, and progress monitoring." },
                { icon: "⭐", title: "Quality Assurance", desc: "Review and rating system maintains high standards across the platform." }
              ].map((feature, index) => (
                <div key={index} className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="card-body items-center text-center">
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h4 className="card-title text-lg mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 ">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of clients and freelancers already growing with Gig Connect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-accent btn-lg px-8">
              Post a Project
            </button>
            <button className="btn btn-outline btn-lg px-8 text-primary-content border-primary-content hover:bg-primary-content hover:text-primary">
              Find Work
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About