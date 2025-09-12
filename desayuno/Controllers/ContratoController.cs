using desayuno.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace desayuno.Controllers
{
    [Authorize]
    public class ContratoController : Controller
    {
        private readonly DesayunoContext _context;
        public ContratoController(DesayunoContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> ListarContrato()
        {
            var contrato = await _context.Contratos
                .GroupBy(c => c.NroContrato)
                .Select(g => new
                {
                    NroContrato = g.Key,
                    CodSocioNeg = g.Min(c => c.CodSocioNeg)
                })
                .Join(_context.Clientes,
                      contrato => contrato.CodSocioNeg,
                      cliente => cliente.CodCliente,
                      (contrato, cliente) => new
                      {
                          contrato.NroContrato,
                          contrato.CodSocioNeg,
                          NombreSocio = cliente.DetalleCliente 
                      })
                .ToListAsync();

            return Json(contrato);
        }

        [HttpGet]
        public IActionResult ListarProductosContrato(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return Json(new { success = false, message = "El ID del contrato no es válido." });
                }

                var productos = _context.Contratos
    .Where(p => p.NroContrato == id)
    .Join(_context.Prodconts,
          contrato => contrato.CodProducto,
          producto => producto.CodProdCont,
          (contrato, producto) => new
          {
              // Datos del contrato
              contrato.Id,
              contrato.Cantidad,
              contrato.CodSocioNeg,
              contrato.CodProducto,
              contrato.Precio,
              contrato.NroContrato,
              // Datos del producto
              NombreProducto = producto.DesProdCont
          })
    .GroupBy(x => x.CodProducto)  
    .Select(g => g.First())       
    .ToList();

                if (!productos.Any())
                {
                    return Json(new { success = false, message = "No se encontraron productos para este contrato." });
                }

                return Json(new { success = true, data = productos });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        [HttpPost]
        [Consumes("application/json")]
        public IActionResult CrearContrato([FromBody] List<Contrato> contratos)
        {
            if (contratos == null || !contratos.Any())
            {
                return BadRequest(new { success = false, message = "No se recibieron contratos para guardar." });
            }

            foreach (var contrato in contratos)
            {
                _context.Contratos.Add(contrato);
            }
            _context.SaveChanges();

            var nuevosContratos = contratos.Select(c => new
            {
                c.Id,
                c.CodProducto,
                c.CodSocioNeg,
                c.Cantidad,
                c.Precio
            });

            return Json(new { success = true, nuevoContrato = nuevosContratos });
        }

        [HttpPost]
        public IActionResult EditarContrato([FromBody] List<Contrato> productosActualizados)
        {
            try
            {
                foreach (var producto in productosActualizados)
                {
                    var productoDb = _context.Contratos.Find(producto.Id);
                    if (productoDb != null)
                    {
                        productoDb.Cantidad = producto.Cantidad;
                        productoDb.Precio = producto.Precio;
                        _context.Contratos.Update(productoDb);
                    }
                }
                _context.SaveChanges();

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        public IActionResult GetContrato(int id)
		{
			var emp = _context.Contratos.Find(id);
			return Json(emp);
		}

		[HttpPost]
		public IActionResult EliminarContrato(int id)
		{
			try
			{
				var contrato = _context.Contratos.Find(id);
				if (contrato == null)
					return Json(new { success = false, message = "Contrato no encontrado." });

				_context.Contratos.Remove(contrato);
				_context.SaveChanges();

				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = $"Error: {ex.Message}" });
			}
		}

        [HttpPost]
        public IActionResult EliminarContratoProductos(string id)
        {
            try
            {
                // Buscar todos los registros que coincidan con el id
                var contratos = _context.Contratos.Where(p => p.NroContrato == id).ToList();

                if (!contratos.Any())
                    return Json(new { success = false, message = "No se encontraron contratos con ese NroContrato." });

                // Eliminar todos los contratos encontrados
                _context.Contratos.RemoveRange(contratos);
                _context.SaveChanges();

                return Json(new { success = true, message = "Contratos eliminados exitosamente." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> BuscarProdcont(string q)
        {
            try
            {
                var prodcont = string.IsNullOrEmpty(q)
                    ? await _context.Prodconts
                        .Select(u => new
                        {
                            id = u.Id,
                            codProdCont = u.CodProdCont,
                            text = $"{u.DesProdCont}"
                        })
                        .ToListAsync()
                    : await _context.Prodconts
                        .Where(u => u.CodProdCont.Contains(q))
                        .Select(u => new
                        {
                            id = u.Id,
                            codProdCont = u.CodProdCont,
                            text = $"{u.CodProdCont}"
                        })
                        .ToListAsync();

                return Json(prodcont);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    error = true,
                    message = "Error al buscar código de producto contable: " + ex.Message
                });
            }
        }
        [HttpGet]
        public async Task<IActionResult> BuscarClientes(string q)
        {
            try
            {
                var clientes = string.IsNullOrEmpty(q)
                    ? await _context.Clientes
                        .Select(u => new
                        {
                            id = u.Id,
                            codCliente = u.CodCliente,
                            detalleCliente = u.DetalleCliente,
                            text = $"{u.CodCliente} - {u.DetalleCliente}"
                        })
                        .ToListAsync()
                    : await _context.Clientes
                        .Where(u => u.CodCliente.Contains(q) || u.DetalleCliente.Contains(q))
                        .Select(u => new
                        {
                            id = u.Id,
                            codCliente = u.CodCliente,
                            detalleCliente = u.DetalleCliente,
                            text = $"{u.CodCliente} - {u.DetalleCliente}"
                        })
                        .ToListAsync();

                return Json(clientes);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    error = true,
                    message = "Error al buscar cliente: " + ex.Message
                });
            }
        }

    }
}
