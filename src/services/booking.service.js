import api from './api';

const getAvailableBookings = async () => {
  const response = await api.get('/bookings/available');
  return response.data;
};

const getMyBookings = async () => {
  const response = await api.get('/bookings/my');
  return response.data;
};

const getBookingById = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

const submitQuote = async (bookingId, { amount, notes }) => {
  const response = await api.post(`/bookings/${bookingId}/quote`, {
    amount,
    notes
  });
  return response.data;
};

const selectQuote = async (bookingId, quoteIndex) => {
  const response = await api.post(`/bookings/${bookingId}/select-quote`, {
    quoteIndex
  });
  return response.data;
};

const signRateConfirmation = async (bookingId, signatureUrl) => {
  const response = await api.post(`/bookings/${bookingId}/rate-confirmation/user-sign`, {
    signatureUrl
  });
  return response.data;
};

const acceptRateConfirmation = async (bookingId, signatureUrl = null) => {
  const response = await api.post(`/bookings/${bookingId}/rate-confirmation/driver-accept`, {
    signatureUrl
  });
  return response.data;
};

export default {
  getAvailableBookings,
  getMyBookings,
  getBookingById,
  submitQuote,
  selectQuote,
  signRateConfirmation,
  acceptRateConfirmation,
};
