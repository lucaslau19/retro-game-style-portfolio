import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../../context/PlayerContext';
import './ContactParty.css';

const ContactParty = () => {
  const { player } = usePlayer();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // 'loading', 'success', 'error'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset status when user starts typing
    if (status) setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('Submitting to:', `${apiUrl}/api/contact`);

    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: formData.name, email: formData.email, message: formData.message })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok && data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus(null), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus(null), 5000);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setStatus('error');
      setTimeout(() => setStatus(null), 5000);
    }
  };

  const partyMembers = [
    {
      name: 'GitHub',
      link: 'https://github.com/lucaslau19',
      icon: '🐙',
      type: 'social'
    },
    {
      name: 'LinkedIn',
      link: 'https://www.linkedin.com/in/lucas-lau-2569312a0/',
      icon: '💼',
      type: 'social'
    },
    {
      name: 'Resume',
      link: '/Lucas_Lau_Resume.pdf',
      icon: '📜',
      type: 'resume',
      download: 'Lucas_Lau_Resume.pdf'
    }
  ];

  return (
    <motion.div
      className="contact-party panel"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="panel-title pixel-font">ADD FRIEND</h2>

      <div className="party-members">
        {partyMembers.map((member, index) => (
          <motion.a
            key={member.name}
            href={member.link}
            target={member.type === 'resume' ? '_self' : '_blank'}
            rel={member.type === 'resume' ? undefined : 'noopener noreferrer'}
            download={member.download}
            className="party-member"
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="member-icon">{member.icon}</div>
            <h3>{member.name}</h3>
          </motion.a>
        ))}
      </div>

      <div className="contact-form-section">
        <h3 className="form-title">Send a Message</h3>

        {status === 'error' && (
          <motion.div
            className="error-message"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            ❌ Send failed. Try again.
          </motion.div>
        )}

        {status === 'success' ? (
          <motion.div
            className="success-message"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h4>✅ Message delivered to the guild!</h4>
            <p>Thanks for reaching out. I'll get back to you soon!</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <textarea
                name="message"
                placeholder="Your Message"
                rows="5"
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>

            <motion.button
              type="submit"
              className="submit-button"
              disabled={status === 'loading'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status === 'loading' ? 'SENDING...' : 'Send Message'}
            </motion.button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default ContactParty;