module.exports = (http) => {
  async function avatar(kind, userIds, size, format) {
    const ids = [].concat(userIds);
    const r = await http.request(`https://thumbnails.roblox.com/v1/users/${kind}`, {
      query: { userIds: ids.join(','), size, format, isCircular: false },
      auth: false,
    });
    return r.data;
  }
  return {
    getPlayerThumbnail: (userIds, size = '150x150', format = 'png') => avatar('avatar', userIds, size, format),
    getPlayerHeadshot: (userIds, size = '150x150', format = 'png') => avatar('avatar-headshot', userIds, size, format),
  };
};
