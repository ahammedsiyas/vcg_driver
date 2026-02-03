import api from './api';

export const submitOnboarding = async ({ licenseUri, rcUri, vehicleNumber, vehicleType, vehicleCapacity, licenseNumber, licenseExpiry }) => {
  const form = new FormData();
  if (licenseUri) {
    form.append('license', {
      uri: licenseUri,
      name: 'license.jpg',
      type: 'image/jpeg',
    });
  }
  if (rcUri) {
    form.append('rc', {
      uri: rcUri,
      name: 'rc.jpg',
      type: 'image/jpeg',
    });
  }
  form.append('licenseNumber', licenseNumber);
  form.append('licenseExpiry', licenseExpiry);
  form.append('vehicleNumber', vehicleNumber);
  form.append('vehicleType', vehicleType);
  form.append('vehicleCapacity', vehicleCapacity);

  const res = await api.post('/drivers/onboarding', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
