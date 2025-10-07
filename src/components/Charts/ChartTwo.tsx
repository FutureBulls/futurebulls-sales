import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { getAnalyticsData } from "@/app/services/razorpay.service";

interface DataStatsOneProps {
  data: any;
  loading: boolean;
}

const ChartTwo: React.FC<DataStatsOneProps> = ({ data, loading }) => {
  const [timeFilteredData, setTimeFilteredData] = useState<any>(null);
  const getWeekdayInitial = (dateString: string) => {
    const date = new Date(dateString);
    const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
    return weekdays[date.getDay()];
  };
  const series = [
    {
      name: "Amount Received",
      data: timeFilteredData
        ? timeFilteredData.map((data: any) => data.amountReceived || 0)
        : [],
    },
    {
      name: "Amount Due",
      data: timeFilteredData
        ? timeFilteredData.map((data: any) => data.amountDue || 0)
        : [],
    },
  ];
  const options: ApexOptions = {
    colors: ["#5750F1", "#0ABEF9"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 335,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 3,
              columnWidth: "25%",
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 3,
        columnWidth: "25%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: {
      enabled: false,
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
    xaxis: {
      categories: timeFilteredData
        ? timeFilteredData.map((data: any) => getWeekdayInitial(data.date))
        : [],
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",
      markers: {
        radius: 99,
        width: 16,
        height: 16,
        strokeWidth: 10,
        strokeColor: "transparent",
      },
    },
    fill: {
      opacity: 1,
    },
  };
  useEffect(() => {
    // const response = await getAnalyticsData(null);
    // const data = response.data?.data;
    const currentDate = new Date();
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(currentDate.getDate() - index);
      return date.toISOString().split("T")[0];
    });
    const filteredData = data?.timeFilteredData?.daily.filter((entry: any) =>
      last7Days.includes(entry.date),
    );
    const sortedDailyData = filteredData?.sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    setTimeFilteredData(sortedDailyData);
  }, [data]);
  return (
    <div className="col-span-12 rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-5">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            Profit this week
          </h4>
        </div>
        <div>
          {/* <DefaultSelectOption options={["This Week", "Last Week"]} /> */}
        </div>
      </div>
      <div>
        <div id="chartTwo" className="-ml-3.5">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={370}
          />
        </div>
      </div>
    </div>
  );
};
export default ChartTwo;
