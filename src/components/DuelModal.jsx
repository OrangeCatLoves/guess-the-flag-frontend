import React from 'react';

export default function DuelModal({
  users,             // array of { userId, username, victories }
  selectedId,
  onSelect,         // fn(userId)
  onSend,
  onClose
}) {
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          background: '#fff', borderRadius: '0.5rem', padding: '1.5rem',
          width: '90%', maxWidth: 400, maxHeight: '80vh', overflowY: 'auto',
          boxSizing: 'border-box', textAlign: 'center'
        }}
      >
        <h3>Select your opponent</h3>
        <div style={{ margin: '1rem 0' }}>
          {users.map(u => {
            const isSelected = u.userId === selectedId;
            return (
              <div
                key={u.userId}
                onClick={() => onSelect(u.userId)}
                style={{
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  border: isSelected ? '2px solid #28a745' : '1px solid #ccc',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isSelected ? '#e6ffe6' : '#fafafa'
                }}
              >
                <span>{u.username} {u.guest && '(Guest)'}</span>
                <span>🏆 {u.duelvictories}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onSend}
          disabled={!selectedId}
          style={{
            background: selectedId ? '#28a745' : '#aaa',
            color: '#fff', border: 'none', padding: '0.5rem 1rem',
            borderRadius: '0.25rem', cursor: selectedId ? 'pointer' : 'not-allowed',
            marginRight: '0.5rem'
          }}
        >
          Send Request
        </button>
        <button
          onClick={onClose}
          style={{
            background: '#ccc', color: '#000', border: 'none',
            padding: '0.5rem 1rem', borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
