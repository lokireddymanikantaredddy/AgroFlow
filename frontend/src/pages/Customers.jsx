import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  PlusIcon, 
  MagnifyingGlassIcon as SearchIcon, 
  CreditCardIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import CustomerModal from '../components/CustomerModal';
import { format } from 'date-fns';

const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showStatement, setShowStatement] = useState(false);

  const { data, isLoading } = useQuery(
    ['customers', page, search],
    () => axios.get(`/api/customers?page=${page}&search=${search}`).then(res => res.data)
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setShowStatement(false);
  };

  const getCreditStatusColor = (creditBalance, creditLimit) => {
    const ratio = creditBalance / creditLimit;
    if (ratio >= 0.9) return 'bg-red-100 text-red-800';
    if (ratio >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agro-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <button
          onClick={() => {
            setSelectedCustomer(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-agro-green hover:bg-agro-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center px-4 py-3 bg-white shadow rounded-lg">
        <SearchIcon className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-2 block w-full text-sm border-0 focus:ring-0"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credit Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credit Limit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Purchase
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.customers.map((customer) => (
              <tr key={customer._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getCreditStatusColor(customer.creditBalance, customer.creditLimit)
                  }`}>
                    ${customer.creditBalance.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${customer.creditLimit.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.lastPurchaseDate ? format(new Date(customer.lastPurchaseDate), 'MMM d, yyyy') : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowStatement(false);
                      setIsModalOpen(true);
                    }}
                    className="text-agro-green hover:text-agro-light mr-4"
                  >
                    <CreditCardIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowStatement(true);
                      setIsModalOpen(true);
                    }}
                    className="text-agro-green hover:text-agro-light"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg shadow">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setPage(page => Math.max(page - 1, 1))}
            disabled={page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page => page + 1)}
            disabled={!data?.hasMore}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page}</span> of{' '}
              <span className="font-medium">{data?.totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setPage(page => Math.max(page - 1, 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page => page + 1)}
                disabled={page >= data?.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={selectedCustomer}
        showStatement={showStatement}
      />
    </div>
  );
};

export default Customers; 