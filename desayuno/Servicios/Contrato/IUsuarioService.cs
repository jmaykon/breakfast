using Microsoft.EntityFrameworkCore;
using desayuno.Models;


namespace desayuno.Servicios.Contrato
{
    public interface IUsuarioService
    {

        Task<Usuario> GetUsuarios(string Nombre, string contraseña);

        Task<Usuario> SaveUsuario(Usuario modelo);
    }
}
