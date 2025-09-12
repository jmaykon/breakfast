    document.addEventListener("DOMContentLoaded", function () {
        // Inicializar modales con Flowbite
        const modalEditarIndividual = new Modal(document.getElementById('editarBoletaIndividualModal'));
    const modalEditar = new Modal(document.getElementById('editarBoletaModal'));
    const modalDuplicar = new Modal(document.getElementById('duplicarBoletaModal'));

    // Guardar en window para acceso global
    window.modalEditarIndividual = modalEditarIndividual;
    window.modalEditar = modalEditar;
    window.modalDuplicar = modalDuplicar;

    // Cargar contratos
    fetch('/Boleta/ListarContratos')
            .then(response => response.json())
            .then(data => {
        console.log(data);

    const boletasContainer = document.getElementById('boletas-container');
    boletasContainer.innerHTML = '';

    let boletasHTML = '';

                // Iterar sobre cada contrato recibido
                data.forEach((contrato, index) => {
        boletasHTML += `
                    <div class="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700 hover:shadow-md hover:border-slate-600 transition-all duration-200">
                        <!-- Header -->
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                                    <i class="fas fa-truck text-blue-400 text-sm"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-white">Carga #${contrato.nroCarga}</h3>
                                    <p class="text-xs text-slate-400">Creada: ${contrato.fCreacion}</p>
                                </div>
                            </div>

                            <!-- Acciones -->
                            <div class="flex space-x-1">
                                <button class="w-8 h-8 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg flex items-center justify-center transition-colors border border-blue-500/30"
                                        onclick="copiarCarga(${contrato.nroCarga})"
                                        title="Copiar">
                                    <i class="fas fa-copy text-xs"></i>
                                </button>
                                <button class="w-8 h-8 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg flex items-center justify-center transition-colors border border-green-500/30"
                                        onclick="edicionBoleta(${contrato.nroCarga})"
                                        title="Editar">
                                    <i class="fas fa-edit text-xs"></i>
                                </button>
                                <button class="w-8 h-8 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg flex items-center justify-center transition-colors border border-red-500/30"
                                        onclick="eliminarBoletaTotal(${contrato.nroCarga})"
                                        title="Eliminar">
                                    <i class="fas fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Fechas -->
                        <div class="grid grid-cols-2 gap-2 mb-4 text-xs">
                            <div class="bg-slate-700 rounded-lg p-2 border border-slate-600">
                                <span class="text-slate-400 block">Despacho</span>
                                <span class="font-medium text-white">${contrato.fDespacho}</span>
                            </div>
                            <div class="bg-slate-700 rounded-lg p-2 border border-slate-600">
                                <span class="text-slate-400 block">Entrega</span>
                                <span class="font-medium text-white">${contrato.fEntrega}</span>
                            </div>
                            <div class="bg-slate-700 rounded-lg p-2 col-span-2 border border-slate-600">
                                <span class="text-slate-400 block">Consolidado</span>
                                <span class="font-medium text-white">${contrato.fConsolidado !== null ? contrato.fConsolidado : 'Sin Consolidar'}</span>
                            </div>
                        </div>

                        <!-- Controles -->
                        <div class="space-y-3">
                            <div class="flex gap-2">
                                <input type="text"
                                       class="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 px-3 py-2 placeholder-slate-400"
                                       id="repeticionesTotales_${contrato.id}"
                                       placeholder="Repeticiones">
                                <select class="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 flex-2"
                                        id="select_${contrato.id}">
                                    <option value="1">La Paz </option>
                                    <option value="2">El Alto </option>
                                </select>
                            </div>

                            <button class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
                                    onclick="seleccionBoleta(${contrato.nroCarga},'repeticionesTotales_${contrato.id}','select_${contrato.id}')">
                                <i class="fas fa-print mr-2"></i>Imprimir Carga
                            </button>

                            <button class="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
                                    onclick="verBoletasIndividuales(${contrato.nroCarga})"
                                    >
                                <i class="fas fa-eye mr-2"></i>Ver Boletas
                            </button>
                        </div>
                    </div>`;
                });

    boletasContainer.innerHTML = boletasHTML;
            })
            .catch(error => {
        console.error('Error al obtener los contratos:', error);
    document.getElementById('boletas-container').innerHTML = `
    <div class="col-span-full text-center py-12">
        <div class="bg-red-900/50 border border-red-800 rounded-xl p-6">
            <i class="fas fa-exclamation-triangle text-red-400 text-3xl mb-4"></i>
            <h3 class="text-lg font-semibold text-red-300 mb-2">Error al cargar los datos</h3>
            <p class="text-red-400">No se pudieron obtener los contratos del servidor</p>
        </div>
    </div>`;
            });
    });



async function seleccionBoleta(nCarga, inputId, tipoBoleta) {
    let seleccion = document.getElementById(tipoBoleta).value;
    console.log("Ubicación seleccionada:", seleccion);
    if (seleccion == 1) {
        imprimirBoletasTotalesLaPaz(nCarga, inputId);
    } else {
        imprimirBoletasTotalesElAlto(nCarga, inputId);
    }
}
async function imprimirBoletasTotalesLaPaz(nCarga, inputId) {
    try {
        const repeticiones = parseInt(document.getElementById(inputId).value, 10) || 1;
        const response = await fetch(`/Boleta/ObtenerBoletasTotales?ncarga=${nCarga}`);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }
        const data = await response.json();

        if (!data.success || !data.data || data.data.length === 0) {
            throw new Error("No se encontraron datos para imprimir.");
        }

        // Agrupar productos por número de boleta
        const boletasMap = new Map();

        data.data.forEach(item => {
            if (!boletasMap.has(item.nroBoleta)) {
                // Si es la primera vez que vemos esta boleta, inicializamos con la info de la boleta y un array vacío de productos
                boletasMap.set(item.nroBoleta, {
                    boletaInfo: item,
                    productos: []
                });
            }

            // Añadimos el producto al array de productos de esta boleta
            boletasMap.get(item.nroBoleta).productos.push(item);
        });

        console.log("Total de boletas únicas:", boletasMap.size);
        console.log("Boletas agrupadas:", boletasMap);

        // Crear contenedor temporal
        const printArea = document.createElement("div");
        printArea.id = "printArea";
        let contenidoBoleta = '';
        for (let i = 0; i < repeticiones; i++) {
            // Generar cada boleta con sus productos específicos
            boletasMap.forEach((boletaData, nroBoleta) => {
                const item = boletaData.boletaInfo;
                const productosDeEstaBoleta = boletaData.productos;
                contenidoBoleta += `
            <div class="boleta">

        <div class="boleta_encabezado">

            <div class="boleta_encabezado_titulo_izquierdo">
                <div class="boleta_encabezado_titulo_izquierdo_descripcion">
                    <h5>GOBIERNO AUTONOMO MUNICIPAL DE LA PAZ</h5>
                    <h5>ALIMENTO COMPLEMENTARIO ESCOLAR</h5>
                    <h5>PARA UNA VIDA SANA</h5>
                    <h5>ACTA DE ENTREGA Y RECEPCION</h5>
                </div>
            </div>
            <div class="boleta_encabezado_titulo_derecho">



                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Nro. Acta:</h5>
                    <h5 id="nroCargaPrint">${data.data[0].nroCarga}</h5>
                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Fecha de Entrega:</h5>
                    <h5 id="fechaEntregaBoletaPrint">${data.data[0].fEntrega}</h5>
                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Turno:</h5>
                    <h5 id="turnoPrint">:${item.turno}</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Nro. Raciones Inicial:</h5>
                    <h5>:0</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Nro. Raciones Primaria:</h5>
                    <h5>:0</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>TOTAL RACIONES:</h5>
                    <h5>:0</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Nro. Raciones Secundaria:</h5>
                    <h5>:0</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Nro. Raciones Especial:</h5>
                    <h5 id="racionPrint">:${data.data[0].raciones}</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">

                    <h5>TOTAL RACIONES:</h5>
                    <h5 id="racionTotalPrint">:${data.data[0].raciones}</h5>
                </div>


            </div>
        </div>

        <div class="boleta_informacion">
            <div class="boleta_informacion_datos">
                <h5 class="d-inline">RUTA: </h5>
                <h5 class="d-inline" id="rutaBoletaPrint">${data.data[0].ruta}</h5>
            </div>
            <div class="boleta_informacion_datos">
                <h5 class="d-inline">CODIGO: </h5>
                <h5 class="d-inline" id="codigoBoletaPrint">${item.codigo}</h5>
            </div>
            <div class="boleta_informacion_datos">
                <h5 class="d-inline">DIRECCION: </h5>
                <h5 class="d-inline" id="unidadBoletaPrint">${item.descripcion}</h5>

            </div>
            <div class="boleta_informacion_datos">
                <h5 class="d-inline">DIRECCION: </h5>
                <h5 class="d-inline" id="direccionBoletaPrint">${item.direccion}</h5>
            </div>
        </div>
        <br />
        <div class="boleta_body">
            <table class="boleta_tabla" id="preBoletaPrint">
                <thead>
                    <tr>
                        <th scope="col">FECHA PROG.</th>
                        <th scope="col">LOTE</th>
                        <th scope="col">RACIONES</th>
                        <th scope="col">P/U.</th>
                        <th scope="col">EMPRESA O ASOCIACION</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosDeEstaBoleta.map(producto => `
                    <tr>
                        <td>${producto.fCreacion || "No disponible"}</td>
                        <td>${producto.desProdCont || "No disponible"}</td>
                        <td>${producto.cantidad || "0"}</td>
                        <td>${producto.precio || "0"}</td>
                        <td>${producto.empProdCont || "No disponible"}</td>
                    </tr>
                    `).join('')}
                </tbody>

            </table>
        </div>
        <div class="boleta_parteInferior">
            <h5>OBSERVACIONES:.................................................................................................</h5>
            <br />
            <div class="boleta_parteInferior_firmas">
                <div class="boleta_parteInferior_firmas_datos">
                        <h5>______________________________</h5>
                        <h5>ENTREGUE CONFORME PROV.</h5>
                        <h5>NOMBRE: </h5>
                        <h5>C.I.:__________________________</h5>
                </div>
                <div class="boleta_parteInferior_firmas_datos">
                    <h5>____________________________</h5>
                    <h5>RECIBI CONFORME C.EDU.</h5>
                    <h5>NOMBRE: </h5>
                    <h5>C.I.:________________________</h5>
                </div>
                <div class="boleta_parteInferior_firmas_datos">
                    <h5>_________________________</h5>
                    <h5>SUPERVISOR SIREMU</h5>
                    <h5>NOMBRE: </h5>
                    <h5>C.I.:_____________________</h5>
                </div>
            </div>
        </div>

    </div>`;

            });
        }
        printArea.innerHTML = contenidoBoleta;

        // Imprimir
        printJS({
            printable: printArea.innerHTML,
            type: 'raw-html',
            style: `
            
.boleta {
    width: 100%;
    height: 48vh;  /* Cada boleta ocupa casi la mitad de la página */
    padding: 15px 25px;
    box-sizing: border-box;
    display: block;
    position: relative;
    margin: 0;
    margin-bottom: 2vh;  /* Pequeño espacio entre boletas */
}

.boleta:nth-child(2n) {
    page-break-after: always;
    margin-bottom: 0;
    height: 48vh;
}
.boleta_encabezado {
    display: flex;
    color: black;
    margin-top:30px;
    width: 100%;

}
.boleta_encabezado_titulo_izquierdo{
    width: 65%;
    display: flex;
    justify-content: end;
    padding-right: 10px;
    align-self: center;
}
.boleta_encabezado_titulo_izquierdo_descripcion{
    text-align: center;
}
.boleta_encabezado_titulo_izquierdo h5{
    margin: 0;
    padding: 0;
    font-size: 11px;
}
.boleta_encabezado_titulo_derecho{
    width: 35%;
}
.boleta_encabezado_titulo_derecho_descripcion{
    display: flex;
    justify-content: space-between;
}
.boleta_encabezado_titulo_derecho_descripcion h5{
    margin: 1px 0;
    padding: 0 20px;
    font-size: 10px;
}
.boleta_informacion{
    width: 100%;
    margin-top:-25px;
}
.boleta_informacion_datos{
    display: flex;
    margin: 0;
    padding: 0;
}
.boleta_informacion_datos h5{
    margin: 0;
    padding: 0;
    font-size: 11px;
}
.boleta_parteInferior{
    padding-bottom:30px;
}
.boleta_parteInferior h5{
    font-size: 11px;
}
.boleta_parteInferior_firmas{
    display: flex;
    justify-content: space-between;
    margin: 0;
    padding: 0 20px;
}
.boleta_parteInferior_firmas h5{
    margin: 2px 0;
    padding: 0;
    font-size: 11px;
}
.boleta_body{
    font-size:11px;
}
.boleta_tabla {
    width: 100%;
    table-layout: auto;
}

.boleta_tabla th, .boleta_tabla td {
    text-align: justify;
}
            `
        });

    } catch (error) {
        console.error("Error al imprimir la boleta:", error);
        alert("Ocurrió un error al intentar imprimir la boleta.");
    }
}

async function imprimirBoletasTotalesElAlto(nCarga, inputId) {
    try {
        const repeticiones = parseInt(document.getElementById(inputId).value, 10) || 1;
        const response = await fetch(`/Boleta/ObtenerBoletasTotales?ncarga=${nCarga}`);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }
        const data = await response.json();

        if (!data.success || !data.data || data.data.length === 0) {
            throw new Error("No se encontraron datos para imprimir.");
        }

        // Filtrar boletas únicas por nroBoleta
        let boletasUnicas = new Map();
        data.data.forEach(item => {
            if (!boletasUnicas.has(item.nroBoleta)) {
                boletasUnicas.set(item.nroBoleta, item);
            }
        });
        let productosUnicos = new Map();
        data.data.forEach(item => {
            if (!productosUnicos.has(item.codProductoCont)) {
                productosUnicos.set(item.codProductoCont, item);
            }
        });
        console.log(data);
        console.log(data.data);

        // Convertir el Map en un array
        let boletasFiltradas = Array.from(boletasUnicas.values());

        console.log("Total de boletas únicas:", boletasFiltradas.length);
        console.log("Boletas únicas:", boletasFiltradas);

        let productosFiltrados = Array.from(productosUnicos.values());

        console.log("Total de boletas únicas:", productosFiltrados.length);
        console.log("Boletas únicas:", productosFiltrados);

        // Crear contenedor temporal
        const printArea = document.createElement("div");
        printArea.id = "printArea";
        let contenidoBoleta = '';
        for (let i = 0; i < repeticiones; i++) {
            // Generar boletas únicas
            boletasFiltradas.forEach(item => {
                contenidoBoleta += `
            <div class="boleta">

        <div class="boleta_encabezado">

            <div class="boleta_encabezado_titulo_izquierdo">
                <div class="boleta_encabezado_titulo_izquierdo_descripcion">
                    <h5>GOBIERNO AUTONOMO MUNICIPAL DE EL ALTO</h5>
                    <h5>ALIMENTO COMPLEMENTARIO ESCOLAR</h5>
                    <h5>PARA UNA VIDA SANA</h5>
                    <h5>ACTA DE ENTREGA Y RECEPCION</h5>
                </div>
            </div>
            <div class="boleta_encabezado_titulo_derecho">



                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Nro. Acta:</h5>
                    <h5 id="nroCargaPrint">${data.data[0].nroCarga}</h5>
                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Fecha de Entrega:</h5>
                    <h5 id="fechaEntregaBoletaPrint">${data.data[0].fEntrega}</h5>
                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Turno:</h5>
                    <h5 id="turnoPrint">:${item.turno}</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Nro. Raciones Inicial:</h5>
                    <h5>:0</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Nro. Raciones Primaria:</h5>
                    <h5>:0</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>TOTAL RACIONES:</h5>
                    <h5>:0</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Nro. Raciones Secundaria:</h5>
                    <h5>:0</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">
                    <h5>Nro. Raciones Especial:</h5>
                    <h5 id="racionPrint">:${data.data[0].raciones}</h5>

                </div>
                <div class="boleta_encabezado_titulo_derecho_descripcion">

                    <h5>TOTAL RACIONES:</h5>
                    <h5 id="racionTotalPrint">:${data.data[0].raciones}</h5>
                </div>


            </div>
        </div>

        <div class="boleta_informacion">
            <div class="boleta_informacion_datos">
                <h5 class="d-inline">RUTA: </h5>
                <h5 class="d-inline" id="rutaBoletaPrint">${data.data[0].ruta}</h5>
            </div>
            <div class="boleta_informacion_datos">
                <h5 class="d-inline">CODIGO: </h5>
                <h5 class="d-inline" id="codigoBoletaPrint">${item.codigo}</h5>
            </div>
            <div class="boleta_informacion_datos">
                <h5 class="d-inline">DIRECCION: </h5>
                <h5 class="d-inline" id="unidadBoletaPrint">${item.descripcion}</h5>

            </div>
            <div class="boleta_informacion_datos">
                <h5 class="d-inline">DIRECCION: </h5>
                <h5 class="d-inline" id="direccionBoletaPrint">${item.direccion}</h5>
            </div>
        </div>
        <br />
        <div class="boleta_body">
            <table class="boleta_tabla" id="preBoletaPrint">
                <thead>
                    <tr>
                        <th scope="col">FECHA PROG.</th>
                        <th scope="col">LOTE</th>
                        <th scope="col">RACIONES</th>
                        <th scope="col">P/U.</th>
                        <th scope="col">EMPRESA O ASOCIACION</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosFiltrados.map(item => `
                    <tr>
                        <td>${item.fCreacion || "No disponible"}</td>
                        <td>${item.desProdCont || "No disponible"}</td>
                        <td>${item.cantidad || "0"}</td>
                        <td>${item.precio || "0"}</td>
                        <td>${item.detalleCliente || "No disponible"}</td>
                    </tr>
                    `).join('')}
                </tbody>

            </table>
        </div>
        <div class="boleta_parteInferior">
            <h5>OBSERVACIONES:.................................................................................................</h5>
            <br />
            <div class="boleta_parteInferior_firmas">
                <div class="boleta_parteInferior_firmas_datos">
                        <h5>______________________________</h5>
                        <h5>ENTREGUE CONFORME PROV.</h5>
                        <h5>NOMBRE: </h5>
                        <h5>C.I.:__________________________</h5>
                </div>
                <div class="boleta_parteInferior_firmas_datos">
                    <h5>____________________________</h5>
                    <h5>RECIBI CONFORME C.EDU.</h5>
                    <h5>NOMBRE: </h5>
                    <h5>C.I.:________________________</h5>
                </div>
                <div class="boleta_parteInferior_firmas_datos">
                    <h5>_________________________</h5>
                    <h5>SUPERVISOR SIREMU</h5>
                    <h5>NOMBRE: </h5>
                    <h5>C.I.:_____________________</h5>
                </div>
            </div>
        </div>

    </div>`;

            });
        }
        printArea.innerHTML = contenidoBoleta;

        // Imprimir
        printJS({
            printable: printArea.innerHTML,
            type: 'raw-html',
            style: `
                .boleta {
    width: 100%;
    height: 48vh;  /* Cada boleta ocupa casi la mitad de la página */
    padding: 15px 25px;
    box-sizing: border-box;
    display: block;
    position: relative;
    margin: 0;
    margin-bottom: 2vh;  /* Pequeño espacio entre boletas */
}

.boleta:nth-child(2n) {
    page-break-after: always;
    margin-bottom: 0;
    height: 48vh;
}
.boleta_encabezado {
    display: flex;
    color: black;
    margin-top:30px;
    width: 100%;

}
.boleta_encabezado_titulo_izquierdo{
    width: 65%;
    display: flex;
    justify-content: end;
    padding-right: 10px;
    align-self: center;
}
.boleta_encabezado_titulo_izquierdo_descripcion{
    text-align: center;
}
.boleta_encabezado_titulo_izquierdo h5{
    margin: 0;
    padding: 0;
    font-size: 11px;
}
.boleta_encabezado_titulo_derecho{
    width: 35%;
}
.boleta_encabezado_titulo_derecho_descripcion{
    display: flex;
    justify-content: space-between;
}
.boleta_encabezado_titulo_derecho_descripcion h5{
    margin: 1px 0;
    padding: 0 20px;
    font-size: 10px;
}
.boleta_informacion{
    width: 100%;
    margin-top:-25px;
}
.boleta_informacion_datos{
    display: flex;
    margin: 0;
    padding: 0;
}
.boleta_informacion_datos h5{
    margin: 0;
    padding: 0;
    font-size: 11px;
}
.boleta_parteInferior{
    padding-bottom:30px;
}
.boleta_parteInferior h5{
    font-size: 11px;
}
.boleta_parteInferior_firmas{
    display: flex;
    justify-content: space-between;
    margin: 0;
    padding: 0 20px;
}
.boleta_parteInferior_firmas h5{
    margin: 2px 0;
    padding: 0;
    font-size: 11px;
}
.boleta_body{
    font-size:11px;
}
.boleta_tabla {
    width: 100%;
    table-layout: auto;
}

.boleta_tabla th, .boleta_tabla td {
    text-align: justify;
}
            `
        });

    } catch (error) {
        console.error("Error al imprimir la boleta:", error);
        alert("Ocurrió un error al intentar imprimir la boleta.");
    }
}


function edicionBoleta(nroContrato) {
    fetch(`/Boleta/ListarFechasBoleta?id=${nroContrato}`)
        .then(response => response.json())
        .then(data => {
            console.log("Datos recibidos:", data.data); // Depuración

            if (data.success && data.data.length > 0) {
                let fechas = data.data[0]; // Extraer el primer objeto del array

                document.getElementById("nroCargaEditar").value = fechas.nroCarga;
                document.getElementById("editarFechaDespachoBoleta").value = fechas.f_despacho;
                document.getElementById("editarFechaEntregaBoleta").value = fechas.f_entrega;
                document.getElementById("editarFechaConsolidadoBoleta").value = fechas.f_consolidado;

                window.modalEditar.show();
            } else {
                alert("No se encontraron fechas para la boleta.");
            }
        })
        .catch(error => {
            console.error('Error al cargar fechas:', error);
            alert('Error al cargar las fechas.');
        });
}




function eliminarBoletaTotal(nroCarga) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Esta acción permanentemente!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    }).then(async (result) => {
        if (result.isConfirmed) {
            const url = `/Boleta/EliminarNumeroCarga?ncarga=${nroCarga}`;

            await enviarDatosFormulario(
                url,
                "",
                (resultado) => {
                    if (resultado.success) {

                        Swal.fire({
                            icon: "success",
                            title: "¡Eliminado!",
                            text: "Boletas eliminadas correctamente",
                            showConfirmButton: false,
                            timer: 800
                        });
                        setTimeout(() => {
                            location.reload();
                        }, 600);
                    } else {
                        Swal.fire("Error", resultado.message, "error");
                    }
                },
                (error) => {
                    Swal.fire("Error", "No se pudo eliminar.", "error");
                    console.error("Error al eliminar:", error);
                }
            );
        }
    });
}



function actualizarFechas() {
    const nroCarga = parseInt(document.getElementById("nroCargaEditar").value);
    const fDespacho = document.getElementById("editarFechaDespachoBoleta").value;
    const fEntrega = document.getElementById("editarFechaEntregaBoleta").value;
    const fConsolidado = document.getElementById("editarFechaConsolidadoBoleta").value;

    // Verificar que todas las fechas estén presentes
    if (!nroCarga || !fDespacho || !fEntrega || !fConsolidado) {
        alert("Por favor, complete todos los campos de fecha.");
        return;
    }

    const data = {
        nroCarga: nroCarga,
        fDespacho: fDespacho,
        fEntrega: fEntrega,
        fConsolidado: fConsolidado
    };

    fetch("/Boleta/ActualizarFechasBoleta", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.querySelector('input[name="__RequestVerificationToken"]')?.value
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                
                Swal.fire("¡Actualizado!", "Fechas actualizadas correctamente", "success");
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al actualizar las fechas. Por favor, intente nuevamente.');
        });
}



let productosDisponibles = [];
let currentNroCarga = 0;

function copiarCarga(nroCarga) {
    currentNroCarga = nroCarga;
    fetch(`/Boleta/ObtenerDatosParaDuplicar?nroCarga=${nroCarga}`)
        .then(response => response.json())
        .then(data => {
            console.log("Datos recibidos:", data); // Depuración
            if (data.success) {
                // Llenar fechas
                document.getElementById('duplicarFechaDespachoBoleta').value = data.fDespacho;
                document.getElementById('duplicarFechaEntregaBoleta').value = data.fEntrega;
                document.getElementById('duplicarFechaConsolidadoBoleta').value = data.fConsolidado;

                // Llenar tabla de productos
                const tbody = document.getElementById('productosLista');
                tbody.innerHTML = '';

                data.productos.forEach((producto, index) => {
                    const tr = document.createElement('tr');
                    tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';

                    tr.innerHTML = `
                        <td class="px-3 py-4 font-medium text-gray-900 dark:text-white">
                            ${index + 1}
                        </td>
                        <td class="px-3 py-4 text-gray-900 dark:text-white">
                            <div class="flex flex-col">
                                <span class="font-medium">${producto.nombreProducto}</span>
                                <span class="text-sm text-gray-500 dark:text-gray-400">(${producto.codProducto})</span>
                                ${producto.existeEnCarga ? '' : '<span class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300 mt-1 w-fit">Nuevo</span>'}
                            </div>
                        </td>
                        <td class="px-3 py-4">
                            <input type="number" 
                                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${!producto.existeEnCarga ? 'opacity-50 cursor-not-allowed' : ''}" 
                                   value="${producto.existeEnCarga ? producto.cantidad || 0 : 0}"
                                   min="1"
                                   data-codigo="${producto.codProducto}"
                                   ${producto.existeEnCarga ? '' : 'disabled'}>
                        </td>
                        <td class="px-3 py-4">
                            <div class="flex items-center">
                                <input class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 producto-seleccionado" 
                                       type="checkbox" 
                                       value="${producto.codProducto}"
                                       id="prod-${producto.codProducto}"
                                       ${producto.existeEnCarga ? 'checked' : ''}
                                       onchange="toggleCantidad(this)">
                                <label for="prod-${producto.codProducto}" class="sr-only">Seleccionar producto</label>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                // Mostrar modal usando tu patrón exacto
                window.modalDuplicar.show();

            } else {
                alert("No se pudieron cargar los datos para duplicar.");
            }
        })
        .catch(error => {
            console.error('Error al cargar datos:', error);
            alert('Error al cargar los datos.');
        });
}

function toggleCantidad(checkbox) {
    const input = checkbox.closest('tr').querySelector('input[type="number"]');
    input.disabled = !checkbox.checked;
    if (!checkbox.checked) input.value = 0;
}

function confirmarDuplicacion() {
    const productosSeleccionados = [];

    document.querySelectorAll('.producto-seleccionado:checked').forEach(checkbox => {
        const input = checkbox.closest('tr').querySelector('input[type="number"]');
        productosSeleccionados.push({
            codProducto: checkbox.value,
            cantidad: parseInt(input.value) || 0
        });
    });

    if (productosSeleccionados.length === 0) {
        Swal.fire('Advertencia', 'Debe seleccionar al menos un producto', 'warning');
        return;
    }

    const request = {
        ncarga: currentNroCarga,
        productos: productosSeleccionados,
        fDespacho: document.getElementById('duplicarFechaDespachoBoleta').value,
        fEntrega: document.getElementById('duplicarFechaEntregaBoleta').value,
        fConsolidado: document.getElementById('duplicarFechaConsolidadoBoleta').value
    };

    fetch('/Boleta/DuplicarBoleta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const targetEl = document.getElementById('duplicarBoletaModal');
                const modal = new Modal(targetEl);
                modal.hide();
                Swal.fire({
                    icon: "success",
                    title: "¡Duplicado!",
                    text: "Carga duplicada exitosamente con número: " + result.nuevaCarga,
                    showConfirmButton: false,
                    timer: 1500
                });
                setTimeout(() => {
                    location.reload();
                }, 800);
            } else {
                throw new Error(result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', error.message, 'error');
        });
}
async function enviarDatosFormulario(url, datosFormulario, onSuccess, onError) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: datosFormulario
        });

        const resultado = await response.json();

        console.log("Respuesta del servidor:", resultado);

        if (response.ok && resultado.success) {
            if (typeof onSuccess === 'function') {
                onSuccess(resultado);
            }
        } else {
            throw new Error(resultado.message || "Error inesperado.");
        }
    } catch (error) {
        if (typeof onError === 'function') {
            onError(error);
        }
        console.error('Error al enviar datos:', error);
    }
}




function verBoletasIndividuales(nroCarga) {

    window.location.href = `/Boleta/VerBoletaIndividual?nroCarga=${nroCarga}`;

}