// Variables Globales
const modalRegistroUsuario = document.querySelector("#modalRegistroUsuario");
const title = document.querySelector("#titleModalUsuario");
const btnNuevoUsuario = document.querySelector("#btnNuevoUsuario");
const frm = document.querySelector("#formularioUsuario");

let tblUsuarios;

document.addEventListener("DOMContentLoaded", function () {
    // Inicializar DataTable
    tblUsuarios = $('#tblUsuarios').DataTable({
        ajax: {
            url: '/Usuarios/ListarUsuarios',
            dataSrc: '',
        },
        columns: [
            { data: 'id' },
            { data: 'nombre' },
            { data: 'idTipo' },
            { data: 'idusuario' },
            {
                data: 'id',
                render: function (data, type, row) {
                    return `
                                <div class="flex gap-2">
                                    <button class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all duration-200 hover:scale-105" onclick="editarUsuario(${data})">
                                        <i class="fas fa-edit mr-1"></i>Editar
                                    </button>
                                    <button class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 transition-all duration-200 hover:scale-105" onclick="eliminarUsuario(${data})">
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
        }
    });

    // Event listener para el botón nuevo usuario
    btnNuevoUsuario.addEventListener("click", function () {
        title.textContent = "NUEVO USUARIO";
        frm.id.value = '';
        frm.reset();

        // Mostrar modal usando Flowbite
        const targetEl = document.getElementById('modalRegistroUsuario');
        const modal = new Modal(targetEl);
        modal.show();
    });

    // REGISTRAR USUARIO POR AJAX
    frm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (
            frm.Nombre.value == "" ||
            frm.contraseña.value == "" ||
            frm.idTipo.value == "" ||
            frm.estado.value == ""
        ) {
            alertaPersonalizada("warning", "TODOS LOS CAMPOS SON REQUERIDOS");
        } else {
            const data = new FormData(frm);
            const http = new XMLHttpRequest();
            const url = "/Usuarios/Guardar";

            http.open("POST", url, true);
            http.send(data);

            http.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const res = JSON.parse(this.responseText);
                    alertaPersonalizada(res.tipo, res.mensaje);
                    if (res.tipo == 'success') {
                        frm.reset();
                        const modal = new window.Modal(modalRegistroUsuario);
                        modal.hide();
                        tblUsuarios.ajax.reload();
                    }
                }
            };
        }
    });
});

// Función para cerrar el modal
function cerrarModal() {
    const targetEl = document.getElementById('modalRegistroUsuario');
    const modal = new Modal(targetEl);
    modal.hide();
}

function editarUsuario(id) {
    const http = new XMLHttpRequest();
    const url = '/Usuarios/GetUsuario/' + id;

    http.open("GET", url, true);
    http.send();

    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);

            title.textContent = 'EDITAR USUARIO';
            frm.id.value = res.id;
            frm.Nombre.value = res.nombre;
            frm.contraseña.value = res.contraseña;
            frm.estado.value = res.estado;
            frm.idTipo.value = res.idTipo;
            frm.idUsuario.value = res.idusuario;

            // Mostrar modal para editar
            const targetEl = document.getElementById('modalRegistroUsuario');
            const modal = new Modal(targetEl);
            modal.show();
        }
    };
}

function eliminarUsuario(id) {
    const url = '/Usuarios/EliminarUsuario/' + id;
    eliminarRegistro('¿ESTÁ SEGURO DE ELIMINAR?', 'EL USUARIO SE ELIMINARÁ DE FORMA PERMANENTE', 'SÍ, ELIMINAR', url, tblUsuarios);
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