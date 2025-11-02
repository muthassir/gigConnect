import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userType: 'client'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        userType: 'client'
      });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(''), 5000);
    }, 2000);
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Us',
      description: 'Send us an email anytime',
      details: 'support@gigconnect.com',
      link: 'mailto:support@gigconnect.com'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Get instant help from our team',
      details: 'Available 24/7',
      link: '#chat'
    },
    {
      icon: '📞',
      title: 'Call Us',
      description: 'Mon-Fri from 9am to 6pm',
      details: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: '📍',
      title: 'Visit Us',
      description: 'Come say hello at our office',
      details: '123 Tech Street, Digital City, DC 10101',
      link: '#map'
    }
  ];

  const faqs = [
    {
      question: "How do I get started as a freelancer?",
      answer: "Create your profile, showcase your skills and portfolio, then start applying to relevant projects that match your expertise."
    },
    {
      question: "What payment methods do you support?",
      answer: "We support credit cards, PayPal, bank transfers, and various digital payment methods depending on your region."
    },
    {
      question: "How are disputes handled?",
      answer: "Our dedicated support team mediates disputes between clients and freelancers to ensure fair resolutions for both parties."
    },
    {
      question: "Is there a fee for using Gig Connect?",
      answer: "We charge a small service fee on completed projects. Clients can post jobs for free, and freelancers pay only when they earn."
    }
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="hero min-h-80 ">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl opacity-90">
              We're here to help you succeed. Reach out with any questions or concerns.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Contact Methods</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the most convenient way to reach our support team
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="card-body items-center text-center">
                  <div className="text-3xl mb-4">{method.icon}</div>
                  <h3 className="card-title text-lg mb-2">{method.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                  <p className="text-primary font-semibold">{method.details}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Send us a Message</h2>
                
                {submitStatus === 'success' && (
                  <div className="alert alert-success mb-6">
                    <div className="flex-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <label>Message sent successfully! We'll get back to you within 24 hours.</label>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">I am a</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="cursor-pointer label">
                        <input
                          type="radio"
                          name="userType"
                          value="client"
                          checked={formData.userType === 'client'}
                          onChange={handleChange}
                          className="radio radio-primary"
                        />
                        <span className="label-text ml-2">Client</span>
                      </label>
                      <label className="cursor-pointer label">
                        <input
                          type="radio"
                          name="userType"
                          value="freelancer"
                          checked={formData.userType === 'freelancer'}
                          onChange={handleChange}
                          className="radio radio-primary"
                        />
                        <span className="label-text ml-2">Freelancer</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="input input-bordered"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email Address</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="input input-bordered"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Subject</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing Issue</option>
                      <option value="feature">Feature Request</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Message</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      className="textarea textarea-bordered h-32"
                      required
                    ></textarea>
                  </div>

                  <div className="form-control mt-6">
                    <button
                      type="submit"
                      className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="collapse collapse-plus bg-base-200 border border-base-300">
                    <input type="checkbox" />
                    <div className="collapse-title text-lg font-medium">
                      {faq.question}
                    </div>
                    <div className="collapse-content">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Support Hours */}
              <div className="card bg-base-200 shadow-lg mt-8">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">Support Hours</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-semibold">9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="font-semibold">10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="font-semibold">Emergency Support Only</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="card bg-base-200 shadow-lg mt-6">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    {[
                      { icon: '📘', name: 'Facebook', url: '#' },
                      { icon: '🐦', name: 'Twitter', url: '#' },
                      { icon: '💼', name: 'LinkedIn', url: '#' },
                      { icon: '📷', name: 'Instagram', url: '#' }
                    ].map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        className="btn btn-circle btn-outline"
                        aria-label={social.name}
                      >
                        <span className="text-lg">{social.icon}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Visit Our Office</h2>
            <p className="text-lg text-gray-600">
              Come meet us in person at our headquarters
            </p>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {/* Placeholder for map - in real app, you'd use Google Maps or similar */}
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-2xl font-bold mb-2">Interactive Map</h3>
                  <p className="text-gray-600">123 Tech Street, Digital City, DC 10101</p>
                  <button className="btn btn-primary mt-4">
                    Get Directions
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">🚗</div>
                  <h4 className="font-semibold">Parking</h4>
                  <p className="text-sm text-gray-600">Free parking available in front of building</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🚆</div>
                  <h4 className="font-semibold">Public Transport</h4>
                  <p className="text-sm text-gray-600">5 min walk from City Center Station</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">♿</div>
                  <h4 className="font-semibold">Accessibility</h4>
                  <p className="text-sm text-gray-600">Fully wheelchair accessible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;