import api from './client.js';
import { ENDPOINTS } from './endpoints.js';

export const getDashboard = () => api.get(ENDPOINTS.athlete.dashboard);
export const getUser = () => api.get(ENDPOINTS.athlete.user);
export const patchUser = (data) => api.patch(ENDPOINTS.athlete.user, data);
export const getGoals = () => api.get(ENDPOINTS.athlete.goals);
export const putGoals = (data) => api.put(ENDPOINTS.athlete.goals, data);
export const getToday = () => api.get(ENDPOINTS.athlete.today);
export const setWater = (cups) => api.post(ENDPOINTS.athlete.todayWater, { cups });
export const setSteps = (steps) => api.post(ENDPOINTS.athlete.todaySteps, { steps });

export const getExercises = () => api.get(ENDPOINTS.athlete.exercises);
export const getExLib = (q, muscle) =>
  api.get(ENDPOINTS.athlete.exercisesLibrary, { params: { q, muscle } });
export const addExercise = (libId) =>
  api.post(ENDPOINTS.athlete.exercises, { libId });
export const toggleExercise = (id) =>
  api.patch(`${ENDPOINTS.athlete.exercises}/${id}/toggle`);

// Edit an exercise's sets/reps/weight/restSec/name
export const updateExercise = (id, data) =>
  api.patch(`${ENDPOINTS.athlete.exercises}/${id}`, data);
export const deleteExercise = (id) =>
  api.delete(`${ENDPOINTS.athlete.exercises}/${id}`);

// Returns plan assigned by coach (separate from user's own plan)
export const getCoachPlan = () => api.get('/athlete/coach-plan');
export const togglePlanActive = (planId) => api.patch(`/athlete/workouts/${planId}/toggle-active`);
export const getSelfPlanStatus = () => api.get('/athlete/self-plan-status');

// === UPGRADE PLAN ===
export const requestUpgrade = (plan, email) => api.post('/upgrade/request', { plan, email });
export const cancelSubscription = (targetPlan = 'FREE') => api.post('/upgrade/cancel', { targetPlan });
export const getMyUpgradeRequest = () => api.get('/upgrade/my-request');
// Admin
export const adminListUpgrades = () => api.get('/upgrade/admin/list');
export const adminListDowngrades = () => api.get('/upgrade/admin/downgrades');
export const adminApproveUpgrade = (id) => api.post(`/upgrade/admin/${id}/approve`);
export const adminRejectUpgrade = (id, reason) => api.post(`/upgrade/admin/${id}/reject`, { reason });
export const bulkDoneExercises = () =>
  api.patch(`${ENDPOINTS.athlete.exercises}/bulk-done`);
export const clearExercises = () =>
  api.delete(ENDPOINTS.athlete.exercises);

export const getMeals = () => api.get(ENDPOINTS.athlete.meals);
export const addMeal = (foodId, meal) =>
  api.post(ENDPOINTS.athlete.meals, { foodId, meal });
export const deleteMeal = (id) => api.delete(`${ENDPOINTS.athlete.meals}/${id}`);
export const searchFood = (q) =>
  api.get(ENDPOINTS.athlete.food, { params: { q } });
export const addCustomFood = (payload) =>
  api.post(`${ENDPOINTS.athlete.food}/custom`, payload);

export const getSleep = () => api.get(ENDPOINTS.athlete.sleep);
export const logSleep = (bed, wake, quality) =>
  api.post(ENDPOINTS.athlete.sleepLog, { bed, wake, quality });

export const getChat = (teamId) => api.get(teamId ? `${ENDPOINTS.athlete.chat}?teamId=${teamId}` : ENDPOINTS.athlete.chat);
export const sendChat = (msg, teamId) => api.post(ENDPOINTS.athlete.chat, { msg, teamId });

export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append('avatar', file);
  return api.post(ENDPOINTS.athlete.avatar, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const searchApp = (q) =>
  api.get(ENDPOINTS.athlete.search, { params: { q } });
export const getDiscover = (params = {}) => api.get(ENDPOINTS.athlete.discover, { params });
export const getAchievements = () => api.get('/achievements');
export const addDiscoverReview = (professionalId, payload) => api.post(`${ENDPOINTS.athlete.discover}/${professionalId}/reviews`, payload);

export const getWorkoutCurrent = () => api.get(ENDPOINTS.athlete.workoutCurrent);
export const startWorkout = (source = 'self') => api.post(ENDPOINTS.athlete.workoutStart, { source });
export const completeSet = (exerciseId) =>
  api.patch(ENDPOINTS.athlete.workoutSet, { exerciseId });
export const finishWorkout = () => api.post(ENDPOINTS.athlete.workoutFinish);
export const abandonWorkout = () => api.post(ENDPOINTS.athlete.workoutAbandon);
export const getWorkoutHistory = () => api.get(ENDPOINTS.athlete.workoutHistory);
export const getWorkoutHistory7Days = () => api.get('/workout/history-7days');
export const getTodayWorkoutProgress = () => api.get('/workout/today-progress');
export const getNutritionHistory7Days = () => api.get('/athlete/nutrition/history-7days');

// === BATCH 1: Profesioniștii mei (coach + nutritionist relationships) ===
export const getMyProfessionals = () =>
  api.get('/user/professionals');

export const requestProfessional = (professionalId) =>
  api.post('/user/professionals/request', { professionalId });

export const removeProfessionalLink = (type, linkId) =>
  api.delete(`/user/professionals/${type}/${linkId}`);

export const acceptProfessionalInvite = (type, linkId) =>
  api.post(`/user/professionals/${type}/${linkId}/accept`);

export const rejectProfessionalInvite = (type, linkId) =>
  api.post(`/user/professionals/${type}/${linkId}/reject`);
