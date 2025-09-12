    let nroCargaActual = null;

    document.addEventListener("DOMContentLoaded", function () {
        nroCargaActual = document.getElementById('nroCargaActual').value;
    cargarBoletasIndividuales();
    });

    function cargarBoletasIndividuales() {
        mostrarLoading();

    fetch(`/Boleta/ObtenerBoletasPorCarga?NroCarga=${nroCargaActual}`)
            .then(response => response.json())
            .then(result => {
        ocultarLoading();
                if (result.success && result.data && result.data.length > 0) {
        mostrarBoletas(result.data); // Usar result.data en lugar de result
    actualizarEstadisticas(result.data);
                } else {
        mostrarEmptyState();
                }
            })
            .catch(error => {
        console.error('Error al cargar boletas:', error);
    ocultarLoading();
    mostrarErrorState();
            });
    }

    function mostrarBoletas(boletas) {
        const container = document.getElementById('boletas-individuales-container');
    const tbody = document.getElementById('boletas-tabla-body');

    let boletasHTML = '';

        boletas.forEach((boleta, index) => {
        boletasHTML += `
                <tr class="bg-slate-800 hover:bg-slate-750 transition-colors">
                    <td class="px-6 py-4 font-medium text-white">${index + 1}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30 mr-3">
                                <i class="fas fa-receipt text-blue-400 text-xs"></i>
                            </div>
                            <span class="font-medium text-white">${boleta.unidad}</span>
                        </div>
                    </td>
                    
                    <td class="px-6 py-4">
                        <input type="number"
                               class="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-20 px-2 py-1"
                               id="repeticiones_${boleta.id}"
                               placeholder="1"
                               min="1"
                               value="1">
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex justify-center space-x-2">
                            <!--<button onclick="abrirVistaBoleta(${nroCargaActual}, ${boleta.nroBoleta})"
                                    class="w-8 h-8 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg flex items-center justify-center transition-colors border border-blue-500/30"
                                    title="Ver Detalle">
                                <i class="fas fa-eye text-xs"></i>
                            </button>-->
                            <button onclick="editarBoletaIndividual(${nroCargaActual}, ${boleta.nroBoleta})"
                                    class="w-8 h-8 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg flex items-center justify-center transition-colors border border-green-500/30"
                                    title="Editar">
                                <i class="fas fa-edit text-xs"></i>
                            </button>
                            <button onclick="imprimirBoleta(${nroCargaActual}, ${boleta.nroBoleta}, 'repeticiones_${boleta.id}')"
                                    class="w-8 h-8 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg flex items-center justify-center transition-colors border border-purple-500/30"
                                    title="Imprimir">
                                <i class="fas fa-print text-xs"></i>
                            </button>
                            <button onclick="eliminarBoletaIndividual(${nroCargaActual}, ${boleta.nroBoleta})"
                                    class="w-8 h-8 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg flex items-center justify-center transition-colors border border-red-500/30"
                                    title="Eliminar">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        });

    tbody.innerHTML = boletasHTML;
    container.classList.remove('hidden');
    }

    function actualizarEstadisticas(boletas) {
        document.getElementById('totalBoletas').textContent = boletas.length;

        // Calcular total de productos (si está disponible en los datos)
        const totalProductos = boletas.reduce((sum, boleta) => sum + (boleta.totalProductos || 0), 0);
        
    }

    function mostrarLoading() {
        document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('boletas-individuales-container').classList.add('hidden');
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('errorState').classList.add('hidden');
    }

    function ocultarLoading() {
        document.getElementById('loadingState').classList.add('hidden');
    }

    function mostrarEmptyState() {
        document.getElementById('emptyState').classList.remove('hidden');
    }

    function mostrarErrorState() {
        document.getElementById('errorState').classList.remove('hidden');
    }

    // Funciones para las acciones (deberás implementar estas según tu lógica existente)
    function abrirVistaBoleta(nroCarga, nroBoleta) {
        // Implementar según tu lógica
        console.log(`Ver boleta ${nroBoleta} de carga ${nroCarga}`);
    }

    function editarBoletaIndividual(nroCarga, nroBoleta) {
        fetch(`/Boleta/ListarBoletasIndividuales?ncarga=${nroCarga}&nboleta=${nroBoleta}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data.length > 0) {
                    const modalBody = document.querySelector('#tablaProductosBody');
                    modalBody.innerHTML = '';

                    data.data.forEach(producto => {
                        const row = `
                                    <tr id="producto_${producto.id}" class="bg-gray-800 border-b border-gray-600 hover:bg-gray-700 transition-colors">
                                        <th scope="row" class="px-6 py-4 font-medium text-white whitespace-nowrap">
                                            <div class="flex items-center">
                                                <i class="fas fa-cube mr-2 text-blue-400 text-xs"></i>
                                                ${producto.codProductoCont}
                                            </div>
                                        </th>
                                        <td class="px-6 py-4">
                                            <input type="number"
                                                   class="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 transition-colors"
                                                   id="editarCantidad_${producto.id}"
                                                   value="${producto.cantidad}"
                                                   min="0"
                                                   placeholder="Cantidad">
                                        </td>
                                    </tr>
                                `;
                        modalBody.innerHTML += row;
                    });

                    // Mostrar modal usando Flowbite
                    const targetEl = document.getElementById('editarBoletaIndividualModal');
                    const modal = new Modal(targetEl);
                    modal.show();
                } else {
                    // Mostrar mensaje de error o productos vacíos
                    const modalBody = document.querySelector('#tablaProductosBody');
                    modalBody.innerHTML = `
                                <tr>
                                    <td colspan="2" class="text-center py-8 text-gray-400">
                                        <i class="fas fa-box-open text-2xl mb-2"></i>
                                        <br>
                                        No se encontraron productos para esta boleta
                                    </td>
                                </tr>
                            `;

                    const targetEl = document.getElementById('editarBoletaIndividualModal');
                    const modal = new Modal(targetEl);
                    modal.show();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Mostrar mensaje de error
                const modalBody = document.querySelector('#tablaProductosBody');
                modalBody.innerHTML = `
                            <tr>
                                <td colspan="2" class="text-center py-8 text-red-400">
                                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                                    <br>
                                    Error al cargar los productos
                                </td>
                            </tr>
                        `;

                const targetEl = document.getElementById('editarBoletaIndividualModal');
                const modal = new Modal(targetEl);
                modal.show();
            });
    }
    function actualizarCantidades() {
        // CAMBIO: Selector actualizado para Tailwind
        const filas = document.querySelectorAll('#editarBoletaIndividualModal tbody tr');
    const actualizaciones = [];

        // Recolectar los datos de cada fila
        filas.forEach(fila => {
            const id = fila.id.split('_')[1]; // Obtener el ID del producto_X
    const cantidadInput = document.getElementById(`editarCantidad_${id}`);

    if (cantidadInput) {
        actualizaciones.push({
            id: parseInt(id),
            cantidad: parseInt(cantidadInput.value)
        });
            }
        });

    // Enviar los datos al servidor
    fetch("/Boleta/ActualizarCantidadBoleta", {
        method: "POST",
    headers: {
        "Content-Type": "application/json",
    "X-CSRF-TOKEN": document.querySelector('input[name="__RequestVerificationToken"]')?.value
            },
    body: JSON.stringify(actualizaciones)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
    return response.json();
            })
            .then(data => {
                if (data.success) {
        Swal.fire("¡Actualizado!", "Cantidades actualizadas correctamente", "success");
                    setTimeout(() => {
        location.reload();
                    }, 1000);
                } else {
        alert(data.message);
                }
            })
            .catch(error => {
        console.error('Error:', error);
    alert('Hubo un error al actualizar las cantidades. Por favor, intente nuevamente.');
            });
    }

    // Función para cerrar el modal
    function cerrarModalBoleta() {
        const targetEl = document.getElementById('editarBoletaIndividualModal');
    const modal = new Modal(targetEl);
    modal.hide();
    }

    async function imprimirBoleta(nCarga, nBoleta, inputId) {
        try {
            const repeticiones = parseInt(document.getElementById(inputId).value, 10) || 1;
    // Obtener los datos de la boleta
    const response = await fetch(`/Boleta/ListarBoletasGeneradas?ncarga=${nCarga}&nboleta=${nBoleta}`);
    if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText}`);
            }
    const data = await response.json();

    // Verificar si hay datos
    if (!data.success || !data.data || data.data.length === 0) {
                throw new Error("No se encontraron datos para imprimir.");
            }

    // Crear un contenedor temporal para la impresión
    const printArea = document.createElement("div");
    printArea.id = "printArea";
    let contenidoBoleta = '';
    for (let i = 0; i < repeticiones; i++) {
        // Agregar contenido a la boleta con el estilo de modal
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
                        <h5 id="turnoPrint">${data.data[0].turno}</h5>

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
                        <h5 id="racionPrint">0</h5>

                    </div>
                    <div class="boleta_encabezado_titulo_derecho_descripcion">

                        <h5>TOTAL RACIONES:</h5>
                        <h5 id="racionTotalPrint">0</h5>
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
                    <h5 class="d-inline" id="codigoBoletaPrint">L-67</h5>
                </div>
                <div class="boleta_informacion_datos">
                    <h5 class="d-inline">CENTRO EDUCATIVO: </h5>
                    <h5 class="d-inline" id="unidadBoletaPrint">${data.data[0].descripcion}</h5>
                </div>
                <div class="boleta_informacion_datos">
                    <h5 class="d-inline">DIRECCION: </h5>
                    <h5 class="d-inline" id="direccionBoletaPrint">${data.data[0].direccion}</h5>
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
                        ${data.data.map(item => `
                        <tr>
                            <td>${item.fConsolidado || "No disponible"}</td>
                            <td>${item.codProductoCont || "No disponible"}</td>
                            <td>${item.cantidad || "0"}</td>
                            <td>${item.raciones || "0"}</td>
                            <td>${item.descripcion || "No disponible"}</td>
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

        </div>
            `;
            }
    printArea.innerHTML = contenidoBoleta;
    // Usar print.js para imprimir el contenido del contenedor
    printJS({
        printable: printArea,
    type: 'html',
    font_size: '',
    style: `
    .boleta {

        min - width: 50vh;
    max-height: 50vh;
    height: 50vh;
    padding: 0 25px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;



    }
    .boleta_encabezado {
        display: flex;
    color: black;
    margin-top:50px;
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
        text - align: center;
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
        padding - bottom:50px;
    }
    .boleta_parteInferior h5{
        font - size: 11px;
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
        font - size:11px;
    }
    .boleta_tabla {
        width: 100%;
    table-layout: auto;
    }

    .boleta_tabla th, .boleta_tabla td {
        text - align: justify;
    }


    `
            });

            // Eliminar el div después de imprimir
            setTimeout(() => {
        printArea.remove();
            }, 1000); // Un pequeño retraso para asegurarse de que la impresión se haya iniciado

        } catch (error) {
        console.error("Error al imprimir la boleta:", error);
    alert("Ocurrió un error al intentar imprimir la boleta.");
        }
    }

    function eliminarBoletaIndividual(nroCarga, nroBoleta) {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¡Esta acción eliminará la boleta permanentemente!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const url = `/Boleta/EliminarBoletaIndividual?ncarga=${nroCarga}&nboleta=${nroBoleta}`;

                await enviarDatosFormulario(
                    url,
                    "",
                    (resultado) => {
                        if (resultado.success) {

                            Swal.fire({
                                icon: "success",
                                title: "¡Eliminado!",
                                text: "Boleta Individual eliminada correctamente",
                                showConfirmButton: false,
                                timer: 1500
                            });
                            setTimeout(() => {
                                location.reload();
                            }, 800);
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

    async function enviarDatosFormulario(url, datosFormulario, onSuccess, onError) {
        try {
            const response = await fetch(url, {
        method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded' },
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

