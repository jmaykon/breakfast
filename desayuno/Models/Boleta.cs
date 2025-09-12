using System;
using System.Collections.Generic;

namespace desayuno.Models;

public partial class Boleta
{
    public long Id { get; set; }

    public int NroCarga { get; set; }

    public int NroBoleta { get; set; }

    public string NroContrato { get; set; } = null!;

    public string CodCiudad { get; set; } = null!;

    public string CodDistrito { get; set; } = null!;

    public string Codigo { get; set; } = null!;

    public int Raciones { get; set; }

    public string CodProductoCont { get; set; } = null!;

    public int Cantidad { get; set; }

    public DateOnly FCreacion { get; set; }

    public DateOnly FDespacho { get; set; }

    public DateOnly FEntrega { get; set; }

    public DateOnly? FConsolidado { get; set; }

    public string? Estado { get; set; }
}
