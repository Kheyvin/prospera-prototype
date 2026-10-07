'use client';

import { useEmpresa } from '../../components/providers/EmpresaProvider';
import { NegocioView } from '../../components/negocio/NegocioView';

export default function NegocioPage() {
  const { empresa } = useEmpresa();
  return <NegocioView empresa={empresa} />;
}
