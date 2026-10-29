const G = 'https://groups.roblox.com';

module.exports = (http) => ({
  getGroup: (groupId) => http.request(`${G}/v1/groups/${groupId}`, { auth: false }),
  getRoles: async (groupId) => (await http.request(`${G}/v1/groups/${groupId}/roles`, { auth: false })).roles,
  getUserGroups: async (userId) => (await http.request(`${G}/v2/users/${userId}/groups/roles`, { auth: false })).data,

  async getMembership(groupId, userId) {
    const groups = await this.getUserGroups(userId);
    return groups.find((g) => g.group.id === Number(groupId)) || null;
  },

  setRole: (groupId, userId, roleId) =>
    http.request(`${G}/v1/groups/${groupId}/users/${userId}`, { method: 'PATCH', json: { roleId } }),

  kick: (groupId, userId) => http.request(`${G}/v1/groups/${groupId}/users/${userId}`, { method: 'DELETE' }),

  shout: (groupId, message) => http.request(`${G}/v1/groups/${groupId}/status`, { method: 'PATCH', json: { message } }),

  getJoinRequests: (groupId, limit = 100, cursor) =>
    http.request(`${G}/v1/groups/${groupId}/join-requests`, { query: { limit, cursor, sortOrder: 'Asc' } }),

  handleJoinRequest: (groupId, userId, accept) =>
    http.request(`${G}/v1/groups/${groupId}/join-requests/users/${userId}`, { method: accept ? 'POST' : 'DELETE' }),
  promote: (groupId, userId) => http.request(`${G}/v1/groups/${groupId}/users/${userId}/promote`, { method: 'POST' }),
  demote: (groupId, userId) => http.request(`${G}/v1/groups/${groupId}/users/${userId}/demote`, { method: 'POST' }),
});
