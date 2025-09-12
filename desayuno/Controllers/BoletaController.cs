using desayuno.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace desayuno.Controllers
{
    [Authorize]
    public class BoletaController : Controller
    {
        private readonly DesayunoContext _context;
        public BoletaController(DesayunoContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Registro()
        { return View(); }





        [HttpGet]
        public async Task<IActionResult> BuscarContrato(string q)
        {
            try
            {
                var consulta = string.IsNullOrEmpty(q)
                    ? await _context.Contratos
                        .GroupBy(c => c.NroContrato)
                        .Select(g => new
                        {
                            nro_contrato = g.Key,
                            cod_socio_neg = g.Min(c => c.CodSocioNeg)
                        })
                        .ToListAsync()
                    : await _context.Contratos
                        .Where(c => c.NroContrato.Contains(q))
                        .GroupBy(c => c.NroContrato)
                        .Select(g => new
                        {
                            nro_contrato = g.Key,
                            cod_socio_neg = g.Min(c => c.CodSocioNeg)
                        })
                        .ToListAsync();

                return Json(consulta);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    error = true,
                    message = "Error al buscar contrato: " + ex.Message
                });
            }
        }
        [HttpGet]
        public IActionResult ListarProductosContrato(string id)
        {
            try
            {
                // Validar el ID del contrato
                if (string.IsNullOrEmpty(id))
                {
                    return Json(new { success = false, message = "El ID del contrato no es válido." });
                }

                // Realizar INNER JOIN con múltiples tablas
                var resultado = (from c in _context.Contratos
                                 join p in _context.Prodconts on c.CodProducto equals p.CodProdCont
                                 join pr in _context.Productos on p.CodProdSap equals pr.CodigoErp
                                 where c.NroContrato == id
                                 select new
                                 {
                                     Contrato = c,
                                     ProdCont = p,
                                     Producto = pr
                                 }).ToList();

                // Devolver los datos
                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }
        [HttpGet]
        public IActionResult ListarDistritosBoleta(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return Json(new { success = false, message = "El ID del distrito no es válido." });
                }

                // Obtener el contrato usando NroContrato como string
                var distritosBoleta = _context.Unidad.FirstOrDefault(c => c.CodDistrito == id);
                if (distritosBoleta == null)
                {
                    return Json(new { success = false, message = "Unidades no encontradas." });
                }

                // Obtener productos asociados al contrato
                var unidades = _context.Unidad
                    .Where(p => p.CodDistrito == id)
                    .ToList();

                return Json(new { success = true, data = unidades });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }
        [HttpGet]
        public IActionResult ListarUnidadesBoleta(int? id)
        {
            try
            {
                if (!id.HasValue)
                {
                    return Json(new { success = false, message = "El ID de la unidad no es válido." });
                }

                var unidadBoleta = _context.Unidad.FirstOrDefault(c => c.Id == id);
                if (unidadBoleta == null)
                {
                    return Json(new { success = false, message = "Unidades no encontradas." });
                }

                // Obtener productos asociados al contrato
                var unidades = _context.Unidad
                    .Where(p => p.Id == id)
                    .FirstOrDefault();

                return Json(new { success = true, data = unidades });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
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
                            codDistrito = u.CodDistrito,
                            distrito = u.Distrito1,
                            text = $"{u.CodDistrito} - {u.Distrito1}"
                        })
                        .ToListAsync()
                    : await _context.Distritos
                        .Where(u => u.CodDistrito.Contains(q) || u.Distrito1.Contains(q))
                        .Select(u => new
                        {
                            id = u.Id,
                            codDistrito = u.CodDistrito,
                            distrito = u.Distrito1,
                            text = $"{u.CodDistrito} - {u.Distrito1}"
                        })
                        .ToListAsync();

                return Json(distrito);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    error = true,
                    message = "Error al buscar Distrito: " + ex.Message
                });
            }
        }
        [HttpPost]
        public async Task<IActionResult> CrearBoletas([FromBody] List<Boleta> boletas)
        {
            try
            {
                if (boletas == null || !boletas.Any())
                {
                    return Json(new { success = false, message = "No hay boletas para guardar." });
                }


                // Añadir la fecha de creación a cada boleta
                foreach (var boleta in boletas)
                {
                    boleta.Estado = "activo";
                    boleta.FCreacion = DateOnly.FromDateTime(DateTime.Now);
                    boleta.NroCarga = (_context.Boletas.Max(b => (int?)b.NroCarga) ?? 0) + 1;
                }

                // Guardar las boletas en la base de datos
                await _context.Boletas.AddRangeAsync(boletas);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Boletas guardadas exitosamente." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error al guardar las boletas: {ex.Message}" });
            }
        }
        [HttpGet]
        public async Task<IActionResult> ListarBoletas()
        {
            var boletas = await _context.Boletas.ToListAsync();
            return Json(boletas);
        }
        [HttpGet]
        public async Task<IActionResult> ListarContratos()
        {
            var contratos = await _context.Boletas
                .Where(b => b.Estado == "Activo")
                .GroupBy(b => b.NroCarga)
                .Select(g => new
                {
                    NroCarga = g.Key,
                    Id = g.FirstOrDefault().Id,
                    FCreacion = g.FirstOrDefault().FCreacion,
                    FDespacho = g.FirstOrDefault().FDespacho,
                    FConsolidado = g.FirstOrDefault().FConsolidado,
                    FEntrega = g.FirstOrDefault().FEntrega,
                    CodDistrito = g.FirstOrDefault().CodDistrito
                })
                .ToListAsync();

            return Json(contratos);
        }
        [HttpGet]
        public async Task<IActionResult> ObtenerBoletasPorCarga(int nroCarga)
        {
            try
            {
                var boletas = await _context.Boletas
                    .Where(b => b.NroCarga == nroCarga)
                    // Join con la tabla Unidad para obtener los datos de la unidad educativa
                    .Join(
                        _context.Unidad,
                        boleta => boleta.Codigo,
                        unidad => unidad.Codigo,
                        (boleta, unidad) => new { Boleta = boleta, Unidad = unidad }
                    )
                    // Agrupar por número de boleta
                    .GroupBy(x => x.Boleta.NroBoleta)
                    .Select(g => new
                    {
                        Id = g.First().Boleta.Id,
                        NroBoleta = g.Key,
                        NroCarga = g.First().Boleta.NroCarga,
                        Raciones = g.First().Boleta.Raciones,
                        // Datos de la unidad educativa (¡esto es lo que necesitas!)
                        Unidad = g.First().Unidad.Descripcion, // Nombre de la unidad
                        CodigoUnidad = g.First().Unidad.Codigo,
                        Direccion = g.First().Unidad.Direccion,
                        // Calcular el total de productos
                        TotalProductos = g.Count(),
                        // Otros campos que puedas necesitar
                        Turno = g.First().Unidad.Turno,
                        Ruta = g.First().Unidad.Ruta
                    })
                    .ToListAsync();

                if (boletas == null || !boletas.Any())
                {
                    return Json(new { success = false, message = "No se encontraron boletas para este NroCarga" });
                }

                return Json(new { success = true, data = boletas });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }
        [HttpGet]
        public IActionResult ListarBoletasGeneradas(int ncarga, int nboleta)
        {
            try
            {

                var resultado = (from b in _context.Boletas
                                 join u in _context.Unidad on b.Codigo equals u.Codigo
                                 where b.NroBoleta == nboleta && b.NroCarga == ncarga
                                 select new
                                 {
                                     b.Id,
                                     b.NroCarga,
                                     b.NroBoleta,
                                     b.NroContrato,
                                     b.CodCiudad,
                                     b.CodDistrito,
                                     b.Raciones,
                                     b.CodProductoCont,
                                     b.Cantidad,
                                     b.FCreacion,
                                     b.FConsolidado,
                                     b.FEntrega,
                                     b.FDespacho,
                                     u.Descripcion,
                                     u.Turno,
                                     u.Ruta,
                                     u.Codigo,
                                     u.Direccion
                                 }).ToList();

                // Devolver los datos en formato JSON
                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }
        [HttpGet]
        public async Task<IActionResult> ObtenerBoletasTotales(int nCarga)
        {
            try
            {
                var resultado = await (
                    from b in _context.Boletas
                    join pd in _context.Prodconts on b.CodProductoCont equals pd.CodProdCont
                    join c in _context.Contratos on b.CodProductoCont equals c.CodProducto
                    join cli in _context.Clientes on c.CodSocioNeg equals cli.CodCliente
                    join u in _context.Unidad on b.Codigo equals u.Codigo
                    where b.NroCarga == nCarga
                    group new { b, pd, c, cli, u } by b.Id into grupo
                    select new
                    {
                        Id = grupo.Key,
                        NroCarga = grupo.Max(x => x.b.NroCarga),
                        NroBoleta = grupo.Max(x => x.b.NroBoleta),
                        NroContrato = grupo.Max(x => x.b.NroContrato),
                        CodCiudad = grupo.Max(x => x.b.CodCiudad),
                        CodDistrito = grupo.Max(x => x.b.CodDistrito),
                        Raciones = grupo.Max(x => x.b.Raciones),
                        CodProductoCont = grupo.Max(x => x.b.CodProductoCont),
                        Cantidad = grupo.Max(x => x.b.Cantidad),
                        FCreacion = grupo.Max(x => x.b.FCreacion),
                        FConsolidado = grupo.Max(x => x.b.FConsolidado),
                        FEntrega = grupo.Max(x => x.b.FEntrega),
                        FDespacho = grupo.Max(x => x.b.FDespacho),
                        DesProdCont = grupo.Max(x => x.pd.DesProdCont),
                        Precio = grupo.Max(x => x.c.Precio),
                        CodSocioNeg = grupo.Max(x => x.c.CodSocioNeg),
                        DetalleCliente = grupo.Max(x => x.cli.DetalleCliente),
                        Descripcion = grupo.Max(x => x.u.Descripcion),
                        Turno = grupo.Max(x => x.u.Turno),
                        Ruta = grupo.Max(x => x.u.Ruta),
                        Codigo = grupo.Max(x => x.u.Codigo),
                        Direccion = grupo.Max(x => x.u.Direccion),
                        EmpProdCont = grupo.Max(x => x.pd.EmpProdCont)


                    }
                ).ToListAsync();

                if (resultado == null || !resultado.Any())
                {
                    return Json(new { mensaje = "No se encontraron registros para este NroCarga" });
                }

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }




        [HttpGet]
        public IActionResult ListarFechasBoleta(int id)
        {
            try
            {
                var contrato = _context.Boletas.FirstOrDefault(c => c.NroCarga == id);
                if (contrato == null)
                {
                    return Json(new { success = false, message = "Contrato no encontrado." });
                }

                var fechas = _context.Boletas
                    .Where(b => b.NroCarga == id)
                    .GroupBy(b => b.NroCarga)
                    .Select(g => new
                    {
                        nroCarga = g.Min(b => b.NroCarga),
                        f_despacho = g.Min(b => b.FDespacho),
                        f_entrega = g.Min(b => b.FEntrega),
                        f_consolidado = g.Min(b => b.FConsolidado)
                    })
                    .ToList();
                return Json(new { success = true, data = fechas });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        [HttpGet]
        public IActionResult ListarBoletasIndividuales(int ncarga, int nboleta)
        {
            try
            {
                var carga = _context.Boletas.FirstOrDefault(c => c.NroCarga == ncarga);
                if (carga == null)
                {
                    return Json(new { success = false, message = "Boleta no encontrada." });
                }

                var cantidades = _context.Boletas
                    .Where(b => b.NroCarga == ncarga && b.NroBoleta == nboleta)
                    .ToList();
                return Json(new { success = true, data = cantidades });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ActualizarFechasBoleta([FromBody] Boleta model)
        {
            try
            {
                var boletas = await _context.Boletas
                    .Where(b => b.NroCarga == model.NroCarga)
                    .ToListAsync();

                if (!boletas.Any())
                {
                    return Json(new { success = false, message = "No se encontraron boletas para el NroCarga." });
                }

                foreach (var boleta in boletas)
                {
                    boleta.FDespacho = model.FDespacho;
                    boleta.FEntrega = model.FEntrega;
                    boleta.FConsolidado = model.FConsolidado;
                }

                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Fechas actualizadas exitosamente " });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error al actualizar las fechas: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ActualizarCantidadBoleta([FromBody] List<Boleta> actualizaciones)
        {
            try
            {
                foreach (var item in actualizaciones)
                {
                    var boleta = await _context.Boletas.FindAsync(item.Id);
                    if (boleta != null)
                    {
                        boleta.Cantidad = item.Cantidad;
                    }
                }

                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Cantidades actualizadas exitosamente." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error al actualizar las cantidades: {ex.Message}" });
            }
        }

        [HttpPost]
        public IActionResult EliminarBoletaIndividual(int ncarga, int nboleta)
        {
            try
            {
                var boleta = _context.Boletas
                .Where(b => b.NroCarga == ncarga && b.NroBoleta == nboleta)
                .ToList();

                if (boleta == null)
                    return Json(new { success = false, message = "Boleta no encontrada." });

                _context.Boletas.RemoveRange(boleta);
                _context.SaveChanges();

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }
        [HttpPost]
        public IActionResult EliminarNumeroCarga(int ncarga)
        {
            try
            {
                var boletas = _context.Boletas
                    .Where(b => b.NroCarga == ncarga)
                    .ToList();

                if (boletas == null || !boletas.Any())
                    return Json(new { success = false, message = "Número de carga no encontrado." });


                foreach (var boleta in boletas)
                {
                    boleta.Estado = "inactivo";

                }

                _context.Boletas.UpdateRange(boletas);
                _context.SaveChanges();

                return Json(new { success = true, message = "Estado actualizado correctamente." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }




        [HttpGet]
        public IActionResult ObtenerDatosParaDuplicar(int nroCarga)
        {
            try
            {
                // Obtener el contrato asociado
                var nroContrato = _context.Boletas
                    .Where(b => b.NroCarga == nroCarga)
                    .Select(b => b.NroContrato)
                    .FirstOrDefault();

                if (nroContrato == null)
                    return Json(new { success = false, message = "No se encontró el contrato asociado" });

                // Obtener productos existentes en la carga
                var productosExistente = _context.Boletas
                    .Where(b => b.NroCarga == nroCarga)
                    .GroupBy(b => b.CodProductoCont)
                    .Select(g => new {
                        codProducto = g.Key,
                        cantidad = g.Sum(b => b.Cantidad)
                    })
                    .ToList();

                // Obtener todos los productos del contrato
                var productosContrato = _context.Contratos
                    .Where(c => c.NroContrato == nroContrato)
                    .Select(c => c.CodProducto)
                    .Distinct()
                    .ToList();

                // Combinar resultados
                var productos = productosContrato.Select(p => {
                    var existente = productosExistente.FirstOrDefault(pe => pe.codProducto == p);
                    return new
                    {
                        codProducto = p,
                        nombreProducto = _context.Prodconts
                            .FirstOrDefault(pr => pr.CodProdCont == p)?.DesProdCont ?? p,
                        cantidad = existente?.cantidad ?? 0,
                        existeEnCarga = existente != null
                    };
                }).ToList();

                // Obtener fechas de ejemplo
                var fechas = _context.Boletas
                    .Where(b => b.NroCarga == nroCarga)
                    .Select(b => new {
                        b.FDespacho,
                        b.FEntrega,
                        b.FConsolidado
                    })
                    .FirstOrDefault();

                return Json(new
                {
                    success = true,
                    productos = productos,
                    fDespacho = fechas?.FDespacho.ToString("yyyy-MM-dd"),
                    fEntrega = fechas?.FEntrega.ToString("yyyy-MM-dd"),
                    fConsolidado = fechas?.FConsolidado?.ToString("yyyy-MM-dd")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }


        [HttpPost]
        public IActionResult DuplicarBoleta([FromBody] DuplicarBoletaRequest request)
        {
            try
            {
                // Obtener datos de la carga original
                var cargaOriginal = _context.Boletas
                    .FirstOrDefault(b => b.NroCarga == request.ncarga);

                if (cargaOriginal == null)
                    return Json(new { success = false, message = "Carga original no encontrada" });

                // Generar nuevo número de carga
                int nuevaCarga = _context.Boletas.Max(b => b.NroCarga) + 1;
                var nuevasBoletas = new List<Boleta>();

                // Obtener todas las boletas originales agrupadas por número de boleta
                var boletasOriginalesPorNumero = _context.Boletas
                    .Where(b => b.NroCarga == request.ncarga)
                    .GroupBy(b => b.NroBoleta)
                    .ToList();

                foreach (var producto in request.productos)
                {
                    var existiaEnOriginal = _context.Boletas
                        .Any(b => b.NroCarga == request.ncarga && b.CodProductoCont == producto.codProducto);

                    if (existiaEnOriginal)
                    {
                        // Duplicar cada boleta original del producto
                        var boletasOriginales = _context.Boletas
                            .Where(b => b.NroCarga == request.ncarga && b.CodProductoCont == producto.codProducto)
                            .ToList();

                        foreach (var original in boletasOriginales)
                        {
                            nuevasBoletas.Add(new Boleta
                            {
                                NroCarga = nuevaCarga,
                                NroBoleta = original.NroBoleta,
                                NroContrato = original.NroContrato,
                                CodCiudad = original.CodCiudad,
                                CodDistrito = original.CodDistrito,
                                Codigo = original.Codigo,
                                Raciones = original.Raciones, // Mantener raciones originales
                                CodProductoCont = original.CodProductoCont,
                                Cantidad = producto.cantidad,
                                FCreacion = DateOnly.FromDateTime(DateTime.Now),
                                FDespacho = DateOnly.Parse(request.fDespacho),
                                FEntrega = DateOnly.Parse(request.fEntrega),
                                FConsolidado = string.IsNullOrEmpty(request.fConsolidado) ? null : DateOnly.Parse(request.fConsolidado)
                            });
                        }
                    }
                    else
                    {
                        // Para nuevo producto, crear una boleta por cada número de boleta existente
                        // con las características (Codigo y Raciones) correspondientes
                        foreach (var grupo in boletasOriginalesPorNumero)
                        {
                            // Tomar la primera boleta del grupo para obtener Codigo y Raciones
                            var boletaEjemplo = grupo.First();

                            nuevasBoletas.Add(new Boleta
                            {
                                NroCarga = nuevaCarga,
                                NroBoleta = grupo.Key,
                                NroContrato = cargaOriginal.NroContrato,
                                CodCiudad = cargaOriginal.CodCiudad,
                                CodDistrito = cargaOriginal.CodDistrito,
                                Codigo = boletaEjemplo.Codigo,
                                Raciones = boletaEjemplo.Raciones,
                                CodProductoCont = producto.codProducto,
                                Cantidad = producto.cantidad,
                                FCreacion = DateOnly.FromDateTime(DateTime.Now),
                                FDespacho = DateOnly.Parse(request.fDespacho),
                                FEntrega = DateOnly.Parse(request.fEntrega),
                                FConsolidado = string.IsNullOrEmpty(request.fConsolidado) ? null : DateOnly.Parse(request.fConsolidado)
                            });
                        }
                    }
                }

                _context.Boletas.AddRange(nuevasBoletas);
                _context.SaveChanges();

                return Json(new
                {
                    success = true,
                    nuevaCarga = nuevaCarga,
                    message = "Carga duplicada correctamente"
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error al duplicar: {ex.Message}" });
            }
        }

        private int GenerarNuevoNumeroCarga()
        {
            var maxNroCarga = _context.Boletas.Max(b => (int?)b.NroCarga) ?? 0;
            return maxNroCarga + 1;
        }


        public IActionResult VerBoletaIndividual(int nroCarga)
        {

            ViewBag.NroCarga = nroCarga;
            return View();
        }

    }
}
