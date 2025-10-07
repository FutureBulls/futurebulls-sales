import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

interface DataStatsOneProps {
  data: any;
  loading: boolean;
}

const ChartOne: React.FC<DataStatsOneProps> = ({ data, loading }) => {
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [dueAmount, setDueAmount] = useState<number>(0);
  // const [loading, setLoading] = useState<boolean>(true);

  const [selectedFilter, setSelectedFilter] = useState<string>("Daily");
  const [daily, setDaily] = useState<any>([]);
  const [timeFilteredData, setTimeFilteredData] = useState<any>([]);
  const [weekly, setWeekly] = useState<any>([]);
  const [monthly, setMonthly] = useState<any>([]);
  const [yearly, setYearly] = useState<any>([]);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#5750F1", "#0ABEF9"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    stroke: {
      curve: "smooth",
    },
    markers: {
      size: 0,
    },
    grid: {
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: true,
      },
      y: {
        title: {
          formatter: (seriesName) => seriesName,
        },
      },
      marker: {
        show: false,
      },
    },
    xaxis: {
      type: "category",
      categories: timeFilteredData.map((data: any) => {
        const date = new Date(data.date);
        return selectedFilter === "Daily"
          ? date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : selectedFilter === "Weekly"
            ? `Week ${data.week}`
            : selectedFilter === "Monthly"
              ? `${data.month} ${data.year}`
              : data.year;
      }),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  // Fetch data and apply filter
  useEffect(() => {

    // Ensure that all data is fetched before setting the filter
    setReceivedAmount(data?.summary?.amountReceived || 0);
    setDueAmount(data?.summary?.amountDue || 0);

    // Sort the daily data by date in ascending order
    const sortedDaily = [...(data?.timeFilteredData?.daily || [])].sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Set the sorted daily data and other filters
    setDaily(sortedDaily);
    setWeekly(data?.timeFilteredData?.weekly || []);
    setMonthly(data?.timeFilteredData?.monthly || []);
    setYearly(data?.timeFilteredData?.yearly || []);

    // Set the initial timeFilteredData to the sorted daily data
    setTimeFilteredData(sortedDaily);
  }, [data]); // Empty dependency array ensures this runs only once on mount

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    let filteredData = [];
  
    switch (filter) {
      case "Daily":
        filteredData = [...daily];
        // Sort by date in ascending order for Daily data
        filteredData = [...filteredData].sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        break;
        
      case "Weekly":
        filteredData = [...weekly];
        // Sort by week in ascending order
        filteredData = filteredData.sort((a: any, b: any) => a.week - b.week);
        break;
        
      case "Monthly":
        filteredData = [...monthly];
        // Sort by year first, then by month in ascending order
        filteredData = filteredData.sort((a: any, b: any) => {
          if (a.year === b.year) {
            return new Date(`${a.month} 1, ${a.year}`).getMonth() - new Date(`${b.month} 1, ${b.year}`).getMonth();
          }
          return a.year - b.year;
        });
        break;
        
      case "Yearly":
        filteredData = [...yearly];
        // Sort by year in ascending order
        filteredData = filteredData.sort((a: any, b: any) => a.year - b.year);
        break;
        
      default:
        filteredData = daily;
        filteredData = [...filteredData].sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
    }
  
    // Set the filtered and sorted data
    setTimeFilteredData(filteredData);
  };
  

  return (
    <div className="col-span-12 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <div className="mb-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            Payments Overview
          </h4>
        </div>
        <div className="flex items-center gap-2.5">
          <p className="font-medium uppercase text-dark dark:text-dark-6">
            Short by:
          </p>
          <select
            onChange={(e) => handleFilterChange(e.target.value)}
            className="rounded border p-2"
            value={selectedFilter}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div>
        {loading ? (
          <p>Loading chart...</p>
        ) : timeFilteredData.length > 0 ? (
          <div className="-ml-4 -mr-5">
            <ReactApexChart
              options={options}
              series={[
                {
                  name: "Received Amount",
                  data: timeFilteredData.map((data: any) =>
                    data.amountReceived.toFixed(2),
                  ),
                },
                {
                  name: "Due Amount",
                  data: timeFilteredData.map((data: any) =>
                    data.amountDue.toFixed(2),
                  ),
                },
              ]}
              type="area"
              height={310}
            />
          </div>
        ) : (
          <p>No data available for the selected filter.</p>
        )}
      </div>
      <div className="flex flex-col gap-2 text-center xsm:flex-row xsm:gap-0">
        <div className="border-stroke dark:border-dark-3 xsm:w-1/2 xsm:border-r">
          <p className="font-medium">Total Received Amount</p>
          <h4 className="mt-1 text-xl font-bold text-dark dark:text-white">
            ₹ {receivedAmount.toFixed(2)}
          </h4>
        </div>
        <div className="xsm:w-1/2">
          <p className="font-medium">Total Due Amount</p>
          <h4 className="mt-1 text-xl font-bold text-dark dark:text-white">
            ₹ {dueAmount.toFixed(2)}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
