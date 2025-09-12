


$('.js-select-boleta-contrato').selectize({
    maxItems: 1,
    placeholder: "Buscar Número de Contrato",
    valueField: 'nro_contrato',
    labelField: 'nro_contrato',
    searchField: 'nro_contrato',
    load: function (query, callback) {
        $.ajax({
            url: '/Boleta/BuscarContrato',
            type: 'GET',
            dataType: 'json',
            data: { q: query || '' },
            error: function () {
                callback();
            },
            success: function (res) {
                console.log("Datos recibidos del servidor:", res);
                callback(res);
            }
        });
    },
    render: {
        option: function (data, escape) {
            return '<div class="card w-100"><div class="card-body">' +
                '<h6 class="card-title">' + escape(data.nro_contrato) + '</h6>' +
                '<p class="card-text">' + escape(data.cod_socio_neg) + '</p>' +
                '</div></div>';
        },
        item: function (data, escape) {
            return '<div>' + escape(data.nro_contrato) + '</div>';
        }
    },
    onFocus: function () {
        this.clearOptions(); // Limpiar opciones previas
        this.load(function (callback) {
            $.ajax({
                url: '/Boleta/BuscarContrato',
                type: 'GET',
                dataType: 'json',
                data: { q: '' }, // Cargar todos los datos al enfocar
                error: function () {
                    callback();
                },
                success: function (res) {
                    console.log("Datos cargados al hacer foco:", res);
                    callback(res);
                }
            });
        });
    },
    onChange: function (value) {
        if (!value) {
            $('#cod_socio_neg_boleta').val(''); // Limpiar campo si no hay selección
            limpiarTablaProductos(); // Limpiar la tabla si no hay selección
            return;
        }

        // Buscar el objeto correspondiente al valor seleccionado
        var selectedData = this.options[value];
        if (selectedData) {
            $('#cod_socio_neg_boleta').val(selectedData.cod_socio_neg); // Actualizar el campo

            // Llamar al controlador para obtener los productos del contrato
            $.ajax({
                url: '/Boleta/ListarProductosContrato',
                type: 'GET',
                dataType: 'json',
                data: { id: value },
                success: function (response) {
                    if (response.success) {
                        actualizarTablaProductos(response.data); 
                    } else {
                        alert(response.message || 'No se encontraron productos para este contrato.');
                        limpiarTablaProductos(); 
                    }
                },
                error: function () {
                    alert('Error al obtener productos del contrato.');
                    limpiarTablaProductos(); 
                }
            });
        }
    }
});

// Función para limpiar la tabla
function limpiarTablaProductos() {
    $('#tabla-productos-contrato tbody').empty();
}


function actualizarTablaProductos(productos) {
    console.log("Datos recibidos para la tabla:", productos);
    const tbody = $('#tabla-productos-contrato tbody');
    const tbodypre = $('#preBoleta tbody');
    tbodypre.empty();
    tbody.empty();

    let codigoAnterior = null;
    const codigosVistos = new Set(); // Para rastrear qué códigos ya hemos visto

    productos.forEach((productoContrato, index) => {
        console.log("Procesando producto:", productoContrato);
        const contrato = productoContrato.contrato;
        const prodCont = productoContrato.prodCont;
        const producto = productoContrato.producto;

        // Determinar si es el primer producto de este código
        const esPrimeroDelCodigo = !codigosVistos.has(contrato.codProducto);

        // Si cambió el código y no es el primer elemento, agregar línea separadora
        if (codigoAnterior !== null && codigoAnterior !== contrato.codProducto) {
            const lineaSeparadora = `
                <tr>
                    <td colspan="7" class="px-0 py-0">
                        <div class="border-t-2 border-slate-500 w-full"></div>
                    </td>
                </tr>`;
            tbody.append(lineaSeparadora);
        }

        // Determinar valor para cantidad
        const cantidadValue = esPrimeroDelCodigo ? contrato.cantidad : 0;

        // Contenido del checkbox solo para el primer producto del grupo
        const checkboxContent = esPrimeroDelCodigo ? `
            <div class="text-center" style="text-align:center;">
                <input checked type="checkbox" value="" class="producto-seleccionado w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
            </div>` : '';

        const fila = `
    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
        <td>
            ${checkboxContent}
        </td>
        <td class="px-4 py-3" data-codproducto="${contrato.codProducto}">${contrato.codProducto}</td>
        <td class="px-4 py-3">${prodCont.desProdCont}</td>
        <td class="px-4 py-3">${prodCont.codProdSap}</td>
        <td class="px-4 py-3">${producto.nombre}</td>
        <td class="px-4 py-3" data-precio="${contrato.precio}">${contrato.precio}</td>   
        <td class="px-4 py-3">
            <input type="number"
                   value="${cantidadValue}" 
                   data-cantidad="${contrato.cantidad}"
                   class="cantidad-input bg-transparent border border-slate-600 text-white text-sm rounded w-20 p-1 text-center"
                   min="0">
        </td>
    </tr>`;

        const filaPreBoleta = `
            <tr>
                <td>0</td> 
                <td>E</td> 
                <td>${producto.nombre}</td> 
                <td>${contrato.precio}</td> 
                <td>${contrato.codSocioNeg}</td>    
            </tr>`;

        tbody.append(fila);
        tbodypre.append(filaPreBoleta);

        // Marcar este código como visto
        codigosVistos.add(contrato.codProducto);

        // Actualizar el código anterior
        codigoAnterior = contrato.codProducto;
    });
}



$('.js-select-boleta-distrito').selectize({
    maxItems: 1,
    placeholder: "Buscar Código de Distrito",
    valueField: 'codDistrito',
    labelField: 'text',
    searchField: 'text',
    load: function (query, callback) {
        if (!query.length) {
            // Si no hay consulta, se muestra todo.
            $.ajax({
                url: '/Boleta/BuscarDistrito',
                type: 'GET',
                dataType: 'json',
                data: { q: '' }, // Enviar un query vacío para traer todos los datos.
                error: function () {
                    callback();
                },
                success: function (res) {
                    console.log("Datos cargados al iniciar:", res);
                    callback(res);
                }
            });
        } else {
            $.ajax({
                url: '/Boleta/BuscarDistrito',
                type: 'GET',
                dataType: 'json',
                data: {
                    q: query // Enviar la consulta al servidor.
                },
                error: function () {
                    callback();
                },
                success: function (res) {
                    console.log("Datos recibidos del servidor:", res);
                    callback(res);
                }
            });
        }
    },
    render: {
        option: function (data, escape) {
            return '<div class="card w-100"><div class="card-body"><h6 class="card-title">' + escape(data.text) +
                '</h6 ><p class="card-text">' + escape(data.codDistrito) + '</p></div></div>';
        },
        item: function (data, escape) {
            return '<div>' + escape(data.codDistrito) + '</div>';
        }
    },
    onFocus: function () {
        // Forzar carga de todos los datos cuando el campo gana foco.
        this.clearOptions(); // Limpia las opciones previas.
        this.load(function (callback) {
            $.ajax({
                url: '/Boleta/BuscarDistrito',
                type: 'GET',
                dataType: 'json',
                data: { q: '' },
                error: function () {
                    callback();
                },
                success: function (res) {
                    console.log("Datos cargados al hacer foco:", res);
                    callback(res);
                }
            });
        });
    },
    onChange: function (value) {
        if (!value) {
            $('#cod_socio_neg_boleta').val(''); // Limpiar campo si no hay selección
            limpiarTablaProductos(); // Limpiar la tabla si no hay selección
            return;
        }

        // Buscar el objeto correspondiente al valor seleccionado
        var selectedData = this.options[value];
        if (selectedData) {

            // Llamar al controlador para obtener los productos del contrato
            $.ajax({
                url: '/Boleta/ListarDistritosBoleta',
                type: 'GET',
                dataType: 'json',
                data: { id: value },
                success: function (response) {
                    if (response.success) {
                        actualizarTablaBoletas(response.data); // Actualizar la tabla con los datos recibidos
                    } else {
                        alert(response.message || 'No se encontraron productos para este contrato.');
                        limpiarTablaBoletas(); // Limpiar la tabla si no hay datos
                    }
                },
                error: function () {
                    alert('Error al obtener productos del contrato.');
                    limpiarTablaBoletas(); // Limpiar la tabla si hay un error
                }
            });
        }
    }
});


// Función para limpiar la tabla
function limpiarTablaBoletas() {
    $('#tabla-distritos-boletas tbody').empty();
}

// Función para actualizar la tabla con los datos obtenidos
function actualizarTablaBoletas(productosBoletas) {
    console.log("Datos recibidos para la tabla:", productosBoletas);
    const tbodyBoletas = $('#tabla-distritos-boletas tbody');
    const botonBoletasPrev = $('#preBoleta');
    tbodyBoletas.empty();
    botonBoletasPrev.empty();

    productosBoletas.forEach(productoBoletas => {
        console.log("Procesando producto:", productoBoletas);
        const filaBoletas = `
            <tr>
                <td>${productoBoletas.codigo}</td>
                <td>${productoBoletas.direccion}</td>
                <td>${productoBoletas.raciones}</td>
                <td>
                    <input type="number" class="form-control" value="${productoBoletas.raciones}"/>
                </td>
            </tr>`;
        const filaBotonesBoletas = `
            <button type="button" class="btn" data-bs-toggle="modal" onclick="abriBoletaPrev(${productoBoletas.id})">
                        <svg width="100px" height="100px"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM80 64l64 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L80 96c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l64 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-64 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm54.2 253.8c-6.1 20.3-24.8 34.2-46 34.2L80 416c-8.8 0-16-7.2-16-16s7.2-16 16-16l8.2 0c7.1 0 13.3-4.6 15.3-11.4l14.9-49.5c3.4-11.3 13.8-19.1 25.6-19.1s22.2 7.7 25.6 19.1l11.6 38.6c7.4-6.2 16.8-9.7 26.8-9.7c15.9 0 30.4 9 37.5 23.2l4.4 8.8 54.1 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-64 0c-6.1 0-11.6-3.4-14.3-8.8l-8.8-17.7c-1.7-3.4-5.1-5.5-8.8-5.5s-7.2 2.1-8.8 5.5l-8.8 17.7c-2.9 5.9-9.2 9.4-15.7 8.8s-12.1-5.1-13.9-11.3L144 349l-9.8 32.8z" /></svg>
            </button>
        `

        tbodyBoletas.append(filaBoletas);
        botonBoletasPrev.append(filaBotonesBoletas);
    });
}


const inputFechaEntrega = document.getElementById('fechaEntregaBoleta');
const nroActaElement = document.getElementById('nroActaBoletaPrev');
const fechaEntregaElement = document.getElementById('fechaEntregaBoletaPrev');
const descripcionElement = document.getElementById('descripcionBoletaPrev');
async function abriBoletaPrev(id) {
    myModalBoletaPrev.show();

    try {
        const response = await fetch(`/Boleta/ListarUnidadesBoleta/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const dataUnidades = await response.json();

        
        const valorFechaEntregaInput = inputFechaEntrega.value.trim();
        const valorDescripcionBoletaPrev = dataUnidades.data.descripcion || 'Sin dato';
        // Actualizar el contenido en el modal
        nroActaElement.textContent = valorNroActaInput ? ":" + valorNroActaInput : ":" + 'Sin dato';
        fechaEntregaElement.textContent = valorFechaEntregaInput ? ":" + valorFechaEntregaInput : ":" + 'Sin dato';
        descripcionElement.textContent = ":" + valorDescripcionBoletaPrev;
    } catch (error) {
        nroActaElement.textContent = ": Error";
        fechaEntregaElement.textContent = ": Error";
    }
}




function cargarBoletas(e) {
    e.preventDefault();
    const productos = [];

    // Captura las filas de las dos tablas
    const filasProductos = document.querySelectorAll("#tabla-productos-contrato tbody tr");
    const filasBoletas = document.querySelectorAll("#tabla-distritos-boletas tbody tr");

    
    const inputCodContratoBoleta = document.getElementById("codContratoBoleta");
    const codContratoBoleta = inputCodContratoBoleta.value;
    const inputCodDistritoBoleta = document.getElementById("codDistritoBoleta");
    const codDistritoBoleta = inputCodDistritoBoleta.value;
    const inputFechaDespachoBoleta = document.getElementById("fechaDespachoBoleta");
    const fechaDespachoBoleta = inputFechaDespachoBoleta.value;
    const inputFechaEntregaBoleta = document.getElementById("fechaEntregaBoleta");
    const fechaEntregaBoleta = inputFechaEntregaBoleta.value;
    
    // Objeto para llevar el contador de boletas por cada codProductoCont
    const contadorBoletasPorProducto = {};

    // Procesar productos de la tabla de productos (solo los que tienen checkbox marcado)
    filasProductos.forEach((fila) => {
        // Verificar si el checkbox está marcado
        const checkbox = fila.querySelector(".producto-seleccionado");
        if (checkbox && checkbox.checked) {
            const codProducto = fila.querySelector("[data-codproducto]").dataset.codproducto;
            const cantidad = fila.querySelector("[data-cantidad]").dataset.cantidad;

            // Inicializar el contador de boletas para este codProductoCont si no existe
            if (!contadorBoletasPorProducto[codProducto]) {
                contadorBoletasPorProducto[codProducto] = 1;
            }

            // Procesar productos de la tabla de boletas
            filasBoletas.forEach((filaBoleta) => {
                const codigo = filaBoleta.querySelector("td:nth-child(1)").innerText;
                const raciones = filaBoleta.querySelector("td:nth-child(3)").innerText;

                // Crear un objeto para cada fila combinada
                const productoBoleta = {
                    
                    nroBoleta: contadorBoletasPorProducto[codProducto],
                    nroContrato: codContratoBoleta,
                    fDespacho: fechaDespachoBoleta,
                    fEntrega: fechaEntregaBoleta,
                   
                    codCiudad: "1",
                    codDistrito: codDistritoBoleta,
                    codigo: codigo,
                    raciones: parseInt(raciones),
                    codProductoCont: codProducto,
                    cantidad: parseFloat(cantidad)
                };

                productos.push(productoBoleta);

                // Incrementar el contador de boletas para este codProductoCont
                contadorBoletasPorProducto[codProducto]++;
            });
        }
    });

    console.log("Fecha de despacho obtenida:", fechaDespachoBoleta);
    console.log("Boletas generadas:", productos);

    // Enviar los datos al servidor solo si hay productos seleccionados
    if (productos.length > 0) {
        enviarMultiplesDatosJSON('/Boleta/CrearBoletas', productos,
            (resultado) => {
                if (!resultado.success) {
                Swal.fire("Error", resultado.message, "error");
                return;
            }
                Swal.fire({
                    icon: "success",
                    title: "¡Registrado!",
                    text: "Boletas guardadas exitosamente",
                    showConfirmButton: false,
                    timer: 800
                });
                setTimeout(() => {
                    window.location.href = '/Boleta/Index'; 
                }, 600);
            },
            (error) => Swal.fire("Error", "Ocurrió un error al guardar las boletas.", "error")
        );
    } else {
        Swal.fire("Advertencia", "No has seleccionado ningún producto para generar boletas.", "warning");
    }
}
async function enviarMultiplesDatosJSON(url, data, onSuccess, onError) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const resultado = await response.json();
        console.log("Respuesta del servidor:", resultado);

        if (response.ok && resultado.success) {
            onSuccess?.(resultado);
        } else {
            throw new Error(resultado.message || "Error inesperado.");
        }
    } catch (error) {
       
        Swal.fire("Error", error.message, "error");
    }
}



