    async function fetchContratos() {
    try {
        const response = await fetch('/Contrato/ListarContrato');
    const contratos = await response.json();

    const tbody = document.querySelector('#contratos-container tbody');
    tbody.innerHTML = "";

    if (contratos.length === 0) {
        tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-12 text-gray-400">
                        <i class="fas fa-inbox text-4xl mb-4"></i>
                        <br>
                        <p class="text-lg">No hay contratos disponibles</p>
                        <p class="text-sm">Haz clic en "Nuevo Contrato" para agregar uno</p>
                    </td>
                </tr>
            `;
    return;
        }

    for (const contrato of contratos) {
            // Obtener los productos de este contrato
            const productosResponse = await fetch(`/Contrato/ListarProductosContrato?id=${contrato.nroContrato}`);
    const productosData = await productosResponse.json();

    let totalProductos = 0;
    let totalMonto = 0;
    let estadoProductos = 'Sin productos';

            if (productosData.success && productosData.data.length > 0) {
                const productos = productosData.data;
    totalProductos = productos.length;
                totalMonto = productos.reduce((sum, p) => sum + (parseFloat(p.precio) * parseInt(p.cantidad)), 0);
    estadoProductos = `${totalProductos} producto${totalProductos !== 1 ? 's' : ''}`;
            }

    // Crear fila de la tabla
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer';
    row.setAttribute('onclick', `toggleContratoDetails('${contrato.nroContrato}')`);

    row.innerHTML = `
    <td class="px-6 py-4">
        <div class="flex items-center">
            <div class="p-2 bg-blue-600 rounded-lg mr-3">
                <i class="fas fa-file-contract text-white text-xs"></i>
            </div>
            <div>
                <div class="font-medium text-white">#${contrato.nroContrato}</div>
                <div class="text-gray-400 text-xs">Contrato</div>
            </div>
        </div>
    </td>
    <td class="px-6 py-4">
        <div class="font-medium text-white">${contrato.nombreSocio}</div>
        <div class="text-gray-400 text-xs">${contrato.codSocioNeg}</div>
    </td>
    <td class="px-6 py-4 text-center">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${totalProductos > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
            <i class="fas fa-box mr-1"></i>
            ${estadoProductos}
        </span>
    </td>
    <td class="px-6 py-4 text-right">
        <div class="font-medium text-white">${totalMonto.toLocaleString()} Bs</div>
        <div class="text-gray-400 text-xs">Total</div>
    </td>
    <td class="px-6 py-4 text-center">
        <div class="flex justify-center space-x-2" onclick="event.stopPropagation()">

            <button onclick="abriModalProductosEditar('${contrato.nroContrato}')"
                class="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            <button onclick="eliminarContratoProductos('${contrato.nroContrato}')"
                class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                title="Eliminar">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </td>
    `;

    tbody.appendChild(row);

    // Crear fila expandible para detalles (oculta por defecto)
    const detailRow = document.createElement('tr');
    detailRow.id = `details-${contrato.nroContrato}`;
    detailRow.className = 'hidden border-b border-gray-700 bg-gray-900';
    detailRow.innerHTML = `
    <td colspan="5" class="px-6 py-4">
        <div class="max-h-60 overflow-y-auto">
            <h4 class="text-white font-medium mb-3 flex items-center">
                <i class="fas fa-list-ul mr-2 text-blue-400"></i>
                Productos del Contrato #${contrato.nroContrato}
            </h4>
            <div id="productos-detail-${contrato.nroContrato}" class="space-y-2">
                <div class="text-center py-4">
                    <i class="fas fa-spinner fa-spin text-gray-400"></i>
                    <p class="text-gray-400 text-sm mt-2">Cargando productos...</p>
                </div>
            </div>
        </div>
    </td>
    `;
    tbody.appendChild(detailRow);

            // Cargar productos en el detalle
            if (productosData.success && productosData.data.length > 0) {
                const productosContainer = document.getElementById(`productos-detail-${contrato.nroContrato}`);
    const productos = productosData.data;

    productosContainer.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        ${productos.map(producto => `
                            <div class="bg-gray-800 rounded-lg p-3 border border-gray-600">
                                <div class="flex justify-between items-start mb-2">
                                    <span class="font-medium text-white text-sm">${producto.nombreProducto}</span>
                                    
                                </div>
                                <div class="flex justify-between items-start mb-2">
                                    
                                    <span class="text-gray-400 text-xs">Cod. Producto: ${producto.codProducto}</span>
                                    <span class="text-green-400 font-semibold text-sm">P/U: ${parseFloat(producto.precio).toLocaleString()} Bs</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-400 text-xs">Cantidad: ${producto.cantidad}</span>
                                    <span class="text-blue-400 text-xs font-medium">
                                        Sub: ${(parseFloat(producto.precio) * parseInt(producto.cantidad)).toLocaleString()} Bs
                                    </span>
                                </div>
                            </div>
                        `).join('')}
    </div>
    `;
            }
        }
    } catch (error) {
        console.error("Error fetching contratos:", error);
    const tbody = document.querySelector('#contratos-container tbody');
    tbody.innerHTML = `
    <tr>
        <td colspan="5" class="text-center py-12 text-red-400">
            <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <br>
                <p class="text-lg">Error al cargar los contratos</p>
                <p class="text-sm">Por favor, intenta nuevamente</p>
        </td>
    </tr>
    `;
    }
}

    // Función auxiliar para expandir/contraer detalles
    function toggleContratoDetails(nroContrato) {
    const detailRow = document.getElementById(`details-${nroContrato}`);
    if (detailRow.classList.contains('hidden')) {
        detailRow.classList.remove('hidden');
    } else {
        detailRow.classList.add('hidden');
    }
}



    // Función para abrir modal de edición (placeholder) 
    function abriModalProductosEditar(nroContrato) {
        // Aquí puedes implementar la lógica para mostrar el modal de edición
        console.log('Editar productos del contrato:', nroContrato);
}

    async function eliminarContratoProductos(id) {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¡Esta acción eliminará el contrato permanentemente!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const url = `/Contrato/EliminarContratoProductos/${id}`;

                await enviarDatosFormulario(
                    url,
                    "",
                    (resultado) => {
                        if (resultado.success) {
                            Swal.fire({
                                title: "¡Eliminado!",
                                text: "Contrato eliminado correctamente",
                                icon: "success",
                                showConfirmButton: false, 
                                timer: 1000
                            });

                            setTimeout(() => {
                                location.reload();
                            }, 1000);

                        } else {
                            Swal.fire("Error", resultado.message, "error");
                        }
                    },
                    (error) => {
                        Swal.fire("Error", "No se pudo eliminar el contrato.", "error");
                        console.error("Error al eliminar el contrato:", error);
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
    function abriModalProductosEditar(nroContrato) {
        fetch(`/Contrato/ListarProductosContrato?id=${nroContrato}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const modalBody = document.querySelector('#editarProductosBody');
                    modalBody.innerHTML = '';

                    modalBody.className = 'grid grid-cols-1 md:grid-cols-2 gap-3';

                    data.data.forEach((producto, index) => {
                        const productCard = document.createElement('div');
                        productCard.className = 'bg-slate-700 rounded-lg p-3 border border-slate-600';
                        productCard.id = `producto_${producto.id}`;

                        productCard.innerHTML = `
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center space-x-2">
                                <div class="p-1.5 bg-blue-600 rounded">
                                    <i class="fas fa-box text-white text-xs"></i>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <h4 class="text-white font-medium text-sm truncate">${producto.nombreProducto || 'Producto'}</h4>
                                    <p class="text-slate-400 text-xs">Cod: ${producto.codProducto}</p>
                                </div>
                            </div>
                            <button type="button" 
                                    class="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors flex-shrink-0 btn-eliminar" 
                                    data-producto-id="${producto.id}"
                                    title="Eliminar">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block mb-1 text-xs font-medium text-slate-300">
                                    <i class="fas fa-sort-numeric-up mr-1 text-blue-400"></i>Cantidad
                                </label>
                                <input type="number" 
                                       class="bg-slate-600 border border-slate-500 text-white text-xs rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2 transition-colors" 
                                       id="cantidad_${producto.id}" 
                                       value="${producto.cantidad}" 
                                       min="1">
                            </div>
                            <div>
                                <label class="block mb-1 text-xs font-medium text-slate-300">
                                    <i class="fas fa-dollar-sign mr-1 text-green-400"></i>Precio (Bs)
                                </label>
                                <input type="number" 
                                       class="bg-slate-600 border border-slate-500 text-white text-xs rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2 transition-colors" 
                                       id="precio_${producto.id}" 
                                       value="${producto.precio}" 
                                       min="0.01" 
                                       step="0.01">
                            </div>
                        </div>
                        <div class="mt-2 pt-2 border-t border-slate-600">
                            <div class="flex justify-between items-center">
                                <span class="text-slate-400 text-xs">Subtotal:</span>
                                <span class="text-green-400 font-semibold text-xs" id="subtotal_${producto.id}">
                                    ${(parseFloat(producto.precio) * parseInt(producto.cantidad)).toLocaleString()} Bs
                                </span>
                            </div>
                        </div>
                    `;

                        modalBody.appendChild(productCard);

                        // Event listener para el botón eliminar
                        const btnEliminar = productCard.querySelector('.btn-eliminar');
                        btnEliminar.addEventListener('click', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            eliminarProductosContrato(parseInt(this.dataset.productoId));
                        });

                        // Event listeners para actualizar subtotal
                        const cantidadInput = document.getElementById(`cantidad_${producto.id}`);
                        const precioInput = document.getElementById(`precio_${producto.id}`);
                        const subtotalSpan = document.getElementById(`subtotal_${producto.id}`);

                        function actualizarSubtotal() {
                            const cantidad = parseFloat(cantidadInput.value) || 0;
                            const precio = parseFloat(precioInput.value) || 0;
                            const subtotal = cantidad * precio;
                            subtotalSpan.textContent = `${subtotal.toLocaleString('es-BO', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} Bs`;
                        }

                        cantidadInput.addEventListener('input', actualizarSubtotal);
                        precioInput.addEventListener('input', actualizarSubtotal);
                    });

                    // Mostrar el modal usando la instancia global
                    window.modalEditarProductos.show();

                } else {
                    Swal.fire("Error", data.message || "No se pudieron cargar los productos", "error");
                }
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                Swal.fire("Error", "Error al cargar los productos", "error");
            });
}
    async function eliminarProductosContrato(id) {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¡Esta acción eliminará el producto del contrato!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const url = `/Contrato/EliminarContrato/${id}`; // URL más específica

                await enviarDatosFormulario(
                    url,
                    "",
                    (resultado) => {
                        if (resultado.success) {
                            // Remover el card del DOM
                            const cardEliminar = document.getElementById(`producto_${id}`);
                            if (cardEliminar) {
                                cardEliminar.remove();
                            }

                            // Verificar si no quedan productos
                            const productosRestantes = document.querySelectorAll('#editarProductosBody > div[id^="producto_"]');
                            if (productosRestantes.length === 0) {
                                document.querySelector('#editarProductosBody').innerHTML = `
                                <div class="col-span-2 text-center py-8 text-slate-400">
                                    <i class="fas fa-box-open text-3xl mb-2"></i>
                                    <p>No hay productos en este contrato</p>
                                </div>
                            `;
                            }

                            Swal.fire({
                                title: "¡Eliminado!",
                                text: "Producto eliminado correctamente",
                                icon: "success",
                                background: '#1e293b',
                                color: '#f8fafc',
                                confirmButtonColor: '#2563eb'
                            });
                        } else {
                            Swal.fire({
                                title: "Error",
                                text: resultado.message,
                                icon: "error",
                                background: '#1e293b',
                                color: '#f8fafc',
                                confirmButtonColor: '#dc2626'
                            });
                        }
                    },
                    (error) => {
                        Swal.fire({
                            title: "Error",
                            text: "No se pudo eliminar el producto.",
                            icon: "error",
                            background: '#1e293b',
                            color: '#f8fafc',
                            confirmButtonColor: '#dc2626'
                        });
                        console.error("Error al eliminar el producto:", error);
                    }
                );
            }
        });
}
    document.getElementById('guardarProductosContrato').addEventListener('click', function (e) {
        e.preventDefault();

    // Ahora buscamos los divs de productos en lugar de filas de tabla
    const productCards = document.querySelectorAll('#editarProductosBody > div[id^="producto_"]');
    const productosActualizados = [];
    
    productCards.forEach(card => {
        const id = card.id.split('_')[1];
    const cantidad = document.getElementById(`cantidad_${id}`).value;
    const precio = document.getElementById(`precio_${id}`).value;

    productosActualizados.push({
        id: parseInt(id),
    cantidad: parseFloat(cantidad),
    precio: parseFloat(precio)
        });
    });

    // Enviar los datos al servidor
    fetch('/Contrato/EditarContrato', {
        method: 'POST',
    headers: {
        'Content-Type': 'application/json'
        },
    body: JSON.stringify(productosActualizados)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
        Swal.fire({
            title: "¡Actualizado!",
            text: "Productos actualizados correctamente",
            icon: "success",
            background: '#1e293b',
            color: '#f8fafc',
            showConfirmButton: false,
            timer: 2000
        });
    window.modalEditarProductos.hide(); // Cerrar el modal
            setTimeout(() => {
        fetchContratos(); // Recargar solo la tabla en lugar de toda la página
            }, 1000);
        } else {
        Swal.fire({
            title: "¡Error!",
            text: data.message,
            icon: "error",
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#dc2626'
        });
        }
    })
    .catch(error => {
        console.error('Error al guardar los productos:', error);
    Swal.fire({
        title: "Error",
    text: "Error al guardar los productos",
    icon: "error",
    background: '#1e293b',
    color: '#f8fafc',
    confirmButtonColor: '#dc2626'
        });
    });
});

    $('.select-cliente').selectize({
        maxItems: 1,
    placeholder: "Buscar Código de Cliente",
    valueField: 'codCliente',
    labelField: 'text',
    searchField: 'text',
    load: function (query, callback) {
        if (!query.length) {
        $.ajax({
            url: '/Contrato/BuscarClientes',
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
            url: '/Contrato/BuscarClientes',
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
            return '<div class="p-3 hover:bg-gray-700 transition-colors"><div class="font-medium text-black">' + escape(data.text) +
        '</div><p class="text-gray-400 text-sm">' + escape(data.codCliente) + '</p></div>';
        },
    item: function (data, escape) {
            return '<div class="text-black">' + escape(data.codCliente) + '</div>';
        }
    },
    onFocus: function () {
        this.clearOptions();
    this.load(function (callback) {
        $.ajax({
            url: '/Contrato/BuscarClientes',
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
    }
});
    $('.select-prodcont').selectize({
        maxItems: 1,
    placeholder: "Buscar Código Producto Contable",
    valueField: 'codProdCont',
    labelField: 'text',
    searchField: 'text',
    load: function (query, callback) {
        if (!query.length) {
        $.ajax({
            url: '/Contrato/BuscarProdcont',
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
            url: '/Contrato/BuscarProdcont',
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
            return '<div class="p-3 hover:bg-gray-700 transition-colors"><div class="font-medium text-black">' + escape(data.text) +
        '</div><p class="text-gray-400 text-sm">' + escape(data.codProdCont) + '</p></div>';
        },
    item: function (data, escape) {
            return '<div class="text-black">' + escape(data.codProdCont) + '</div>';
        }
    },
    onFocus: function () {
        this.clearOptions();
    this.load(function (callback) {
        $.ajax({
            url: '/Contrato/BuscarProdcont',
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
    }
});
    document.getElementById("product-form").addEventListener("submit", function (e) {
        e.preventDefault();

    const codProducto = document.getElementById("codProducto").value.trim();
    const cantidad = document.getElementById("cantidad").value.trim();
    const precio = document.getElementById("precio").value.trim();

    const ui = new UI();

    // Input User Validation
    if (codProducto === "" || cantidad === "" || precio === "") {
        ui.showMessage("Por favor llene todos los campos", "danger");
    return;
    }

    // CORREGIDO: Validación de duplicados
    const productList = document.getElementById("product-list");
    const existingProducts = productList.querySelectorAll('.product-code');
    const isDuplicate = Array.from(existingProducts).some(productCode => {
        return productCode.textContent.trim() === codProducto;
    });

    if (isDuplicate) {
        ui.showMessage("No puede tener dos productos iguales.", "danger");
    return;
    }

    // Crear y agregar producto
    const product = new Product(codProducto, cantidad, precio);
    ui.addProduct(product);
    ui.showMessage("Item registrado exitosamente", "success");
    ui.resetForm(); 
});
    class Product {
        constructor(codProducto, cantidad, precio) {
        this.codProducto = codProducto;
    this.cantidad = cantidad;
            this.precio = parseFloat(precio).toFixed(2);
    }
}
    class UI {
        /**
         * Añadir nuevo item con diseño compacto en tabla
         */
        addProduct(product) {
        const productList = document.getElementById("product-list");

    // Si es el primer producto, crear la estructura de la tabla
    if (!productList.querySelector('table')) {
        productList.innerHTML = `
                <div class="h-full flex flex-col">
                    <div class="max-h-80 overflow-y-auto flex-1">
                        <table class="w-full text-xs">
                            <thead class="sticky top-0 bg-gray-800 border-b border-gray-600">
                                <tr class="text-left">
                                    <th class="px-3 py-2 font-medium text-gray-300 uppercase">
                                        <i class="fas fa-barcode mr-1 text-blue-400 text-xs"></i>Código
                                    </th>
                                    <th class="px-3 py-2 font-medium text-gray-300 uppercase text-center">
                                        <i class="fas fa-sort-numeric-up mr-1 text-green-400 text-xs"></i>Cant.
                                    </th>
                                    <th class="px-3 py-2 font-medium text-gray-300 uppercase text-right">
                                        <i class="fas fa-dollar-sign mr-1 text-yellow-400 text-xs"></i>Precio
                                    </th>
                                    <th class="px-3 py-2 font-medium text-gray-300 uppercase text-right">
                                        <i class="fas fa-calculator mr-1 text-purple-400 text-xs"></i>Subtotal
                                    </th>
                                    <th class="px-3 py-2 font-medium text-gray-300 uppercase text-center w-16">
                                        <i class="fas fa-cog mr-1 text-red-400 text-xs"></i>
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="products-tbody" class="divide-y divide-gray-700">
                            </tbody>
                        </table>
                    </div>
                    <div class="px-3 py-2 border-t border-gray-600 bg-gray-800 rounded-b-lg">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-xs">Total:</span>
                            <span class="text-green-400 font-bold text-sm" id="total-contrato">0 Bs</span>
                        </div>
                    </div>
                </div>
            `;
        }

    const tbody = document.getElementById('products-tbody');
    const subtotal = parseFloat(product.precio) * parseInt(product.cantidad);

    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-750 transition-colors product-row';
    row.innerHTML = `
    <td class="px-3 py-2">
        <div class="flex items-center space-x-2">
            <div class="p-0.5 bg-blue-600 rounded text-xs">
                <i class="fas fa-cube text-white" style="font-size: 8px;"></i>
            </div>
            <span class="text-white font-medium text-xs product-code">${product.codProducto}</span>
        </div>
    </td>
    <td class="px-3 py-2 text-center">
        <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 product-quantity">
            ${product.cantidad}
        </span>
    </td>
    <td class="px-3 py-2 text-right">
        <span class="text-yellow-400 font-medium text-xs product-price">${parseFloat(product.precio).toLocaleString()} Bs</span>
    </td>
    <td class="px-3 py-2 text-right">
        <span class="text-purple-400 font-semibold text-xs product-subtotal">${subtotal.toLocaleString()} Bs</span>
    </td>
    <td class="px-3 py-2 text-center">
        <button class="inline-flex items-center px-1.5 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
            name="delete" title="Eliminar">
            <i class="fas fa-trash" style="font-size: 8px;"></i>
        </button>
    </td>
    `;

    tbody.appendChild(row);
    this.updateProductCounter();
    this.updateTotalContrato();
    }

    /**
     * Actualizar contador de productos
     */
    updateProductCounter() {
        const count = document.querySelectorAll('.product-row').length;
    const counterElement = document.getElementById('product-count');
    if (counterElement) {
        counterElement.textContent = count;
        }
    }

    /**
     * Actualizar total del contrato
     */
    updateTotalContrato() {
        const subtotals = document.querySelectorAll('.product-subtotal');
    let total = 0;
        
        subtotals.forEach(subtotal => {
            const value = parseFloat(subtotal.textContent.replace(/[,\s]/g, '').replace('Bs', ''));
    total += value;
        });

    const totalElement = document.getElementById('total-contrato');
    if (totalElement) {
        totalElement.textContent = `${total.toLocaleString()} Bs`;
        }
    }

    /**
     * Reset Form Values
     */
    resetForm() {
        const numeroContrato = document.getElementById("inputNumeroContrato").value;

    // Resetear el formulario
    document.getElementById("product-form").reset();

    // Restaurar el número de contrato
    document.getElementById("inputNumeroContrato").value = numeroContrato;

    // Limpiar el selectize del producto
    const selectProdcont = document.querySelector('.select-prodcont');
    if (selectProdcont && selectProdcont.selectize) {
        selectProdcont.selectize.clear();
        }
    }

    deleteProduct(element) {
        if (element.name === "delete" || element.closest('button[name="delete"]')) {
            const row = element.closest('.product-row');
    if (row) {
        row.remove();
    this.showMessage("Item eliminado exitosamente", "success");
    this.updateProductCounter();
    this.updateTotalContrato();

    // Verificar si no quedan productos
    const remainingProducts = document.querySelectorAll('.product-row');
    if (remainingProducts.length === 0) {
                    const productList = document.getElementById("product-list");
    productList.innerHTML = `
    <div class="text-center py-16 text-gray-400">
        <i class="fas fa-box-open text-3xl mb-3 opacity-50"></i>
        <p class="text-xs">No hay productos agregados</p>
        <p class="text-xs text-gray-500">Usa el formulario para agregar productos</p>
    </div>
    `;
                }
            }
        }
    }

    showMessage(message, cssClass) {
        let bgColor, textColor, iconColor, icon;

    switch(cssClass) {
            case 'success':
    bgColor = 'bg-green-900';
    textColor = 'text-green-100';
    iconColor = 'text-green-400';
    icon = 'fas fa-check-circle';
    break;
    case 'danger':
    bgColor = 'bg-red-900';
    textColor = 'text-red-100';
    iconColor = 'text-red-400';
    icon = 'fas fa-exclamation-circle';
    break;
    default:
    bgColor = 'bg-blue-900';
    textColor = 'text-blue-100';
    iconColor = 'text-blue-400';
    icon = 'fas fa-info-circle';
        }

    const div = document.createElement("div");
    div.className = `${bgColor} border-l-4 ${cssClass === 'success' ? 'border-green-400' : cssClass === 'danger' ? 'border-red-400' : 'border-blue-400'} p-3 mb-3 rounded-lg shadow-lg message-alert`;
    div.innerHTML = `
    <div class="flex items-center">
        <div class="flex-shrink-0">
            <i class="${icon} ${iconColor} text-sm"></i>
        </div>
        <div class="ml-2">
            <p class="${textColor} text-xs font-medium">${message}</p>
        </div>
        <div class="ml-auto pl-2">
            <button type="button" class="inline-flex ${bgColor} rounded-md p-1 ${textColor} hover:bg-opacity-75 focus:outline-none text-xs" onclick="this.closest('.message-alert').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>
    `;

    const app = document.querySelector("#App");
    const container = app ? app.parentElement : document.querySelector(".p-5");

    if (container && app) {
        container.insertBefore(div, app);
        }

    setTimeout(function () {
            if (div && div.parentNode) {
        div.remove();
            }
        }, 4000);
    }
}
document.getElementById("product-list").addEventListener("click", (e) => {
    const ui = new UI();
    ui.deleteProduct(e.target);
    e.preventDefault();
});
    async function enviarMultiplesDatosJSON(url, data, onSuccess, onError) {
    try {
        const response = await fetch(url, {
        method: 'POST',
    headers: {'Content-Type': 'application/json' },
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
    function getAllProducts() {
    const codSocioNeg = document.getElementById("inputCodSocioNeg").value.trim();
    const NroContrato = document.getElementById("inputNumeroContrato").value.trim();
    const productRows = document.querySelectorAll('.product-row');
    const products = [];

    console.log("Número de filas encontradas:", productRows.length);
    console.log("codSocioNeg:", codSocioNeg);
    console.log("NroContrato:", NroContrato);

    productRows.forEach((row, index) => {
        const codProductoElement = row.querySelector('.product-code');
    const cantidadElement = row.querySelector('.product-quantity');
    const precioElement = row.querySelector('.product-price');

    console.log(`Fila ${index}:`, {
        codProductoElement: codProductoElement?.textContent,
    cantidadElement: cantidadElement?.textContent,
    precioElement: precioElement?.textContent
        });
    
    if (codProductoElement && cantidadElement && precioElement) {
            const codProducto = codProductoElement.textContent.trim();
        const cantidad = cantidadElement.textContent.trim();
        const precioText = precioElement.textContent;
        const normalizedPrice = precioText.replace(/[^\d,.]/g, '').replace(',', '.');
        const precio = parseFloat(normalizedPrice).toFixed(2);

    if (codSocioNeg && codProducto && cantidad && precio && NroContrato) {
        products.push({
            NroContrato: NroContrato,
            codSocioNeg: codSocioNeg,
            codProducto: codProducto,
            cantidad: cantidad,
            precio: precio
        });
    console.log(`Producto ${index} agregado:`, {
        NroContrato,
        codSocioNeg,
        codProducto,
        cantidad,
        precio
    });
            } else {
        console.log(`Producto ${index} no válido - faltan campos`);
            }
        } else {
        console.log(`Fila ${index} - elementos no encontrados`);
        }
    });

    console.log("Productos finales:", products);
    return products;
}

    // Cargar contratos al inicializar la página
    document.addEventListener('DOMContentLoaded', function() {
        fetchContratos();
    const modalEditarProductos = new Modal(document.getElementById('editarProductoContratoModal'));
    window.modalEditarProductos = modalEditarProductos;
    document.getElementById("btnAgregarContrato").addEventListener("click", function (event) {
        event.preventDefault();

    const products = getAllProducts();
    console.log("Productos obtenidos antes de enviar:", products);

    if (products.length === 0) {
        Swal.fire("Advertencia", "No hay productos para guardar.", "warning");
    return;
        }

    enviarMultiplesDatosJSON('/Contrato/CrearContrato', products,
            (resultado) => {
        Swal.fire("Contrato guardado exitosamente", "", "success");


    document.getElementById("product-list").innerHTML = '';
                setTimeout(() => {
        location.reload();
                }, 1000);
               
            },
            (error) => Swal.fire("Error", "Ocurrió un error al guardar el contrato.", "error")
    );
    });
});