using desayuno.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace desayuno.Controllers
{
	[Authorize]

	public class ProductosController : Controller
	{
		private readonly DesayunoContext _context;
		public ProductosController(DesayunoContext context)
		{
			_context = context;
		}
		public IActionResult Index()
		{
			return View();
		}

		public async Task<IActionResult> ListarProductos()
		{
			var productos = await _context.Productos.ToListAsync();

			var productosConId = productos.Select((producto, index) => new
			{
				id = index + 1, 
				producto.CodigoErp,
				producto.Nombre,
                producto.Descripcion,
                producto.IdUnidadMedida,
				producto.GrupoItem,
				producto.Activo

			});

			
			return Json(productosConId);
		}
	}
}
