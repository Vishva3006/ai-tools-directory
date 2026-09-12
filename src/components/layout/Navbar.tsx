import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Menu, X, Sun, Moon, Search, LogOut, Settings,
  LayoutDashboard, ChevronDown, Heart, Send
} from 'lucide-react';

export default function Navbar() {
  const { user, loading, darkMode, toggleDarkMode, signOut, categories } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Refs for click-outside detection
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowUserMenu(false);
    setShowCategories(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/tools?q=${encodeURIComponent(q)}`);
      setMobileOpen(false);
    }
  };

  const handleSignOut = async () => {
    setShowUserMenu(false);
    setMobileOpen(false);
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Tools', href: '/tools' },
    { name: 'Categories', href: '/categories', hasDropdown: true },
    { name: 'Blog', href: '/blog' },
    { name: 'Submit Tool', href: '/submit' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Get initials for avatar
  const getInitial = () => {
    if (user?.full_name && user.full_name.trim().length > 0) {
      return user.full_name.trim().charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const AvatarCircle = ({ size = 'sm' }: { size?: 'sm' | 'lg' }) => {
    const sizeClass = size === 'lg' ? 'w-12 h-12 text-lg' : 'w-8 h-8 text-sm';
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center overflow-hidden border-2 border-white/20 dark:border-slate-600 flex-shrink-0`}
      >
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-semibold">{getInitial()}</span>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
                AI Tools Directory
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <div key={link.name} className="relative" ref={link.hasDropdown ? categoriesRef : undefined}>
                {link.hasDropdown ? (
                  <button
                    onClick={() => setShowCategories(!showCategories)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.name}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    to={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}

                {link.hasDropdown && showCategories && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 animate-fade-in">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => setShowCategories(false)}
                      >
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: cat.color || '#3B82F6' }}
                        >
                          {cat.name.charAt(0)}
                        </span>
                        {cat.name}
                      </Link>
                    ))}
                    {categories.length === 0 && (
                      <p className="px-4 py-3 text-sm text-slate-400">No categories found</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                         bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200
                         placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              />
            </form>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Section */}
            {loading ? (
              /* Loading skeleton — prevents flash of Sign In */
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ) : user ? (
              /* Logged In: Avatar + Dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-menu-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <AvatarCircle size="sm" />
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                    role="menu"
                  >
                    {/* Profile Header */}
                    <div className="px-5 py-4 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-700 dark:to-slate-750 border-b border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-3">
                        <AvatarCircle size="lg" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                            {user.full_name || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        Dashboard
                      </Link>
                      <Link
                        to="/favorites"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <Heart className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        My Favorites
                      </Link>
                      <Link
                        to="/submit"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <Send className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        Submit Tool
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        Settings
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-slate-200 dark:border-slate-600 py-1.5">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged Out: Sign In + Get Started */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search AI tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </form>

            {/* Mobile Nav Links */}
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.hasDropdown ? '/categories' : link.href}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-full transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              {/* Mobile Auth Section */}
              {loading ? (
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ) : user ? (
                <div className="space-y-1">
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <AvatarCircle size="lg" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {user.full_name || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Mobile User Links */}
                  <nav className="space-y-1 pt-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Heart className="w-5 h-5" />
                      My Favorites
                    </Link>
                    <Link
                      to="/submit"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Send className="w-5 h-5" />
                      Submit Tool
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </nav>
                </div>
              ) : (
                <div className="flex gap-2 px-4">
                  <Link
                    to="/login"
                    className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
