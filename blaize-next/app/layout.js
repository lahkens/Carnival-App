import './globals.css'
import { LoadingProvider } from '../context/LoadingContext';
import GlobalLoader from '../components/GlobalLoader';

export const metadata = {
  title: 'Blaize Carnival',
  description: 'Winter Carnival 2024 - Blaize'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LoadingProvider>
          <GlobalLoader />
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}