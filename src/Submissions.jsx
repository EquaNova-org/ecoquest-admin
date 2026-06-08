import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('pending');

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('submissions')
      .select('*, users(username)')
      .eq('status', filter)
      .order('submitted_at', { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, [filter]);

  const approve = async (sub) => {
    const points = 10; // points awarded per approved photo
    await supabase.from('submissions').update({
      status: 'approved',
      points_awarded: points,
      reviewed_at: new Date().toISOString()
    }).eq('id', sub.id);

    // Add points to user
    const { data: user } = await supabase
      .from('users').select('points').eq('id', sub.user_id).single();
    await supabase.from('users').update({ points: user.points + points }).eq('id', sub.user_id);

    fetchSubmissions();
  };

  const reject = async (id) => {
    await supabase.from('submissions').update({
      status: 'rejected',
      reviewed_at: new Date().toISOString()
    }).eq('id', id);
    fetchSubmissions();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Photo Submissions</h1>
        <div className="filters">
          {['pending','approved','rejected'].map(f => (
            <button key={f} className={filter === f ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <p className="loading">Loading...</p> : (
        <div className="grid">
          {submissions.length === 0 && <p className="empty">No {filter} submissions</p>}
          {submissions.map(sub => (
            <div key={sub.id} className="card">
              <img src={sub.photo_url} alt="submission" className="photo" />
              <div className="card-body">
                <p className="card-user">👤 {sub.users?.username}</p>
                <p className="card-date">{new Date(sub.submitted_at).toLocaleString()}</p>
                <span className={`badge badge-${sub.status}`}>{sub.status}</span>
                {sub.status === 'pending' && (
                  <div className="card-actions">
                    <button className="btn-approve" onClick={() => approve(sub)}>✅ Approve</button>
                    <button className="btn-reject"  onClick={() => reject(sub.id)}>❌ Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}