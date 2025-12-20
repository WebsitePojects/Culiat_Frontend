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
      // Error fetching analytics data - silently fail
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comprehensive overview of barangay services and activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-lg ${stat.bgColor} ${stat.darkBg}`}
                >
                  <Icon
                    className={`w-6 h-6 ${stat.iconColor} ${stat.darkIcon}`}
                  />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Trends
              </h2>
            </div>
          </div>
          <ReactApexChart
            options={monthlyTrendsData.options}
            series={monthlyTrendsData.series}
            type="area"
            height={300}
          />
        </div>

        {/* Document Types Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Document Types Distribution
              </h2>
            </div>
          </div>
          <ReactApexChart
            options={documentTypeData.options}
            series={documentTypeData.series}
            type="donut"
            height={300}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Request Status Breakdown
              </h2>
            </div>
          </div>
          <ReactApexChart
            options={statusData.options}
            series={statusData.series}
            type="bar"
            height={300}
          />
        </div>

        {/* Peak Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Peak Hours Activity
              </h2>
            </div>
          </div>
          <ReactApexChart
            options={peakHoursData.options}
            series={peakHoursData.series}
            type="line"
            height={280}
          />
        </div>
      </div>

      {/* Popular Services Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Most Popular Services
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {popularServices.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {service.requests} requests
                  </div>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Avg. Processing Time</p>
              <p className="text-2xl font-bold">
                {summary.avgProcessingTime} days
              </p>
            </div>
          </div>
          <p className="text-sm opacity-75">Faster processing than before</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Active Users Today</p>
              <p className="text-2xl font-bold">{summary.activeUsersToday}</p>
            </div>
          </div>
          <p className="text-sm opacity-75">Peak hour: {summary.peakHour}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Satisfaction Rate</p>
              <p className="text-2xl font-bold">
                {summary.satisfactionRate}/5.0
              </p>
            </div>
          </div>
          <p className="text-sm opacity-75">Based on user feedback</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
