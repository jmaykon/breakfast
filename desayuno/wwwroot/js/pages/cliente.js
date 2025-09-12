
    const modalRegistroCliente = document.querySelector("#modalRegistroCliente");
    const title = document.querySelector("#titleModalCliente");
    const btnNuevoCliente = document.querySelector("#btnNuevoCliente");
    const frm = document.querySelector("#formularioCliente");

    let tblCliente;

    document.addEventListener("DOMContentLoaded", function () {
        // Inicializar DataTable
        tblCliente = $('#tblCliente').DataTable({
            ajax: {
                url: '/Clientes/ListarCliente',
                dataSrc: '',
            },
            columns: [
                
                { data: 'codCliente' },
                { data: 'detalleCliente' },
                { data: 'codCiudad' },
                { data: 'tipo' },
                {
                    data: 'id',
                    render: function (data, type, row) {
                        return `
                                <div class="flex gap-2">
                                    <button class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all duration-200 hover:scale-105" onclick="editarCliente(${data})">
                                        <i class="fas fa-edit mr-1"></i>Editar
                                    </button>
                                    <button class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 transition-all duration-200 hover:scale-105" onclick="eliminarCliente(${data})">
                                        <i class="fas fa-trash mr-1"></i>Eliminar
                                    </button>
                                </div>
                            `;
                    },
                    orderable: false
                }
            ],
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
            },
            paging: true,
            searching: true,
            pageLength: 10,
            scrollX: true,
            responsive: {
                details: {
                    type: 'column',
                    target: 'tr'
                }
            },
            autoWidth: false,
            scrollCollapse: true,
            order: [[0, 'desc']],
            dom: 'Bfrtip',
            buttons: [
                { extend: 'copy', text: 'Copiar', className: 'btn btn-primary btn-sm' },
                { extend: 'excel', text: 'Excel', className: 'btn btn-primary btn-sm' },
                { extend: 'pdf', text: 'PDF', className: 'btn btn-primary btn-sm' },
            ],
            initComplete: function () {
                this.api().columns([0, 1, 2, 3]).every(function () {
                    var column = this;
                    var columnTitle = $(column.header()).text();

                    $(column.header()).empty();

                    var headerContent = $('<div class="filter-wrapper"></div>');

                    // Crear título clickeable para ordenamiento - usar el evento nativo de DataTables
                    var titleElement = $('<div class="column-title">' + columnTitle + '</div>');

                    headerContent.append(titleElement);

                    var input = $('<input type="text" class="filter-input" placeholder="Buscar..." />')
                        .appendTo(headerContent)
                        .on('keyup change', function () {
                            column.search(this.value).draw();
                        })
                        .on('click', function (e) {
                            e.stopPropagation();
                        });

                    $(column.header()).append(headerContent);

                    // Permitir que DataTables maneje el ordenamiento naturalmente
                    $(column.header()).removeClass('sorting_disabled');
                });
                setTimeout(() => {
                    this.api().columns.adjust();
                    $(window).trigger('resize'); // Fuerza el recálculo
                }, 200);
            }
        });

    // Inicializar Select2
    $('.select-cliente-ciudad').select2({
        placeholder: "Buscar Código de Ciudad",
    allowClear: true,
    minimumInputLength: 0,
    dropdownParent: $('#modalRegistroCliente'),
    ajax: {
        url: '/Clientes/BuscarDistrito',
    dataType: 'json',
    delay: 250,
    data: function (params) {
                    return {q: params.term || '' };
                },
    processResults: function (data) {
                    return {
        results: data.map(item => ({
        id: item.codCiudad,
    text: item.codCiudad + " - " + item.ciudad,
    ciudad: item.ciudad,
    distrito: item.distrito,
    codCiudad: item.codCiudad
                        }))
                    };
                },
    cache: true
            },
    templateSelection: function (data) {
                return data.id;
            }
        });

    // Event listener para el botón nuevo cliente
    btnNuevoCliente.addEventListener("click", function () {
        title.textContent = "NUEVO CLIENTE";
    frm.id.value = '';
    frm.reset();

    // Limpiar Select2
    $('.select-cliente-ciudad').val(null).trigger('change');

    // Mostrar modal usando Flowbite
    const targetEl = document.getElementById('modalRegistroCliente');
    const modal = new Modal(targetEl);
    modal.show();
        });

    // REGISTRAR CLIENTE POR AJAX
    frm.addEventListener("submit", function (e) {
        e.preventDefault();

    if (
    frm.DetalleCliente.value == "" ||
    frm.CodCliente.value == "" ||
    frm.CodCiudad.value == "" ||
    frm.Tipo.value == ""
    ) {
        alertaPersonalizada("warning", "TODOS LOS CAMPOS SON REQUERIDOS");
            } else {
                const data = new FormData(frm);
    const http = new XMLHttpRequest();
    const url = "/Clientes/Guardar";

    http.open("POST", url, true);
    http.send(data);

    http.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        const res = JSON.parse(this.responseText);
    alertaPersonalizada(res.tipo, res.mensaje);
    if (res.tipo == 'success') {
        frm.reset();
    $('.select-cliente-ciudad').val(null).trigger('change');
    const modal = new window.Modal(modalRegistroCliente);
    modal.hide();
    tblCliente.ajax.reload();
                        }
                    }
                };
            }
        });
    });

    // Función para cerrar el modal
    function cerrarModal() {
        const targetEl = document.getElementById('modalRegistroCliente');
    const modal = new Modal(targetEl);
    modal.hide();
    }

    function editarCliente(id) {
        const http = new XMLHttpRequest();
    const url = '/Clientes/GetCliente/' + id;

    http.open("GET", url, true);
    http.send();

    http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const res = JSON.parse(this.responseText);

    title.textContent = 'EDITAR CLIENTE';
    frm.id.value = res.id;
    frm.CodCliente.value = res.codCliente;
    frm.DetalleCliente.value = res.detalleCliente;
    frm.Tipo.value = res.tipo;

    // Asignar valor al select2 correctamente
    let $selectDistritoCliente = $('.select-cliente-ciudad');
    if ($selectDistritoCliente.find("option[value='" + res.codCiudad + "']").length) {
        $selectDistritoCliente.val(res.codCiudad).trigger('change');
                } else {
        let newOption = new Option(res.codCiudad, res.codCiudad, true, true);
    $selectDistritoCliente.append(newOption).trigger('change');
                }

    // Mostrar modal para editar
    const targetEl = document.getElementById('modalRegistroCliente');
    const modal = new Modal(targetEl);
    modal.show();
            }
        };
    }

    function eliminarCliente(id) {
        const url = '/Clientes/EliminarCliente/' + id;
    eliminarRegistro('¿ESTÁ SEGURO DE ELIMINAR?', 'EL CLIENTE SE ELIMINARÁ DE FORMA PERMANENTE', 'SÍ, ELIMINAR', url, tblCliente);
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
                            if (table != null) {
                                table.ajax.reload();
                            } else {
                                setTimeout(() => {
                                    table.ajax.reload();
                                }, 1500);
                            }
                        }
                    }
                };
            }
        });
    }