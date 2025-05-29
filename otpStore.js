const otpStore = {};

function saveOTP(email, otp) {
  otpStore[email] = { otp, createdAt: Date.now() };
}

function getOTP(email) {
  return otpStore[email];
}

function clearOTP(email) {
  delete otpStore[email];
}

module.exports = { saveOTP, getOTP, clearOTP };
