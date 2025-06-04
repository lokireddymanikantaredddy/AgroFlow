import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const REPORT_TYPES = {
  CUSTOMER_STATEMENTS: 'customer_statements',
  PAYMENT_HISTORY: 'payment_history',
  CREDIT_ANALYSIS: 'credit_analysis',
  AGING_REPORT: 'aging_report',
  COLLECTION_PERFORMANCE: 'collection_performance'
};

const ReportGenerator = ({ onClose }) => {
  const [reportType, setReportType] = useState(REPORT_TYPES.CUSTOMER_STATEMENTS);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  // Fetch customers for selection
  const { data: customers } = useQuery('customers', () =>
    axios.get('/api/customers').then(res => res.data)
  );

  const handleCustomerSelection = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await axios.post('/api/reports/generate', {
        type: reportType,
        startDate: dateRange.start,
        endDate: dateRange.end,
        customers: selectedCustomers.length > 0 ? selectedCustomers : undefined,
        format
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_${format(new Date(), 'yyyy-MM-dd')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report generated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Report generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Generate Report</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {/* Report Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-agro-green focus:border-agro-green sm:text-sm rounded-md"
          >
            <option value={REPORT_TYPES.CUSTOMER_STATEMENTS}>Customer Statements</option>
            <option value={REPORT_TYPES.PAYMENT_HISTORY}>Payment History</option>
            <option value={REPORT_TYPES.CREDIT_ANALYSIS}>Credit Analysis</option>
            <option value={REPORT_TYPES.AGING_REPORT}>Aging Report</option>
            <option value={REPORT_TYPES.COLLECTION_PERFORMANCE}>Collection Performance</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
            />
          </div>
        </div>

        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Customers (Optional)
          </label>
          <div className="mt-1 max-h-48 overflow-y-auto border border-gray-300 rounded-md">
            {customers?.map(customer => (
              <label
                key={customer._id}
                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer._id)}
                  onChange={() => handleCustomerSelection(customer._id)}
                  className="h-4 w-4 text-agro-green focus:ring-agro-green border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">{customer.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="mt-1 flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="pdf"
                checked={format === 'pdf'}
                onChange={(e) => setFormat(e.target.value)}
                className="h-4 w-4 text-agro-green focus:ring-agro-green border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">PDF</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="excel"
                checked={format === 'excel'}
                onChange={(e) => setFormat(e.target.value)}
                className="h-4 w-4 text-agro-green focus:ring-agro-green border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Excel</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="csv"
                checked={format === 'csv'}
                onChange={(e) => setFormat(e.target.value)}
                className="h-4 w-4 text-agro-green focus:ring-agro-green border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">CSV</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green"
          >
            Cancel
          </button>
          <button
            onClick={generateReport}
            disabled={generating}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-agro-green hover:bg-agro-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green ${
              generating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator; 