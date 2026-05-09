import api from './client.js';

export const getFeed = (params = {}) => api.get('/feed', { params });
export const createPost = (data) => api.post('/feed', data);
export const likePost = (id) => api.post(`/feed/${id}/like`);
export const commentPost = (id, content) => api.post(`/feed/${id}/comment`, { content });
export const deletePost = (id) => api.delete(`/feed/${id}`);

export const getTeams = (params = {}) => api.get('/teams', { params });
export const createTeam = (data) => api.post('/teams', data);
export const getTeamDetail = (id) => api.get(`/teams/${id}`);
export const joinTeam = (id) => api.post(`/teams/${id}/join`);
export const leaveTeam = (id) => api.post(`/teams/${id}/leave`);


export const patchTeam = (id, data) => api.patch(`/teams/${id}`, data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);
export const acceptJoinRequest = (teamId, requestId) => api.post(`/teams/${teamId}/requests/${requestId}/accept`);
export const rejectJoinRequest = (teamId, requestId) => api.post(`/teams/${teamId}/requests/${requestId}/reject`);
export const updateTeamMember = (teamId, userId, action) => api.patch(`/teams/${teamId}/members/${userId}`, { action });
export const deleteComment = (id) => api.delete(`/feed/comments/${id}`);

export const getChallenges = (params = {}) => {
  const query = params.teamId ? `?teamId=${encodeURIComponent(params.teamId)}` : '';
  return api.get(`/challenges${query}`);
};
export const createChallenge = (data) => api.post('/challenges', data);
export const joinChallenge = (id) => api.post(`/challenges/${id}/join`);
export const updateProgress = (id, progress) => api.patch(`/challenges/${id}/progress`, { progress });
export const getLeaderboard = (id) => api.get(`/challenges/${id}/leaderboard`);
export const toggleChallengeActivity = (challengeId, activityId) =>
  api.post(`/challenges/${challengeId}/activities/${activityId}/toggle`);
export const deleteChallenge = (id) => api.delete(`/challenges/${id}`);
