import React from 'react';
import '../styles/Home.css';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🔍',
      title: 'Easy Search',
      description: 'Search and compare buses across multiple operators'
    },
    {
      icon: '💺',
      title: 'Seat Selection',
      description: 'Choose your preferred seat with interactive seat layout'
    },
    {
      icon: '💳',
      title: 'Secure Payment',
      description: 'Safe and secure payment options'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Book tickets on the go'
    }
  ];

  return (
    <div className="home">
      <SearchBar />

      <section className="features-section">
        <div className="features-container">
          <h2>Why Choose BusBook?</h2>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Book Your Journey?</h2>
          <p>Browse thousands of buses and find the best deal</p>
          <button className="cta-btn" onClick={() => navigate('/buses')}>
            Browse All Buses
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
