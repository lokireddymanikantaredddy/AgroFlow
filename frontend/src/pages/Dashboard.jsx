import { useQuery } from 'react-query';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  CurrencyDollarIcon, 
  CubeIcon, 
  ExclamationTriangleIcon as ExclamationIcon, 
  CreditCardIcon 
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        drawBorder: false
      },
      ticks: {
        callback: (value) => formatCurrency(value)
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'end'
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`
      }
    }
  }
};

const Dashboard = () => {
  const { data: summary, isLoading: summaryLoading } = useQuery('summary', () =>
    axios.get('/api/dashboard/summary').then(res => res.data),
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  const { data: salesTrends, isLoading: trendsLoading } = useQuery('salesTrends', () =>
    axios.get('/api/dashboard/sales-trends?period=weekly').then(res => res.data),
    { refetchInterval: 30000 }
  );

  const { data: topProducts } = useQuery('topProducts', () =>
    axios.get('/api/dashboard/top-products').then(res => res.data),
    { refetchInterval: 30000 }
  );

  if (summaryLoading || trendsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agro-green"></div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(summary?.todayRevenue || 0),
      icon: CurrencyDollarIcon,
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Total Products',
      value: summary?.totalProducts || 0,
      icon: CubeIcon,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Low Stock Items',
      value: summary?.lowStockProducts || 0,
      icon: ExclamationIcon,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Pending Credit',
      value: formatCurrency(summary?.pendingCredit || 0),
      icon: CreditCardIcon,
      color: 'bg-red-100 text-red-800'
    }
  ];

  const salesChartData = {
    labels: salesTrends?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Sales',
        data: salesTrends?.map(item => item.total) || [],
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <card.icon
                    className={`h-6 w-6 ${card.color}`}
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Sales Trend</h2>
          <div className="h-[300px]">
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Products</h2>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: topProducts?.map(p => p.name) || [],
                datasets: [
                  {
                    label: 'Units Sold',
                    data: topProducts?.map(p => p.totalQuantity) || [],
                    backgroundColor: '#388E3C'
                  }
                ]
              }}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    ticks: {
                      callback: (value) => Math.round(value) // Show whole numbers for units
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 