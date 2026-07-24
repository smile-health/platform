import { TPrintLabel } from '@/types/print-label';
import ReactDOM from 'react-dom/client';
import QRPrintWindow from './QRPrintWindow';

export async function openQRPrintWindow(dataPrint: TPrintLabel[]) {
  const container = document.createElement('div');
  container.id = 'temp-print';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(<QRPrintWindow data={dataPrint} />);

  setTimeout(() => {
    root.unmount();
    container.remove();
  }, 2000);
}
