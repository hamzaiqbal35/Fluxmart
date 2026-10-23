import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api, { getMediaUrl } from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import { formatPricePKR } from '../utils/currency';
import { subDays } from 'date-fns';
import { 
  LayoutDashboard, Users, Package, ShoppingCart, 
  Tags, FileText, Image as ImageIcon, Trash2, Upload,
  CheckCircle, XCircle, Edit, DollarSign, Settings as SettingsIcon, HelpCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, ScatterChart, Scatter, RadarChart, Radar,
  Treemap, Brush, ReferenceLine, ReferenceDot, ReferenceArea
} from 'recharts';
import AdminUsersTab from '../components/AdminUsersTab';
import AdminOrdersTab from '../components/AdminOrdersTab';
import AdminCategoriesTab from '../components/AdminCategoriesTab';
import AdminProductsTab from '../components/AdminProductsTab';
import AdminFAQsTab from '../components/AdminFAQsTab';

const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // Data states
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState({});

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'overview' || activeTab === 'analytics') {
        await Promise.all([
          fetchStats(),
          fetchAnalytics()
        ]);
      } else if (activeTab === 'users') {
        await fetchUsers();
      } else if (activeTab === 'products') {
        await fetchProducts();
      } else if (activeTab === 'orders') {
        await fetchOrders();
      } else if (activeTab === 'categories') {
        await fetchCategories();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        api.get('/users'),
        api.get('/products'),
        api.get('/orders/all')
      ]);

      const allUsers = usersRes.data.users || [];

      const totalRevenue = (ordersRes.data.orders || []).filter(order => order.status !== 'cancelled').reduce(
        (sum, order) => sum + (order.totalPrice || 0), 0
      );

      setStats({
        totalUsers: allUsers.length,
        totalProducts: (productsRes.data.products || []).length,
        totalOrders: (ordersRes.data.orders || []).length,
        totalRevenue,
      });
    } catch (error) {
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders/all'),
        api.get('/products')
      ]);

      const orders = ordersRes.data.orders || [];
      const products = productsRes.data.products || [];

      // Calculate analytics
      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      const revenueByMonth = orders.filter(order => order.status !== 'cancelled').reduce((acc, order) => {
        const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + (order.totalPrice || 0);
        return acc;
      }, {});

      setAnalytics({
        ordersByStatus,
        revenueByMonth,
        topProducts: products.slice(0, 5),
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (error) {
    }
  };

  const fetchProducts = async () => {
    try {
      // Use admin endpoint to get ALL products (active and inactive)
      const res = await api.get('/products/admin/all');
      setProducts(res.data.products || []);
    } catch (error) {
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data.orders || []);
    } catch (error) {
    }
  };

  const fetchCategories = async () => {
    // Mock categories - replace with actual API call
    setCategories([
      'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food'
    ]);
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    const action = isActive ? 'deactivate' : 'activate';
    const confirmResult = window.confirm(`Are you sure you want to ${action} this user?`);
    if (!confirmResult) return;

    try {
      await api.put(`/users/${userId}`, { isActive: !isActive });
      toast.success(`User ${action}d successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmResult = window.confirm('Are you sure you want to delete this user? This action is permanent and cannot be undone.');
    if (!confirmResult) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, shippingDetails = null) => {
    try {
      const payload = { status };
      if (shippingDetails) {
        Object.assign(payload, shippingDetails);
      }
      await api.put(`/orders/${orderId}/status`, payload);
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleTogglePayment = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/pay`);
      toast.success('Payment status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  const handleAddCategory = async (categoryName) => {
    if (!categoryName.trim()) {
      toast.warning('Please enter a category name');
      return;
    }
    setCategories([...categories, categoryName.trim()]);
    toast.success('Category added successfully');
  };

  const handleDeleteCategory = async (categoryName) => {
    const confirmResult = window.confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`);
    if (!confirmResult) return;

    setCategories(categories.filter(c => c !== categoryName));
    toast.success(`Category "${categoryName}" deleted`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'categories', label: 'Categories', icon: <Tags className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
    { id: 'faqs', label: 'FAQs', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'banners', label: 'Banners', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> }
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background text-brand-black">
        <div className="bg-brand-white shadow-sm border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-3xl font-bold text-brand-black">Admin Dashboard</h1>
            <p className="text-brand-gray mt-1">Manage your Business</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Tabs */}
          <div className="bg-brand-white rounded-lg shadow-sm mb-6 overflow-hidden border border-border">
            <div className="flex p-1.5 bg-muted w-full">
              <div className="flex space-x-2.5 overflow-x-auto pb-1 scrollbar-hide w-full flex-nowrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200 flex-shrink-0
                      ${activeTab === tab.id
                        ? 'bg-brand-white text-brand-orange shadow-sm border border-border'
                        : 'text-brand-gray hover:bg-brand-white hover:text-brand-orange hover:shadow-sm'
                      }
                      focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:ring-offset-1
                    `}
                  >
                    <span className="flex items-center">
                      <span className="mr-2 text-current">{tab.icon}</span>
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full mx-2"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && <OverviewTab stats={stats} />}
                {activeTab === 'users' && <AdminUsersTab />}
                {activeTab === 'products' && (
                  <AdminProductsTab
                    products={products}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    refreshProducts={fetchProducts}
                  />
                )}
                {activeTab === 'orders' && <AdminOrdersTab />}
                {activeTab === 'categories' && <AdminCategoriesTab />}
                {activeTab === 'reports' && (
                  <ReportsTab />
                )}
                {activeTab === 'faqs' && <AdminFAQsTab />}
                {activeTab === 'banners' && <BannersTab />}
                {activeTab === 'settings' && <SettingsTab />}
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-brand-black">Dashboard Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={<Users className="w-6 h-6" />}
        color="black"
        change=""
      />

      <StatCard
        title="Total Products"
        value={stats.totalProducts}
        icon={<Package className="w-6 h-6" />}
        color="darkGray"
      />
      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        icon={<ShoppingCart className="w-6 h-6" />}
        color="gray"
      />
      <StatCard
        title="Total Revenue"
        value={formatPricePKR(stats.totalRevenue)}
        icon={<DollarSign className="w-6 h-6" />}
        color="orange"
      />
    </div>
  </div>
);

const StatCard = ({ title, value, icon, color, change, badge }) => {
  const colorClasses = {
    orange: 'bg-brand-orange/10 text-brand-orange',
    black: 'bg-brand-black/10 text-brand-black',
    darkGray: 'bg-brand-dark-gray/10 text-brand-dark-gray',
    gray: 'bg-brand-gray/10 text-brand-gray',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-brand-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-gray text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-brand-black">{value}</p>
          {change && <p className="text-sm text-green-600 mt-1">{change}</p>}
        </div>
        <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      {badge && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-xs text-brand-orange font-medium">{badge}</span>
        </div>
      )}
    </div>
  );
};

// Reports Tab Component
const ReportsTab = () => {
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState({
    sales: {},
    topProducts: [],
    topCategories: [],
    loading: true
  });
  const [activeChart, setActiveChart] = useState('sales');

  // In the fetchReportData function, update the categories data processing:
  const fetchReportData = async () => {
    try {
      setReportData(prev => ({ ...prev, loading: true }));

      const [salesRes, productsRes, categoriesRes] = await Promise.all([
        api.get(`/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        api.get(`/reports/top-products?limit=5&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        api.get(`/reports/top-categories?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      ]);

      // Process top products data
      const productsData = Array.isArray(productsRes.data?.data)
        ? productsRes.data.data
        : Array.isArray(productsRes.data)
          ? productsRes.data
          : [];

      const processedTopProducts = productsData.map(product => ({
        id: product._id || product.id || Math.random().toString(36).substr(2, 9),
        name: product.name || 'Unknown Product',
        quantitySold: Number(product.quantitySold || product.sold || product.quantity || 0),
        price: Number(product.price || 0),
        totalSales: Number(product.totalSales || (product.price || 0) * (product.quantitySold || 0)),
        image: product.images?.[0] || product.image || ''
      }));

      // Process categories data
      const categoriesData = Array.isArray(categoriesRes.data?.data)
        ? categoriesRes.data.data
        : Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : [];

      const processedCategories = categoriesData
        .filter(cat => cat && cat.name)
        .map(cat => ({
          ...cat,
          name: String(cat.name || '').trim(),
          totalSales: Number(cat.totalSales || 0),
          orderCount: Number(cat.orderCount || 0),
          productCount: Number(cat.productCount || 0),
          // Add these fields for the chart tooltip
          sales: Number(cat.totalSales || 0),
          orders: Number(cat.orderCount || 0),
          products: Number(cat.productCount || 0)
        }))
        .sort((a, b) => b.totalSales - a.totalSales);

      setReportData({
        sales: {
          ...salesRes.data,
          salesByDate: salesRes.data.salesTrend?.reduce((acc, { date, sales }) => {
            acc[date] = sales;
            return acc;
          }, {}) || {}
        },
        topProducts: processedTopProducts,
        topCategories: processedCategories,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const exportToCSV = async () => {
    try {
      const response = await api.get(
        `/reports/export?type=sales&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const { sales = {}, topProducts = [], loading } = reportData;

  // Handle both old and new sales data structure
  const salesByDate = sales.salesByDate ||
    (sales.salesTrend ?
      sales.salesTrend.reduce((acc, { date, sales }) => {
        acc[date] = sales;
        return acc;
      }, {}) :
      {});

  const salesDates = Object.keys(salesByDate);
  const salesData = Object.values(salesByDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="text-sm font-medium">From:</label>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="border rounded px-2 py-1 text-sm"
              max={dateRange.endDate}
              aria-label="Start date"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="text-sm font-medium">To:</label>
            <input
              id="endDate"
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="border rounded px-2 py-1 text-sm"
              min={dateRange.startDate}
              max={new Date().toISOString().split('T')[0]}
              aria-label="End date"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="bg-brand-orange text-white px-4 py-1 rounded hover:opacity-90 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
              <p className="text-2xl font-bold">{formatPricePKR(sales.totalSales || 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
              <p className="text-2xl font-bold">{sales.totalOrders || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Avg. Order Value</h3>
              <p className="text-2xl font-bold">{formatPricePKR(sales.avgOrderValue || 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Top Selling Category</h3>
              <p className="text-2xl font-bold">
                {sales.topSellingCategory || 'N/A'}
              </p>
            </div>
          </div>

          {/* Chart Tabs */}
          <div className="bg-white rounded-lg shadow p-6 min-w-0">
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 font-medium ${activeChart === 'sales' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}
                onClick={() => setActiveChart('sales')}
              >
                Sales Trend
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeChart === 'products' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}
                onClick={() => setActiveChart('products')}
              >
                Top Products
              </button>
            </div>

            <div>
              {activeChart === 'sales' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Sales Trend</h3>
                  {salesDates.length > 0 ? (
                    <div className="h-64 w-full min-w-0">
                      <ResponsiveContainer width="99%" height="100%">
                        <LineChart
                          data={sales.salesTrend || salesDates.map((date, i) => ({
                          date,
                          sales: salesData[i] || 0
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatPricePKR(value), 'Sales']} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          name="Sales"
                          stroke="#E85002"
                          strokeWidth={2}
                          dot={false}
                        />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No sales data available for the selected date range
                    </div>
                  )}
                </div>
              )}

              {activeChart === 'products' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Top Selling Products</h3>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
                    </div>
                  ) : topProducts && topProducts.length > 0 ? (
                    <div className="h-[400px] sm:h-80 w-full min-w-0">
                      <ResponsiveContainer width="99%" height="100%">
                        <BarChart
                          data={topProducts.map(product => {
                          // Ensure we have numeric values for the chart
                          const quantitySold = Number(product.quantitySold || product.totalQuantity || 0);
                          const price = Number(product.price || 0);
                          const totalSales = Number(product.totalSales || (price * quantitySold) || 0);

                          return {
                            ...product,
                            displayName: product.name && product.name.length > 20
                              ? `${product.name.substring(0, 20)}...`
                              : product.name || 'Unknown Product',
                            quantitySold,
                            price,
                            totalSales
                          };
                        })}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barGap={4}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          tickFormatter={(value) => Math.round(value)}
                        />
                        <YAxis
                          type="category"
                          dataKey="displayName"
                          width={110}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          labelFormatter={(label) => `Product: ${label}`}
                          contentStyle={{
                            padding: '10px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.375rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }}
                          formatter={() => {
                            // Don't show the default tooltip items
                            return null;
                          }}
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;

                            // Get the first payload item which contains all the data
                            const data = payload[0].payload;

                            return (
                              <div className="space-y-1 bg-white">
                                <div className="font-semibold">Product: {label}</div>
                                <div className="flex items-center">
                                  <span className="inline-block w-3 h-3 mr-2 bg-green-500 rounded-full"></span>
                                  <span>Product Price (PKR): {Number(data.price || 0).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="inline-block w-3 h-3 mr-2 bg-brand-orange rounded-full"></span>
                                  <span>Quantity Sold: {Math.round(Number(data.quantitySold || 0))}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="inline-block w-3 h-3 mr-2 bg-purple-500 rounded-full"></span>
                                  <span>Total Sale (PKR): {(Number(data.price || 0) * Number(data.quantitySold || 0)).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}</span>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            let color;
                            if (value === 'Product Price (PKR)') {
                              color = '#10b981';
                            } else if (value === 'Total Sales (PKR)') {
                              color = '#8b5cf6';
                            } else {
                              color = '#E85002';
                            }
                            return <span style={{ color }}>{value}</span>;
                          }}
                        />
                        {/* Price Bar (Green) */}
                        <Bar
                          dataKey="price"
                          name="Product Price (PKR)"
                          fill="#10b981"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                        {/* Total Sales Bar (Purple) */}
                        <Bar
                          dataKey="totalSales"
                          name="Total Sales (PKR)"
                          fill="#8b5cf6"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                        {/* Quantity Sold Bar (Orange) */}
                        <Bar
                          dataKey="quantitySold"
                          name="Quantity Sold"
                          fill="#E85002"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4 text-center">
                      <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium">No product data available</p>
                      <p className="text-sm mt-1">No sales data found for the selected date range</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales.recentOrders?.length > 0 ? (
                      sales.recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {order._id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.user?.name || 'Guest'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="space-y-1">
                              {order.orderItems.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex items-center">
                                  <span className="truncate max-w-xs">
                                    {item.quantity} × {item.name}
                                  </span>
                                </div>
                              ))}
                              {order.orderItems.length > 2 && (
                                <div className="text-xs text-gray-400">
                                  +{order.orderItems.length - 2} more items
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {formatPricePKR(order.totalPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'shipped' ? 'bg-brand-orange/10 text-brand-orange' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No recent orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
// Banners Tab Component

const BANNER_FONT_OPTIONS = [
  {
    group: 'Modern & Clean Sans',
    options: [
      { value: 'sans', label: 'Modern Sans (Inter)', family: "'Inter', sans-serif" },
      { value: 'plus-jakarta', label: 'Plus Jakarta Sans (Crisp Modern)', family: "'Plus Jakarta Sans', sans-serif" },
      { value: 'outfit', label: 'Outfit (Geometric Clean)', family: "'Outfit', sans-serif" },
    ]
  },
  {
    group: 'Luxury & Editorial Serif',
    options: [
      { value: 'playfair', label: 'Playfair Display (Vogue Luxury / Editorial)', family: "'Playfair Display', serif" },
      { value: 'cinzel', label: 'Cinzel (Royal & High Jewelry)', family: "'Cinzel', serif" },
      { value: 'cormorant', label: 'Cormorant Garamond (Haute Couture Italic)', family: "'Cormorant Garamond', serif" },
      { value: 'serif', label: 'Classic Serif', family: 'serif' },
    ]
  },
  {
    group: 'Bold Display & Streetwear',
    options: [
      { value: 'bebas', label: 'Bebas Neue (Bold Streetwear / Big Sale)', family: "'Bebas Neue', sans-serif" },
      { value: 'syne', label: 'Syne (Avant-Garde Designer)', family: "'Syne', sans-serif" },
      { value: 'oswald', label: 'Oswald (Condensed Urban Impact)', family: "'Oswald', sans-serif" },
      { value: 'righteous', label: 'Righteous (Retro Wave / Cyber)', family: "'Righteous', cursive" },
    ]
  },
  {
    group: 'Artisan & Handwritten Script',
    options: [
      { value: 'caveat', label: 'Caveat (Handwritten Signature)', family: "'Caveat', cursive" },
      { value: 'dancing', label: 'Dancing Script (Calligraphy & Romance)', family: "'Dancing Script', cursive" },
    ]
  },
  {
    group: 'Tech & Brutalist',
    options: [
      { value: 'space-grotesk', label: 'Space Grotesk (Tech Editorial)', family: "'Space Grotesk', sans-serif" },
      { value: 'mono', label: 'Clean Monospace', family: 'monospace' },
    ]
  }
];

const BannersTab = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    title: '',
    subtitle: '',
    link: '',
    order: 0,
    isActive: true,
    titleColor: '#000000',
    subtitleColor: '#4b5563',
    titleSize: 'large',
    subtitleSize: 'medium',
    titleFont: 'sans',
    subtitleFont: 'sans',
    textPosition: 'center',
    verticalPosition: 'center',
    buttonText: 'Shop Now',
    buttonColor: '#000000',
    buttonTextColor: '#ffffff'
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/banners/admin');
      setBanners(res.data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image && !editingBannerId) {
      toast.warning('Please select a banner image');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subtitle', formData.subtitle);
      data.append('link', formData.link);
      data.append('order', formData.order);
      data.append('isActive', formData.isActive);
      data.append('titleColor', formData.titleColor);
      data.append('subtitleColor', formData.subtitleColor);
      data.append('titleSize', formData.titleSize);
      data.append('subtitleSize', formData.subtitleSize);
      data.append('titleFont', formData.titleFont);
      data.append('subtitleFont', formData.subtitleFont);
      data.append('textPosition', formData.textPosition);
      data.append('verticalPosition', formData.verticalPosition);
      data.append('buttonText', formData.buttonText);
      data.append('buttonColor', formData.buttonColor);
      data.append('buttonTextColor', formData.buttonTextColor);
      data.append('textColor', formData.titleColor);

      if (image) {
        data.append('image', image);
      }

      if (editingBannerId) {
        await api.put(`/banners/${editingBannerId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Banner updated successfully');
      } else {
        await api.post('/banners', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Banner created successfully');
      }
      
      handleCancelEdit();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error(editingBannerId ? 'Failed to update banner' : 'Failed to create banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (banner) => {
    setEditingBannerId(banner._id);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      order: banner.order || 0,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      titleColor: banner.titleColor || banner.textColor || '#000000',
      subtitleColor: banner.subtitleColor || banner.textColor || '#4b5563',
      titleSize: banner.titleSize || 'large',
      subtitleSize: banner.subtitleSize || 'medium',
      titleFont: banner.titleFont || 'sans',
      subtitleFont: banner.subtitleFont || 'sans',
      textPosition: banner.textPosition || 'center',
      verticalPosition: banner.verticalPosition || 'center',
      buttonText: banner.buttonText || 'Shop Now',
      buttonColor: banner.buttonColor || '#000000',
      buttonTextColor: banner.buttonTextColor || '#ffffff'
    });
    setImage(null);
    setImagePreview(banner.imageUrl ? getMediaUrl(banner.imageUrl) : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingBannerId(null);
    setFormData(initialFormState);
    setImage(null);
    setImagePreview(null);
  };

  const handleDelete = async (id) => {
    if (!(await Swal.fire({ 
      text: 'Are you sure you want to delete this banner?', 
      showCancelButton: true, 
      confirmButtonColor: '#000', 
      customClass: { confirmButton: 'btn-primary', cancelButton: 'btn-secondary' }, 
      buttonsStyling: false 
    })).isConfirmed) return;
    
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const getPreviewTitleClass = (size) => {
    switch (size) {
      case 'small': return 'text-xl sm:text-2xl font-bold';
      case 'medium': return 'text-2xl sm:text-3xl font-bold';
      case 'xlarge': return 'text-4xl sm:text-5xl font-bold';
      case 'large': default: return 'text-3xl sm:text-4xl font-bold';
    }
  };

  const getPreviewSubtitleClass = (size) => {
    switch (size) {
      case 'small': return 'text-xs sm:text-sm';
      case 'large': return 'text-base sm:text-lg';
      case 'medium': default: return 'text-sm sm:text-base';
    }
  };

  const getPreviewFont = (font) => {
    switch (font) {
      case 'plus-jakarta': return 'font-plus-jakarta';
      case 'outfit': return 'font-outfit';
      case 'playfair': return 'font-playfair';
      case 'cinzel': return 'font-cinzel';
      case 'cormorant': return 'font-cormorant italic';
      case 'bebas': return 'font-bebas uppercase';
      case 'syne': return 'font-syne';
      case 'righteous': return 'font-righteous';
      case 'oswald': return 'font-oswald uppercase';
      case 'caveat': return 'font-caveat';
      case 'dancing': return 'font-dancing';
      case 'space-grotesk': return 'font-space-grotesk';
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'sans': default: return 'font-sans';
    }
  };

  const hAlignClass = formData.textPosition === 'left' ? 'text-left items-start' : formData.textPosition === 'right' ? 'text-right items-end' : 'text-center items-center';
  const vAlignClass = formData.verticalPosition === 'top' ? 'justify-start pt-6' : formData.verticalPosition === 'bottom' ? 'justify-end pb-8' : 'justify-center';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hero Banners Management</h2>
          <p className="text-gray-500 text-sm mt-1">Design responsive hero banners with separate typography, colors, solid buttons, and layout controls.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-6 md:p-8">
        <h3 className="text-xl font-bold mb-6 pb-3 border-b border-border">{editingBannerId ? 'Edit Hero Banner' : 'Create New Hero Banner'}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Title Configuration */}
          <div className="bg-gray-50/70 p-5 rounded-lg border border-border/60 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700">1. Title Typography & Color</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-medium text-gray-700 mb-1">Title Text</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="input-field bg-white" 
                  placeholder="e.g. Everyday Essentials. Exceptional Style." 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Title Color</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    value={formData.titleColor} 
                    onChange={e => setFormData({...formData, titleColor: e.target.value})} 
                    className="h-10 w-12 p-0.5 bg-white border border-border rounded cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={formData.titleColor} 
                    onChange={e => setFormData({...formData, titleColor: e.target.value})} 
                    className="w-20 px-2 py-2 text-xs border border-border rounded uppercase bg-white font-mono" 
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Title Size</label>
                <select 
                  value={formData.titleSize} 
                  onChange={e => setFormData({...formData, titleSize: e.target.value})} 
                  className="input-field bg-white text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large (Standard)</option>
                  <option value="xlarge">Extra Large (Bold)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Title Font</label>
                <select 
                  value={formData.titleFont} 
                  onChange={e => setFormData({...formData, titleFont: e.target.value})} 
                  className="input-field bg-white text-sm font-medium"
                >
                  {BANNER_FONT_OPTIONS.map((grp) => (
                    <optgroup key={grp.group} label={grp.group}>
                      {grp.options.map((opt) => (
                        <option key={opt.value} value={opt.value} style={{ fontFamily: opt.family }}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Subtitle Configuration */}
          <div className="bg-gray-50/70 p-5 rounded-lg border border-border/60 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700">2. Subtitle Typography & Color</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle Text</label>
                <input 
                  type="text" 
                  value={formData.subtitle} 
                  onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                  className="input-field bg-white" 
                  placeholder="e.g. Discover fashion, accessories, and tech that fit your everyday life." 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle Color</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    value={formData.subtitleColor} 
                    onChange={e => setFormData({...formData, subtitleColor: e.target.value})} 
                    className="h-10 w-12 p-0.5 bg-white border border-border rounded cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={formData.subtitleColor} 
                    onChange={e => setFormData({...formData, subtitleColor: e.target.value})} 
                    className="w-20 px-2 py-2 text-xs border border-border rounded uppercase bg-white font-mono" 
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle Size</label>
                <select 
                  value={formData.subtitleSize} 
                  onChange={e => setFormData({...formData, subtitleSize: e.target.value})} 
                  className="input-field bg-white text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle Font</label>
                <select 
                  value={formData.subtitleFont} 
                  onChange={e => setFormData({...formData, subtitleFont: e.target.value})} 
                  className="input-field bg-white text-sm font-medium"
                >
                  {BANNER_FONT_OPTIONS.map((grp) => (
                    <optgroup key={grp.group} label={grp.group}>
                      {grp.options.map((opt) => (
                        <option key={opt.value} value={opt.value} style={{ fontFamily: opt.family }}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Alignment, Layout & Positioning across all screen sizes */}
          <div className="bg-gray-50/70 p-5 rounded-lg border border-border/60 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700">3. Positioning & Layout (Responsive for All Screens)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Horizontal Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'left', label: 'Left Aligned' },
                    { value: 'center', label: 'Center Aligned' },
                    { value: 'right', label: 'Right Aligned' }
                  ].map(option => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setFormData({...formData, textPosition: option.value})}
                      className={`py-2.5 px-3 text-xs font-medium rounded-lg border transition-all ${
                        formData.textPosition === option.value 
                          ? 'bg-black text-white border-black shadow-sm' 
                          : 'bg-white text-gray-700 border-border hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Vertical Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'top', label: 'Top' },
                    { value: 'center', label: 'Middle' },
                    { value: 'bottom', label: 'Bottom' }
                  ].map(option => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setFormData({...formData, verticalPosition: option.value})}
                      className={`py-2.5 px-3 text-xs font-medium rounded-lg border transition-all ${
                        formData.verticalPosition === option.value 
                          ? 'bg-black text-white border-black shadow-sm' 
                          : 'bg-white text-gray-700 border-border hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Call to Action Button (Solid Color - No Gradient) */}
          <div className="bg-gray-50/70 p-5 rounded-lg border border-border/60 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700">4. Call to Action Button (Solid Color - No Gradient)</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
                <input 
                  type="text" 
                  value={formData.buttonText} 
                  onChange={e => setFormData({...formData, buttonText: e.target.value})} 
                  className="input-field bg-white" 
                  placeholder="Shop Now" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Button Destination URL</label>
                <input 
                  type="text" 
                  value={formData.link} 
                  onChange={e => setFormData({...formData, link: e.target.value})} 
                  className="input-field bg-white" 
                  placeholder="/products" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Button Color (Solid)</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    value={formData.buttonColor} 
                    onChange={e => setFormData({...formData, buttonColor: e.target.value})} 
                    className="h-10 w-12 p-0.5 bg-white border border-border rounded cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={formData.buttonColor} 
                    onChange={e => setFormData({...formData, buttonColor: e.target.value})} 
                    className="w-24 px-2 py-2 text-xs border border-border rounded uppercase bg-white font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Button Text Color</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    value={formData.buttonTextColor} 
                    onChange={e => setFormData({...formData, buttonTextColor: e.target.value})} 
                    className="h-10 w-12 p-0.5 bg-white border border-border rounded cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={formData.buttonTextColor} 
                    onChange={e => setFormData({...formData, buttonTextColor: e.target.value})} 
                    className="w-24 px-2 py-2 text-xs border border-border rounded uppercase bg-white font-mono" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Media & Publication */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Banner Image {editingBannerId && '(Leave empty to keep current)'}</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="input-field bg-white p-2 text-xs" 
                required={!editingBannerId && !imagePreview} 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Display Order</label>
              <input 
                type="number" 
                value={formData.order} 
                onChange={e => setFormData({...formData, order: e.target.value})} 
                className="input-field bg-white" 
              />
            </div>

            <div className="flex items-center space-x-2 h-10">
              <input 
                type="checkbox" 
                id="bannerActive" 
                checked={formData.isActive} 
                onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer" 
              />
              <label htmlFor="bannerActive" className="text-sm font-medium text-gray-800 cursor-pointer">Active on Homepage</label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="mt-6 border border-border rounded-xl overflow-hidden bg-gray-50">
            <div className="bg-gray-100/80 px-4 py-2 border-b border-border text-xs font-semibold text-gray-600 flex justify-between items-center">
              <span>Live Visual Preview</span>
              <span className="text-gray-400 font-normal">Real-time simulation of colors, sizes & alignment</span>
            </div>
            <div className="relative h-64 md:h-72 w-full overflow-hidden flex items-center justify-center bg-gray-200">
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              )}
              <div className="absolute inset-0 bg-black/20"></div>

              <div className={`relative z-10 w-full h-full p-6 md:p-8 flex flex-col ${vAlignClass} ${hAlignClass}`}>
                <h3 
                  className={`${getPreviewTitleClass(formData.titleSize)} ${getPreviewFont(formData.titleFont)} tracking-tight mb-2`}
                  style={{ color: formData.titleColor }}
                >
                  {formData.title || 'Banner Title Preview'}
                </h3>
                <p 
                  className={`${getPreviewSubtitleClass(formData.subtitleSize)} ${getPreviewFont(formData.subtitleFont)} max-w-xl mb-4`}
                  style={{ color: formData.subtitleColor }}
                >
                  {formData.subtitle || 'Subtitle text with customized font, color, and size.'}
                </p>
                <div 
                  style={{ backgroundColor: formData.buttonColor, color: formData.buttonTextColor }}
                  className="inline-flex items-center px-6 py-2.5 rounded-full text-xs font-semibold shadow-sm select-none"
                >
                  {formData.buttonText || 'Shop Now'} &rarr;
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center px-6 py-2.5 text-sm">
              {isSubmitting ? 'Saving...' : <><Upload className="w-4 h-4 mr-2" /> {editingBannerId ? 'Update Banner' : 'Publish Banner'}</>}
            </button>
            {editingBannerId && (
              <button type="button" onClick={handleCancelEdit} className="btn-secondary px-6 py-2.5 text-sm">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">Loading banners...</p>
        ) : banners.length === 0 ? (
          <p className="text-gray-500 col-span-full">No banners found. Create one above to display on the storefront.</p>
        ) : (
          banners.map(banner => (
            <div key={banner._id} className="border border-border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="h-44 bg-gray-100 w-full overflow-hidden relative">
                <img 
                  src={getMediaUrl(banner.imageUrl)} 
                  alt={banner.title} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/600x400'; }} 
                />
                {!banner.isActive && (
                  <div className="absolute top-2 right-2 bg-black text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    Inactive
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                  <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm uppercase">
                    {banner.textPosition || 'center'}
                  </span>
                  <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm uppercase">
                    {banner.titleSize || 'large'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: banner.titleColor || banner.textColor || '#000000' }} title="Title Color"></span>
                  <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: banner.subtitleColor || banner.textColor || '#4b5563' }} title="Subtitle Color"></span>
                  <h4 className="font-bold text-base truncate flex-1" style={{ color: banner.titleColor || banner.textColor || '#000000' }}>
                    {banner.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2" style={{ color: banner.subtitleColor || banner.textColor || '#4b5563' }}>
                  {banner.subtitle}
                </p>

                <div className="flex space-x-3 pt-3 border-t border-border">
                  <button onClick={() => handleEditClick(banner)} className="text-black hover:text-gray-600 text-xs font-semibold flex items-center">
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit Design
                  </button>
                  <button onClick={() => handleDelete(banner._id)} className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center">
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

const SettingsTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    shipping: { isTiered: true, flatRate: 200, freeShippingThreshold: 5000 },
    tax: { rate: 10 }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.data) {
          setSettings({
            shipping: res.data.data.shipping || { isTiered: true, flatRate: 200, freeShippingThreshold: 5000 },
            tax: res.data.data.tax || { rate: 10 }
          });
        }
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;
    const category = dataset.category || 'shipping';
    
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: type === 'checkbox' ? checked : Number(value)
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Store Settings</h2>
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Shipping Configuration</h3>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isTiered"
                  data-category="shipping"
                  checked={settings.shipping.isTiered}
                  onChange={handleChange}
                  className="w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded"
                />
                <span className="font-medium">Enable Tiered Shipping (Free above threshold)</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Flat Rate Shipping Cost (PKR)</label>
              <input 
                type="number"
                name="flatRate"
                data-category="shipping"
                min="0"
                value={settings.shipping.flatRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
              />
            </div>

            {settings.shipping.isTiered && (
              <div>
                <label className="block text-sm font-medium mb-1">Free Shipping Threshold (PKR)</label>
                <input 
                  type="number"
                  name="freeShippingThreshold"
                  data-category="shipping"
                  min="0"
                  value={settings.shipping.freeShippingThreshold}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                />
                <p className="text-xs text-gray-500 mt-1">Orders with total price above this amount will have free shipping.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Tax Configuration</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
              <input 
                type="number"
                name="rate"
                data-category="tax"
                min="0"
                max="100"
                step="0.1"
                value={settings.tax.rate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
              />
              <p className="text-xs text-gray-500 mt-1">Example: Enter 10 for 10% tax.</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

