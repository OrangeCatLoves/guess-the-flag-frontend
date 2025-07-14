import React from 'react';

export default function InviteModal({
  invitation,
  onAccept,
  onReject
}) {
  const { username, guest, duelvictories } = invitation;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff', borderRadius: '0.5rem', padding: '1.5rem',
        width: '90%', maxWidth: 360,
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
          {username}{guest ? ' (Guest)' : ''} would like to duel with you! 🏆 {duelvictories}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onAccept} style={buttonStyle}>Accept</button>
          <button onClick={onReject} style={buttonStyle}>Reject</button>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem',
  cursor: 'pointer', background: '#28a745', color: '#fff'
};