import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Landing page e HTML original din forja-final, servit ca static file
// Această componentă redirect-ează la landing.html dacă nu e user logat
export default function Landing() {
  useEffect(() => {
    // Redirect to the static HTML landing page
    window.location.replace('/landing.html');
  }, []);
  return null;
}
