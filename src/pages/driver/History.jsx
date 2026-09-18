import { DriverBack, DriverEmpty } from './DriverUI';
export default function History() {
  return <div className="page-transition driver-stack"><DriverBack /><h1>Histórico de viagens</h1>
    <DriverEmpty title="Histórico ainda indisponível"><p>O registro de início e encerramento das viagens será disponibilizado em uma próxima etapa. Não há histórico operacional para consultar nesta versão.</p></DriverEmpty>
  </div>;
}
