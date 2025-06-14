from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('promotions', '0003_flashdeal_remove_flashsaleitem_flash_sale_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            """
            CREATE TABLE IF NOT EXISTS "promotions_flashdeal" (
                "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                "name" varchar(200) NOT NULL,
                "slug" varchar(255) NOT NULL UNIQUE,
                "description" text NULL,
                "brand" varchar(100) NULL,
                "color" varchar(50) NULL,
                "storage" varchar(50) NULL,
                "original_price" decimal(10, 2) NOT NULL,
                "sale_price" decimal(10, 2) NOT NULL,
                "discount_percentage" decimal(5, 2) NOT NULL,
                "stock" integer NOT NULL,
                "reserved_stock" integer NOT NULL,
                "image" varchar(100) NULL,
                "start_date" datetime NOT NULL,
                "end_date" datetime NOT NULL,
                "is_active" bool NOT NULL,
                "stripe_price_id" varchar(100) NULL,
                "stripe_product_id" varchar(100) NULL,
                "created_at" datetime NOT NULL,
                "updated_at" datetime NOT NULL
            );
            """,
            "DROP TABLE IF EXISTS promotions_flashdeal;"
        ),
    ]
