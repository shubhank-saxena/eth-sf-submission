import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const YouTubeOAuth = () => {
  const [channelInfo, setChannelInfo] = useState(null);
  const [videoId, setVideoId] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [hashtags, setHashtags] = useState('');
  const [hashtagResults, setHashtagResults] = useState(null);
  const [error, setError] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token;
      setAccessToken(token);
      try {
        const response = await axios.get(
          'https://www.googleapis.com/youtube/v3/channels',
          {
            params: {
              part: 'snippet,statistics',
              mine: true,
            },
            headers: {
              Authorization: `Bearer ${token}`,
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
          setError('No channel found');
        }
      } catch (error) {
        console.error('Error fetching YouTube channel info:', error);
        setError('Error fetching channel info: ' + error.message);
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setError('Login failed: ' + error.message);
    },
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  });

  const fetchVideoInfo = async () => {
    if (!accessToken) {
      setError('Please sign in first');
      return;
    }
    if (!videoId) {
      setError('Please enter a video ID');
      return;
    }

    setError(null);
    setVideoInfo(null);
    setHashtagResults(null);

    try {
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/videos',
        {
          params: {
            part: 'snippet,statistics',
            id: videoId,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.items && response.data.items.length > 0) {
        const video = response.data.items[0];
        setVideoInfo({
          title: video.snippet.title,
          views: video.statistics.viewCount,
          likes: video.statistics.likeCount,
          comments: video.statistics.commentCount,
          description: video.snippet.description,
        });

        checkHashtags(video.snippet.description);
      } else {
        setError('No video found with the given ID');
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
      setError('Error fetching video info: ' + error.message);
    }
  };

  const checkHashtags = (description) => {
    if (!hashtags) {
      setHashtagResults(null);
      return;
    }

    const hashtagList = hashtags.split(',').map(tag => tag.trim().toLowerCase());
    const descriptionLower = description.toLowerCase();
    const results = hashtagList.map(tag => ({
      tag: tag,
      found: descriptionLower.includes(`#${tag}`)
    }));
    setHashtagResults(results);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-center">YouTube Channel Info</h2>
      {!accessToken ? (
        <button
          onClick={() => login()}
          className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
        >
          Sign in with Google
        </button>
      ) : (
        <div>
          {channelInfo && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Channel Information</h3>
              <p><strong>Channel Name:</strong> {channelInfo.name}</p>
              <p><strong>Subscribers:</strong> {parseInt(channelInfo.subscribers).toLocaleString()}</p>
              <p><strong>Total Views:</strong> {parseInt(channelInfo.views).toLocaleString()}</p>
              <p><strong>Videos:</strong> {parseInt(channelInfo.videos).toLocaleString()}</p>
            </div>
          )}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Check Video Info</h3>
            <input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="Enter Video ID"
              className="w-full px-3 py-2 mb-3 border rounded"
            />
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="Enter hashtags (comma-separated)"
              className="w-full px-3 py-2 mb-3 border rounded"
            />
            <button
              onClick={fetchVideoInfo}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
            >
              Fetch Video Info
            </button>
          </div>
          {videoInfo && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Video Information</h3>
              <p><strong>Title:</strong> {videoInfo.title}</p>
              <p><strong>Views:</strong> {parseInt(videoInfo.views).toLocaleString()}</p>
              <p><strong>Likes:</strong> {parseInt(videoInfo.likes).toLocaleString()}</p>
              <p><strong>Comments:</strong> {parseInt(videoInfo.comments).toLocaleString()}</p>
            </div>
          )}
          {hashtagResults && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Hashtag Results</h3>
              {hashtagResults.map((result, index) => (
                <p key={index}>
                  #{result.tag}: {result.found ? '✅ Found' : '❌ Not Found'}
                </p>
              ))}
            </div>
          )}
          {error && (
            <div className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YouTubeOAuth;
