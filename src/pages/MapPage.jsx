import Map from '../components/Map';
import Navigation from '../components/Navigation';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      {/* Map Component */}
      <div className="h-[calc(100vh-4rem)]">
        <Map />
      </div>
    </div>
  );
}
