import React, { useEffect, useState } from 'react';
import { usersApi, type UserDto } from '../services/api';

const roleColors: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
  MEMBER: { bg: 'bg-surface-variant', text: 'text-on-surface-variant' },
};

const Team: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await usersApi.getAll();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load team members', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-md text-on-surface-variant">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="font-body-sm text-body-sm">Loading team...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl flex flex-col gap-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">Team Members</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-unit">
            {users.length} member{users.length !== 1 ? 's' : ''} in your workspace.
          </p>
        </div>
      </div>

      {/* Tools & Filters */}
      <div className="flex flex-col sm:flex-row gap-md justify-between items-center bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            className="w-full pl-[36px] pr-md py-sm bg-surface-bright border border-outline-variant rounded-lg font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder="Search team..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Showing {filteredUsers.length} of {users.length}
        </span>
      </div>

      {/* Members List */}
      <div className="flex flex-col gap-sm">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] opacity-30 mb-md">person_off</span>
            <p className="font-body-md text-body-md">No team members found.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const role = roleColors[user.role] || roleColors.MEMBER;
            return (
              <div key={user.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col sm:flex-row sm:items-center justify-between gap-md shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg border border-outline-variant">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-h3 text-h3 text-on-background">{user.name}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-lg sm:w-[300px]">
                  <div className="flex flex-col gap-unit">
                    <span className={`${role.bg} ${role.text} font-label-caps text-label-caps px-sm py-[2px] rounded-full w-fit`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Active</span>
                  </div>
                  <button className="text-outline hover:text-on-background transition-colors p-xs rounded-lg hover:bg-surface-container">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Team;
