import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api, { getMediaUrl } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const getTitleSizeClass = (size) => {
  switch (size) {
    case 'small':
      return 'text-2xl sm:text-3xl md:text-5xl';
    case 'medium':
      return 'text-3xl sm:text-4xl md:text-6xl';
    case 'xlarge':
      return 'text-5xl sm:text-6xl md:text-8xl';
    case 'large':
    default:
      return 'text-4xl sm:text-5xl md:text-7xl';
  }
};

const getSubtitleSizeClass = (size) => {
  switch (size) {
    case 'small':
      return 'text-sm sm:text-base md:text-lg';
    case 'large':
      return 'text-lg sm:text-xl md:text-2xl';
    case 'medium':
    default:
      return 'text-base sm:text-lg md:text-xl';
  }
};

const getFontClass = (font) => {
  switch (font) {
    case 'serif':
      return 'font-serif';
    case 'mono':
      return 'font-mono';
    case 'sans':
    default:
      return 'font-sans';
  }
};

const getAlignmentClasses = (hPos, vPos) => {
  let hClass = 'text-center items-center';
  let innerAlign = 'mx-auto';
  if (hPos === 'left') {
    hClass = 'text-left items-start';
    innerAlign = 'mr-auto ml-0';
  } else if (hPos === 'right') {
    hClass = 'text-right items-end';
    innerAlign = 'ml-auto mr-0';
  }

  let vClass = 'items-center';
  if (vPos === 'top') {
    vClass = 'items-start pt-12 md:pt-16';
  } else if (vPos === 'bottom') {
    vClass = 'items-end pb-16 md:pb-24';
  }

  return { hClass, vClass, innerAlign };
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Initialize banners from session cache to prevent split-second placeholder flash on refresh
  const [banners, setBanners] = useState(() => {
    try {
      const cached = sessionStorage.getItem('fluxmart_cached_banners');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [bannersLoading, setBannersLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('fluxmart_cached_banners');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });

  const heroSlides = [
    {
      title: 'Premium E-Commerce Platform.',
      subtitle: 'Discover meticulously crafted products from our premium catalog.',
      buttonText: 'Shop the Collection',
      buttonLink: '/products',
      buttonColor: '#000000',
      buttonTextColor: '#ffffff',
      titleColor: '#000000',
      subtitleColor: '#4b5563',
      titleSize: 'large',
      subtitleSize: 'medium',
      textPosition: 'center',
      verticalPosition: 'center',
      bgClass: 'bg-gray-100'
    },
    {
      title: 'Built for Performance.',
      subtitle: 'Experience lightning fast shopping with unparalleled design.',
      buttonText: 'Learn About Us',
      buttonLink: '/about',
      buttonColor: '#000000',
      buttonTextColor: '#ffffff',
      titleColor: '#000000',
      subtitleColor: '#4b5563',
      titleSize: 'large',
      subtitleSize: 'medium',
      textPosition: 'center',
      verticalPosition: 'center',
      bgClass: 'bg-gray-200'
    }
  ];

  // If banners exist in cache, render immediately. If still loading without cache, avoid flashing text.
  const activeSlides = banners.length > 0 ? banners : (bannersLoading ? [] : heroSlides);

  const nextSlide = () => {
    if (activeSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    if (activeSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  // Mobile Touch Swipe Handling
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const minSwipeDistance = 40;

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    const xDistance = touchStartX.current - touchEndX.current;
    const yDistance = touchStartY.current - touchEndY.current;

    // Trigger only if horizontal swipe dominates over vertical scroll
    if (Math.abs(xDistance) > Math.abs(yDistance) && Math.abs(xDistance) > minSwipeDistance) {
      if (xDistance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBanners();
  }, []);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const fetchBanners = async () => {
    try {
      const res = await api.get('/banners');
      const fetched = res.data.banners || [];
      setBanners(fetched);
      if (fetched.length > 0) {
        sessionStorage.setItem('fluxmart_cached_banners', JSON.stringify(fetched));
      } else {
        sessionStorage.removeItem('fluxmart_cached_banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setBannersLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=8');
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero Section with Touch Swipe Support */}
      <section 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative h-[60vh] min-h-[400px] md:h-[70vh] md:min-h-[500px] flex items-center justify-center overflow-hidden border-b border-border bg-gray-50 touch-pan-y select-none"
      >
        {activeSlides.map((slide, index) => {
          const { hClass, vClass, innerAlign } = getAlignmentClasses(slide.textPosition, slide.verticalPosition);
          const titleColor = slide.titleColor || slide.textColor || '#000000';
          const subtitleColor = slide.subtitleColor || slide.textColor || '#4b5563';
          const btnBg = slide.buttonColor || '#000000';
          const btnText = slide.buttonTextColor || '#ffffff';

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 flex ${vClass} justify-center ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className={`container mx-auto px-8 md:px-16 lg:px-20 max-w-5xl relative z-20 flex flex-col ${hClass}`}>
                {slide.title && (
                  <h1 
                    className={`${getTitleSizeClass(slide.titleSize)} ${getFontClass(slide.titleFont)} font-bold tracking-tight mb-3 md:mb-5 leading-tight`}
                    style={{ color: titleColor }}
                  >
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p 
                    className={`${getSubtitleSizeClass(slide.subtitleSize)} ${getFontClass(slide.subtitleFont)} mb-6 md:mb-8 max-w-2xl font-normal ${innerAlign}`}
                    style={{ color: subtitleColor }}
                  >
                    {slide.subtitle}
                  </p>
                )}
                {(slide.buttonLink || (slide.link && slide.link !== 'undefined' && slide.link !== 'null' && slide.link.trim() !== '')) && (
                  <Link
                    to={slide.buttonLink || slide.link}
                    style={{ backgroundColor: btnBg, color: btnText }}
                    className="inline-flex items-center justify-center px-8 py-3.5 md:py-4 rounded-full font-medium hover:opacity-90 transition-all group shadow-md active:scale-95 text-sm md:text-base"
                  >
                    {slide.buttonText || 'Shop Now'}
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
              {/* Display Banner Image if exists, else clean neutral background */}
              {slide.imageUrl ? (
                <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center bg-gray-100">
                  <img src={getMediaUrl(slide.imageUrl)} alt={slide.title || 'Banner'} className="w-full h-full object-cover object-[80%_center] md:object-center" />
                  {(slide.title || slide.subtitle) && (
                    <div className="absolute inset-0 bg-black/25 md:bg-black/10"></div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gray-100">
                   <div className="absolute inset-0 bg-white/40"></div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Slide Indicators */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2 md:space-x-3">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === currentSlide ? 'w-8 md:w-12 bg-black' : 'w-3 md:w-4 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Navigation Arrows (accessible on both mobile and desktop) */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/70 hover:bg-white text-black transition-all shadow-md items-center justify-center active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
            </button>
            <button
              onClick={nextSlide}
              className="flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/70 hover:bg-white text-black transition-all shadow-md items-center justify-center active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
            </button>
          </>
        )}
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Featured Products</h2>
            <p className="text-gray-500">Curated picks for you.</p>
          </div>
          <Link to="/products" className="hidden sm:inline-flex items-center text-sm font-medium text-black hover:text-gray-600 transition-colors">
            View all <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="bg-gray-100 aspect-square rounded-lg"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-border rounded-xl bg-gray-50">
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        )}
        
        <div className="mt-12 text-center sm:hidden">
          <Link to="/products" className="inline-flex items-center justify-center w-full px-6 py-3 border border-border rounded-lg text-black font-medium hover:bg-gray-50 transition-colors">
            View all products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
