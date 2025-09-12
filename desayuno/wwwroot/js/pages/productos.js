let rowData = [];

const gridOptions = {

    columnDefs: [
       
        { headerName: "Codigo ERP", field: "codigoErp" },
        { headerName: "Nombre del Producto", field: "nombre" },
        { headerName: "Unidad", field: "idUnidadMedida" },
        { headerName: "Grupo", field: "grupoItem" },
        { headerName: "Estado", field: "activo" }

    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    defaultColDef: {
        flex: 1,
        filter: true,
        sortable: true,
        floatingFilter: true
    },
    pagination: true,
    paginationPageSize: 10,
    getRowId: params => params.data.id,
    localeText: {
        page: "Página",
        more: "Más",
        to: "a",
        of: "de",
        next: "Siguiente",
        last: "Última",
        first: "Primera",
        previous: "Anterior",
        loadingOoo: "Cargando...",
        selectAll: "Seleccionar todo",
        searchOoo: "Buscar...",
        blanks: "Vacíos",
        filterOoo: "Filtrar...",
        equals: "Igual",
        notEqual: "Diferente",
        lessThan: "Menor que",
        greaterThan: "Mayor que",
        contains: "Contiene",
        notContains: "No contiene",
        startsWith: "Empieza con",
        endsWith: "Termina con",
        andCondition: "Y",
        orCondition: "O",
        applyFilter: "Aplicar",
        resetFilter: "Reiniciar",
        clearFilter: "Limpiar",
        group: "Grupo",
        columns: "Columnas",
        rowGroupColumnsEmptyMessage: "Arrastra columnas aquí para agrupar",
        valueColumnsEmptyMessage: "Arrastra columnas aquí para sumar",
        pivotMode: "Modo Pivote",
        groups: "Grupos",
        values: "Valores",
        pivots: "Pivotes",
        valueAggregation: "Agregación de valores",
        toolPanelButton: "Panel de Herramientas",
        export: "Exportar",
        csvExport: "Exportar CSV",
        excelExport: "Exportar Excel",
        pinColumn: "Fijar Columna",
        autoSizeColumn: "Ajustar Ancho",
        autosizeAllColumns: "Ajustar Todo",
        resetColumns: "Restablecer Columnas",
        expandAll: "Expandir Todo",
        collapseAll: "Colapsar Todo",
        pivotChartAndPivotMode: "Gráfico y Modo Pivote",
        noRowsToShow: "Sin filas para mostrar",
        copy: "Copiar",
        copyWithHeaders: "Copiar con encabezados",
        ctrlC: "Ctrl+C",
        paste: "Pegar",
        ctrlV: "Ctrl+V"
    },
    rowData: [], // Los datos iniciales se mantienen vacíos
    onGridReady: params => cargarDistritos(params), // Cargar datos al estar listo
};

// Función para cargar datos en el grid
const cargarDistritos = (params) => {
    fetch("ListarProductos")
        .then(resp => resp.json())
        .then(data => {
            console.log("Datos de la API:", data);
            if (Array.isArray(data)) {
                rowData = data; // Guardar los datos en una variable global
                params.api.applyTransaction({ add: rowData }); // Agregar los datos al grid
            } else {
                console.error("Los datos no son un array válido");
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos:", error);
        });
};

// Inicializar el grid  
const gridDiv = document.getElementById('myGridProductos');
new agGrid.Grid(gridDiv, gridOptions);