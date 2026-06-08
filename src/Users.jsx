import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export default function Users() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('points', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const approveUser = async (user) => {
    // Mark user as approved
    await supabase.from('users').update({ is_approved: true }).eq('id', user.id);

    // Grant referral points if they were referred
    if (user.referred_by) {
      await supabase.rpc('grant_referral_points', {
        p_referred_id: user.id,
        p_points: 50
      });
    }
    fetchUsers();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <p className="subtitle">{users.length} total users</p>
      </div>

      {loading ? <p className="loading">Loading...</p> : (
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Points</th>
              <th>Referral Code</th>
              <th>Referred By</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td><strong>{user.points}</strong></td>
                <td><code>{user.referral_code}</code></td>
                <td>{user.referred_by ? '✅ Yes' : '—'}</td>
                <td>
                  <span className={`badge badge-${user.is_approved ? 'approved' : 'pending'}`}>
                    {user.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td>
                  {!user.is_approved && (
                    <button className="btn-approve" onClick={() => approveUser(user)}>
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}