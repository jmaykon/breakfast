using Microsoft.AspNetCore.Mvc;

namespace desayuno.Controllers
{
    public class ErrorController : Controller
    {
        [Route("Error/{statusCode}")]
        public IActionResult HttpStatusCodeHandler(int statusCode)
        {
            if (statusCode == 404)
            {
                return View("NotFound"); // Vista personalizada para 404
            }

            return View("Error"); // Vista genérica para otros errores
        }
    }
}
