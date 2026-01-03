import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axios from "axios";
import {
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  PieChart,
  Calendar,
} from "lucide-react";

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [documentTypeData, setDocumentTypeData] = useState({
    series: [],
    options: {},
  });
  const [statusData, setStatusData] = useState({ series: [], options: {} });
  const [monthlyTrendsData, setMonthlyTrendsData] = useState({
    series: [],
    options: {},
  });
  const [peakHoursData, setPeakHoursData] = useState({
    series: [],
    options: {},
  });
  const [popularServices, setPopularServices] = useState([]);
  const [summary, setSummary] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { timeRange },
      };

      // Fetch all analytics data
      const [
        overviewRes,
        docTypesRes,
        statusRes,
        trendsRes,
        peakHoursRes,
        servicesRes,
        summaryRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/overview`, config),
        axios.get(`${API_URL}/api/analytics/document-types`, config),
        axios.get(`${API_URL}/api/analytics/status-breakdown`, config),
        axios.get(`${API_URL}/api/analytics/monthly-trends`, config),
        axios.get(`${API_URL}/api/analytics/peak-hours`, config),
        axios.get(`${API_URL}/api/analytics/popular-services`, config),
        axios.get(`${API_URL}/api/analytics/summary`, config),
      ]);

      // Set overview stats
      const statsData = overviewRes.data.data.stats.map((stat) => ({
        ...stat,
        icon: getIconComponent(stat.icon),
        bgColor: `bg-${stat.color}-100`,
        iconColor: `text-${stat.color}-600`,
        darkBg: `dark:bg-${stat.color}-900/20`,
        darkIcon: `dark:text-${stat.color}-400`,
      }));
      setStats(statsData);

      // Set document type distribution
      setDocumentTypeData({
        series: docTypesRes.data.data.series,
        options: {
          chart: {
            type: "donut",
            fontFamily: "Inter, sans-serif",
          },
          labels: docTypesRes.data.data.labels,
          colors: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#6B7280"],
          legend: {
            position: "bottom",
            labels: {
              colors: "#6B7280",
            },
          },
          plotOptions: {
            pie: {
              donut: {
                size: "70%",
              },
            },
          },
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return Math.round(val) + "%";
            },
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 300,
                },
                legend: {
                  position: "bottom",
                },
              },
            },
          ],
        },
      });

      // Set status breakdown
      setStatusData({
        series: statusRes.data.data.series,
        options: {
          chart: {
            type: "bar",
            height: 350,
            toolbar: {
              show: false,
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 8,
              horizontal: false,
              columnWidth: "60%",
            },
          },
          dataLabels: {
            enabled: false,
          },
          colors: ["#3B82F6"],
          xaxis: {
            categories: statusRes.data.data.categories,
            labels: {
              style: {
                colors: "#6B7280",
              },
            },
          },
          yaxis: {
            labels: {
              style: {
                colors: "#6B7280",
              },
            },
          },
          grid: {
            borderColor: "#E5E7EB",
          },
        },
      });

      // Set monthly trends
      setMonthlyTrendsData({
        series: trendsRes.data.data.series,
        options: {
          chart: {
            type: "area",
            height: 350,
            toolbar: {
              show: false,
            },
            zoom: {
              enabled: false,
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: "smooth",
            width: 2,
          },
          colors: ["#3B82F6", "#10B981"],
          fill: {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.4,
              opacityTo: 0.1,
            },
          },
          xaxis: {
            categories: trendsRes.data.data.categories,
            labels: {
              style: {
                colors: "#6B7280",
              },
            },
          },
          yaxis: {
            labels: {
              style: {
                colors: "#6B7280",
              },
            },
          },
          grid: {
            borderColor: "#E5E7EB",
          },
          legend: {
            position: "top",
            horizontalAlign: "right",
            labels: {
              colors: "#6B7280",
            },
          },
        },
      });

      // Set peak hours
      setPeakHoursData({
        series: peakHoursRes.data.data.series,
        options: {
          chart: {
            type: "line",
            height: 300,
            toolbar: {
              show: false,
            },
          },
          stroke: {
            curve: "smooth",
            width: 3,
          },
          colors: ["#8B5CF6"],
          xaxis: {
            categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            labels: {
              rotate: -45,
              style: {
                colors: "#6B7280",
                fontSize: "10px",
              },
            },
          },
          yaxis: {
            labels: {
              style: {
                colors: "#6B7280",
              },
            },
          },
          grid: {
            borderColor: "#E5E7EB",
          },
          tooltip: {
            x: {
              format: "HH:mm",
            },
          },
        },
      });

      // Set popular services
      setPopularServices(servicesRes.data.data);

      // Set summary
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Users,
      FileText,
      Clock,
      CheckCircle,
    };
    return icons[iconName] || FileText;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 border-3 sm:border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 p-2.5 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Comprehensive overview of barangay services and activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg ${stat.bgColor} ${stat.darkBg}`}
                >
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${stat.iconColor} ${stat.darkIcon}`}
                  />
                </div>
                <div
                  className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs md:text-sm font-medium ${
                    stat.trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <TrendIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  {stat.change}
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4">
                <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </h3>
                <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-white mt-0.5 sm:mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Trends
              </h2>
            </div>
          </div>
          <div className="-mx-2 sm:mx-0">
            <ReactApexChart
              options={monthlyTrendsData.options}
              series={monthlyTrendsData.series}
              type="area"
              height={250}
            />
          </div>
        </div>

        {/* Document Types Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                Document Types Distribution
              </h2>
            </div>
          </div>
          <div className="-mx-2 sm:mx-0">
            <ReactApexChart
              options={documentTypeData.options}
              series={documentTypeData.series}
              type="donut"
              height={250}
            />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Request Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                Request Status Breakdown
              </h2>
            </div>
          </div>
          <div className="-mx-2 sm:mx-0">
            <ReactApexChart
              options={statusData.options}
              series={statusData.series}
              type="bar"
              height={250}
            />
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                Peak Hours Activity
              </h2>
            </div>
          </div>
          <div className="-mx-2 sm:mx-0">
            <ReactApexChart
              options={peakHoursData.options}
              series={peakHoursData.series}
              type="line"
              height={230}
            />
          </div>
        </div>
      </div>

      {/* Popular Services Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow">
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Most Popular Services
            </h2>
          </div>
        </div>
        <div className="p-3 sm:p-4 md:p-6">
          <div className="space-y-3 sm:space-y-4">
            {popularServices.map((service, index) => (
              <div key={index} className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {service.requests} requests
                  </div>
                </div>
                <div className="relative h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${service.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
            <div className="p-2 sm:p-2.5 md:p-3 bg-white/20 rounded-md sm:rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs md:text-sm opacity-90">Avg. Processing Time</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">
                {summary.avgProcessingTime} days
              </p>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm opacity-75">Faster processing than before</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
            <div className="p-2 sm:p-2.5 md:p-3 bg-white/20 rounded-md sm:rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs md:text-sm opacity-90">Active Users Today</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{summary.activeUsersToday}</p>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm opacity-75">Peak hour: {summary.peakHour}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 md:p-6 text-white sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
            <div className="p-2 sm:p-2.5 md:p-3 bg-white/20 rounded-md sm:rounded-lg">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs md:text-sm opacity-90">Satisfaction Rate</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">
                {summary.satisfactionRate}/5.0
              </p>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm opacity-75">Based on user feedback</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
