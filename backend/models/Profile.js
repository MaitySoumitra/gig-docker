const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: ['private_tutor', 'coaching_center', 'small_institute'],
    required: true
  },

  location: String,
  experience: Number,
  description: String,

  // 🆕 Contact info
  contactInfo: {
    phone: String,
    email: String
  },

  // 🆕 Profile image
  profileImage: String,

  // 🆕 Rating (average)
  rating: {
    type: Number,
    default: 0
  },

  // 🆕 Linked reviews
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

  // ✅ Admin review status
  status: {
    type: String,
    enum: ['under_review', 'approved', 'rejected'],
    default: 'under_review'
  }

}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
