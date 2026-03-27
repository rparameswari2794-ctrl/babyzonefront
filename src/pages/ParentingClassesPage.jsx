import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const ParentingClasses = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userEmail = user?.email;
  const userName = user?.name || 'User';

  const [enrolledClassId, setEnrolledClassId] = useState(null);
  const [enrolledWorkshopId, setEnrolledWorkshopId] = useState(null);
  
  // NEW: State for storing enrollment dates
  const [enrollmentDates, setEnrollmentDates] = useState({
    class: {},
    workshop: {}
  });

  const classes = [
    { id: 1, title: "Parenting techniques", date: "30/08/2025", duration: "10 Days", img: "images/fo2.webp" },
    { id: 2, title: "Parenting techniques", date: "02/09/2025", duration: "30 Days", img: "images/pa3.png" },
    { id: 3, title: "Child Development", date: "28/08/2025", duration: "10 Days", img: "images/pa2.jpg" },
    { id: 4, title: "Discipline", date: "29/08/2025", duration: "10 Days", img: "images/pa1.jpg" },
  ];

  const workshops = [
    { id: 101, title: "Child care", doctor: "James doe", designation: "Senior Doctor", date: "Wed, 28 Aug, 2025", time: "10.00 Am - 1.00Pm", img: "images/pa4.jpg" },
    { id: 102, title: "First step with baby", doctor: "Lilly Mary", designation: "Senior Doctor", date: "Wed, 28 Aug, 2025", time: "10.00 Am - 1.00Pm", img: "images/pa5.webp" },
    { id: 103, title: "The Art of Baby Handling", doctor: "Stella Robert", designation: "Senior Doctor", date: "Wed, 28 Aug, 2025", time: "10.00 Am - 1.00Pm", img: "images/pa6.jpg" },
  ];

  // Load enrollment from localStorage and fetch from backend
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      const storageKey = `user_enrollments_${userEmail}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        setEnrolledClassId(data.enrolledClassId || null);
        setEnrolledWorkshopId(data.enrolledWorkshopId || null);
        setEnrollmentDates(data.enrollmentDates || { class: {}, workshop: {} });
      } else {
        setEnrolledClassId(null);
        setEnrolledWorkshopId(null);
        setEnrollmentDates({ class: {}, workshop: {} });
      }
    } else {
      setEnrolledClassId(null);
      setEnrolledWorkshopId(null);
      setEnrollmentDates({ class: {}, workshop: {} });
    }
  }, [isAuthenticated, userEmail]);

  // Save enrollment to localStorage with dates
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      const storageKey = `user_enrollments_${userEmail}`;
      localStorage.setItem(storageKey, JSON.stringify({ 
        enrolledClassId, 
        enrolledWorkshopId,
        enrollmentDates 
      }));
    }
  }, [enrolledClassId, enrolledWorkshopId, enrollmentDates, isAuthenticated, userEmail]);

  // Helper function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mock email sender
  const sendEmail = (to, subject, body) => {
    console.log(`📧 Email sent to ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    alert(`📧 Email sent to ${to} (check console for details)`);
  };

  // Send admin notification – uses axios instance with token
  const sendAdminNotification = async (type, itemId, title) => {
    try {
      const response = await axios.post('/admin/notify-enrollment/', {
        type,
        itemId,
        title,
      });
      console.log('Enrollment saved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to save enrollment:', error);
      throw error;
    }
  };

  // Enrollment functions with date tracking
  const enrollInClass = async (id, title) => {
    if (!isAuthenticated) {
      alert('Please login first.');
      return false;
    }
    if (enrolledClassId === id) {
      const date = enrollmentDates.class[id];
      alert(`You are already enrolled in ${title}.\nEnrolled on: ${date}`);
      return false;
    }
    if (enrolledClassId !== null) {
      alert('You can only join one class at a time.');
      return false;
    }

    try {
      await sendAdminNotification('class', id, title);
      const currentDate = new Date().toISOString();
      setEnrolledClassId(id);
      setEnrollmentDates(prev => ({
        ...prev,
        class: { ...prev.class, [id]: currentDate }
      }));
      
      const formattedDate = formatDate(currentDate);
      alert(`✅ Successfully enrolled in class: ${title}\n\nEnrolled on: ${formattedDate}`);
      sendEmail(
        userEmail,
        'Class Registration Confirmed',
        `Dear ${userName},\n\nYou have successfully registered for the class "${title}".\n\nEnrollment Date: ${formattedDate}\n\nOur team will reach you soon.\n\nThank you!`
      );
      return true;
    } catch (error) {
      alert('Enrollment failed. Please try again.');
      return false;
    }
  };

  const registerForWorkshop = async (id, title) => {
    if (!isAuthenticated) {
      alert('Please login first.');
      return false;
    }
    if (enrolledWorkshopId === id) {
      const date = enrollmentDates.workshop[id];
      alert(`You have already registered for ${title}.\nRegistered on: ${date}`);
      return false;
    }
    if (enrolledWorkshopId !== null) {
      alert('You can only register for one workshop at a time.');
      return false;
    }

    try {
      await sendAdminNotification('workshop', id, title);
      const currentDate = new Date().toISOString();
      setEnrolledWorkshopId(id);
      setEnrollmentDates(prev => ({
        ...prev,
        workshop: { ...prev.workshop, [id]: currentDate }
      }));
      
      const formattedDate = formatDate(currentDate);
      alert(`✅ Successfully registered for workshop: ${title}\n\nRegistered on: ${formattedDate}`);
      sendEmail(
        userEmail,
        'Workshop Registration Confirmed',
        `Dear ${userName},\n\nYou have successfully registered for the workshop "${title}".\n\nRegistration Date: ${formattedDate}\n\nOur team will reach you soon.\n\nThank you!`
      );
      return true;
    } catch (error) {
      alert('Registration failed. Please try again.');
      return false;
    }
  };

  const handleJoinClass = (id, title) => enrollInClass(id, title);
  const handleRegisterWorkshop = (id, title) => registerForWorkshop(id, title);

  // Helper to get enrollment date display
  const getEnrollmentDateDisplay = (type, id) => {
    if (type === 'class') {
      const date = enrollmentDates.class[id];
      if (date) return formatDate(date);
    } else if (type === 'workshop') {
      const date = enrollmentDates.workshop[id];
      if (date) return formatDate(date);
    }
    return null;
  };

  return (
    <div className="container-fluid py-5 overflow-hidden">
      <div className="d-flex justify-content-between align-items-center px-5 mb-4">
        {isAuthenticated && <span>Welcome, {userName}</span>}
      </div>

      {/* SECTION: ONLINE CLASSES */}
      <h5 className="fw-bold mb-4 ms-5">Online Classes</h5>
      <div className="scroll-wrapper mb-5">
        <div className="auto-scroll-track">
          {[...classes, ...classes].map((cls, index) => {
            const isEnrolled = enrolledClassId === cls.id;
            const enrollmentDate = getEnrollmentDateDisplay('class', cls.id);
            
            return (
              <div key={`cls-key-${index}`} className="custom-card-container">
                <div className="card h-100 rounded-4 shadow-sm border-dark overflow-hidden">
                  <div className="img-fixed-wrapper">
                    <img src={cls.img} alt={cls.title} />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h6 className="fw-bold">{cls.title}</h6>
                    <div className="d-flex justify-content-between text-dark" style={{ fontWeight: '600' }}>
                      <p className="small mb-0">Starts on {cls.date}</p>
                      <p className="small">{cls.duration}</p>
                    </div>
                    {/* NEW: Show enrollment date if already enrolled */}
                    {isEnrolled && enrollmentDate && (
                      <div className="mt-1 mb-2">
                        <small className="text-success">
                          <i className="fas fa-check-circle me-1"></i>
                          Enrolled on: {enrollmentDate}
                        </small>
                      </div>
                    )}
                    <button
                      onClick={() => handleJoinClass(cls.id, cls.title)}
                      className="btn btn-warning w-100 fw-bold rounded-3 mt-auto"
                      style={{
                        backgroundColor: isEnrolled ? '#28a745' : '#FFD700',
                        color: isEnrolled ? 'white' : 'black',
                      }}
                    >
                      {isEnrolled ? 'Joined' : 'Join Class'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: WORKSHOPS */}
      <h5 className="fw-bold ms-5 mb-3">Workshops</h5>
      <div className="row g-5 justify-content-center px-5">
        {workshops.map((ws) => {
          const isRegistered = enrolledWorkshopId === ws.id;
          const registrationDate = getEnrollmentDateDisplay('workshop', ws.id);
          
          return (
            <div key={ws.id} className="col-md-4">
              <div className="card h-100 rounded-4 shadow-sm border-dark overflow-hidden">
                <div className="img-fixed-wrapper">
                  <img src={ws.img} alt={ws.title} />
                </div>
                <div className="card-body d-flex flex-column text-dark">
                  <h6 className="fw-bold">{ws.title}</h6>
                  <p className="small mb-1" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                    Conducted by {ws.doctor}
                  </p>
                  <p className="small mb-1" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                    {ws.designation}
                  </p>
                  <p className="small mb-1" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                    {ws.date}
                  </p>
                  <p className="small mb-2" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                    {ws.time}
                  </p>
                  {/* NEW: Show registration date if already registered */}
                  {isRegistered && registrationDate && (
                    <div className="mt-1 mb-2">
                      <small className="text-success">
                        <i className="fas fa-check-circle me-1"></i>
                        Registered on: {registrationDate}
                      </small>
                    </div>
                  )}
                  <div className="d-flex justify-content-center mt-auto">
                    <button
                      onClick={() => handleRegisterWorkshop(ws.id, ws.title)}
                      className="btn btn-warning w-50 fw-bold rounded-3"
                      style={{
                        backgroundColor: isRegistered ? '#28a745' : '#FFD700',
                        color: isRegistered ? 'white' : 'black',
                      }}
                    >
                      {isRegistered ? 'Registered' : 'Register'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParentingClasses;