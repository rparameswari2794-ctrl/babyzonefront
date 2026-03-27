import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// --- SUB-COMPONENT: AI Chat Modal (Logic for the chat window) ---
const AIChatModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your BabyZone assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate AI response delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I've received your message. Our team will contact you soon!", 
        isBot: true 
      }]);
    }, 1000);
  };

  return (
    <div className="position-fixed bottom-0 end-0 m-4 shadow-lg rounded-4 overflow-hidden bg-white" 
         style={{ width: '320px', zIndex: 3000, border: '2px solid #000' }}>
      <div className="p-3 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: '#000' }}>
        <h6 className="mb-0 fw-bold small">BabyZone AI Support</h6>
        <button className="btn-close btn-close-white btn-sm" onClick={onClose}></button>
      </div>
      <div className="p-3 overflow-auto" style={{ height: '250px', backgroundColor: '#f8f9fa' }}>
        {messages.map((m, i) => (
          <div key={i} className={`d-flex mb-3 ${m.isBot ? 'justify-content-start' : 'justify-content-end'}`}>
            <div className={`p-2 rounded-3 small shadow-sm ${m.isBot ? 'bg-white text-dark border' : 'bg-warning text-dark fw-bold'}`} style={{ maxWidth: '85%' }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="p-2 border-top bg-white">
        <div className="input-group">
          <input type="text" className="form-control form-control-sm border-0 shadow-none" placeholder="Type..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}/>
          <button className="btn btn-warning btn-sm fw-bold border-0" onClick={handleSend} style={{ backgroundColor: '#FFD700' }}>Send</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT: ContactPage ---
const ContactPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showChat, setShowChat] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', query: '' });
  const [submitting, setSubmitting] = useState(false);

  // Set form data from logged-in user if available
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || user.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Logic: Only allow actions if user is logged in
  const handleRestrictedAction = (actionType) => {
    if (!isAuthenticated) {
      toast.error("Please login to your account to continue track orders & use live chat.");
      navigate('/login');
    } else {
      if (actionType === 'track') navigate('/orders');  // Fixed: changed from '/my-orders' to '/orders'
      if (actionType === 'chat') setShowChat(true);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to submit your query.");
      navigate('/login');
      return;
    }
    
    if (!formData.query.trim()) {
      toast.error("Please enter your message");
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await axios.post('/contact/submit/', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.query,
        subject: "Contact Form Submission"
      });
      
      console.log('Contact form response:', response.data);
      toast.success("Our team will contact you soon!");
      setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', query: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    { q: "Where are the offices of BabyZone located?", a: "Currently our office is located in Madurai while the orders are shipped from our warehouses located across India." },
    { q: "How do I know my order has been confirmed?", a: "After checking out during the payment process, you will get a confirmation that your payment has been processed successfully. You will also get a mail in your registered email id, along with an SMS to your registered mobile number confirming the order." },
    { q: "Are there any other hidden charges like Octroi or Entry tax?", a: "You will get the final price during check out. Our prices are all inclusive and you need not pay anything extra." },
    { q: "How long will it take to receive my orders?", a: "For all areas serviced by reputed couriers, the delivery time would be within 3 to 4 business days after dispatch. However items weighing over 2 kilos may take a couple of days longer to reach." },
    { q: "Will my GST amount be refunded on Order Cancellation and Returns?", a: "Yes. GST amount collected will be returned to customer's source method at the time of Cancellation and Returns" }
  ];

  return (
    <div className="container py-5 mt-5">
      <Toaster position="top-center" />
      
      {/* Show welcome message if logged in */}
      {isAuthenticated && user && (
        <div className="alert alert-success mb-4">
          Welcome back, {user.name || user.full_name || user.email}! 👋
        </div>
      )}
      
      <div className="row g-5 mb-5">
        {/* LEFT COLUMN: Reach Us */}
        <div className="col-lg-6">
          <h4 className="fw-bold mb-4">Reach us</h4>
          <div className="d-flex flex-column gap-3">
            <div className="border border-dark rounded-4 p-3 d-flex align-items-center gap-3 bg-white shadow-sm">
              <i className="fas fa-phone-alt fs-5"></i>
              <div>
                <p className="mb-0 small fw-bold">+123-456-7890</p>
                <p className="mb-0 small fw-bold text-muted">support@babyzone.com</p>
              </div>
            </div>

            {/* Restricted Track Order */}
            <div 
              className={`border border-dark rounded-4 p-3 d-flex align-items-center gap-3 bg-white shadow-sm ${!isAuthenticated ? 'opacity-50' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleRestrictedAction('track')}
            >
              <i className="fas fa-truck fa-2x"></i>
              <p className="mb-0 fw-bold">Track order & Cancel order</p>
            </div>

            <div className="border border-dark rounded-4 p-3 d-flex align-items-center gap-3 bg-white shadow-sm">
              <i className="fas fa-exchange-alt fa-2x"></i>
              <p className="mb-0 fw-bold">Exchange and refund policy</p>
            </div>
          </div>

          {/* Restricted Live Chat Button */}
          <button 
            className={`btn btn-warning fw-bold mt-5 px-5 py-2 shadow-sm border-0 rounded-3 ${!isAuthenticated ? 'opacity-75' : ''}`} 
            style={{ backgroundColor: '#FFD700' }}
            onClick={() => handleRestrictedAction('chat')}
          >
            Live Chat
          </button>
        </div>

        {/* RIGHT COLUMN: Contact Form */}
        <div className="col-lg-6">
          <div className="rounded-4 p-4 p-md-5 shadow-sm border border-dark" style={{ backgroundColor: '#FFB2E6' }}>
            <h4 className="fw-bold mb-4">Contact Form</h4>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-3">
                <label className="fw-bold mb-1 small">Name</label>
                <input 
                  type="text" 
                  className="form-control border-0 rounded-pill px-3 py-2" 
                  placeholder="Your Name" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isAuthenticated}
                />
              </div>
              <div className="mb-3">
                <label className="fw-bold mb-1 small">Email</label>
                <input 
                  type="email" 
                  className="form-control border-0 rounded-pill px-3 py-2" 
                  placeholder="Email Id" 
                  required 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isAuthenticated}
                />
              </div>
              <div className="mb-3">
                <label className="fw-bold mb-1 small">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control border-0 rounded-pill px-3 py-2" 
                  placeholder="Phone Number" 
                  required 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isAuthenticated}
                />
              </div>
              <div className="mb-3">
                <label className="fw-bold mb-1 small">Queries</label>
                <textarea 
                  className="form-control border-0 rounded-4 px-3 py-2" 
                  rows="4" 
                  placeholder="Your Message.." 
                  required 
                  value={formData.query} 
                  onChange={(e) => setFormData({...formData, query: e.target.value})}
                  disabled={!isAuthenticated}
                />
              </div>
              <div className="text-center">
                <button 
                  type="submit" 
                  className="btn btn-warning fw-bold px-5 py-2 mt-2 rounded-3 shadow-sm border-0" 
                  style={{ backgroundColor: '#FFD700' }}
                  disabled={!isAuthenticated || submitting}
                >
                  {submitting ? 'Sending...' : 'Send'}
                </button>
              </div>
              {!isAuthenticated && (
                <p className="text-center text-danger small mt-3">
                  Please <Link to="/login">login</Link> to submit your query.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="rounded-4 p-4 p-md-5 mb-5 shadow-sm border border-dark" style={{ backgroundColor: '#FFB2E6' }}>
        <h5 className="text-center fw-bold mb-4">FAQ's</h5>
        <div className="d-flex flex-column gap-4">
          {faqs.map((faq, index) => (
            <div key={index}>
              <p className="fw-bold mb-2 small">{faq.q}</p>
              <div className="bg-white border border-dark rounded-3 p-3">
                <p className="mb-0 small" style={{ fontSize: '13px' }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The Modal only renders when showChat is true (which only happens if logged in) */}
      {showChat && <AIChatModal onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default ContactPage;