import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductModal = ({ isOpen, onClose, product }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    stockThreshold: '',
    category: '',
    supplier: {
      name: '',
      contactInfo: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        price: product.price,
        quantity: product.quantity,
        stockThreshold: product.stockThreshold,
        category: product.category,
        supplier: {
          name: product.supplier?.name || '',
          contactInfo: product.supplier?.contactInfo || '',
          email: product.supplier?.email || '',
          phone: product.supplier?.phone || ''
        }
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        stockThreshold: '',
        category: '',
        supplier: {
          name: '',
          contactInfo: '',
          email: '',
          phone: ''
        }
      });
    }
  }, [product]);

  const mutation = useMutation(
    (data) => {
      if (product) {
        return axios.put(`/api/products/${product._id}`, data);
      }
      return axios.post('/api/products', data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success(product ? 'Product updated successfully' : 'Product created successfully');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('supplier.')) {
      const supplierField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        supplier: {
          ...prev.supplier,
          [supplierField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
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
                    {product ? 'Edit Product' : 'Add New Product'}
                  </Dialog.Title>
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                          SKU
                        </label>
                        <input
                          type="text"
                          name="sku"
                          id="sku"
                          required
                          value={formData.sku}
                          onChange={handleChange}
                          className="mt-1 focus:ring-agro-green focus:border-agro-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-1 focus:ring-agro-green focus:border-agro-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 focus:ring-agro-green focus:border-agro-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            name="price"
                            id="price"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            className="mt-1 focus:ring-agro-green focus:border-agro-green block w-full pl-7 shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          id="quantity"
                          required
                          min="0"
                          value={formData.quantity}
                          onChange={handleChange}
                          className="mt-1 focus:ring-agro-green focus:border-agro-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="stockThreshold" className="block text-sm font-medium text-gray-700">
                          Stock Threshold
                        </label>
                        <input
                          type="number"
                          name="stockThreshold"
                          id="stockThreshold"
                          required
                          min="0"
                          value={formData.stockThreshold}
                          onChange={handleChange}
                          className="mt-1 focus:ring-agro-green focus:border-agro-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <input
                          type="text"
                          name="category"
                          id="category"
                          required
                          value={formData.category}
                          onChange={handleChange}
                          className="mt-1 focus:ring-agro-green focus:border-agro-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900">Supplier Information</h4>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="supplier.name" className="block text-sm font-medium text-gray-700">
                            Supplier Name
                          </label>
                          <input
                            type="text"
                            name="supplier.name"
                            id="supplier.name"
                            value={formData.supplier.name}
                            onChange={handleChange}
                            className="mt-1 focus:ring-agro-green focus:border-agro-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="supplier.phone" className="block text-sm font-medium text-gray-700">
                            Supplier Phone
                          </label>
                          <input
                            type="text"
                            name="supplier.phone"
                            id="supplier.phone"
                            value={formData.supplier.phone}
                            onChange={handleChange}
                            className="mt-1 focus:ring-agro-green focus:border-agro-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-agro-green text-base font-medium text-white hover:bg-agro-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        {product ? 'Update' : 'Create'}
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
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ProductModal; 