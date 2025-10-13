"use client";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "@/Redux/store";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <SessionProvider>
      <Provider store={store}>
        {children}
      </Provider>
    </SessionProvider>
  );
}
