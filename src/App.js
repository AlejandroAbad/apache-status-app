import React, { useEffect, useState, useCallback, useRef } from 'react';
import logo from './logo.svg';
import './App.css';



const REGEX = /<tr><td><b>([0-9-]*)<\/b><\/td><td>([0-9]*|-)<\/td><td>([0-9]*)\/([0-9]*)\/([0-9]*)<\/td><td><b>([SRWKDCLGI])<\/b>\n<\/td><td>([0-9.]*)<\/td><td>([0-9.]*)<\/td><td>([0-9.]*)<\/td><td>([0-9.]*)<\/td><td>([0-9.]*)<\/td><td>([0-9.]*)\n<\/td><td>([0-9.]*)<\/td><td>(.*)<\/td><td nowrap>(.*)<\/td><td nowrap>(.*)<\/td><\/tr>/gm

const App = () => {

	const [resultado, setResultado] = useState({ cargando: false, error: null, datos: null })
	const ultimoResultado = useRef()

	const consultaServidor = useCallback(() => {

		setResultado({ cargando: true, error: ultimoResultado.current?.error, datos: ultimoResultado.current?.datos })
		fetch('http://liferay-prx.kio.hefame.es/server-status')
			.then(res => res.text())
			.then(res => {
				setResultado({ cargando: false, error: null, datos: res })
			})
			.catch(err => {
				setResultado({ cargando: false, error: err, datos: null })
			})

	}, [setResultado])

	ultimoResultado.current = resultado;


	useEffect(consultaServidor, [consultaServidor])


	if (resultado.cargando && !resultado.datos) {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<p>
						Inventando la rueda ....
        </p>
				</header>
			</div>
		);
	} else {
		if (resultado.error) {
			return (
				<div className="App">
					<pre>
						{resultado.error.toString()}
					</pre>
				</div>
			);
		}
		else {

			let match = REGEX.exec(resultado.datos);
			let workers = [];

			while (match != null) {
				if (match[16])
					workers.push(match)
				match = REGEX.exec(resultado.datos);
			}

			workers = workers.sort((a, b) => {
				return parseInt(b[8]) - parseInt(a[8])
			})

			let sortedWorkers = workers.map((w, i) => <Worker key={i} datos={w} />)



			return (
				<>
					<button onClick={consultaServidor}>¡ REFRÉSCATE !</button>
					<table>
						<thead>
							<tr>
								<th>Acción</th>
								<th>Tiempo (sec)</th>
								<th>Transferencia (Kb)</th>
								<th>IP origen</th>
								<th>VHost</th>
								<th>Petición</th>
							</tr>
						</thead>
						<tbody>
							{sortedWorkers}
						</tbody>
					</table>
					<ul>
						<li><b>"S"</b> Starting up</li>
						<li><b>"R"</b> Reading Request</li>
						<li><b>"W"</b> Sending Reply</li>
						<li><b>"K"</b> Keepalive (read)</li>
						<li><b>"D"</b> DNS Lookup</li>
						<li><b>"C"</b> Closing connection</li>
						<li><b>"L"</b> Logging</li>
						<li><b>"G"</b> Gracefully finishing</li>
						<li><b>"I"</b> Idle cleanup of worker</li>
					</ul>
				</>
			);
		}
	}
}

export default App;



const Worker = ({ datos }) => {

	console.log(datos)
	return (
		<tr>
			<td>{datos[6]}</td>
			<td>{datos[8]}</td>
			<td>{datos[10]}</td>
			<td>{datos[13]}</td>
			<td>{datos[15]}</td>
			<td>{datos[16]}</td>
		</tr>
	)
}