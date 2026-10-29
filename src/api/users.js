module.exports = (http) => ({
  getUserInfo: (userId) => http.request(`https://users.roblox.com/v1/users/${userId}`, { auth: false }),

  async getIdFromUsername(username) {
    const r = await http.request('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      json: { usernames: [username], excludeBannedUsers: false },
      auth: false,
    });
    return r.data[0] ? r.data[0].id : null;
  },

  async getUsernameFromId(userId) {
    return (await http.request(`https://users.roblox.com/v1/users/${userId}`, { auth: false })).name;
  },

  async searchUsers(keyword, limit = 10) {
    return (await http.request('https://users.roblox.com/v1/users/search', { query: { keyword, limit }, auth: false })).data;
  },
});
