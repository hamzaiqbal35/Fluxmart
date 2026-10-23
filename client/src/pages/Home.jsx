import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getMediaUrl } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Initialize banners from local cache to prevent split-second placeholder flash on refresh
  const [banners, setBanners] = useState(() => {
    try {
      const cached = localStorage.getItem('fluxmart_cached_banners');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [bannersLoading, setBannersLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('fluxmart_cached_banners');
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
      bgClass: 'bg-gray-100'
    },
    {
      title: 'Built for Performance.',
      subtitle: 'Experience lightning fast shopping with unparalleled design.',
      buttonText: 'Learn About Us',
      buttonLink: '/about',
      bgClass: 'bg-gray-200'
    }
  ];

  // If banners exist in cache, render immediately. If still loading without cache, avoid flashing text.
  const activeSlides = banners.length > 0 ? banners : (bannersLoading ? [] : heroSlides);

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
        localStorage.setItem('fluxmart_cached_banners', JSON.stringify(fetched));
      } else {
        localStorage.removeItem('fluxmart_cached_banners');
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
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] md:h-[70vh] md:min-h-[500px] flex items-center justify-center overflow-hidden border-b border-border bg-gray-50">
        {activeSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="container mx-auto px-12 md:px-20 lg:px-6 text-center max-w-4xl relative z-20">
              {slide.title && (
                <h1 
                  className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 md:mb-6 leading-tight"
                  style={{ color: slide.textColor || '#000000' }}
                >
                  {slide.title}
                </h1>
              )}
              {slide.subtitle && (
                <p 
                  className="text-base md:text-lg lg:text-xl mb-8 md:mb-10 max-w-2xl mx-auto font-light"
                  style={{ color: slide.textColor || '#4b5563' }}
                >
                  {slide.subtitle}
                </p>
              )}
              {(slide.buttonLink || (slide.link && slide.link !== 'undefined' && slide.link !== 'null' && slide.link.trim() !== '')) && (
                <Link
                  to={slide.buttonLink || slide.link}
                  className="inline-flex items-center justify-center bg-brand-gradient text-white px-8 py-4 rounded-full font-medium hover:opacity-90 transition-opacity group shadow-lg"
                >
                  {slide.buttonText || 'Shop Now'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
            {/* Display Banner Image if exists, else abstract bg */}
            {slide.imageUrl ? (
              <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center bg-gray-100">
                <img src={getMediaUrl(slide.imageUrl)} alt={slide.title || 'Banner'} className="w-full h-full object-cover object-[80%_center] md:object-center" />
                {(slide.title || slide.subtitle) && (
                  <div className="absolute inset-0 bg-black/30 md:bg-black/10"></div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gradient rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
                 <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-orange rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
              </div>
            )}
          </div>
        ))}
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide ? 'w-12 bg-black' : 'w-4 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        {/* Navigation Arrows (Hidden on mobile to save space) */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-8 h-8 text-black" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % activeSlides.length)}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="w-8 h-8 text-black" />
        </button>
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
