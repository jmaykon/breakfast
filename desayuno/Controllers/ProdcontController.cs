using desayuno.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace desayuno.Controllers
{
    [Authorize]
    public class ProdcontController : Controller
    {
        private readonly DesayunoContext _context;

        public ProdcontController(DesayunoContext context)
        {
            _context = context;
        }

        // DTO para recibir múltiples códigos SAP
        public class ProdcontMultipleDto
        {
            public int Id { get; set; }
            public string CodProdCont { get; set; } = null!;
            public string DesProdCont { get; set; } = null!;
            public string EmpProdCont { get; set; } = null!;
            public List<string> CodigosSap { get; set; } = new List<string>();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> ListarProdcontAgrupados()
        {
            try
            {
                var prodcontAgrupados = await _context.Prodconts
                    .GroupBy(p => new { p.CodProdCont, p.DesProdCont, EmpProdCont = p.EmpProdCont ?? "Sin empresa" })
                    .Select(g => new
                    {
                        codProdCont = g.Key.CodProdCont,
                        desProdCont = g.Key.DesProdCont,
                        empProdCont = g.Key.EmpProdCont,
                        codigosSap = g.Select(x => new {
                            id = x.Id,
                            codProdSap = x.CodProdSap,
                           
                            descripcionSap = _context.Productos
                                .Where(prod => prod.CodigoErp == x.CodProdSap)
                                .Select(prod => prod.Descripcion)
                                .FirstOrDefault() ?? "Sin descripción"
                        }).ToList()
                    })
                    .OrderBy(p => p.codProdCont)
                    .ToListAsync();

                return Json(prodcontAgrupados);
            }
            catch (Exception ex)
            {
                return Json(new { error = true, message = "Error al obtener productos: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GuardarMultiple([FromBody] ProdcontMultipleDto model)
        {
            try
            {
                if (model.Id == 0)
                {
                    // Verificar si ya existe el código de producto contable
                    var existeCodigo = await _context.Prodconts
                        .AnyAsync(p => p.CodProdCont == model.CodProdCont);

                    if (existeCodigo)
                    {
                        return Json(new { tipo = "error", mensaje = "Ya existe un producto contabilizado con este código" });
                    }

                    // Crear nuevos registros para cada código SAP
                    // Si no hay códigos SAP, crear un registro sin código SAP
                    if (!model.CodigosSap.Any())
                    {
                        var registroSinSap = new Prodcont
                        {
                            CodProdCont = model.CodProdCont,
                            DesProdCont = model.DesProdCont,
                            EmpProdCont = model.EmpProdCont,
                            CodProdSap = null // o string.Empty si tu BD no acepta null
                        };
                        _context.Prodconts.Add(registroSinSap);
                    }
                    else
                    {
                        // Crear nuevos registros para cada código SAP
                        var nuevosRegistros = model.CodigosSap.Select(codigoSap => new Prodcont
                        {
                            CodProdCont = model.CodProdCont,
                            DesProdCont = model.DesProdCont,
                            EmpProdCont = model.EmpProdCont,
                            CodProdSap = codigoSap
                        }).ToList();
                        _context.Prodconts.AddRange(nuevosRegistros);
                    }
                    await _context.SaveChangesAsync();

                    return Json(new { tipo = "success", mensaje = $"Producto contabilizado registrado con {model.CodigosSap.Count} código(s) SAP" });
                }
                else
                {
                    // Actualización: eliminar registros existentes y crear nuevos
                    var registrosExistentes = await _context.Prodconts
                        .Where(p => p.CodProdCont == model.CodProdCont)
                        .ToListAsync();

                    _context.Prodconts.RemoveRange(registrosExistentes);

                    // Crear nuevos registros
                    // Si no hay códigos SAP, crear un registro sin código SAP
                    if (!model.CodigosSap.Any())
                    {
                        var registroSinSap = new Prodcont
                        {
                            CodProdCont = model.CodProdCont,
                            DesProdCont = model.DesProdCont,
                            EmpProdCont = model.EmpProdCont,
                            CodProdSap = null // o string.Empty si tu BD no acepta null
                        };
                        _context.Prodconts.Add(registroSinSap);
                    }
                    else
                    {
                        // Crear nuevos registros
                        var nuevosRegistros = model.CodigosSap.Select(codigoSap => new Prodcont
                        {
                            CodProdCont = model.CodProdCont,
                            DesProdCont = model.DesProdCont,
                            EmpProdCont = model.EmpProdCont,
                            CodProdSap = codigoSap
                        }).ToList();
                        _context.Prodconts.AddRange(nuevosRegistros);
                    }
                    await _context.SaveChangesAsync();

                    return Json(new { tipo = "success", mensaje = $"Producto contabilizado actualizado con {model.CodigosSap.Count} código(s) SAP" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { tipo = "error", mensaje = "Error al guardar: " + ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetProdcontDetalle(string codProdCont)
        {
            try
            {
                var registros = await _context.Prodconts
    .Where(p => p.CodProdCont == codProdCont)
    .GroupJoin(_context.Productos,
        prodcont => prodcont.CodProdSap,
        producto => producto.CodigoErp,
        (prodcont, productos) => new
        {
            Prodcont = prodcont,
            ProductoDescripcion = productos.FirstOrDefault() != null ? productos.FirstOrDefault().Descripcion : "Sin descripción"
        })
    .ToListAsync();

                if (!registros.Any())
                {
                    return Json(new { error = true, message = "No se encontró el producto contabilizado" });
                }

                var primer = registros.First();
                var resultado = new
                {
                    id = primer.Prodcont.Id,
                    codProdCont = primer.Prodcont.CodProdCont,
                    desProdCont = primer.Prodcont.DesProdCont,
                    empProdCont = primer.Prodcont.EmpProdCont ?? "",
                    codigosSap = registros.Select(r => new
                    {
                        codigo = r.Prodcont.CodProdSap,
                        descripcion = r.ProductoDescripcion ?? "Sin descripción"
                    }).ToList()
                };

                return Json(resultado);
            }
            catch (Exception ex)
            {
                return Json(new { error = true, message = "Error al obtener detalles: " + ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> BuscarProducto(string q)
        {
            try
            {
                var producto = string.IsNullOrEmpty(q)
                    ? await _context.Productos
                        .Take(50)
                        .Select(u => new
                        {
                            CodigoErp = u.CodigoErp,
                            Descripcion = u.Descripcion,
                            text = $"{u.CodigoErp} - {u.Descripcion}"
                        })
                        .ToListAsync()
                    : await _context.Productos
                        .Where(u => u.Descripcion.Contains(q) || u.CodigoErp.Contains(q))
                        .Take(50)
                        .Select(u => new
                        {
                            CodigoErp = u.CodigoErp,
                            Descripcion = u.Descripcion,
                            text = $"{u.CodigoErp} - {u.Descripcion}"
                        })
                        .ToListAsync();

                return Json(producto);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    error = true,
                    message = "Error al buscar producto: " + ex.Message
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> EliminarProdcont(string id)
        {
            try
            {
                // Verificar si es un ID numérico (eliminación individual) o código (eliminación grupal)
                if (int.TryParse(id, out int idNumerico))
                {
                    // Eliminación individual por ID
                    var registro = await _context.Prodconts.FindAsync(idNumerico);

                    if (registro == null)
                    {
                        return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR - Registro no encontrado" });
                    }

                    _context.Prodconts.Remove(registro);
                    var result = await _context.SaveChangesAsync();

                    if (result > 0)
                    {
                        return Json(new { tipo = "success", mensaje = "CÓDIGO SAP ELIMINADO CORRECTAMENTE" });
                    }
                    else
                    {
                        return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR EL REGISTRO" });
                    }
                }
                else
                {
                    // Eliminación grupal por código de producto contable
                    var registros = await _context.Prodconts
                        .Where(p => p.CodProdCont == id)
                        .ToListAsync();

                    if (!registros.Any())
                    {
                        return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR - Producto no encontrado" });
                    }

                    _context.Prodconts.RemoveRange(registros);
                    var result = await _context.SaveChangesAsync();

                    if (result > 0)
                    {
                        return Json(new { tipo = "success", mensaje = $"PRODUCTO CONTABILIZADO ELIMINADO ({registros.Count} registro(s))" });
                    }
                    else
                    {
                        return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR" });
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { tipo = "error", mensaje = "Error al eliminar: " + ex.Message });
            }
        }

        
    }
}