    // Variables Globales
    const modalRegistroDistrito = document.querySelector("#modalRegistroDistrito");
    const title = document.querySelector("#titleModalDistrito");
    const btnNuevoDistrito = document.querySelector("#btnNuevoDistrito");
    const frm = document.querySelector("#formularioDistrito");

    let tblDistritos;

    document.addEventListener("DOMContentLoaded", function () {
        // Inicializar DataTable
        tblDistritos = $('#tblDistritos').DataTable({
            ajax: {
                url: '/Distrito/ListarDistritos',
                dataSrc: '',
            },
            columns: [
                
                { data: 'codDistrito' },
                { data: 'distrito1' },
                { data: 'codCiudad' },
                { data: 'ciudad' },
                {
                    data: 'id',
                    render: function (data, type, row) {
                        return `
                                <div class="flex gap-2">
                                    <button class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all duration-200 hover:scale-105" onclick="editarDistrito(${data})">
                                        <i class="fas fa-edit mr-1"></i>Editar
                                    </button>
                                    <button class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 transition-all duration-200 hover:scale-105" onclick="eliminarDistrito(${data})">
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
            order: [[0, 'desc']],
            dom: 'Bfrtip',
            scrollX: true,
            responsive: {
                details: {
                    type: 'column',
                    target: 'tr'
                }
            },
            autoWidth: false,
            scrollCollapse: true,
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

                    // Crear título clickeable para ordenamiento
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

    // Event listener para el botón nuevo distrito
    btnNuevoDistrito.addEventListener("click", function () {
        title.textContent = "NUEVO DISTRITO";
    frm.id.value = '';
    frm.reset();

    // Mostrar modal usando Flowbite
    const targetEl = document.getElementById('modalRegistroDistrito');
    const modal = new Modal(targetEl);
    modal.show();
        });

    // REGISTRAR DISTRITO POR AJAX
    frm.addEventListener("submit", function (e) {
        e.preventDefault();

    if (
    frm.codDistrito.value == "" ||
    frm.distrito1.value == "" ||
    frm.ciudad.value == ""
    ) {
        alertaPersonalizada("warning", "TODOS LOS CAMPOS SON REQUERIDOS");
            } else {
                const data = new FormData(frm);
    const http = new XMLHttpRequest();
    const url = "/Distrito/Guardar";

    http.open("POST", url, true);
    http.send(data);

    http.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        const res = JSON.parse(this.responseText);
    alertaPersonalizada(res.tipo, res.mensaje);
    if (res.tipo == 'success') {
        frm.reset();
    const modal = new Modal(modalRegistroDistrito);
    modal.hide();
    tblDistritos.ajax.reload();
                        }
                    }
                };
            }
        });
    });

    // Función para cerrar el modal
    function cerrarModal() {
        const targetEl = document.getElementById('modalRegistroDistrito');
    const modal = new Modal(targetEl);
    modal.hide();
    }

    function editarDistrito(id) {
        const http = new XMLHttpRequest();
    const url = '/Distrito/GetDistrito/' + id;

    http.open("GET", url, true);
    http.send();

    http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const res = JSON.parse(this.responseText);

    title.textContent = 'EDITAR DISTRITO';
    frm.id.value = res.id;
    frm.codDistrito.value = res.codDistrito;
    frm.distrito1.value = res.distrito1;
    frm.ciudad.value = res.ciudad;

    // Mostrar modal para editar
    const targetEl = document.getElementById('modalRegistroDistrito');
    const modal = new Modal(targetEl);
    modal.show();
            }
        };
    }

    function eliminarDistrito(id) {
        const url = '/Distrito/EliminarDistrito/' + id;
    eliminarRegistro('¿ESTÁ SEGURO DE ELIMINAR?', 'EL DISTRITO SE ELIMINARÁ DE FORMA PERMANENTE', 'SÍ, ELIMINAR', url, tblDistritos);
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
