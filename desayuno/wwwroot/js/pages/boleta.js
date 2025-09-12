$(document).ready(function () {
    var navListItems = $('div.setup-panel div a'),
        allWells = $('.setup-content'),
        allNextBtn = $('.nextBtn'),
        allPrevBtn = $('.prevBtn');

    allWells.hide();

    navListItems.click(function (e) {
        e.preventDefault();
        var $target = $($(this).attr('href')),
            $item = $(this);

        if (!$item.hasClass('disabled')) {
            navListItems.removeClass('bg-blue-600').removeClass('text-white').addClass('bg-gray-100').addClass('text-gray-500').addClass('border').addClass('border-gray-300');
            navListItems.addClass('dark:bg-gray-700').addClass('dark:text-gray-400').addClass('dark:border-gray-600');

            $item.removeClass('bg-gray-100').removeClass('text-gray-500').removeClass('border').removeClass('border-gray-300');
            $item.removeClass('dark:bg-gray-700').removeClass('dark:text-gray-400').removeClass('dark:border-gray-600');
            $item.addClass('bg-blue-600').addClass('text-white');

            allWells.hide();
            $target.show();
        }
    });

    allNextBtn.click(function () {
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
            curInputs = curStep.find("input[type='text'],input[type='number'],input[type='url'],input[type='date'], select"),
            isValid = true;

        $(".error-message").addClass("hidden");

        for (var i = 0; i < curInputs.length; i++) {
            var $input = $(curInputs[i]);

            if ($input.is("select") && $input.val().trim() === "") {
                isValid = false;
                $input.closest("div").find(".error-message").removeClass("hidden");
            } else if (!$input[0].validity.valid) {
                isValid = false;
                $input.closest("div").find(".error-message").removeClass("hidden");
            }
        }

        if (isValid) {
            nextStepWizard.removeAttr('disabled').trigger('click');
        }
    });

    allPrevBtn.click(function () {
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            prevStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().prev().children("a");

        $(".error-message").addClass("hidden");
        prevStepWizard.removeAttr('disabled').trigger('click');
    });

    $('div.setup-panel div a').first().trigger('click');
});

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
        this.clearOptions();
        this.load(function (callback) {
            $.ajax({
                url: '/Boleta/BuscarContrato',
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
            $('#cod_socio_neg_boleta').val('');
            limpiarTablaProductos();
            return;
        }

        var selectedData = this.options[value];
        if (selectedData) {
            $('#cod_socio_neg_boleta').val(selectedData.cod_socio_neg);

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

function limpiarTablaProductos() {
    $('#tabla-productos-contrato tbody').empty();
}

function actualizarTablaProductos(productos) {
    console.log("Datos recibidos para la tabla:", productos);
    const tbody = $('#tabla-productos-contrato tbody');
    const tbodypre = $('#preBoleta tbody');
    tbodypre.empty();
    tbody.empty();

    productos.forEach(productoContrato => {
        console.log("Procesando producto:", productoContrato);

        const contrato = productoContrato.contrato;
        const prodCont = productoContrato.prodCont;
        const producto = productoContrato.producto;

        const fila = `
           <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
               <td class="px-4 py-3">${prodCont.codProdSap}</td>
               <td class="px-4 py-3" data-codproducto="${contrato.codProducto}">${contrato.codProducto}</td>
               <td class="px-4 py-3">${producto.nombre}</td> 
               <td class="px-4 py-3" data-cantidad="${contrato.cantidad}">${contrato.cantidad}</td>
               <td class="px-4 py-3" data-precio="${contrato.precio}">${contrato.precio}</td>   
               <td class="px-4 py-3">
                   <input type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
               </td>
           </tr>`;

        tbody.append(fila);
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
            $.ajax({
                url: '/Boleta/BuscarDistrito',
                type: 'GET',
                dataType: 'json',
                data: { q: '' },
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
                    q: query
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
        this.clearOptions();
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
            $('#cod_socio_neg_boleta').val('');
            limpiarTablaProductos();
            return;
        }

        var selectedData = this.options[value];
        if (selectedData) {
            $.ajax({
                url: '/Boleta/ListarDistritosBoleta',
                type: 'GET',
                dataType: 'json',
                data: { id: value },
                success: function (response) {
                    if (response.success) {
                        actualizarTablaBoletas(response.data);
                    } else {
                        alert(response.message || 'No se encontraron productos para este contrato.');
                        limpiarTablaBoletas();
                    }
                },
                error: function () {
                    alert('Error al obtener productos del contrato.');
                    limpiarTablaBoletas();
                }
            });
        }
    }
});

function limpiarTablaBoletas() {
    $('#tabla-distritos-boletas tbody').empty();
}

function actualizarTablaBoletas(productosBoletas) {
    console.log("Datos recibidos para la tabla:", productosBoletas);
    const tbodyBoletas = $('#tabla-distritos-boletas tbody');
    const botonBoletasPrev = $('#preBoleta');
    tbodyBoletas.empty();
    botonBoletasPrev.empty();

    productosBoletas.forEach(productoBoletas => {
        console.log("Procesando producto:", productoBoletas);
        const filaBoletas = `
           <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
               <td class="px-4 py-3">${productoBoletas.codigo}</td>
               <td class="px-4 py-3">${productoBoletas.direccion}</td>
               <td class="px-4 py-3">${productoBoletas.raciones}</td>
               <td class="px-4 py-3">
                   <input type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value="${productoBoletas.raciones}"/>
               </td>
           </tr>`;
        const filaBotonesBoletas = `
           <button type="button" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 group" onclick="abriBoletaPrev(${productoBoletas.id})">
               <svg class="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                   <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
               </svg>
               <div class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Boleta ${productoBoletas.codigo}</div>
           </button>
       `;

        tbodyBoletas.append(filaBoletas);
        botonBoletasPrev.append(filaBotonesBoletas);
    });
}

function cargarBoletas(e) {
    e.preventDefault();
    const productos = [];

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
    const inputFechaConsolidadoBoleta = document.getElementById("fechaConsolidadoBoleta");
    const fechaConsolidadoBoleta = inputFechaConsolidadoBoleta.value;

    const contadorBoletasPorProducto = {};

    filasProductos.forEach((fila) => {
        const codProducto = fila.querySelector("[data-codproducto]").dataset.codproducto;
        const cantidad = fila.querySelector("[data-cantidad]").dataset.cantidad;

        if (!contadorBoletasPorProducto[codProducto]) {
            contadorBoletasPorProducto[codProducto] = 1;
        }

        filasBoletas.forEach((filaBoleta) => {
            const codigo = filaBoleta.querySelector("td:nth-child(1)").innerText;
            const raciones = filaBoleta.querySelector("td:nth-child(3)").innerText;

            const productoBoleta = {
                
                nroBoleta: contadorBoletasPorProducto[codProducto],
                nroContrato: codContratoBoleta,
                fDespacho: fechaDespachoBoleta,
                fEntrega: fechaEntregaBoleta,
                fConsolidado: fechaConsolidadoBoleta,
                codCiudad: "1",
                codDistrito: codDistritoBoleta,
                codigo: codigo,
                raciones: parseInt(raciones),
                codProductoCont: codProducto,
                cantidad: parseFloat(cantidad)
            };

            productos.push(productoBoleta);
            contadorBoletasPorProducto[codProducto]++;
        });
    });

    console.log("Fecha de despacho obtenida:", fechaDespachoBoleta);
    console.log("Boletas generadas:", productos);

    enviarMultiplesDatosJSON('/Boleta/CrearBoletas', productos,
        (resultado) => {
            alert("Boletas guardadas exitosamente");
        },
        (error) => alert("Error: Ocurrió un error al guardar las boletas.")
    );
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
        onError?.(error);
        console.error('Error al enviar datos:', error);
    }
}