using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace desayuno.Models;

public partial class Producto
{
    [Key]
    public int Id { get; set; }

    public string? CodigoErp { get; set; }

    public string? Nombre { get; set; }

    public string? Descripcion { get; set; }

    public string? IdUnidadMedida { get; set; }

    public string? GrupoItem { get; set; }

    public string? Activo { get; set; }
}
