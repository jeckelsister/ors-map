import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

export default function About(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* About Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            About ORS Map
          </h1>

          <div className="prose prose-lg text-gray-600">
            <p className="mb-6">
              ORS Map is a modern web application built with React that provides
              powerful route planning capabilities using the OpenRouteService
              API. Whether you're planning a walking route, cycling adventure,
              or driving directions, our application offers comprehensive
              mapping solutions.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Features
            </h2>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>Multiple transport modes (walking, cycling, driving)</li>
              <li>Real-time route calculation with elevation profiles</li>
              <li>Interactive map with multiple layers</li>
              <li>Multi-trace support with color-coded routes</li>
              <li>Autocomplete location search</li>
              <li>Detailed route statistics and summaries</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Technology Stack
            </h2>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>React 19 with modern hooks</li>
              <li>Leaflet for interactive mapping</li>
              <li>Tailwind CSS for styling</li>
              <li>Axios for API communication</li>
              <li>Vitest for comprehensive testing</li>
              <li>React Router for navigation</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Getting Started
            </h2>
            <p className="mb-4">
              Ready to start planning your routes? Head over to the{" "}
              <Link
                to="/map"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                map page
              </Link>{" "}
              and begin exploring the features.
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Built with ❤️ using OpenRouteService API
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
