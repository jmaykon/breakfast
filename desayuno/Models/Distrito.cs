using System;
using System.Collections.Generic;

namespace desayuno.Models;

public partial class Distrito
{
    public int Id { get; set; }

    public string CodDistrito { get; set; } = null!;

    public string CodCiudad { get; set; } = null!;

    public string Ciudad { get; set; } = null!;

    public string Distrito1 { get; set; } = null!;
}
