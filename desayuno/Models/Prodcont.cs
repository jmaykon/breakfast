using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace desayuno.Models;

public partial class Prodcont
{
    [Key]
    public int Id { get; set; }

    public string CodProdCont { get; set; } = null!;

    public string DesProdCont { get; set; } = null!;

    public string? CodProdSap { get; set; } 

    public string? EmpProdCont { get; set; }
}
