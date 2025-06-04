import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CustomerModal = ({ isOpen, onClose, customer, showStatement }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(showStatement ? 'statement' : 'details');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: 0,
    notes: ''
  });

  // Fetch customer's sales history
  const { data: salesHistory } = useQuery(
    ['customerSales', customer?._id],
    () => axios.get(`/api/customers/${customer?._id}/sales`).then(res => res.data),
    { enabled: !!customer && activeTab === 'statement' }
  );

  // Fetch customer's payment history
  const { data: paymentHistory } = useQuery(
    ['customerPayments', customer?._id],
    () => axios.get(`/api/customers/${customer?._id}/payments`).then(res => res.data),
    { enabled: !!customer && activeTab === 'statement' }
  );

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        code: customer.code,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || '',
        creditLimit: customer.creditLimit,
        notes: customer.notes || ''
      });
    } else {
      setFormData({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        creditLimit: 0,
        notes: ''
      });
    }
  }, [customer]);

  const mutation = useMutation(
    (data) => {
      if (customer) {
        return axios.put(`/api/customers/${customer._id}`, data);
      }
      return axios.post('/api/customers', data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
        toast.success(customer ? 'Customer updated successfully' : 'Customer created successfully');
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Operation failed');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const renderStatement = () => {
    if (!salesHistory || !paymentHistory) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-agro-green"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Credit Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Credit Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Credit Limit</p>
              <p className="text-lg font-medium text-gray-900">
                ${customer.creditLimit.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-lg font-medium text-gray-900">
                ${customer.creditBalance.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available Credit</p>
              <p className="text-lg font-medium text-gray-900">
                ${(customer.creditLimit - customer.creditBalance).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Recent Transactions</h4>
          <div className="border rounded-lg divide-y">
            {[...salesHistory, ...paymentHistory]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((transaction) => (
                <div key={transaction._id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.type === 'sale' ? 'Purchase' : 'Payment'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === 'sale' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'sale' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.type === 'sale' 
                          ? `${transaction.items?.length || 0} items`
                          : transaction.paymentMethod}
                      </p>
                    </div>
                  </div>
                  {transaction.type === 'sale' && transaction.items && (
                    <div className="mt-2 text-sm text-gray-500">
                      {transaction.items.map(item => item.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {customer ? customer.name : 'New Customer'}
                  </Dialog.Title>

                  <Tab.Group selectedIndex={activeTab === 'statement' ? 1 : 0} onChange={(index) => setActiveTab(index === 1 ? 'statement' : 'details')}>
                    <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
                      <Tab
                        className={({ selected }) =>
                          `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                          ${selected
                            ? 'bg-white text-agro-green shadow'
                            : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-900'
                          }`
                        }
                      >
                        Details
                      </Tab>
                      {customer && (
                        <Tab
                          className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                            ${selected
                              ? 'bg-white text-agro-green shadow'
                              : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-900'
                            }`
                          }
                        >
                          Statement
                        </Tab>
                      )}
                    </Tab.List>
                    <Tab.Panels>
                      <Tab.Panel>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Customer Code
                              </label>
                              <input
                                type="text"
                                id="code"
                                name="code"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                              Address
                            </label>
                            <textarea
                              id="address"
                              name="address"
                              rows={3}
                              value={formData.address}
                              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700">
                              Credit Limit
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                              </div>
                              <input
                                type="number"
                                id="creditLimit"
                                name="creditLimit"
                                min="0"
                                step="0.01"
                                required
                                value={formData.creditLimit}
                                onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) }))}
                                className="mt-1 block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                              Notes
                            </label>
                            <textarea
                              id="notes"
                              name="notes"
                              rows={3}
                              value={formData.notes}
                              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
                            />
                          </div>

                          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                              type="submit"
                              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-agro-green text-base font-medium text-white hover:bg-agro-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green sm:ml-3 sm:w-auto sm:text-sm"
                            >
                              {customer ? 'Update' : 'Create'}
                            </button>
                            <button
                              type="button"
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green sm:mt-0 sm:w-auto sm:text-sm"
                              onClick={onClose}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </Tab.Panel>
                      <Tab.Panel>
                        {renderStatement()}
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CustomerModal; 