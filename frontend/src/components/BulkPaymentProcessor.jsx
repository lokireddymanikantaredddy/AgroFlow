import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const BulkPaymentProcessor = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          validatePaymentData(data);
          setPreview(data);
        } catch (error) {
          toast.error('Invalid file format. Please upload a valid JSON file.');
          setFile(null);
        }
      };
      reader.readAsText(uploadedFile);
    }
  };

  const validatePaymentData = (data) => {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array of payments');
    }

    data.forEach((payment, index) => {
      if (!payment.customerId || !payment.amount || !payment.date || !payment.method) {
        throw new Error(`Invalid payment data at index ${index}`);
      }
    });
  };

  const processBulkPaymentMutation = useMutation(
    async (payments) => {
      const response = await axios.post('/api/payments/bulk', payments);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
        queryClient.invalidateQueries('sales');
        toast.success('Bulk payments processed successfully');
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to process bulk payments');
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preview) return;

    setProcessing(true);
    try {
      await processBulkPaymentMutation.mutateAsync(preview);
    } finally {
      setProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        customerId: "customer_id_here",
        amount: 1000.00,
        date: format(new Date(), 'yyyy-MM-dd'),
        method: "bank_transfer",
        reference: "optional_reference_number",
        notes: "optional_notes"
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_payment_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Bulk Payment Processor</h2>
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
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Need a template?</h3>
            <p className="text-sm text-gray-500">Download our JSON template to get started</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-agro-green bg-agro-green-light hover:bg-agro-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green"
          >
            Download Template
          </button>
        </div>

        {/* File Upload */}
        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-agro-green hover:text-agro-green-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-agro-green"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".json"
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">JSON file up to 10MB</p>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.customerId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.reference || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!preview || processing}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-agro-green hover:bg-agro-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green ${
              (!preview || processing) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {processing ? 'Processing...' : 'Process Payments'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkPaymentProcessor; 