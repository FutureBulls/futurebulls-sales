const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-dark dark:via-dark-2 dark:to-dark-3">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237C3AED' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Main Loader Container */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        {/* StockZy Logo with Animation */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          
          {/* Rotating Ring */}
          <div className="absolute inset-0 w-20 h-20 rounded-2xl border-4 border-transparent border-t-primary/30 animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 rounded-2xl border-4 border-transparent border-b-secondary/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-dark dark:text-white">StockZy</h2>
          <p className="text-gray-6 dark:text-gray-5 text-sm">Loading your learning platform...</p>
        </div>

        {/* Progress Dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-sm animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-6 h-6 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-10 w-3 h-3 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-10 w-5 h-5 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};

export default Loader;
