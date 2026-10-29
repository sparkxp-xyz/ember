const { EmberError } = require('../http/errors');

/** Rank helpers (noblox-style: rank numbers 0-255) built on the groups API. */
module.exports = (groups) => {
  async function roleByRank(groupId, rank) {
    const role = (await groups.getRoles(groupId)).find((r) => r.rank === Number(rank));
    if (!role) throw new EmberError(`No role with rank ${rank} in group ${groupId}`);
    return role;
  }

  async function getRankInGroup(groupId, userId) {
    const m = await groups.getMembership(groupId, userId);
    return m ? m.role.rank : 0;
  }

  async function getRankNameInGroup(groupId, userId) {
    const m = await groups.getMembership(groupId, userId);
    return m ? m.role.name : 'Guest';
  }

  async function setRank(groupId, userId, rank) {
    const role = await roleByRank(groupId, rank);
    await groups.setRole(groupId, userId, role.id);
    return role;
  }

  async function shift(groupId, userId, dir) {
    const roles = (await groups.getRoles(groupId)).filter((r) => r.rank > 0).sort((a, b) => a.rank - b.rank);
    const current = await getRankInGroup(groupId, userId);
    const idx = roles.findIndex((r) => r.rank === current);
    if (idx === -1) throw new EmberError(`User ${userId} is not a member of group ${groupId}`);
    const next = roles[idx + dir];
    if (!next) throw new EmberError(`No ${dir > 0 ? 'higher' : 'lower'} rank available`);
    await groups.setRole(groupId, userId, next.id);
    return { oldRank: current, newRank: next.rank, role: next };
  }

  return {
    getRankInGroup,
    getRankNameInGroup,
    setRank,
    promote: (g, u) => shift(g, u, 1),
    demote: (g, u) => shift(g, u, -1),
  };
};
