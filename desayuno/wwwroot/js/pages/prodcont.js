// Variables Globales
const modalRegistroProdcont = document.querySelector("#modalRegistroProdcont");
const title = document.querySelector("#titleModalProdcont");
const btnNuevoProdcont = document.querySelector("#btnNuevoProdcont");
const frm = document.querySelector("#formularioProdcont");
const btnAgregarSap = document.querySelector("#btnAgregarSap");
const listaSapSeleccionados = document.querySelector("#listaSapSeleccionados");
const contadorSap = document.querySelector("#contadorSap");

let tblProdcont;
let codigosSapSeleccionados = [];

document.addEventListener("DOMContentLoaded", function () {
    // Cargar productos contabilizados
    cargarProductosContables();

    // Inicializar Select2
    $('.select-prodcont-producto').select2({
        placeholder: "Buscar Producto SAP",
        allowClear: true,
        minimumInputLength: 0,
        dropdownParent: $('#modalRegistroProdcont'),
        ajax: {
            url: '/Prodcont/BuscarProducto',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return { q: params.term || '' };
            },
            processResults: function (data) {
                return {
                    results: data.map(item => ({
                        id: item.codigoErp,
                        text: item.codigoErp + " - " + item.descripcion,
                        codigoErp: item.codigoErp,
                        descripcion: item.descripcion,
                    }))
                };
            },
            cache: true
        },
        templateSelection: function (data) {
            return data.text || data.id;
        }
    });



    // Cargar productos contabilizados
    cargarProductosContables();

    // Cargar datos iniciales
    cargarDatosSelect2();

    // Event listener para el botón nuevo producto contabilizado
    btnNuevoProdcont.addEventListener("click", function () {
        title.textContent = "NUEVO PRODUCTO CONTABILIZADO";
        frm.id.value = '';
        frm.reset();
        codigosSapSeleccionados = [];

        // Limpiar Select2
        $('.select-prodcont-producto').val(null).trigger('change');

        actualizarListaSap();

        // Mostrar modal usando Flowbite
        const targetEl = document.getElementById('modalRegistroProdcont');
        const modal = new Modal(targetEl, {
            backdrop: 'static',
            keyboard: false
        });
        modal.show();
    });

    // Event listener directo para el botón Agregar
    btnAgregarSap.addEventListener("click", agregarCodigoSap);;

    // REGISTRAR PRODUCTO CONTABILIZADO POR AJAX
    frm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (
            frm.codProdCont.value == "" ||
            frm.desProdCont.value == "" ||
            frm.empProdCont.value == "" 
        ) {
            alertaPersonalizada("warning", "TODOS LOS CAMPOS SON REQUERIDOS Y DEBE AGREGAR AL MENOS UN CÓDIGO SAP");
            return;
        }

        // Preparar datos para enviar
        const datos = {
            id: frm.id.value || 0,
            codProdCont: frm.codProdCont.value,
            desProdCont: frm.desProdCont.value,
            empProdCont: frm.empProdCont.value,
            codigosSap: codigosSapSeleccionados.map(item => item.codigo)
        };

        const http = new XMLHttpRequest();
        const url = "/Prodcont/GuardarMultiple";

        http.open("POST", url, true);
        http.setRequestHeader("Content-Type", "application/json");
        http.send(JSON.stringify(datos));

        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const res = JSON.parse(this.responseText);
                alertaPersonalizada(res.tipo, res.mensaje);
                if (res.tipo == 'success') {
                    frm.reset();
                    codigosSapSeleccionados = [];
                    $('.select-prodcont-producto').val(null).trigger('change');
                    actualizarListaSap();
                    const modal = new window.Modal(modalRegistroProdcont);
                    modal.hide();
                    cargarProductosContables();
                }
            }
        };
    });
});

// Función para cargar y mostrar productos contabilizados en formato de tarjetas
async function cargarProductosContables() {
    const container = document.getElementById('productosContainer');
    const loadingState = document.getElementById('loadingState');

    try {
        const response = await fetch('/Prodcont/ListarProdcontAgrupados');
        const data = await response.json();

        if (loadingState) {
            loadingState.remove();
        }

        if (data.length === 0) {
            container.innerHTML = `
                <div class="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
                    <i class="fas fa-cube text-3xl mb-3 text-gray-600"></i>
                    <p class="text-gray-400">No hay productos contables registrados</p>
                </div>
            `;
            return;
        }

        // Renderizar como lista con toggle completo
        container.innerHTML = `
            <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                ${data.map((producto, index) => {
            const codigosSapValidos = producto.codigosSap ?
                producto.codigosSap.filter(sap =>
                    sap.codProdSap &&
                    sap.codProdSap !== "SIN_CODIGO" &&
                    sap.codProdSap !== "null" &&
                    sap.codProdSap.trim() !== ""
                ) : [];

            return `
                        <div class="hover:bg-gray-700 transition-colors ${index !== data.length - 1 ? 'border-b border-gray-700' : ''}">
                            
                            <!-- Fila principal -->
                            <div class="flex items-center justify-between p-4">
                                <!-- Info del producto -->
                                <div class="flex items-center space-x-4 flex-1 min-w-0">
                                    <div class="p-2 bg-blue-600 rounded-lg flex-shrink-0">
                                        <i class="fas fa-cube text-white text-sm"></i>
                                    </div>
                                    
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center space-x-3">
                                            <h3 class="font-bold text-white text-sm">${producto.codProdCont}</h3>
                                            <span class="text-gray-400">•</span>
                                            <p class="text-gray-300 truncate text-sm">${producto.desProdCont}</p>
                                            ${producto.empProdCont ? `
                                                <span class="text-gray-400">•</span>
                                                <p class="text-gray-400 text-sm truncate">${producto.empProdCont}</p>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>

                                <!-- Controles derechos -->
                                <div class="flex items-center space-x-3 flex-shrink-0">
                                    <!-- Contador de códigos SAP con toggle -->
                                    ${codigosSapValidos.length > 0 ? `
                                        <button onclick="toggleSapCodes('sap-${index}')" 
                                                class="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
                                            <span class="text-xs text-gray-400">Códigos SAP:</span>
                                            <span class="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                                ${codigosSapValidos.length}
                                            </span>
                                            <i class="fas fa-chevron-down transform transition-transform text-xs" id="chevron-${index}"></i>
                                        </button>
                                    ` : `
                                        <span class="text-gray-500 text-xs">Sin códigos SAP</span>
                                    `}

                                    <!-- Botones de acción -->
                                    <div class="flex space-x-1">
                                        <button onclick="editarProdcont('${producto.codProdCont}')"
                                                class="p-2 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded-lg transition-all duration-200"
                                                title="Editar">
                                            <i class="fas fa-edit text-sm"></i>
                                        </button>
                                        <button onclick="eliminarProdcont('${producto.codProdCont}')"
                                                class="p-2 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200"
                                                title="Eliminar">
                                            <i class="fas fa-trash text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Todos los códigos SAP (expandibles con toggle) -->
                            ${codigosSapValidos.length > 0 ? `
                                <div id="sap-${index}" class="hidden px-4 pb-4">
                                    <div class="flex flex-wrap gap-2">
                                        ${codigosSapValidos.map(sapCode => `
                                            <div class="group relative bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 hover:bg-gray-600 hover:border-green-500 transition-all duration-200 flex items-center space-x-2">
                                                <div class="p-1 bg-green-600 rounded group-hover:bg-green-500 transition-colors">
                                                    <i class="fas fa-cube text-white text-xs"></i>
                                                </div>
                                                <div>
                                                    <p class="text-white text-sm font-mono font-semibold">${sapCode.codProdSap}</p>
                                                    ${sapCode.descripcionSap && sapCode.descripcionSap !== 'Sin descripción' ? `
                                                        <p class="text-gray-400 text-xs max-w-48 truncate" title="${sapCode.descripcionSap}">${sapCode.descripcionSap}</p>
                                                    ` : ''}
                                                </div>
                                                <button onclick="eliminarSapIndividual(${sapCode.id})"
                                                        class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition-all ml-2">
                                                    <i class="fas fa-times text-xs"></i>
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
        }).join('')}
            </div>
        `;

    } catch (error) {
        console.error('Error cargando productos:', error);
        container.innerHTML = `
            <div class="bg-red-900 border border-red-700 rounded-lg p-4">
                <div class="flex items-center text-red-200">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <span>Error al cargar productos contabilizados</span>
                </div>
            </div>
        `;
    }
}

// Función para expandir/colapsar códigos SAP
function toggleSapCodes(elementId) {
    const element = document.getElementById(elementId);
    const chevronId = elementId.replace('sap-', 'chevron-');
    const chevron = document.getElementById(chevronId);

    if (element.classList.contains('hidden')) {
        element.classList.remove('hidden');
        element.classList.add('animate-fadeIn');
        chevron.classList.add('rotate-180');
    } else {
        element.classList.add('hidden');
        element.classList.remove('animate-fadeIn');
        chevron.classList.remove('rotate-180');
    }
}
function cargarDatosSelect2() {
    // Inicializar Select2
    $('.select-prodcont-producto').select2({
        placeholder: "Buscar Producto SAP",
        allowClear: true,
        minimumInputLength: 0,
        dropdownParent: $('#modalRegistroProdcont'),
        ajax: {
            url: '/Prodcont/BuscarProducto',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return { q: params.term || '' };
            },
            processResults: function (data) {
                return {
                    results: data.map(item => ({
                        id: item.codigoErp,
                        text: item.codigoErp + " - " + item.descripcion,
                        codigoErp: item.codigoErp,
                        descripcion: item.descripcion,
                    }))
                };
            },
            cache: true
        },
        templateSelection: function (data) {
            return data.text || data.id;
        }
    });
}

// Función para agregar código SAP
function agregarCodigoSap() {
    const select2Data = $('.select-prodcont-producto').select2('data')[0];

    if (!select2Data || !select2Data.id) {
        alertaPersonalizada("warning", "Por favor seleccione un código SAP");
        return;
    }

    // Verificar si ya está agregado
    if (codigosSapSeleccionados.find(item => item.codigo === select2Data.id)) {
        alertaPersonalizada("warning", "Este código SAP ya está agregado");
        return;
    }

    // Agregar al array
    codigosSapSeleccionados.push({
        codigo: select2Data.id,
        descripcion: select2Data.descripcion || "Sin descripción"
    });

    // Actualizar la lista visual
    actualizarListaSap();

    // Limpiar selector
    $('.select-prodcont-producto').val(null).trigger('change');

    alertaPersonalizada("success", "Código SAP agregado correctamente");
}

// Función para actualizar la lista visual de códigos SAP
function actualizarListaSap() {
    const lista = document.getElementById("listaSapSeleccionados");
    const contador = document.getElementById("contadorSap");

    if (codigosSapSeleccionados.length === 0) {
        lista.innerHTML = `
                <div class="text-gray-400 text-sm italic text-center py-4">
                    <i class="fas fa-info-circle mr-2"></i>
                    No hay códigos SAP seleccionados. Busque y agregue códigos SAP usando el selector de arriba.
                </div>
            `;
        contador.textContent = "0 códigos";
    } else {
        let html = '';
        codigosSapSeleccionados.forEach((item, index) => {
            html += `
                    <div class="flex items-center justify-between bg-gray-500 rounded-lg p-3 border border-gray-400 transition-all duration-300 hover:bg-gray-400">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-green-600 rounded-lg">
                                <i class="fas fa-cube text-white text-sm"></i>
                            </div>
                            <div>
                                <p class="text-white font-medium text-sm font-mono">${item.codigo}</p>
                                <p class="text-gray-300 text-xs">${item.descripcion}</p>
                            </div>
                        </div>
                        <button type="button" onclick="eliminarSapSeleccionado(${index})" class="text-red-400 hover:text-red-300 hover:bg-red-600 hover:bg-opacity-20 rounded-lg p-2 transition-colors">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                `;
        });
        lista.innerHTML = html;
        contador.textContent = `${codigosSapSeleccionados.length} código${codigosSapSeleccionados.length !== 1 ? 's' : ''}`;
    }
}

// Función para eliminar código SAP seleccionado
function eliminarSapSeleccionado(index) {
    Swal.fire({
        title: '¿Remover código SAP?',
        text: `¿Está seguro de remover el código ${codigosSapSeleccionados[index].codigo}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, remover',
        cancelButtonText: 'Cancelar',
        background: '#1f2937',
        color: '#ffffff'
    }).then((result) => {
        if (result.isConfirmed) {
            codigosSapSeleccionados.splice(index, 1);
            actualizarListaSap();
            alertaPersonalizada("success", "Código SAP removido");
        }
    });
}



function eliminarProdcont(codProdCont) {
    const url = '/Prodcont/EliminarProdcont/' + encodeURIComponent(codProdCont);
    eliminarRegistro('¿ESTÁ SEGURO DE ELIMINAR?', 'EL PRODUCTO CONTABILIZADO Y TODOS SUS CÓDIGOS SAP SE ELIMINARÁN DE FORMA PERMANENTE', 'SÍ, ELIMINAR', url, null);

}

function eliminarSapIndividual(id) {
    Swal.fire({
        title: '¿Eliminar código SAP?',
        text: 'Este código SAP se eliminará permanentemente',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#1f2937',
        color: '#ffffff'
    }).then((result) => {
        if (result.isConfirmed) {
            const http = new XMLHttpRequest();
            const url = '/Prodcont/EliminarProdcont/' + id;

            http.open("GET", url, true);
            http.send();

            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertaPersonalizada(res.tipo, res.mensaje);
                    if (res.tipo == 'success') {
                        cargarProductosContables();
                    }
                }
            };
        }
    });
}


// Función para actualizar la lista visual de códigos SAP
function actualizarListaSap() {
    const lista = document.getElementById("listaSapSeleccionados");
    const contador = document.getElementById("contadorSap");

    if (codigosSapSeleccionados.length === 0) {
        lista.innerHTML = `
                <div class="text-gray-400 text-sm italic text-center py-4">
                    <i class="fas fa-info-circle mr-2"></i>
                    No hay códigos SAP seleccionados. Busque y agregue códigos SAP usando el selector de arriba.
                </div>
            `;
        contador.textContent = "0 códigos";
    } else {
        let html = '';
        codigosSapSeleccionados.forEach((item, index) => {
            html += `
                    <div class="flex items-center justify-between bg-gray-500 rounded-lg p-3 border border-gray-400 animate-pulse" style="animation-duration: 0.5s; animation-iteration-count: 1;">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-green-600 rounded-lg">
                                <i class="fas fa-cube text-white text-sm"></i>
                            </div>
                            <div>
                                <p class="text-white font-medium text-sm">${item.codigo}</p>
                                <p class="text-gray-300 text-xs">${item.descripcion}</p>
                            </div>
                        </div>
                        <button type="button" onclick="eliminarSapSeleccionado(${index})" class="text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg p-2 transition-colors">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                `;
        });
        lista.innerHTML = html;
        contador.textContent = `${codigosSapSeleccionados.length} código${codigosSapSeleccionados.length !== 1 ? 's' : ''}`;
    }
}

// Función para eliminar código SAP seleccionado
function eliminarSapSeleccionado(index) {
    Swal.fire({
        title: '¿Remover código SAP?',
        text: `¿Está seguro de remover el código ${codigosSapSeleccionados[index].codigo}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, remover',
        cancelButtonText: 'Cancelar',
        background: '#1f2937',
        color: '#ffffff'
    }).then((result) => {
        if (result.isConfirmed) {
            codigosSapSeleccionados.splice(index, 1);
            actualizarListaSap();
            alertaPersonalizada("success", "Código SAP removido");
        }
    });
}

// Función para cerrar el modal
function cerrarModal() {
    const targetEl = document.getElementById('modalRegistroProdcont');
    const modal = new Modal(targetEl);
    modal.hide();
}

function verDetalles(codProdCont) {
    const http = new XMLHttpRequest();
    // CAMBIA TAMBIÉN ESTA URL
    const url = '/Prodcont/GetProdcontDetalle?codProdCont=' + encodeURIComponent(codProdCont);

    http.open("GET", url, true);
    http.send();

    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);

            let codigosSapHtml = '';
            if (res.codigosSap && res.codigosSap.length > 0) {
                codigosSapHtml = res.codigosSap.map(sap =>
                    `<span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mr-1 mb-1">
                            <i class="fas fa-cube mr-1"></i>${sap.codigo} - ${sap.descripcion}
                        </span>`
                ).join('');
            } else {
                codigosSapHtml = '<span class="text-gray-500 italic">No hay códigos SAP asociados</span>';
            }

            Swal.fire({
                title: 'Detalles del Producto Contabilizado',
                html: `
                        <div class="text-left space-y-4">
                            <div class="bg-gray-100 p-3 rounded-lg">
                                <p class="font-semibold text-gray-800">Código:</p>
                                <p class="text-blue-600">${res.codProdCont}</p>
                            </div>
                            <div class="bg-gray-100 p-3 rounded-lg">
                                <p class="font-semibold text-gray-800">Descripción:</p>
                                <p class="text-gray-700">${res.desProdCont}</p>
                            </div>
                            <div class="bg-gray-100 p-3 rounded-lg">
                                <p class="font-semibold text-gray-800">Códigos SAP Asociados:</p>
                                <div class="mt-2">${codigosSapHtml}</div>
                            </div>
                        </div>
                    `,
                icon: 'info',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#3b82f6',
                background: '#ffffff',
                color: '#1f2937',
                width: '600px'
            });
        }
    };
}
function editarProdcont(codProdCont) {
    console.log("Editando producto:", codProdCont);
    const http = new XMLHttpRequest();
    const url = '/Prodcont/GetProdcontDetalle?codProdCont=' + encodeURIComponent(codProdCont);

    http.open("GET", url, true);
    http.send();

    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);

            title.textContent = 'EDITAR PRODUCTO CONTABILIZADO';
            frm.id.value = res.id;
            frm.codProdCont.value = res.codProdCont;
            frm.desProdCont.value = res.desProdCont;
            frm.empProdCont.value = res.empProdCont || '';

            // Filtrar y mapear códigos SAP válidos
            codigosSapSeleccionados = res.codigosSap ?
                res.codigosSap
                    .filter(item => item.codigo && item.codigo !== "SIN_CODIGO" && item.codigo !== "null" && item.codigo.trim() !== "")
                    .map(item => ({
                        codigo: item.codigo,
                        descripcion: item.descripcion || "Sin descripción"
                    })) : [];

            actualizarListaSap();

            // Mostrar modal para editar
            const targetEl = document.getElementById('modalRegistroProdcont');
            const modal = new Modal(targetEl, {
                backdrop: 'static',
                keyboard: false
            });
            modal.show();
        }
    };
}
function eliminarProdcont(codProdCont) {
    const url = '/Prodcont/EliminarProdcont/' + encodeURIComponent(codProdCont);
    eliminarRegistro('¿ESTÁ SEGURO DE ELIMINAR?', 'EL PRODUCTO CONTABILIZADO Y TODOS SUS CÓDIGOS SAP SE ELIMINARÁN DE FORMA PERMANENTE', 'SÍ, ELIMINAR', url, tblProdcont);
}

function alertaPersonalizada(type, mensaje) {
    Swal.fire({
        position: "center",
        icon: type,
        title: mensaje,
        showConfirmButton: false,
        timer: 1500,
        background: '#1f2937',
        color: '#ffffff',
        toast: true,
        timerProgressBar: true
    });
}

function eliminarRegistro(title, text, accion, url, table) {
    Swal.fire({
        title: title,
        text: text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: accion,
        cancelButtonText: "Cancelar",
        background: '#1f2937',
        color: '#ffffff'
    }).then((result) => {
        if (result.isConfirmed) {
            const http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.send();

            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertaPersonalizada(res.tipo, res.mensaje);
                    if (res.tipo == 'success') {
                        if (table !== null && table !== undefined && typeof table.ajax !== 'undefined') {
                            // Si es una tabla DataTable
                            table.ajax.reload();
                        } else {
                            // Si no es tabla, recargar productos
                            setTimeout(() => {
                                cargarProductosContables();
                            }, 1000);
                        }
                    }
                }
            };
        }
    });
}