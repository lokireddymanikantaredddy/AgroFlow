import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { 
  XMarkIcon as XIcon, 
  PlusIcon, 
  TrashIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PaymentModal from './PaymentModal';

const SaleModal = ({ isOpen, onClose, sale }) => {
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    items: [],
    paymentType: 'cash',
    creditDetails: {
      dueDate: '',
      interestRate: 0
    }
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch customers
  const { data: customers } = useQuery('customers', () =>
    axios.get('/api/customers').then(res => res.data.customers)
  );

  // Fetch products
  const { data: products } = useQuery('products', () =>
    axios.get('/api/products').then(res => res.data.products)
  );

  useEffect(() => {
    if (sale) {
      setFormData({
        customer: sale.customer._id,
        items: sale.items,
        paymentType: sale.paymentType,
        creditDetails: sale.creditDetails || {
          dueDate: '',
          interestRate: 0
        }
      });
    } else {
      setFormData({
        customer: '',
        items: [],
        paymentType: 'cash',
        creditDetails: {
          dueDate: '',
          interestRate: 0
        }
      });
    }
  }, [sale]);

  const mutation = useMutation(
    (data) => {
      if (sale) {
        return axios.put(`/api/sales/${sale._id}`, data);
      }
      return axios.post('/api/sales', data);
    },
    {
      onSuccess: (response) => {
        // For credit sales or updates, close immediately
        if (response.data.paymentType === 'credit' || sale) {
          queryClient.invalidateQueries('sales');
          queryClient.invalidateQueries('summary');
          queryClient.invalidateQueries('salesTrends');
          queryClient.invalidateQueries('topProducts');
          queryClient.invalidateQueries('creditSummary');
          queryClient.invalidateQueries('inventoryStatus');
          toast.success(sale ? 'Sale updated successfully' : 'Sale created successfully');
          onClose();
        } else {
          // For cash sales, show payment modal
          setCurrentSale(response.data);
          setShowPaymentModal(true);
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Operation failed');
      }
    }
  );

  const handleAddItem = () => {
    if (!selectedProduct || quantity < 1) return;

    const product = products.find(p => p._id === selectedProduct);
    if (!product) return;

    if (quantity > product.quantity) {
      toast.error('Insufficient stock');
      return;
    }

    const existingItem = formData.items.find(item => item.product === selectedProduct);
    if (existingItem) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.product === selectedProduct
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          product: selectedProduct,
          quantity,
          price: product.price,
          name: product.name
        }]
      }));
    }

    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemoveItem = (productId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product !== productId)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    if (!formData.customer) {
      toast.error('Please select a customer');
      return;
    }

    const totalAmount = calculateTotal();
    const saleData = {
      customerId: formData.customer,
      items: formData.items.map(item => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      paymentType: formData.paymentType,
      totalAmount,
      creditDetails: formData.paymentType === 'credit' ? formData.creditDetails : undefined
    };
    
    mutation.mutate(saleData);
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries('sales');
    queryClient.invalidateQueries('summary');
    queryClient.invalidateQueries('salesTrends');
    queryClient.invalidateQueries('topProducts');
    queryClient.invalidateQueries('creditSummary');
    queryClient.invalidateQueries('inventoryStatus');
    toast.success('Payment completed successfully');
    setShowPaymentModal(false);
    onClose();
  };

  // Update the display of prices to use ₹ symbol
  const formatPrice = (price) => `₹${price.toFixed(2)}`;

  return (
    <>
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
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
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
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      {sale ? 'Sale Details' : 'New Sale'}
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {/* Customer Selection */}
                      <div>
                        <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                          Customer
                        </label>
                        <select
                          id="customer"
                          name="customer"
                          value={formData.customer}
                          onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-agro-green focus:border-agro-green sm:text-sm rounded-md"
                          required
                          disabled={!!sale}
                        >
                          <option value="">Select a customer</option>
                          {customers?.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                              {customer.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Payment Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Payment Type
                        </label>
                        <RadioGroup
                          value={formData.paymentType}
                          onChange={(value) => setFormData(prev => ({ ...prev, paymentType: value }))}
                          className="mt-2"
                          disabled={!!sale}
                        >
                          <div className="flex space-x-4">
                            <RadioGroup.Option value="cash">
                              {({ checked }) => (
                                <div className={`
                                  ${checked ? 'bg-agro-green text-white' : 'bg-white text-gray-900'}
                                  cursor-pointer rounded-md px-4 py-2 border border-gray-300 flex items-center
                                `}>
                                  <PlusIcon className="h-5 w-5 mr-2" />
                                  Cash
                                </div>
                              )}
                            </RadioGroup.Option>
                            <RadioGroup.Option value="credit">
                              {({ checked }) => (
                                <div className={`
                                  ${checked ? 'bg-agro-green text-white' : 'bg-white text-gray-900'}
                                  cursor-pointer rounded-md px-4 py-2 border border-gray-300 flex items-center
                                `}>
                                  <PlusIcon className="h-5 w-5 mr-2" />
                                  Credit
                                </div>
                              )}
                            </RadioGroup.Option>
                            <RadioGroup.Option value="online">
                              {({ checked }) => (
                                <div className={`
                                  ${checked ? 'bg-agro-green text-white' : 'bg-white text-gray-900'}
                                  cursor-pointer rounded-md px-4 py-2 border border-gray-300 flex items-center
                                `}>
                                  <PlusIcon className="h-5 w-5 mr-2" />
                                  Online (QR)
                                </div>
                              )}
                            </RadioGroup.Option>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Credit Details */}
                      {formData.paymentType === 'credit' && !sale && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                              Due Date
                            </label>
                            <input
                              type="date"
                              id="dueDate"
                              name="dueDate"
                              value={formData.creditDetails.dueDate}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                creditDetails: {
                                  ...prev.creditDetails,
                                  dueDate: e.target.value
                                }
                              }))}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                              Interest Rate (%)
                            </label>
                            <input
                              type="number"
                              id="interestRate"
                              name="interestRate"
                              value={formData.creditDetails.interestRate}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                creditDetails: {
                                  ...prev.creditDetails,
                                  interestRate: parseFloat(e.target.value)
                                }
                              }))}
                              min="0"
                              step="0.1"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Add Items */}
                      {!sale && (
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <select
                              value={selectedProduct}
                              onChange={(e) => setSelectedProduct(e.target.value)}
                              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-agro-green focus:border-agro-green sm:text-sm rounded-md"
                            >
                              <option value="">Select a product</option>
                              {products?.map((product) => (
                                <option key={product._id} value={product._id}>
                                  {product.name} ({formatPrice(product.price)}) - {product.quantity} in stock
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-32">
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => setQuantity(parseInt(e.target.value))}
                              min="1"
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-agro-green focus:border-agro-green sm:text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-agro-green hover:bg-agro-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green"
                          >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Add
                          </button>
                        </div>
                      )}

                      {/* Items List */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Items</h4>
                        <div className="mt-2 border rounded-md divide-y">
                          {formData.items.map((item) => (
                            <div key={item.product} className="p-4 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-gray-900 mr-4">
                                  {formatPrice(item.quantity * item.price)}
                                </p>
                                {!sale && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.product)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {formData.items.length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-500">
                              No items added
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-900">Total Amount</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(calculateTotal())}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {!sale && (
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-agro-green text-base font-medium text-white hover:bg-agro-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Process Sale
                          </button>
                          <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={onClose}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      
      {showPaymentModal && currentSale && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          sale={currentSale}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default SaleModal; 