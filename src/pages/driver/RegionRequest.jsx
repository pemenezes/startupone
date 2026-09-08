import { DriverBack, DriverEmpty } from './DriverUI';
export default function RegionRequest() {
  return <div className="page-transition driver-stack"><DriverBack to="/driver/profile">Voltar ao perfil</DriverBack><h1>Solicitação de região</h1>
    <DriverEmpty title="Solicitação ainda indisponível"><p>O envio e acompanhamento de solicitações de região serão disponibilizados em uma próxima etapa. Por enquanto, consulte a operação para solicitar uma mudança.</p></DriverEmpty>
  </div>;
}
