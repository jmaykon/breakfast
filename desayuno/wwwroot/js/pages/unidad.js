    // Variables Globales
    const modalRegistroUnidad = document.querySelector("#modalRegistroUnidad");
    const title = document.querySelector("#titleModalUnidad");
    const btnNuevaUnidad = document.querySelector("#btnNuevaUnidad");
    const frm = document.querySelector("#formularioUnidad");

    let tblUnidad;

    document.addEventListener("DOMContentLoaded", function () {
        // Inicializar DataTable
        tblUnidad = $('#tblUnidad').DataTable({
            ajax: {
                url: '/Unidad/ListarUnidad',
                dataSrc: '',
            },
            columns: [
                { data: 'codigo' },
                { data: 'descripcion' },
                { data: 'raciones' },
                { data: 'direccion' },
                { data: 'turno' },
                { data: 'codDistrito' },
                {
                    data: 'id',
                    render: function (data, type, row) {
                        return `
                                    <div class="flex gap-2">
                                        <button class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all duration-200 hover:scale-105" onclick="editarUnidad(${data})">
                                            <i class="fas fa-edit mr-1"></i>Editar
                                        </button>
                                        <button class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 transition-all duration-200 hover:scale-105" onclick="eliminarUnidad(${data})">
                                            <i class="fas fa-trash mr-1"></i>Eliminar
                                        </button>
                                    </div>
                                `;
                    },
                    orderable: false
                }
            ],
            columnDefs: [{
                targets: 0,
                type: 'custom-numeric',
                render: function (data, type, row) {
                    if (type === 'type' || type === 'sort') {
                        // Extraer números para ordenamiento
                        var num = parseInt(data.replace(/[^0-9]/g, ''));
                        return isNaN(num) ? 0 : num;
                    }
                    return data;
                }
            }],
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
            },
            paging: true,
            searching: true,
            pageLength: 10,
            order: [[0, 'asc']],
            dom: 'Bfrtip',
            scrollX: true,
            scrollCollapse: true,
            buttons: [
                { extend: 'copy', text: 'Copiar', className: 'btn btn-primary btn-sm' },
                { extend: 'excel', text: 'Excel', className: 'btn btn-primary btn-sm' },
                { extend: 'pdf', text: 'PDF', className: 'btn btn-primary btn-sm' },
            ],
            initComplete: function () {
                this.api().columns([0, 1, 2, 3, 4, 5, 6]).every(function () {
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
                    this.api().responsive.recalc();
                }, 100);
            }
        });

    // Inicializar Select2
    $('.select-unidad-distrito').select2({
        placeholder: "Buscar Código o Distrito",
    allowClear: true,
    minimumInputLength: 0,
    dropdownParent: $('#modalRegistroUnidad'),
    ajax: {
        url: '/Unidad/BuscarDistrito',
    dataType: 'json',
    delay: 250,
    data: function (params) {
                    return {q: params.term || '' };
                },
    processResults: function (data) {
                    return {
        results: data.map(item => ({
        id: item.text,
    text: item.text + " - " + item.distrito,
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

    // Cuando se selecciona un elemento en Select2
    $('.select-unidad-distrito').on('select2:select', function (e) {
            var data = e.params.data;
    $('#Distrito').val(data.distrito);
    $('#IdCiudad').val(data.codCiudad);
    $('#ciudad').val(data.ciudad);
        });

    // Event listener para el botón nueva unidad
    btnNuevaUnidad.addEventListener("click", function () {
        title.textContent = "NUEVA UNIDAD";
    frm.id.value = '';
    frm.reset();

    // Limpiar Select2
    $('.select-unidad-distrito').val(null).trigger('change');

    // Mostrar modal usando Flowbite
    const targetEl = document.getElementById('modalRegistroUnidad');
    const modal = new Modal(targetEl);
    modal.show();
        });

    // REGISTRAR UNIDAD POR AJAX
    frm.addEventListener("submit", function (e) {
        e.preventDefault();

    if (
    frm.Codigo.value == "" ||
    frm.Descripcion.value == "" ||
    frm.codDistrito.value == "" ||
    frm.Telefono.value == ""
    ) {
        alertaPersonalizada("warning", "TODOS LOS CAMPOS SON REQUERIDOS");
            } else {
                const data = new FormData(frm);
    const http = new XMLHttpRequest();
    const url = "/Unidad/Guardar";

    http.open("POST", url, true);
    http.send(data);

    http.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        const res = JSON.parse(this.responseText);
    alertaPersonalizada(res.tipo, res.mensaje);
    if (res.tipo == 'success') {
        frm.reset();
    $('.select-unidad-distrito').val(null).trigger('change');
    const modal = new window.Modal(modalRegistroUnidad);
    modal.hide();
    tblUnidad.ajax.reload();
                        }
                    }
                };
            }
        });
    });

    // Función para cerrar el modal
    function cerrarModal() {
        const targetEl = document.getElementById('modalRegistroUnidad');
    const modal = new Modal(targetEl);
    modal.hide();
    }

    function editarUnidad(id) {
        const http = new XMLHttpRequest();
    const url = '/Unidad/GetUnidad/' + id;

    http.open("GET", url, true);
    http.send();

    http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const res = JSON.parse(this.responseText);

    title.textContent = 'EDITAR UNIDAD';
    frm.id.value = res.u.id;
    frm.Codigo.value = res.u.codigo;
    frm.Descripcion.value = res.u.descripcion;
    frm.Raciones.value = res.u.raciones;
    frm.Direccion.value = res.u.direccion;
    frm.Turno.value = res.u.turno;
    frm.Responzable.value = res.u.responzable;
    frm.IdCiudad.value = res.u.idCiudad;
    frm.ciudad.value = res.ciudad;
    frm.Distrito.value = res.u.distrito;
    frm.Telefono.value = res.u.telefono;
    frm.Ruta.value = res.u.ruta;
    frm.Nivel.value = res.u.nivel;

    // Asignar valor al select2 correctamente
    let $selectDistrito = $('.select-unidad-distrito');
    if ($selectDistrito.find("option[value='" + res.u.codDistrito + "']").length) {
        $selectDistrito.val(res.u.codDistrito).trigger('change');
                } else {
        let newOption = new Option(res.u.codDistrito, res.u.codDistrito, true, true);
    $selectDistrito.append(newOption).trigger('change');
                }

    // Mostrar modal para editar
    const targetEl = document.getElementById('modalRegistroUnidad');
    const modal = new Modal(targetEl);
    modal.show();
            }
        };
    }

    function eliminarUnidad(id) {
        const url = '/Unidad/EliminarUnidad/' + id;
    eliminarRegistro('¿ESTÁ SEGURO DE ELIMINAR?', 'LA UNIDAD SE ELIMINARÁ DE FORMA PERMANENTE', 'SÍ, ELIMINAR', url, tblUnidad);
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
