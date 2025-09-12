using System;
using System.Collections.Generic;

namespace desayuno.Models;

public partial class Unidad
{
    public int Id { get; set; }

    public string Codigo { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public int? Raciones { get; set; }

    public string? Direccion { get; set; }

    public string? Turno { get; set; }

    public string? Responzable { get; set; }

    public string IdCiudad { get; set; } = null!;

    public string CodDistrito { get; set; } = null!;

    public string? Distrito { get; set; }

    public string Telefono { get; set; } = null!;

    public string Nivel { get; set; } = null!;

    public string Ruta { get; set; } = null!;
}
