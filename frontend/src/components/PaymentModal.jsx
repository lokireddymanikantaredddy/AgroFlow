import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const PaymentModal = ({ isOpen, onClose, sale, onPaymentSuccess }) => {
  const [qrValue, setQrValue] = useState('');
  const [upiString, setUpiString] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [verificationInterval, setVerificationInterval] = useState(null);
  const [qrError, setQrError] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && sale.paymentType === 'online') {
      generateQRCode();
    }
    return () => {
      if (verificationInterval) {
        clearInterval(verificationInterval);
      }
    };
  }, [isOpen]);

  const generateQRCode = async () => {
    try {
      const { data } = await axios.post(`/api/sales/${sale._id}/generate-qr`);
      setQrValue(data.qrData);
      setUpiString(data.upiString);
      setPaymentDetails(data.paymentDetails);
      setQrError(false);
      
      // Start polling for payment verification
      const interval = setInterval(async () => {
        try {
          const { data: verificationData } = await axios.get(`/api/sales/${sale._id}/verify-payment`);
          if (verificationData.status === 'completed') {
            clearInterval(interval);
            toast.success('Payment successful');
            onPaymentSuccess();
            onClose();
          }
        } catch (error) {
          console.error('Payment verification error:', error);
        }
      }, 5000); // Check every 5 seconds

      setVerificationInterval(interval);
    } catch (error) {
      setQrError(true);
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    }
  };

  const handleCashPayment = async () => {
    try {
      setProcessing(true);
      await axios.post(`/api/sales/${sale._id}/cash-payment`);
      toast.success('Cash payment recorded successfully');
      onPaymentSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record cash payment');
    } finally {
      setProcessing(false);
    }
  };

  const openUPIApp = () => {
    window.location.href = upiString;
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
                    Process Payment
                  </Dialog.Title>
                  <div className="mt-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700">
                        Total Amount: <span className="font-semibold">₹{sale?.totalAmount?.toFixed(2)}</span>
                      </p>
                    </div>

                    {sale.paymentType === 'online' ? (
                      <div className="mt-4 flex flex-col items-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Scan the QR code or click below to pay
                        </p>
                        {qrValue && !qrError ? (
                          <>
                            <div className="bg-white p-4 rounded-lg shadow-md">
                              <QRCodeSVG
                                value={upiString}
                                size={200}
                                level="M"
                                includeMargin={false}
                                className="mx-auto"
                              />
                            </div>
                            {paymentDetails && (
                              <div className="mt-4 text-sm text-gray-600">
                                <p>UPI ID: {paymentDetails.upiId}</p>
                                <p>Reference: {paymentDetails.reference}</p>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={openUPIApp}
                              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-agro-green hover:bg-agro-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green"
                            >
                              Pay with UPI App
                            </button>
                          </>
                        ) : (
                          <div className="text-red-600 text-sm">
                            {qrError ? 'Failed to generate QR code. Please try again.' : 'Loading QR code...'}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-4">
                          The payment status will be automatically updated once completed
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-agro-green text-base font-medium text-white hover:bg-agro-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-green sm:ml-3 sm:w-auto sm:text-sm ${
                            processing ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={handleCashPayment}
                          disabled={processing}
                        >
                          {processing ? 'Processing...' : 'Confirm Cash Payment'}
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
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default PaymentModal; 