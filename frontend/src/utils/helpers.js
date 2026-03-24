export const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

export const calculateDuration = (departure, arrival) => {
  const [depHour, depMin] = departure.split(':').map(Number);
  const [arrHour, arrMin] = arrival.split(':').map(Number);

  let depMinutes = depHour * 60 + depMin;
  let arrMinutes = arrHour * 60 + arrMin;

  if (arrMinutes < depMinutes) {
    arrMinutes += 24 * 60;
  }

  const diffMinutes = arrMinutes - depMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;

  return `${hours}h ${mins}m`;
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price);
};

export const generateBookingId = () => {
  return `BUS${Date.now()}`;
};
