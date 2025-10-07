"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
};

export default Dashboard;
