import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/auth';

export default function InterviewerDashboard() {
  const { token, logout } = useAuth();
  const [list, setList] = useState([]);
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    try {
      const res = await axios.get(`${API_BASE}/api/interviews`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setList(res.data);
    } catch (err) {
      console.error('Error fetching interviews:', err);
    }
  }

  async function submitFeedback(id) {
    try {
      const payload = comments[id] || { rating: 'Good', comments: 'Well done' };
      await axios.post(
        `${API_BASE}/api/interviews/${id}/feedback`,
        payload,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      fetchList();
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  }

  return (
    <div className="container">
      <header className="topbar">
        <h1>Interviewer Dashboard</h1>
        <div>
          <button onClick={logout} className="btn-ghost">
            Logout
          </button>
        </div>
      </header>

      <div className="stats">
        <div className="stat">
          <div className="stat-title">Upcoming</div>
          <div className="stat-value">
            {list.filter((i) => i.status === 'scheduled' && new Date(i.datetime) > new Date()).length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Completed</div>
          <div className="stat-value">{list.filter((i) => i.status === 'completed').length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Total</div>
          <div className="stat-value">{list.length}</div>
        </div>
      </div>

      {/* UPCOMING INTERVIEWS */}
      <section className="panel">
        <h3>Upcoming Interviews</h3>
        {list
          .filter((i) => i.status === 'scheduled' && new Date(i.datetime) > new Date())
          .map((iv) => (
            <div className="iv" key={iv._id}>
              <div>
                <strong>{iv.candidate?.name}</strong>
                <div className="muted">{new Date(iv.datetime).toLocaleString()}</div>
              </div>

              <div style={{ minWidth: 260 }}>
                <select
                  onChange={(e) =>
                    setComments({
                      ...comments,
                      [iv._id]: {
                        ...(comments[iv._id] || {}),
                        rating: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">Select Rating</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>

                <input
                  placeholder="Comments"
                  onChange={(e) =>
                    setComments({
                      ...comments,
                      [iv._id]: {
                        ...(comments[iv._id] || {}),
                        comments: e.target.value,
                      },
                    })
                  }
                />

                <button className="primary" onClick={() => submitFeedback(iv._id)}>
                  Submit Feedback
                </button>
              </div>
            </div>
          ))}
      </section>

      {/* COMPLETED INTERVIEWS */}
      <section className="panel">
        <h3>Completed Interviews</h3>
        {list
          .filter((i) => i.status === 'completed')
          .map((iv) => (
            <div className="iv" key={iv._id}>
              <div>
                <strong>{iv.candidate?.name}</strong>
                <div className="muted">{new Date(iv.datetime).toLocaleString()}</div>
              </div>
              <div>
                {iv.feedback?.length ? (
                  iv.feedback.map((f) => (
                    <div key={f._id}>
                      <b>{f.rating}</b> — {f.comments}
                    </div>
                  ))
                ) : (
                  <div>No feedback submitted</div>
                )}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
