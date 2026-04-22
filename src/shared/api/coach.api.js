import api from './client.js';
import { ENDPOINTS } from './endpoints.js';

export const getCoachTeam = () => api.get(ENDPOINTS.coach.team);
export const getCoachAthletes = () => api.get(ENDPOINTS.coach.athletes);
export const getCoachAthlete = (id) => api.get(`${ENDPOINTS.coach.athletes}/${id}`);
export const getCoachWorkouts = () => api.get(ENDPOINTS.coach.workouts);
export const getCoachWorkout = (id) => api.get(`${ENDPOINTS.coach.workouts}/${id}`);
export const getCoachMessages = () => api.get(ENDPOINTS.coach.messages);
export const coachInviteAthlete = (data) => api.post(`${ENDPOINTS.coach.athletes}/invite`, data);
export const coachCreateWorkout = (data) => api.post(ENDPOINTS.coach.workouts, data);
export const coachReplyMessage = (id, msg) =>
  api.post(`${ENDPOINTS.coach.messages}/${id}/reply`, { msg });
export const coachReadMessage = (id) =>
  api.patch(`${ENDPOINTS.coach.messages}/${id}/read`);
export const coachAssignWorkout = (id, athleteIds) =>
  api.post(`${ENDPOINTS.coach.workouts}/${id}/assign`, { athleteIds });
