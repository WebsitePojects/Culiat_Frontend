import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

const BypassForm = () => {
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const bypassKeyword = (import.meta.env.VITE_MAINTENANCE_BYPASS_KEYWORD || 'vergel')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '') || 'vergel';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const enteredKeyword = keyword.toLowerCase().trim();

    if (enteredKeyword === bypassKeyword) {
      // Store bypass in localStorage with timestamp (10 minutes validity)
      localStorage.setItem('maintenanceBypass', bypassKeyword);
      localStorage.setItem('maintenanceBypassTime', Date.now().toString());
      // Redirect to home page
      navigate('/');
    } else {
      setError('Invalid bypass keyword. Please try again.');
      setKeyword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5f8d] to-[#1e3a5f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back to Maintenance Page</span>
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#1e3a5f]/10 p-4 rounded-full">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-[#1e3a5f]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
            Maintenance Bypass
          </h1>
          <p className="text-xs sm:text-sm text-center text-gray-600 mb-6 sm:mb-8">
            Enter the bypass keyword to access the system during maintenance mode
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="keyword"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Bypass Keyword
              </label>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter bypass keyword"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none transition-all"
                required
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#1e3a5f] hover:bg-[#2d5f8d] text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              Access System
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-[10px] sm:text-xs text-center text-gray-500">
              Contact the system administrator if you don't have the bypass keyword
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BypassForm;
