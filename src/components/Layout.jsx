import Navigation from './Navigation';

export default function Layout({ children, className = "" }) {
  return (
    <div className={`min-h-screen ${className}`}>
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  );
}
