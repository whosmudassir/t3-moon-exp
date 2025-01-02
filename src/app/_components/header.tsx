export default function Header() {
  return (
    <header className="bg-white shadow-md">
      {/* Main Navigation */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="text-lg font-bold">ECOMMERCE</div>
        <nav className="flex space-x-6">
          <a href="#" className="text-gray-700 hover:text-black">
            Categories
          </a>
          <a href="#" className="text-gray-700 hover:text-black">
            Sale
          </a>
          <a href="#" className="text-gray-700 hover:text-black">
            Clearance
          </a>
          <a href="#" className="text-gray-700 hover:text-black">
            New stock
          </a>
          <a href="#" className="text-gray-700 hover:text-black">
            Trending
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <a href="#" className="text-gray-700 hover:text-black">
            Help
          </a>
          <a href="#" className="text-gray-700 hover:text-black">
            Orders & Returns
          </a>
          <a href="#" className="text-gray-700 hover:text-black">
            Hi, John
          </a>
          <button>
            <svg
              className="h-5 w-5 text-gray-700 hover:text-black"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h14m-7-7v14"
              />
            </svg>
          </button>
          <button>
            <svg
              className="h-5 w-5 text-gray-700 hover:text-black"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h18l-3 9H6l-3-9z"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Top Banner */}
      <div className="bg-gray-200 py-2 text-center text-sm">
        <span>Get 10% off on business sign up</span>
      </div>
    </header>
  );
}
