using System;
using System.Collections.Generic;
using MathNet.Numerics.Distributions;
using Microsoft.EntityFrameworkCore;

namespace desayuno.Models;

public partial class DesayunoContext : DbContext
{
    public DesayunoContext()
    {
    }

    public DesayunoContext(DbContextOptions<DesayunoContext> options)
    : base(options)
    {
    }

    public virtual DbSet<Boleta> Boletas { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<Contrato> Contratos { get; set; }

    public virtual DbSet<Distrito> Distritos { get; set; }

    public virtual DbSet<Prodcont> Prodconts { get; set; }

    public virtual DbSet<Producto> Productos { get; set; }

    public virtual DbSet<Unidad> Unidad { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=192.168.1.1;Initial Catalog=desayuno;User=sa1;Password=1237890;TrustServerCertificate=true;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuración para Boleta
        modelBuilder.Entity<Boleta>(entity =>
        {
            entity.HasKey(e => e.Id); // Clave primaria
            entity.ToTable("boleta");
            entity.Property(e => e.NroCarga).HasColumnName("Nro_carga");
            entity.Property(e => e.NroBoleta).HasColumnName("Nro_boleta");
            entity.Property(e => e.NroContrato)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("nro_contrato");
            entity.Property(e => e.CodCiudad)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("cod_ciudad");
            entity.Property(e => e.CodDistrito)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("cod_distrito");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Codigo)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("CODIGO");
            entity.Property(e => e.Raciones).HasColumnName("RACIONES");
            entity.Property(e => e.CodProductoCont)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("cod_producto_cont");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.FConsolidado).HasColumnName("f_consolidado");
            entity.Property(e => e.FCreacion).HasColumnName("f_creacion");
            entity.Property(e => e.FDespacho).HasColumnName("f_despacho");
            entity.Property(e => e.FEntrega).HasColumnName("f_entrega");
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.Id); // Clave primaria
            entity.ToTable("cliente");
          

            entity.Property(e => e.CodCiudad)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("cod_ciudad");
            entity.Property(e => e.CodCliente)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("cod_cliente");
            entity.Property(e => e.DetalleCliente)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("detalle_cliente");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Tipo)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("tipo");
        });

        modelBuilder.Entity<Contrato>(entity =>
        {

            entity.HasKey(e => e.Id); // Clave primaria
            entity.ToTable("contrato");
            
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.CodProducto)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("cod_producto");
            entity.Property(e => e.CodSocioNeg)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("cod_socio_neg");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.NroContrato)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("nro_contrato");
            entity.Property(e => e.Precio)
                .HasColumnType("decimal(20, 2)")
                .HasColumnName("precio");
        });

        modelBuilder.Entity<Distrito>(entity =>
        {
            entity.HasKey(e => e.Id); // Clave primaria
            entity.ToTable("distrito");
            

            entity.Property(e => e.Ciudad)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("CIUDAD");
            entity.Property(e => e.CodCiudad)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("cod_ciudad");
            entity.Property(e => e.CodDistrito)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("cod_distrito");
            entity.Property(e => e.Distrito1)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("distrito");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
        });

        modelBuilder.Entity<Prodcont>(entity =>
        {
            entity.HasKey(e => e.Id); // Clave primaria
            entity.ToTable("prodcont");
           

            entity.Property(e => e.CodProdCont)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("cod_prod_cont");
            entity.Property(e => e.CodProdSap)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("cod_prod_sap");
            entity.Property(e => e.DesProdCont)
                .HasMaxLength(300)
                .IsUnicode(false)
                .HasColumnName("des_prod_cont");
            entity.Property(e => e.EmpProdCont)
                .HasMaxLength(300)
                .IsUnicode(false)
                .HasColumnName("emp_prod_cont");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
        });

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(e => e.Id); // Clave primaria
            entity.ToTable("producto");
           

            entity.Property(e => e.Activo)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("activo");
            entity.Property(e => e.CodigoErp)
                .HasMaxLength(25)
                .IsUnicode(false)
                .HasColumnName("CodigoERP");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.GrupoItem)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("grupo_item");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.IdUnidadMedida)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Nombre)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        

        modelBuilder.Entity<Unidad>(entity =>
        {
            entity.HasKey(e => e.Id); // Clave primaria
            entity.ToTable("unidad");

            entity.Property(e => e.CodDistrito)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("COD_DISTRITO");
            entity.Property(e => e.Codigo)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("CODIGO");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("DESCRIPCION");
            entity.Property(e => e.Direccion)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("DIRECCION");
            entity.Property(e => e.Distrito)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("DISTRITO");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.IdCiudad)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("ID_CIUDAD");
            entity.Property(e => e.Nivel)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("NIVEL");
            entity.Property(e => e.Raciones).HasColumnName("RACIONES");
            entity.Property(e => e.Responzable)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("RESPONZABLE");
            entity.Property(e => e.Ruta)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("RUTA");
            entity.Property(e => e.Telefono)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("TELEFONO");
            entity.Property(e => e.Turno)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("TURNO");
        });

        

        modelBuilder.Entity<Usuario>(entity =>
        {
            
            entity.HasKey(e => e.Id); // Clave primaria
            entity.ToTable("usuario");

            entity.Property(e => e.Contraseña)
                .HasMaxLength(250)
                .IsUnicode(false)
                .HasColumnName("contraseña");
            entity.Property(e => e.Estado)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasColumnName("estado");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.IdTipo)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("id_tipo");
            entity.Property(e => e.Idusuario)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("idusuario");
            entity.Property(e => e.Nombre)
                .HasMaxLength(300)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
