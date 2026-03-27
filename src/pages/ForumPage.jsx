import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { loginSuccess } from '@/store/slices/authSlice';
import { toast } from 'react-toastify';

const ForumPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [forumGroups, setForumGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedBlogId, setExpandedBlogId] = useState(null);
  
  // NEW: State for storing joined groups info with dates
  const [userJoinedGroups, setUserJoinedGroups] = useState([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState(false);
  const messagesEndRef = useRef(null);

  // Blog Content from Image
  const blogs = [
    {
      id: 1,
      title: "The Story of My Rainbow Baby",
      shortDesc: "What does it mean when I say that my daughter is my ‘Rainbow Baby’? A ‘Rainbow Baby’ is a baby that is born following a miscarriage or an infant loss. Just like a beautiful and...",
      fullContent: "What does it mean when I say that my daughter is my ‘Rainbow Baby’? A ‘Rainbow Baby’ is a baby that is born following a miscarriage or an infant loss. Just like a beautiful and bright rainbow appears after a storm, a rainbow baby brings hope and healing to a family after a period of darkness.",
      image: "images/fo5.jpg"
    },
    {
      id: 2,
      title: "Baby Dry Skin: Symptoms, Causes and Treatment",
      shortDesc: "For a parent, their baby’s health is of utmost importance. This means taking care of their internal health by ensuring the right kind of nutrition and choosing products that not only secure their...",
      fullContent: "For a parent, their baby’s health is of utmost importance. This means taking care of their internal health by ensuring the right kind of nutrition and choosing products that not only secure their well-being but also their comfort. Dry skin can be caused by environmental factors, frequent bathing, or underlying conditions like eczema.",
      image: "images/fo6.jpg"
    },
    {
      id: 3,
      title: "Raisins for babies- Health benefits and risks",
      shortDesc: "Many of us love a good old raisin- they are small, wrinkled packets of energy that have been around since medieval times and are famous for being a natural source of minerals, vitamins, and...",
      fullContent: "Many of us love a good old raisin- they are small, wrinkled packets of energy that have been around since medieval times and are famous for being a natural source of minerals, vitamins, and carbohydrates. However, for babies, they can pose a choking hazard and high sugar content, so moderation is key.",
      image: "images/fo8.jpg"
    },
    {
      id: 4,
      title: "Hernia in Babies – Types, Causes, Signs and Treatment",
      shortDesc: "A hernia is a lump that develops under the skin, in the tummy or groin region, and in variable sizes. When the muscles across the tummy area and the pelvic region weaken or develop a gap, it can...",
      fullContent: "A hernia is a lump that develops under the skin, in the tummy or groin region, and in variable sizes. When the muscles across the tummy area and the pelvic region weaken or develop a gap, it can lead to the protrusion of organs. Most common in babies are umbilical and inguinal hernias.",
      image: "images/fo7.webp"
    }
  ];

  // Image mapping for groups
  const getGroupImage = (groupId) => {
    const images = {
      1: 'images/fo1.jpg',
      2: 'images/fo2.webp',
      3: 'images/fo3.jpg',
      4: 'images/fo4.jpg',
    };
    return images[groupId] || `images/fo${groupId}.jpg`;
  };

  useEffect(() => {
    fetchGroups();
  }, [isAuthenticated]);

  // NEW: Fetch user's joined groups when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserJoinedGroups();
    }
  }, [isAuthenticated]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/forum-groups/');
      const groups = response.data.results || response.data;
      if (Array.isArray(groups)) {
        setForumGroups(groups);
      } else {
        setForumGroups([]);
      }
    } catch (error) {
      console.error('Failed to fetch forum groups:', error);
      setForumGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Function to fetch user's joined groups with join dates
  const fetchUserJoinedGroups = async () => {
    try {
      // Get user's enrolled groups with join dates from the backend
      // This assumes you have an endpoint like /forum-groups/joined/
      const response = await axios.get('/forum-groups/joined/');
      setUserJoinedGroups(response.data || []);
    } catch (error) {
      console.error('Failed to fetch joined groups:', error);
      // If endpoint doesn't exist, try to get from localStorage as fallback
      const stored = localStorage.getItem(`user_forum_joined_${user?.id}`);
      if (stored) {
        setUserJoinedGroups(JSON.parse(stored));
      }
    }
  };

  // Helper function to check if user joined a group and get join date
  const getGroupJoinInfo = (groupId) => {
    const joined = userJoinedGroups.find(g => g.id === groupId || g.group_id === groupId);
    if (joined) {
      return {
        joined: true,
        joined_at: joined.joined_at || joined.created_at,
        formatted_date: new Date(joined.joined_at || joined.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      };
    }
    return { joined: false };
  };

  useEffect(() => {
    const pendingGroupId = sessionStorage.getItem('pendingForumGroup');
    if (pendingGroupId && isAuthenticated) {
      sessionStorage.removeItem('pendingForumGroup');
      const group = forumGroups.find(g => g.id === parseInt(pendingGroupId));
      if (group) {
        handleJoinAction(group);
      }
    }
  }, [isAuthenticated, forumGroups]);

  useEffect(() => {
    if (selectedGroup && showChat) {
      fetchChatMessages();
      const interval = setInterval(fetchChatMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup, showChat]);

  const fetchChatMessages = async () => {
    try {
      const response = await axios.get('/forum-chats/group_chat/', {
        params: { group_id: selectedGroup.id }
      });
      if (Array.isArray(response.data)) {
        setChatMessages(response.data);
        setChatError(false);
        scrollToBottom();
      } else {
        setChatError(true);
      }
    } catch (error) {
      setChatError(true);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await axios.post('/forum-chats/', {
        group: selectedGroup.id,
        message: newMessage
      });
      setNewMessage('');
      await fetchChatMessages();
    } catch (error) {
      alert('Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJoinAction = async (group) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingForumGroup', group.id);
      navigate('/login');
      return;
    }

    // Check if already joined
    const joinInfo = getGroupJoinInfo(group.id);
    if (joinInfo.joined) {
      setSelectedGroup(group);
      setShowChat(true);
      return;
    }

    setJoinLoading(true);
    try {
      const response = await axios.post(`/forum/groups/${group.id}/join/`);
      if (response.status === 200 || response.status === 201) {
        toast.success(`Successfully joined ${group.type_display} group!`);
        // Refresh joined groups
        await fetchUserJoinedGroups();
        setSelectedGroup(group);
        setShowChat(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.info(`You are already a member of ${group.type_display} group.`);
        await fetchUserJoinedGroups();
        setSelectedGroup(group);
        setShowChat(true);
      } else {
        alert('An error occurred. Please try again.');
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const toggleBlog = (id) => {
    setExpandedBlogId(expandedBlogId === id ? null : id);
  };

  // Chat Interface
  if (showChat && selectedGroup) {
    const joinInfo = getGroupJoinInfo(selectedGroup.id);
    
    return (
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="row g-3">
          <div className="col-md-2 bg-white rounded-4 border p-3 text-center shadow-sm">
            <img
              src={user?.profile_picture || 'images/a.png'}
              className="rounded-circle mb-3"
              width="70"
              alt={user?.name || 'User'}
            />
            <div className="nav flex-column gap-2">
              <button className="btn btn-sm border-0 text-start">Home</button>
              <button className="btn btn-sm border-0 text-start" style={{ backgroundColor: '#f9b1d8' }}>Chat</button>
              <button className="btn btn-sm text-danger mt-5" onClick={() => setShowChat(false)}>Exit</button>
            </div>
            {/* NEW: Show join date in chat sidebar */}
            {joinInfo.joined && (
              <div className="mt-3 small text-muted">
                <i className="fas fa-calendar-alt me-1"></i>
                Member since: {joinInfo.formatted_date}
              </div>
            )}
          </div>
          <div className="col-md-3 bg-white rounded-4 border p-4 shadow-sm">
            <h6 className="fw-bold mb-3">Groups</h6>
            {forumGroups.map((group) => {
              const groupJoinInfo = getGroupJoinInfo(group.id);
              return (
                <div key={group.id} className="p-2 mb-2 rounded-2 border small d-flex justify-content-between align-items-center" style={{ backgroundColor: selectedGroup.id === group.id ? '#fce4ec' : 'transparent' }}>
                  <span>{group.type_display}</span>
                  {groupJoinInfo.joined && (
                    <i className="fas fa-check-circle text-success" style={{ fontSize: '12px' }} title={`Joined on ${groupJoinInfo.formatted_date}`}></i>
                  )}
                </div>
              );
            })}
          </div>
          <div className="col-md-7 bg-white rounded-4 border p-0 shadow-sm d-flex flex-column" style={{ height: '70vh' }}>
            <div className="p-3 fw-bold" style={{ backgroundColor: '#f9b1d8' }}>
              {selectedGroup.type_display} Forum
              {/* NEW: Show join date in chat header */}
              {joinInfo.joined && (
                <span className="ms-2 small text-muted">
                  (Joined: {joinInfo.formatted_date})
                </span>
              )}
            </div>
            <div className="flex-grow-1 p-3 overflow-auto">
              {chatError && <div className="alert alert-warning text-center">Chat not available.</div>}
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`mb-3 d-flex ${msg.user === user?.id ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div className={`rounded-3 p-2 shadow-sm ${msg.user === user?.id ? 'bg-warning' : 'bg-light'}`} style={{ maxWidth: '70%' }}>
                    <strong>{msg.user_name || `User ${msg.user}`}</strong>
                    <p className="mb-0 small">{msg.message}</p>
                    <span className="text-muted small">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-top">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={sending}
                />
                <button className="btn btn-warning rounded-pill" onClick={sendMessage} disabled={sending || !newMessage.trim()}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Page
  if (loading) return <div className="container text-center py-5">Loading forum groups...</div>;

  return (
    <>
      <div className="container-fluid py-5 mt-4 px-md-5">
        <nav className="small text-muted mb-3">Home / Forum</nav>
        <button className="btn btn-warning fw-bold px-4 mb-4 rounded-3 border-0" style={{ backgroundColor: '#FFD700', width: '220px' }}>Join Forum</button>

        <div className="row g-4">
          {forumGroups.map((group) => {
            const joinInfo = getGroupJoinInfo(group.id);
            
            return (
              <div key={group.id} className="col-md-3">
                <div className="card rounded-4 overflow-hidden border-dark text-white h-100 shadow-sm">
                  <img src={getGroupImage(group.id)} className="card-img h-100" alt={group.type_display} style={{ objectFit: 'cover', minHeight: '180px' }} />
                  <div className="card-img-overlay d-flex flex-column justify-content-end p-0">
                    <div className="bg-dark bg-opacity-75 p-2 w-100">
                      <h6 className="fw-bold mb-1" style={{ fontSize: '14px' }}>{group.type_display}</h6>
                      
                      {/* NEW: Show join date if already joined */}
                      {joinInfo.joined ? (
                        <>
                          <p className="mb-0" style={{ fontSize: '10px' }}>
                            <i className="fas fa-check-circle text-success me-1"></i>
                            Joined on {joinInfo.formatted_date}
                          </p>
                          <div className="text-end">
                            <button
                              onClick={() => handleJoinAction(group)}
                              className="btn btn-success btn-sm fw-bold px-3 border-0"
                              style={{ fontSize: '12px' }}
                              disabled={joinLoading}
                            >
                              Open Chat
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="mb-0" style={{ fontSize: '10px' }}>Join forum to ask or share something</p>
                          <div className="text-end">
                            <button
                              onClick={() => handleJoinAction(group)}
                              className="btn btn-warning btn-sm fw-bold px-3 border-0"
                              style={{ backgroundColor: '#FFD700', fontSize: '12px' }}
                              disabled={joinLoading}
                            >
                              {joinLoading ? 'Joining...' : 'Join'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blogs section from Uploaded Image */}
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button className="btn btn-warning fw-bold px-4 rounded-3 border-0 shadow-sm" style={{ backgroundColor: '#FFD700', width: '220px' }}>Blogs</button>
          <span className="text-primary fw-bold small" style={{ cursor: 'pointer' }}>View more</span>
        </div>
        <div className="row g-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="col-md-6">
              <div className="card h-100 border-dark rounded-4 overflow-hidden p-2 shadow-sm">
                <div className="row g-0 h-100">
                  <div className="col-4">
                    <img src={blog.image} alt={blog.title} className="img-fluid h-100 rounded-2" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="col-8 px-2">
                    <div className="card-body p-2 d-flex flex-column h-100">
                      <h5 className="fw-bold mb-3 mt-1" style={{ fontSize: '15px' }}>{blog.title}</h5>
                      <p className=" small mb-1" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                        {expandedBlogId === blog.id ? blog.fullContent : blog.shortDesc}
                      </p>
                      <div className="mt-auto text-end">
                        <button 
                          onClick={() => toggleBlog(blog.id)} 
                          className="btn btn-warning btn-sm fw-bold border-0 shadow-sm px-3" 
                          style={{ backgroundColor: '#FFD700', fontSize: '11px', color: '#000' }}
                        >
                          {expandedBlogId === blog.id ? 'Show Less' : 'Read more'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ForumPage;