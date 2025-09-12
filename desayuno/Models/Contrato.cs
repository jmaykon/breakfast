using System;
using System.Collections.Generic;

namespace desayuno.Models;

public partial class Contrato
{
    public int Id { get; set; }

    public string NroContrato { get; set; } = null!;

    public string CodSocioNeg { get; set; } = null!;

    public string CodProducto { get; set; } = null!;

    public int Cantidad { get; set; }

    public decimal Precio { get; set; }
}
