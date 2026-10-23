const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  titleColor: {
    type: String,
    default: '#000000',
  },
  subtitleColor: {
    type: String,
    default: '#4b5563',
  },
  titleSize: {
    type: String,
    default: 'large', // 'small', 'medium', 'large', 'xlarge'
  },
  subtitleSize: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
  },
  titleFont: {
    type: String,
    default: 'sans', // 'sans', 'serif', 'mono'
  },
  subtitleFont: {
    type: String,
    default: 'sans', // 'sans', 'serif', 'mono'
  },
  textPosition: {
    type: String,
    default: 'center', // 'left', 'center', 'right'
  },
  verticalPosition: {
    type: String,
    default: 'center', // 'top', 'center', 'bottom'
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
  },
  buttonColor: {
    type: String,
    default: '#000000', // solid color, no gradient
  },
  buttonTextColor: {
    type: String,
    default: '#ffffff',
  },
  textColor: {
    type: String,
    default: '#000000', // legacy fallback
  },
  imageUrl: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
