using desayuno.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace desayuno.Controllers
{
    [Authorize]
    public class ClientesController : Controller
    {
        private readonly DesayunoContext _context;

        public ClientesController(DesayunoContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public async Task<IActionResult> ListarCliente()
        {
            var cliente = await _context.Clientes.ToListAsync();
            return Json(cliente);
        }
        

        [HttpPost]
        public IActionResult Guardar([FromForm] Cliente model)
        {

            if (model.Id == 0)
            {
                if (_context.Clientes.Any(d => d.CodCliente == model.CodCliente))
                {
                    return Json(new { tipo = "warning", mensaje = "El código del cliente ya existe" });
                }

                var nuevoCliente = new Cliente
                {
                    CodCliente = model.CodCliente,
                    CodCiudad = model.CodCiudad,
                    Tipo = model.Tipo,
                    DetalleCliente = model.DetalleCliente
                };
                _context.Clientes   .Add(nuevoCliente);
                _context.SaveChanges();

                return Json(new { tipo = "success", mensaje = "Cliente registrado con éxito" });
            }
            else
            {
                if (_context.Clientes.Any(d => d.CodCliente == model.CodCliente && d.Id != model.Id))
                {
                    return Json(new { tipo = "warning", mensaje = "El código del Cliente ya existe en otro registro" });
                }

                var clienteExistente = _context.Clientes.Find(model.Id);
                if (clienteExistente == null)
                {
                    return Json(new { tipo = "error", mensaje = "Cliente no encontrado" });
                }


                clienteExistente.CodCliente = model.CodCliente;
                clienteExistente.CodCiudad = model.CodCiudad;
                clienteExistente.Tipo = model.Tipo;
                clienteExistente.DetalleCliente = model.DetalleCliente;
               
                _context.SaveChanges();

                return Json(new { tipo = "success", mensaje = "Cliente actualizado con éxito" });
            }


        }

        public IActionResult GetCliente(int id)
        {
            var emp = _context.Clientes.Find(id);
            return Json(emp);
        }
        [HttpGet]
        public async Task<IActionResult> BuscarDistrito(string q)
        {
            try
            {
                var distrito = string.IsNullOrEmpty(q)
                    ? await _context.Distritos
                        .GroupBy(u => u.CodCiudad)
                        .Select(u => new
                        {
                            id = u.First().Id,
                            distrito = u.First().Distrito1,
                            Ciudad = u.First().Ciudad,
                            codCiudad = u.First().CodCiudad,
                            text = $"{u.First().CodDistrito}"
                        })
                        .ToListAsync()
                    : await _context.Distritos
                        .Where(u => u.Ciudad.Contains(q))
                        .GroupBy(u => u.CodCiudad)
                        .Select(u => new
                        {
                            id = u.First().Id,
                            distrito = u.First().Distrito1,
                            Ciudad = u.First().Ciudad,
                            codCiudad = u.First().CodCiudad,
                            text = $"{u.First().CodDistrito}"
                        })
                        .ToListAsync();

                return Json(distrito);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    error = true,
                    message = "Error al buscar ciudad: " + ex.Message
                });
            }
        }


        [HttpGet]
        public async Task<IActionResult> EliminarCliente(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);

            if (cliente == null)
            {
                return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR" });
            }

            _context.Clientes.Remove(cliente);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                return Json(new { tipo = "success", mensaje = "CLIENTE ELIMINADO" });
            }
            else
            {
                return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR" });
            }
        }

    }
}
