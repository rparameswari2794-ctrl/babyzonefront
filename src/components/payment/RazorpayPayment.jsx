import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '@/api/axios';

const RazorpayPayment = ({ amount, paymentMethod, orderData, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      // Convert amount to paise
      const amountInPaise = Math.round(parseFloat(amount) * 100);

      console.log('Original amount (INR):', amount);
      console.log('Amount in paise:', amountInPaise);

      const requestData = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        ...orderData
      };

      console.log('Creating Razorpay order...');
      const response = await axios.post('/create-razorpay-order/', requestData);

      console.log('Razorpay order response:', response.data);

      if (response.data && response.data.id) {
        const options = {
          key: response.data.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: response.data.amount,
          currency: response.data.currency || 'INR',
          name: 'BabyZone',
          description: `Order Payment - ${response.data.order_number || ''}`,
          order_id: response.data.id,
          // In RazorpayPayment.jsx, update the handler function

          handler: async (paymentResponse) => {
            console.log('Payment response:', paymentResponse);
            try {
              const verifyResponse = await axios.post('/verify-payment/', {
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                order_data: {
                  ...orderData,
                  total_amount: amount,
                  payment_method: 'razorpay'
                }
              });

              console.log('Verification response:', verifyResponse.data);

              if (verifyResponse.data.status === 'success') {
                toast.success('Payment successful!');
                if (onSuccess) {
                  onSuccess({
                    id: verifyResponse.data.order_id,
                    order_number: verifyResponse.data.order_number,
                    items: verifyResponse.data.items,
                    total_amount: verifyResponse.data.total_amount
                  });
                }
              } else {
                throw new Error(verifyResponse.data.message || 'Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              console.error('Error response:', error.response?.data);
              toast.error(error.response?.data?.message || 'Payment verification failed. Please contact support.');
              if (onFailure) {
                onFailure(error);
              }
            }
          },
          prefill: {
            name: orderData.shipping_name,
            email: orderData.shipping_email,
            contact: orderData.shipping_phone
          },
          notes: {
            shipping_address: orderData.shipping_address,
            order_number: response.data.order_number
          },
          theme: {
            color: '#d63384'
          },
          modal: {
            ondismiss: () => {
              console.log('Payment modal closed');
              toast.info('Payment cancelled');
              setLoading(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (razorpayResponse) => {
          console.error('Razorpay payment failed:', razorpayResponse);
          const errorMessage = razorpayResponse.error?.description || 'Payment failed. Please try again.';
          toast.error(errorMessage);
          setLoading(false);
          if (onFailure) {
            onFailure(new Error(errorMessage));
          }
        });

        razorpay.open();
      } else {
        throw new Error('Invalid response from server: Missing order ID');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);

      let errorMessage = 'Payment initialization failed. ';

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage += 'Payment endpoint not found. Please contact support.';
        } else if (error.response.status === 401) {
          errorMessage += 'Please login again to continue.';
          setTimeout(() => { window.location.href = '/login'; }, 2000);
        } else if (error.response.status === 400) {
          errorMessage += error.response.data?.error || error.response.data?.message || 'Invalid request.';
        } else {
          errorMessage += error.response.data?.error || error.response.data?.message || error.message;
        }
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }

      toast.error(errorMessage);
      if (onFailure) {
        onFailure(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="btn w-100 py-3 rounded-pill fw-semibold"
      style={{ backgroundColor: '#d63384', color: 'white', border: 'none' }}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          Processing...
        </>
      ) : (
        `Pay ₹${parseFloat(amount).toFixed(2)}`
      )}
    </button>
  );
};

export default RazorpayPayment;