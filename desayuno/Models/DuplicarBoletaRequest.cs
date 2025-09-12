using static desayuno.Controllers.BoletaController;

namespace desayuno.Models
{
    public class DuplicarBoletaRequest
    {
        public int ncarga { get; set; }
        public List<ProductoSeleccionado> productos { get; set; }
        public string fDespacho { get; set; }
        public string fEntrega { get; set; }
        public string fConsolidado { get; set; }
    }
}
public class ProductoSeleccionado
{
    public string codProducto { get; set; }
    public int cantidad { get; set; }
}