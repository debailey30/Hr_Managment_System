
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import HRManagementApp from '../HRManagementApp';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HRManagementApp>
      <Component {...pageProps} />
    </HRManagementApp>
  );
}
