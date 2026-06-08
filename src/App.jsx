import React, { useState } from 'react';
import Submissions from './Submissions';
import Users from './Users';
import './App.css';

export default function App() {
  const [page, setPage] = useState('submissions');

  return (
    <div className="admin">
      <div className="sidebar">
        <div className="logo">🌿 EcoQuest<br/><span>Admin</span></div>
        <button className={page === 'submissions' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setPage('submissions')}>📸 Submissions</button>
        <button className={page === 'users' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setPage('users')}>👥 Users</button>
      </div>
      <div className="content">
        {page === 'submissions' ? <Submissions /> : <Users />}
      </div>
    </div>
  );
}