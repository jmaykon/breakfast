using desayuno.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;

using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using NPOI.HSSF.UserModel;    
using EFCore.BulkExtensions;

namespace desayuno.Controllers
{
    [Authorize]
    public class UnidadController : Controller
    {
        private readonly DesayunoContext _context;
        public UnidadController(DesayunoContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> ListarUnidad()
        {
            var unidad = await _context.Unidad.ToListAsync();
            return Json(unidad);
        }

        [HttpPost]
        public IActionResult Guardar([FromForm] Unidad model)
        {

            if (model.Id == 0)
            {
                if (_context.Unidad.Any(d => d.Codigo == model.Codigo))
                {
                    return Json(new { tipo = "warning", mensaje = "El código de la Unidad ya existe" });
                }

                var nuevaUnidad = new Unidad
                {
                    Codigo = model.Codigo,
                    Descripcion = model.Descripcion,
                    Raciones = model.Raciones,
                    Direccion = model.Direccion,
                    Turno = model.Turno,
                    Responzable = model.Responzable,
                    IdCiudad = model.IdCiudad,
                    CodDistrito = model.CodDistrito,
                    Distrito = model.Distrito,
                    Telefono = model.Telefono,
                    Nivel = model.Nivel,
                    Ruta = model.Ruta
                   
                };
                _context.Unidad.Add(nuevaUnidad);
                _context.SaveChanges();

                return Json(new { tipo = "success", mensaje = "Unidad registrada con éxito" });
            }
            else
            {
                if (_context.Unidad.Any(d => d.Codigo == model.Codigo && d.Id != model.Id))
                {
                    return Json(new { tipo = "warning", mensaje = "El código de la Unidad ya existe en otro registro" });
                }

                var unidadExistente = _context.Unidad.Find(model.Id);
                if (unidadExistente == null)
                {
                    return Json(new { tipo = "error", mensaje = "Unidad no encontrada" });
                }

                
                unidadExistente.Codigo = model.Codigo;
                unidadExistente.Descripcion = model.Descripcion;
                unidadExistente.Raciones = model.Raciones;
                unidadExistente.Direccion = model.Direccion;
                unidadExistente.Turno = model.Turno;
                unidadExistente.Responzable = model.Responzable;
                unidadExistente.IdCiudad = model.IdCiudad;
                unidadExistente.CodDistrito = model.CodDistrito;
                unidadExistente.Distrito = model.Distrito;
                unidadExistente.Telefono = model.Telefono;
                unidadExistente.Nivel = model.Nivel;
                unidadExistente.Ruta = model.Ruta;
                _context.SaveChanges();

                return Json(new { tipo = "success", mensaje = "Unidad actualizada con éxito" });
            }


        }

        [HttpGet]
        public async Task<IActionResult> EliminarUnidad(int id)
        {
            var unidad = await _context.Unidad.FindAsync(id);

            if (unidad == null)
            {
                return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR" });
            }

            _context.Unidad.Remove(unidad);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                return Json(new { tipo = "success", mensaje = "UNIDAD ELIMINADA" });
            }
            else
            {
                return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> BuscarDistrito(string q)
        {
            try
            {
                var distrito = string.IsNullOrEmpty(q)
                    ? await _context.Distritos
                        .Select(u => new
                        {
                            id = u.Id,
                            distrito = u.Distrito1,
                            Ciudad = u.Ciudad,
                            codCiudad = u.CodCiudad,
                            text = $"{u.CodDistrito}"
                        })
                        .ToListAsync()
                    : await _context.Distritos
                        .Where(u => u.Distrito1.Contains(q))
                        .Select(u => new
                        {
                            id = u.Id,
                            distrito = u.Distrito1,
                            Ciudad = u.Ciudad,
                            codCiudad = u.CodCiudad,
                            text = $"{u.CodDistrito}"
                        })
                        .ToListAsync();

                return Json(distrito);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    error = true,
                    message = "Error al buscar codigo de distrito: " + ex.Message
                });
            }
        }

        public IActionResult GetUnidad(int id)
        {
            var emp = (from u in _context.Unidad
                       join d in _context.Distritos on u.CodDistrito equals d.CodDistrito
                       where u.Id == id
                       select new
                       {
                           u,         // Todos los datos de Unidad
                           d.Ciudad   // Solo la ciudad desde Distrito
                       }).FirstOrDefault();

            return Json(emp);
        }

        // Métodos para exportar a Excel
        [HttpGet]
        public IActionResult CargarExcel()
        {
            return View();
        }

        // Modelo para los cambios detectados
        public class CambioDetectado
        {
            public string Codigo { get; set; }
            public string TipoCambio { get; set; } // "NUEVO", "MODIFICADO", "SIN_CAMBIOS"
            public Dictionary<string, object> ValoresAnteriores { get; set; } = new Dictionary<string, object>();
            public Dictionary<string, object> ValoresNuevos { get; set; } = new Dictionary<string, object>();
            public Unidad UnidadExcel { get; set; }
            public Unidad UnidadBD { get; set; }
        }

        public class ResultadoComparacion
        {
            public List<CambioDetectado> Cambios { get; set; } = new List<CambioDetectado>();
            public int TotalNuevos { get; set; }
            public int TotalModificados { get; set; }
            public int TotalSinCambios { get; set; }
        }

        [HttpPost]
        public IActionResult CompararDatos([FromForm] IFormFile ArchivoExcel)
        {
            try
            {
                var unidadesExcel = ProcesarArchivoExcel(ArchivoExcel);
                var unidadesBD = _context.Unidad.ToList();

                var resultado = CompararUnidades(unidadesExcel, unidadesBD);

                return StatusCode(StatusCodes.Status200OK, resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { mensaje = "Error al procesar el archivo: " + ex.Message });
            }
        }

        [HttpPost]
        public IActionResult AplicarCambios([FromForm] IFormFile ArchivoExcel)
        {
            try
            {
                var unidadesExcel = ProcesarArchivoExcel(ArchivoExcel);
                var unidadesBD = _context.Unidad.ToList();

                var resultado = CompararUnidades(unidadesExcel, unidadesBD);

                var unidadesParaAgregar = new List<Unidad>();
                var unidadesParaActualizar = new List<Unidad>();

                foreach (var cambio in resultado.Cambios)
                {
                    if (cambio.TipoCambio == "NUEVO")
                    {
                        unidadesParaAgregar.Add(cambio.UnidadExcel);
                    }
                    else if (cambio.TipoCambio == "MODIFICADO")
                    {
                        var unidadExistente = unidadesBD.First(u => u.Codigo == cambio.Codigo);

                        // Actualizar campos
                        unidadExistente.Descripcion = cambio.UnidadExcel.Descripcion;
                        unidadExistente.Raciones = cambio.UnidadExcel.Raciones;
                        unidadExistente.Direccion = cambio.UnidadExcel.Direccion;
                        unidadExistente.Turno = cambio.UnidadExcel.Turno;
                        unidadExistente.Responzable = cambio.UnidadExcel.Responzable;
                        unidadExistente.CodDistrito = cambio.UnidadExcel.CodDistrito;
                        unidadExistente.Distrito = cambio.UnidadExcel.Distrito;
                        unidadExistente.Telefono = cambio.UnidadExcel.Telefono;
                        unidadExistente.Nivel = cambio.UnidadExcel.Nivel;
                        unidadExistente.Ruta = cambio.UnidadExcel.Ruta;

                        unidadesParaActualizar.Add(unidadExistente);
                    }
                }

                // Aplicar cambios
                if (unidadesParaAgregar.Any())
                {
                    _context.BulkInsert(unidadesParaAgregar);
                }

                if (unidadesParaActualizar.Any())
                {
                    _context.BulkUpdate(unidadesParaActualizar);
                }

                return StatusCode(StatusCodes.Status200OK, new
                {
                    mensaje = "Cambios aplicados correctamente",
                    nuevos = unidadesParaAgregar.Count,
                    modificados = unidadesParaActualizar.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { mensaje = "Error al aplicar cambios: " + ex.Message });
            }
        }

        private List<Unidad> ProcesarArchivoExcel(IFormFile ArchivoExcel)
        {
            Stream stream = null;
            IWorkbook MiExcel = null;

            try
            {
                stream = ArchivoExcel.OpenReadStream();

                if (Path.GetExtension(ArchivoExcel.FileName).ToLower() == ".xlsx")
                {
                    MiExcel = new XSSFWorkbook(stream);
                }
                else
                {
                    MiExcel = new HSSFWorkbook(stream);
                }

                ISheet HojaExcel = MiExcel.GetSheetAt(0);
                int cantidadFilas = HojaExcel.LastRowNum;
                List<Unidad> listaUni = new List<Unidad>();

                // Empezar desde fila 4 (índice base 0) porque los datos inician en fila 5
                for (int i = 4; i <= cantidadFilas; i++)
                {
                    IRow fila = HojaExcel.GetRow(i);
                    if (fila == null) continue;

                    // Verificar que hay datos en la fila (al menos código)
                    var codigoCell = fila.GetCell(1);
                    if (codigoCell == null || string.IsNullOrWhiteSpace(ObtenerValorCelda(codigoCell)))
                        continue;

                    Unidad uni = new Unidad
                    {
                        Codigo = ObtenerValorCelda(fila.GetCell(1))?.Trim() ?? "",           // Columna B
                        CodDistrito = ObtenerValorCelda(fila.GetCell(2))?.Trim() ?? "",     // Columna C
                        Descripcion = ObtenerValorCelda(fila.GetCell(3))?.Trim() ?? "",     // Columna D
                        Nivel = ObtenerValorCelda(fila.GetCell(4))?.Trim() ?? "",           // Columna E
                        Turno = ObtenerValorCelda(fila.GetCell(5))?.Trim() ?? "",           // Columna F
                        Raciones = ParsearEntero(fila.GetCell(7)),                          // Columna G (25/7/2025)
                        Direccion = "NN",
                        Responzable = "NN",
                        Distrito = "NN",
                        Telefono = "NN",
                        Ruta = "NN",
                        IdCiudad = "1111"
                    };

                    listaUni.Add(uni);
                }

                return listaUni;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al procesar archivo Excel: {ex.Message}", ex);
            }
            finally
            {
                // Limpiar recursos
                MiExcel?.Close();
                stream?.Close();
                stream?.Dispose();
            }
        }

        // Método auxiliar para obtener valor de celda de forma segura
        private string ObtenerValorCelda(ICell cell)
        {
            if (cell == null) return "";

            switch (cell.CellType)
            {
                case CellType.Numeric:
                    return cell.NumericCellValue.ToString();
                case CellType.String:
                    return cell.StringCellValue;
                case CellType.Boolean:
                    return cell.BooleanCellValue.ToString();
                case CellType.Formula:
                    // Evaluar la fórmula y obtener el resultado
                    return cell.NumericCellValue.ToString();
                case CellType.Blank:
                    return "";
                default:
                    return cell.ToString() ?? "";
            }
        }

        // Método auxiliar para parsear enteros de forma segura
        private int ParsearEntero(ICell cell)
        {
            if (cell == null) return 0;

            try
            {
                switch (cell.CellType)
                {
                    case CellType.Numeric:
                        return (int)cell.NumericCellValue;
                    case CellType.String:
                        if (int.TryParse(cell.StringCellValue.Trim(), out int resultado))
                            return resultado;
                        return 0;
                    case CellType.Formula:
                        return (int)cell.NumericCellValue;
                    default:
                        return 0;
                }
            }
            catch
            {
                return 0;
            }
        }

        private Dictionary<string, object> ObtenerValoresUnidad(Unidad unidad)
        {
            return new Dictionary<string, object>
            {
                ["Codigo"] = unidad.Codigo ?? "",
                ["Descripcion"] = unidad.Descripcion ?? "",
                ["Raciones"] = unidad.Raciones,
                ["Direccion"] = unidad.Direccion ?? "",
                ["Turno"] = unidad.Turno ?? "",
                ["Responzable"] = unidad.Responzable ?? "",
                ["CodDistrito"] = unidad.CodDistrito ?? "",
                ["Distrito"] = unidad.Distrito ?? "",
                ["Telefono"] = unidad.Telefono ?? "",
                ["Nivel"] = unidad.Nivel ?? "",
                ["Ruta"] = unidad.Ruta ?? ""
            };
        }

        private ResultadoComparacion CompararUnidades(List<Unidad> unidadesExcel, List<Unidad> unidadesBD)
        {
            var resultado = new ResultadoComparacion();

            foreach (var unidadExcel in unidadesExcel)
            {
                if (string.IsNullOrWhiteSpace(unidadExcel.Codigo)) continue;

                var unidadBD = unidadesBD.FirstOrDefault(u => u.Codigo == unidadExcel.Codigo);
                var cambio = new CambioDetectado
                {
                    Codigo = unidadExcel.Codigo,
                    UnidadExcel = unidadExcel,
                    UnidadBD = unidadBD
                };

                if (unidadBD == null)
                {
                    // Unidad nueva
                    cambio.TipoCambio = "NUEVO";
                    cambio.ValoresNuevos = ObtenerValoresUnidad(unidadExcel);
                    resultado.TotalNuevos++;
                }
                else
                {
                    // Comparar campos y obtener diferencias
                    var valoresAnteriores = ObtenerValoresUnidad(unidadBD);
                    var valoresNuevos = ObtenerValoresUnidad(unidadExcel);

                    bool tieneCambios = false;

                    // Comparar cada campo (excepto Codigo)
                    foreach (var campo in valoresAnteriores.Keys.Where(k => k != "Codigo"))
                    {
                        var valorAnterior = valoresAnteriores[campo]?.ToString()?.Trim() ?? "";
                        var valorNuevo = valoresNuevos[campo]?.ToString()?.Trim() ?? "";

                        if (valorAnterior != valorNuevo)
                        {
                            tieneCambios = true;
                            break;
                        }
                    }

                    if (tieneCambios)
                    {
                        cambio.TipoCambio = "MODIFICADO";
                        cambio.ValoresAnteriores = valoresAnteriores;
                        cambio.ValoresNuevos = valoresNuevos;
                        resultado.TotalModificados++;
                    }
                    else
                    {
                        cambio.TipoCambio = "SIN_CAMBIOS";
                        cambio.ValoresAnteriores = valoresAnteriores;
                        cambio.ValoresNuevos = valoresNuevos;
                        resultado.TotalSinCambios++;
                    }
                }

                resultado.Cambios.Add(cambio);
            }

            return resultado;
        }




    }
}
