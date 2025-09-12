using desayuno.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Scripting;
using Microsoft.EntityFrameworkCore;

namespace desayuno.Controllers
{
    [Authorize]
    public class DistritoController : Controller
    {
        private readonly DesayunoContext _context;
        public DistritoController(DesayunoContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> ListarDistritos()
        {
            var distrito = await _context.Distritos.ToListAsync();
            return Json(distrito);
        }

        [HttpPost]
        public IActionResult Guardar([FromForm] Distrito model)
        {
            var codigoCiudad = "";
            if (model.Ciudad == "LA PAZ") { codigoCiudad = "1"; }
            if (model.Ciudad == "EL ALTO") { codigoCiudad = "2"; }
            if (model.Ciudad == "ORURO") { codigoCiudad = "3"; }
            if (model.Ciudad == "COCHABAMBA") { codigoCiudad = "4"; }
            if (model.Ciudad == "SANTA CRUZ") { codigoCiudad = "5"; }
            if (model.Ciudad == "TARIJA") { codigoCiudad = "6"; }
            if (model.Ciudad == "BENI") { codigoCiudad = "7"; }
            if (model.Ciudad == "CHUQUISACA") { codigoCiudad = "8"; }
            if (model.Ciudad == "POTOSI") { codigoCiudad = "9"; }
            if (model.Ciudad == "PANDO") { codigoCiudad = "10"; }

            if (model.Id == 0)
                {
                    if (_context.Distritos.Any(d => d.CodDistrito == model.CodDistrito))
                    {
                        return Json(new { tipo = "warning", mensaje = "El código del distrito ya existe" });
                    }
                
                var nuevoDistrito = new Distrito
                    {
                        CodDistrito = model.CodDistrito,
                        Distrito1 = model.Distrito1,
                        CodCiudad = codigoCiudad,
                        Ciudad = model.Ciudad
                    };
                    _context.Distritos.Add(nuevoDistrito);
                    _context.SaveChanges();

                    return Json(new { tipo = "success", mensaje = "Distrito registrado con éxito" });
                }
                else
                {
                    if (_context.Distritos.Any(d => d.CodDistrito == model.CodDistrito && d.Id != model.Id))
                    {
                        return Json(new { tipo = "warning", mensaje = "El código del distrito ya existe en otro registro" });
                    }
                   

                var distritoExistente = _context.Distritos.Find(model.Id);
                    if (distritoExistente == null)
                    {
                        return Json(new { tipo = "error", mensaje = "Distrito no encontrado" });
                    }

                    distritoExistente.CodDistrito = model.CodDistrito;
                    distritoExistente.Distrito1 = model.Distrito1;
                    distritoExistente.Ciudad = model.Ciudad;
                    distritoExistente.CodCiudad = codigoCiudad;
                    _context.SaveChanges();

                    return Json(new { tipo = "success", mensaje = "Distrito actualizado con éxito" });
                }
            

        }

        


        public IActionResult GetDistrito(int id)
        {
            var emp = _context.Distritos.Find(id);
            return Json(emp);
        }

        [HttpGet]
        public async Task<IActionResult> EliminarDistrito(int id)
        {
            var distrito = await _context.Distritos.FindAsync(id);

            if (distrito == null)
            {
                return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR" });
            }

            _context.Distritos.Remove(distrito);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                return Json(new { tipo = "success", mensaje = "DISTRITO ELIMINADO" });
            }
            else
            {
                return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR" });
            }
        }
    }
}
