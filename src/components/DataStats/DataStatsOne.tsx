"use client";
import React, { useEffect, useState } from "react";
import { dataStats } from "@/types/dataStats";
import { getAnalyticsData } from "@/app/services/razorpay.service";

interface DataStatsOneProps {
  data: any;
  loading: boolean;
}

const DataStatsOne: React.FC<DataStatsOneProps> = ({ data, loading }) => {
  const dataStatsList = [
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "from-primary to-primary/80",
      title: "Total Revenue",
      value: data?.data?.summary?.linkCreated || 0,
      subtitle: "Course enrollments",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "from-secondary to-secondary/80",
      title: "Active Students",
      value: data?.data?.summary?.linkPaid || 0,
      subtitle: "Currently enrolled",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "from-accent to-accent/80",
      title: "Pending Payments",
      value: data?.data?.summary?.linkPending || 0,
      subtitle: "Awaiting completion",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "from-orange-light to-orange-light/80",
      title: "Course Completion",
      value: data?.data?.summary?.linkPartial || 0,
      subtitle: "Students graduated",
    },
  ];

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true); // Set loading to true before fetching data
  //     try {
  //       const response = await getAnalyticsData(); // Replace with your API endpoint
  //       setData(response.data); // Assuming the data format is correct for the chart
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setLoading(false); // Stop loading once the data is fetched
  //     }
  //   };

  //   fetchData(); // Call the fetch function
  // }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {dataStatsList.map((item, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-stroke dark:bg-dark-2 dark:border-stroke-dark hover:shadow-md transition-all duration-300"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            <div className="relative">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-white shadow-sm`}>
                {item.icon}
              </div>

              <div className="mt-4">
                <h4 className="text-2xl font-bold text-dark dark:text-white mb-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-3 dark:bg-dark-4 rounded animate-pulse"></div>
                  ) : (
                    item.value?.toLocaleString() || 0
                  )}
                </h4>
                <p className="text-sm font-semibold text-gray-7 dark:text-gray-6 mb-1">
                  {item.title}
                </p>
                <p className="text-xs text-gray-5 dark:text-gray-6">
                  {item.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DataStatsOne;
