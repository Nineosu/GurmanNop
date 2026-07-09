using FluentMigrator;
using Nop.Core.Domain.Catalog;
using Nop.Data.Migrations;

namespace Nop.Data.Migrations.Custom;

[NopSchemaMigration("2026-06-01 00:00:01", "Add MeasureTypeId to Product")]
public class AddMeasureTypeToProduct : ForwardOnlyMigration
{
    public override void Up()
    {
        var tableName = nameof(Product);
        var columnName = nameof(Product.MeasureTypeId);

        if (!Schema.Table(tableName).Column(columnName).Exists())
        {
            Alter.Table(tableName)
                .AddColumn(columnName)
                .AsInt32()
                .NotNullable()
                .WithDefaultValue(0);
        }
    }
}