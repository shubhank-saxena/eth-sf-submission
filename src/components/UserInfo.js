import React from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import './UserInfo.css';

const UserInfo = () => {
  const { user, isDarkMode } = useDynamicContext();

  return (
    <div className={`user-info ${isDarkMode ? 'dark' : 'light'}`}>
      <h1>User Information</h1>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}</p>
    </div>
  );
};

export default UserInfo;
