
using Microsoft.AspNetCore.Mvc;
using desayuno.Models;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using desayuno.Recursos;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace desayuno.Controllers

{
    [Authorize]
    public class UsuariosController : Controller
    {
        private readonly DesayunoContext _context;
        public UsuariosController(DesayunoContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> ListarUsuarios()
        {
            var usuario = await _context.Usuarios.ToListAsync();
            return Json(usuario);
        }

        [HttpPost]
        public IActionResult Guardar([FromForm] Usuario model)
        {

            if (model.Id == 0)
            {
                if (_context.Usuarios.Any(d => d.Nombre == model.Nombre))
                {
                    return Json(new { tipo = "warning", mensaje = "El nombre del usuario ya existe" });
                }


                var nuevoUsuario = new Usuario
                {
                    Nombre = model.Nombre,
                    Contraseña = Utilidades.EncriptarClave(model.Contraseña),
                    IdTipo = model.IdTipo,
                    Estado = model.Estado,
                    Idusuario = model.Idusuario
                };
                _context.Usuarios.Add(nuevoUsuario);
                _context.SaveChanges();

                return Json(new { tipo = "success", mensaje = "Usuario registrado con éxito" });
            }
            else
            {
                if (_context.Usuarios.Any(d => d.Nombre == model.Nombre && d.Id != model.Id))
                {
                    return Json(new { tipo = "warning", mensaje = "El nombre del usuario ya existe en otro registro" });
                }


                var usuarioExistente = _context.Usuarios.Find(model.Id);
                if (usuarioExistente == null)
                {
                    return Json(new { tipo = "error", mensaje = "Usuario no encontrado" });
                }
                var contraseñaExistente = _context.Usuarios.Where(d => d.Id == model.Id).Select(d => d.Contraseña).FirstOrDefault();

                if (model.Contraseña == contraseñaExistente){ 
                    usuarioExistente.Nombre = model.Nombre;
                    usuarioExistente.Contraseña = model.Contraseña;
                    usuarioExistente.IdTipo = model.IdTipo;
                usuarioExistente.Estado = model.Estado;
                usuarioExistente.Idusuario = model.Idusuario;
                _context.SaveChanges();
                    return Json(new { tipo = "success", mensaje = "Usuario actualizado con éxito" });
                }
                usuarioExistente.Nombre = model.Nombre;
                usuarioExistente.Contraseña = Utilidades.EncriptarClave(model.Contraseña);
                usuarioExistente.IdTipo = model.IdTipo;
                usuarioExistente.Estado = model.Estado;
                usuarioExistente.Idusuario = model.Idusuario;
                _context.SaveChanges();
                return Json(new { tipo = "success", mensaje = "Usuario actualizado con éxito" });
            }


        }




        public IActionResult GetUsuario(int id)
        {
            var emp = _context.Usuarios.Find(id);
            return Json(emp);
        }

        [HttpGet]
        public async Task<IActionResult> EliminarUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return Json(new { tipo = "warning", mensaje = "ERROR AL USUARIO" });
            }

            _context.Usuarios.Remove(usuario);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                return Json(new { tipo = "success", mensaje = "USUARIO ELIMINADO" });
            }
            else
            {
                return Json(new { tipo = "warning", mensaje = "ERROR AL ELIMINAR" });
            }
        }


    }
}
