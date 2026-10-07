import type { Metadata } from 'next';
import { EmpresaProvider } from '../components/providers/EmpresaProvider';
import { CockpitShellConnected } from '../components/shell/CockpitShellConnected';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cockpit · Vista Negocio',
  description: 'Sistema empresarial — ingesta multi-fuente, As-Is/To-Be, Hilo de Oro (P1 · Discovery)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <EmpresaProvider>
          <CockpitShellConnected>{children}</CockpitShellConnected>
        </EmpresaProvider>
      </body>
    </html>
  );
}
