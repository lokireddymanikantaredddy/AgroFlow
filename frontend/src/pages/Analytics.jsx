import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    start: subMonths(new Date(), 6),
    end: new Date()
  });

  // Fetch credit analytics
  const { data: creditAnalytics, isLoading: loadingCredit } = useQuery(
    ['creditAnalytics', dateRange],
    () => axios.get('/api/analytics/credit', {
      params: {
        startDate: startOfMonth(dateRange.start),
        endDate: endOfMonth(dateRange.end)
      }
    }).then(res => res.data)
  );

  // Fetch payment analytics
  const { data: paymentAnalytics, isLoading: loadingPayments } = useQuery(
    ['paymentAnalytics', dateRange],
    () => axios.get('/api/analytics/payments', {
      params: {
        startDate: startOfMonth(dateRange.start),
        endDate: endOfMonth(dateRange.end)
      }
    }).then(res => res.data)
  );

  // Fetch customer segments
  const { data: customerSegments, isLoading: loadingSegments } = useQuery(
    'customerSegments',
    () => axios.get('/api/analytics/customer-segments').then(res => res.data)
  );

  if (loadingCredit || loadingPayments || loadingSegments) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agro-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>

      {/* Credit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Credit Extended</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ${creditAnalytics?.totalCreditExtended.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Outstanding Credit</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ${creditAnalytics?.outstandingCredit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Average Collection Period</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {creditAnalytics?.averageCollectionPeriod} days
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Credit Utilization</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {creditAnalytics?.creditUtilization}%
          </p>
        </div>
      </div>

      {/* Credit Trends Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Trends</h3>
        <div className="h-80">
          <LineChart
            width={800}
            height={300}
            data={creditAnalytics?.trends}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="extended" name="Credit Extended" stroke="#0088FE" />
            <Line type="monotone" dataKey="collected" name="Credit Collected" stroke="#00C49F" />
          </LineChart>
        </div>
      </div>

      {/* Payment Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status Distribution</h3>
          <div className="h-80">
            <PieChart width={400} height={300}>
              <Pie
                data={paymentAnalytics?.statusDistribution}
                cx={200}
                cy={150}
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentAnalytics?.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Collections</h3>
          <div className="h-80">
            <BarChart
              width={400}
              height={300}
              data={paymentAnalytics?.monthlyCollections}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" name="Collection Amount" fill="#0088FE" />
            </BarChart>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Segments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Credit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Credit Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customerSegments?.map((segment) => (
                <tr key={segment.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {segment.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {segment.customerCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${segment.totalCredit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {segment.averageCreditScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${segment.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                        segment.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                      {segment.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex justify-end space-x-4">
        <input
          type="date"
          value={format(dateRange.start, 'yyyy-MM-dd')}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
          className="border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
        />
        <input
          type="date"
          value={format(dateRange.end, 'yyyy-MM-dd')}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
          className="border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
        />
      </div>
    </div>
  );
};

export default Analytics; 