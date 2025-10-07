"use client";
import React, { useEffect, useState } from "react";
import ChartTwo from "../Charts/ChartTwo";
import DataStatsOne from "@/components/DataStats/DataStatsOne";
import ChartOne from "@/components/Charts/ChartOne";
import {
  fetchCsvData,
  getAnalyticsData,
  getAnalyticsUserData,
  getSalesUserList,
} from "@/app/services/razorpay.service";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { DateRangePicker } from "../DateRangeOicker/page";
import dayjs from "dayjs";
import Swal from 'sweetalert2';
import Papa from "papaparse";

const ECommerce: React.FC = () => {
  const [userDataList, setUserDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [csvLoading, setCsvLoading] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.user.userData);
  const [userList, setUserList] = useState<any[]>([]);
  const [filterUser, setFilterUser] = useState<string>("");
  const [data, setData] = useState<any>();
  const [startDate, setStartDate] = useState<string | any>(null);
  const [endDate, setEndDate] = useState<string | any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (
          filterUser &&
          startDate &&
          endDate &&
          dayjs.isDayjs(startDate) && startDate.isValid() &&
          dayjs.isDayjs(endDate) && endDate.isValid()
        ) {
          response = await getAnalyticsUserData(
            filterUser,
            startDate.format("YYYY-MM-DD"),
            endDate.format("YYYY-MM-DD")
          );
        } else {
          response = await getAnalyticsData();
        }
        setUserDataList(response.data?.data || []);
        setData(response?.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterUser, startDate, endDate]);

  useEffect(() => {
    if (user && user?.data?.role.includes("ADMIN")) {
      const fetchData = async () => {
        try {
          const response = await getSalesUserList();
          setUserList(response.data.users);
        } catch (error) {
          console.error("Error fetching sales employee names:", error);
        }
      };
      fetchData();
    }
  }, [user]);

  const downloadCSV = async () => {
    if (!startDate || !endDate) {
      Swal.fire({
        title: "Error While Downloading CSV",
        text: "Please select a date range to download the CSV",
        icon: "error",
        confirmButtonColor: "#3085d6",

      });
      return;
    }
    setCsvLoading(true);
    try {
      const data = await fetchCsvData(startDate, endDate, filterUser);

      if (!data.data) {
        Swal.fire({
          title: "Error While Downloading CSV",
          text: "No valid data available to download.",
          icon: "error",
          confirmButtonColor: "#3085d6",

        });
        return;
      }

      if (data.data.length === 0) {
        Swal.fire({
          title: "Error While Downloading CSV",
          text: "No valid data available to download.",
          icon: "error",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
      const formattedData = data.data?.data?.map((item: any) => ({
        status: (item.status === "Completed" || item.status === "captured") ? "Paid" : (item.status || "_"),
        Amount: item.amount || "_",
        "Remaining Amount": item.remainingAmount || "_",
        "BDA Discount": item.bdaDiscount || "_",
        "Customer Name": item.customerName || "_",
        "Customer Email": item.customerEmail || "_",
        "Customer Phone": item.customerPhone || "_",
        "Payment ID": item.paymentId || "_",
        "Order ID": item.orderId || "_",
        "Source": item.Source || "_",
        "Paid On": item.paid_on || "_",
        "Course": item.courseTitle || "_",
        "Tutor Name": item.tutorName || "_",
        "BDA Name": item?.userId?.name || "_",
        "BDA Email": item?.userId?.email || "_",
        "Mode of Payment": item?.paymentMethod || "_",
        "customerState": item?.customerState || "_",
      }));
      const csv = Papa.unparse(formattedData);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "StockZy_Learning_Analytics_Report.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error: any) {
      Swal.fire({
        title: "Message",
        text: error?.response?.data?.message || "Error while downloading CSV",
        icon: "error",
        confirmButtonColor: "#3085d6",

      });

    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
        <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">StockZy Analytics Dashboard</h1>
        <p className="text-gray-6 dark:text-gray-5">Monitor your learning platform performance and student engagement</p>
      </div>

      {/* Controls Section */}
      {user && user.data.role.includes("ADMIN") && (
        <div className="bg-white dark:bg-dark-2 rounded-xl p-6 shadow-sm border border-stroke dark:border-stroke-dark">
          <h2 className="text-lg font-semibold text-dark dark:text-white mb-4">Analytics Controls</h2>
          <div className="flex w-full flex-grow flex-col items-center justify-between gap-4 md:w-1/2 md:flex-row">
            <select
              id="status"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="block w-full rounded-lg border border-stroke bg-white dark:bg-dark-3 dark:border-stroke-dark px-4 py-3 text-dark dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All Users</option>
              {userList.map((user: any) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <DateRangePicker onDateChange={(dates) => {
              setStartDate(dates?.[0]?.format("YYYY-MM-DD") || null);
              setEndDate(dates?.[1]?.format("YYYY-MM-DD") || null);
            }} />
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white dark:bg-dark-2 rounded-xl p-6 shadow-sm border border-stroke dark:border-stroke-dark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-dark dark:text-white">Export Data</h3>
            <p className="text-gray-6 dark:text-gray-5 text-sm">Download comprehensive reports for analysis</p>
          </div>
          <button
            onClick={downloadCSV}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={csvLoading}
          >
            {csvLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Downloading...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download CSV</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <DataStatsOne data={data} loading={loading} />
      
      {/* Charts Section */}
      <div className="grid grid-cols-12 gap-6">
        <ChartOne data={data?.data} loading={loading} />
        <ChartTwo data={data?.data} loading={loading} />
      </div>
    </div>
  );
};

export default ECommerce;
