import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to ORS Map
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A powerful route planning application using OpenRouteService API
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/map"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Open Map
          </Link>
          <Link
            to="/about"
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Learn More
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold mb-2">Interactive Mapping</h3>
            <p className="text-gray-600">
              Navigate through detailed maps with multiple transport modes
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold mb-2">Fast Routing</h3>
            <p className="text-gray-600">
              Get optimal routes for walking, cycling, and driving
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Detailed Analytics</h3>
            <p className="text-gray-600">
              View elevation profiles and route statistics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
