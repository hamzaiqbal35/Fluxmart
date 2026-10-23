const Banner = require('../models/Banner');

// @desc    Get all banners (public)
// @route   GET /api/banners
// @access  Public
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all banners (admin)
// @route   GET /api/banners/admin
// @access  Private/Admin
exports.getAdminBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
  try {
    const { 
      title, subtitle, link, isActive, order, textColor,
      titleColor, subtitleColor,
      titleSize, subtitleSize,
      titleFont, subtitleFont,
      textPosition, verticalPosition,
      buttonText, buttonColor, buttonTextColor
    } = req.body;

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      imageUrl,
      link,
      textColor: textColor || '#000000',
      titleColor: titleColor || textColor || '#000000',
      subtitleColor: subtitleColor || textColor || '#4b5563',
      titleSize: titleSize || 'large',
      subtitleSize: subtitleSize || 'medium',
      titleFont: titleFont || 'sans',
      subtitleFont: subtitleFont || 'sans',
      textPosition: textPosition || 'center',
      verticalPosition: verticalPosition || 'center',
      buttonText: buttonText || 'Shop Now',
      buttonColor: buttonColor || '#000000',
      buttonTextColor: buttonTextColor || '#ffffff',
      isActive: isActive === 'true' || isActive === true,
      order: order ? parseInt(order) : 0
    });

    res.status(201).json({ success: true, banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    
    await banner.deleteOne();
    res.status(200).json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
  try {
    const { 
      title, subtitle, link, isActive, order, textColor,
      titleColor, subtitleColor,
      titleSize, subtitleSize,
      titleFont, subtitleFont,
      textPosition, verticalPosition,
      buttonText, buttonColor, buttonTextColor
    } = req.body;

    let banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    let imageUrl = banner.imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }

    banner.title = title !== undefined ? title : banner.title;
    banner.subtitle = subtitle !== undefined ? subtitle : banner.subtitle;
    banner.link = link !== undefined ? link : banner.link;
    banner.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : banner.isActive;
    banner.order = order !== undefined ? parseInt(order) : banner.order;
    banner.textColor = textColor !== undefined ? textColor : banner.textColor;
    banner.titleColor = titleColor !== undefined ? titleColor : (banner.titleColor || banner.textColor || '#000000');
    banner.subtitleColor = subtitleColor !== undefined ? subtitleColor : (banner.subtitleColor || banner.textColor || '#4b5563');
    banner.titleSize = titleSize !== undefined ? titleSize : banner.titleSize;
    banner.subtitleSize = subtitleSize !== undefined ? subtitleSize : banner.subtitleSize;
    banner.titleFont = titleFont !== undefined ? titleFont : banner.titleFont;
    banner.subtitleFont = subtitleFont !== undefined ? subtitleFont : banner.subtitleFont;
    banner.textPosition = textPosition !== undefined ? textPosition : banner.textPosition;
    banner.verticalPosition = verticalPosition !== undefined ? verticalPosition : banner.verticalPosition;
    banner.buttonText = buttonText !== undefined ? buttonText : banner.buttonText;
    banner.buttonColor = buttonColor !== undefined ? buttonColor : banner.buttonColor;
    banner.buttonTextColor = buttonTextColor !== undefined ? buttonTextColor : banner.buttonTextColor;
    banner.imageUrl = imageUrl;

    await banner.save();
    res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
