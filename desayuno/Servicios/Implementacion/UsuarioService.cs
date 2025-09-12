using Microsoft.EntityFrameworkCore;
using desayuno.Models;
using desayuno.Servicios.Contrato;

namespace desayuno.Servicios.Implementacion
{
    public class UsuarioService : IUsuarioService
    {
        private readonly DesayunoContext _dbContext;
        public UsuarioService(DesayunoContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Usuario> GetUsuarios(string Nombre, string contraseña)
        {
            Usuario usuario_encontrado = await _dbContext.Usuarios.Where(u => u.Nombre == Nombre && u.Contraseña == contraseña).
                FirstOrDefaultAsync();

            return usuario_encontrado;
        }

        public async Task<Usuario> SaveUsuario(Usuario modelo)
        {
            _dbContext.Usuarios.Add(modelo);
            await _dbContext.SaveChangesAsync();
            return modelo;
        }
    }
}
