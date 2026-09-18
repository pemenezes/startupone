import { DriverBack, DriverEmpty } from './DriverUI';
export default function DriverStatus() {
  return <div className="page-transition driver-stack"><DriverBack to="/driver/profile">Voltar ao perfil</DriverBack><h1>Documentação e situação operacional</h1>
    <DriverEmpty title="Situação não informada"><p>A consulta de aprovação e liberação operacional ainda não está disponível. Consulte a operação para confirmar sua situação.</p></DriverEmpty>
    <DriverEmpty title="Documentação"><p>O envio de CNH, CRLV e a consulta de vencimentos ainda não estão disponíveis no aplicativo.</p></DriverEmpty>
    <DriverEmpty title="Penalidades"><p>O histórico de penalidades ainda não está integrado. Esta tela não confirma a existência ou ausência de ocorrências.</p></DriverEmpty>
  </div>;
}
