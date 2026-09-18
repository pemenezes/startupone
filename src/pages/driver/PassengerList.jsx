import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDriver } from './driver-context';
import { DriverBack, DriverEmpty, DriverError, DriverLoading } from './DriverUI';

export default function PassengerList() {
  const { journey, passengers, assignment, status } = useDriver();
  const [search, setSearch] = useState('');
  const list = passengers.data || [];
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const filtered = list.filter((p) => normalize(p.name).includes(normalize(search.trim())));
  return <div className="page-transition driver-stack">
    <DriverBack /><h1>Passageiros de hoje</h1>
    {journey.loading ? <DriverLoading /> : journey.error ? <DriverError error={journey.error} onRetry={journey.refresh} /> :
      !assignment ? <DriverEmpty title="Sem rota assumida"><Link className="btn btn-primary" to="/driver/claim-route">Assumir rota</Link></DriverEmpty> :
      status !== 'scheduled' ? <DriverEmpty title="Sem operação prevista hoje"><p>Consulte a vigência e os dias da rota na jornada.</p></DriverEmpty> :
      <><h2>{assignment.route.name}</h2><p>Passageiros previstos, em ordem alfabética. Esta lista ainda não define a sequência de paradas nem registra presença.</p>
        {passengers.loading ? <DriverLoading>Carregando passageiros...</DriverLoading> : passengers.error ? <DriverError error={passengers.error} onRetry={passengers.refresh} /> :
          <><label className="driver-stack">Buscar por nome<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome do passageiro" /></label>
            <p role="status">{filtered.length} de {list.length} passageiro(s)</p>
            {!list.length ? <DriverEmpty title="Nenhum passageiro previsto"><p>Os inscritos não estão agendados para hoje ou cancelaram o dia.</p></DriverEmpty> :
              !filtered.length ? <DriverEmpty title="Nenhum resultado"><p>Tente outro nome.</p></DriverEmpty> :
                <ul className="driver-passengers">{filtered.map((p) => <li className="card driver-stack" key={p.id}><strong>{p.name}</strong><span className="driver-badge">Previsto</span><p>Endereço residencial: {p.homeAddress}</p></li>)}</ul>}
          </>}
        <button className="btn btn-outline" type="button" onClick={passengers.refresh} disabled={passengers.loading}>Atualizar passageiros</button>
      </>}
  </div>;
}
