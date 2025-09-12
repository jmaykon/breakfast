using System;
using System.Collections.Generic;

namespace desayuno.Models;

public partial class Cliente
{
    public int Id { get; set; }

    public string CodCliente { get; set; } = null!;

    public string? CodCiudad { get; set; }

    public string Tipo { get; set; } = null!;

    public string DetalleCliente { get; set; } = null!;
}
