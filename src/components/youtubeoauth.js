import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const YouTubeOAuth = () => {
  const [channelInfo, setChannelInfo] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      try {
        const response = await axios.get(
          'https://www.googleapis.com/youtube/v3/channels',
          {
            params: {
              part: 'snippet,statistics',
              mine: true,
            },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.data.items && response.data.items.length > 0) {
          const channel = response.data.items[0];
          setChannelInfo({
            name: channel.snippet.title,
            subscribers: channel.statistics.subscriberCount,
            views: channel.statistics.viewCount,
            videos: channel.statistics.videoCount,
          });
        } else {
          console.warn('No channel found');
        }
      } catch (error) {
        console.error('Error fetching YouTube channel info:', error);
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
    },
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  });

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>YouTube Channel Info</h2>
      {!channelInfo ? (
        <button 
          onClick={() => login()} 
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#FF0000', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Sign in with Google
        </button>
      ) : (
        <div>
          <p><strong>Channel Name:</strong> {channelInfo.name}</p>
          <p><strong>Subscribers:</strong> {parseInt(channelInfo.subscribers).toLocaleString()}</p>
          <p><strong>Total Views:</strong> {parseInt(channelInfo.views).toLocaleString()}</p>
          <p><strong>Videos:</strong> {parseInt(channelInfo.videos).toLocaleString()}</p>
          <button 
            onClick={() => setChannelInfo(null)} 
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#4285F4', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Fetch Another Channel
          </button>
        </div>
      )}
    </div>
  );
};

export default YouTubeOAuth;
