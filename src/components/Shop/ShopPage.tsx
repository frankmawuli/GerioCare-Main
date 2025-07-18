import React, { useState, useEffect } from 'react';
import { ShoppingCart, Filter, Search, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';

export const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'therapy', label: 'Therapy Sessions' },
    { value: 'assistive_tools', label: 'Assistive Tools' },
    { value: 'supplements', label: 'Supplements' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product_id: product.id, quantity: 1, product }];
      }
    });
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health & Wellness Shop</h1>
            <p className="text-gray-600 mt-2">
              Therapy sessions, assistive tools, and wellness products
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Featured Therapy Sessions */}
      {selectedCategory === 'all' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Therapy Sessions</h2>
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg p-8 text-white">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold mb-4">Personalized Care Sessions</h3>
              <p className="text-blue-100 mb-6">
                Connect with certified therapists for personalized care sessions tailored to your needs.
                Available for physical therapy, occupational therapy, and wellness consultations.
              </p>
              <button
                onClick={() => setSelectedCategory('therapy')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Browse Therapy Sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg`;
                }}
              />
            </div>
            <div className="p-6">
              <div className="mb-2">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  product.category === 'therapy' ? 'bg-purple-100 text-purple-800' :
                  product.category === 'assistive_tools' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {product.category.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                  {product.category === 'therapy' && (
                    <span className="text-sm text-gray-600">/session</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.8</span>
                </div>
              </div>

              <button
                onClick={() => addToCart(product)}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'Try selecting a different category'}
          </p>
        </div>
      )}
    </div>
  );
};