import { DynamicWidget, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useState, useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import DynamicMethods from './Methods.js';
import UserInfo from './components/UserInfo.js';
import YouTubeOAuth from './components/youtubeoauth';
import './Main.css';

const checkIsDarkSchemePreferred = () => window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches ?? false;

const Main = () => {
  const isLoggedIn = useIsLoggedIn();
  const [isDarkMode, setIsDarkMode] = useState(checkIsDarkSchemePreferred);
  const { user, isAuthenticated, setShowAuthFlow } = useDynamicContext();
  const [showInfluencerData, setShowInfluencerData] = useState(false);
  const [showYouTubeOAuth, setShowYouTubeOAuth] = useState(false);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setIsDarkMode(checkIsDarkSchemePreferred());
    
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleProfileClick = () => {
    if (isLoggedIn && user?.metadata?.['Type of User'] === 'Influencer') {
      setShowInfluencerData(true);
      setShowYouTubeOAuth(true); 
    }
  };

  console.log("isAuthenticated:", isAuthenticated);
  console.log("user:", user);

  const renderMenuOptions = () => {
    if (user?.metadata?.['Type of User'] === 'Influencer') {
      return (
        <div className="menu-options">
          <div className="menu-option">Bounties</div>

          <div 
            className="menu-option" 
            onClick={handleProfileClick} 
            style={{ cursor: 'pointer' }}
          >
            Profile
          </div>

        </div>
      );
    } else if (user?.metadata?.['Type of User'] === 'Company') {
      return (
        <div className="menu-options">
          <div className="menu-option">Your Bounties</div>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className={`container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <img className="logo" src={isDarkMode ? "/logo-light.png" : "/logo-dark.png"} alt="dynamic" />
        <div className="left-menu">
          {renderMenuOptions()}
        </div>
        <div className="header-buttons">
          {isLoggedIn && <DynamicWidget />}
        </div>
      </div>

      <div className="modal">
        {!isLoggedIn && (
          <button
            onClick={() => setShowAuthFlow(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.3s',
              fontWeight: 'bold',
              backgroundColor: '#007bff',
              color: '#fff',
              marginLeft: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Log in or Sign Up
          </button>
        )}
         {/* Conditional rendering for influencer data */}
        {isLoggedIn && showInfluencerData && (
          <UserInfo />
        )}

        {showYouTubeOAuth && (
              <div style={{ marginTop: '20px' }}>
                <YouTubeOAuth />
              </div>
            )}

      </div>
      <div className="footer">
        <div className="footer-text">Made with ❤️ by dynamic</div>
        <img className="footer-image" src={isDarkMode ? "/image-dark.png" : "/image-light.png"} alt="dynamic" />
      </div>
    </div> 
  );
}

export default Main;
