export function getRoleHome(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'COACH') return '/coach';
  if (role === 'NUTRITIONIST') return '/nutritionist';
  return '/app';
}
