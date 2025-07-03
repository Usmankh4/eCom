import logging
from django.core.management.base import BaseCommand
from products.cache_utils import invalidate_brand_cache

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Clear cache for specific brands or all common brands'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--brand',
            type=str,
            help='Specific brand to clear cache for (e.g., "apple", "samsung")',
            required=False
        )
        
        parser.add_argument(
            '--all',
            action='store_true',
            help='Clear cache for all common brands',
            required=False
        )
    
    def handle(self, *args, **options):
        brand = options.get('brand')
        clear_all = options.get('all')
        
        if not brand and not clear_all:
            self.stdout.write(self.style.ERROR('Please specify either --brand or --all'))
            return
        
        if brand:
            # Clear cache for specific brand
            num_keys = invalidate_brand_cache(brand.lower())
            self.stdout.write(
                self.style.SUCCESS(f'Successfully cleared {num_keys} cache keys for brand: {brand}')
            )
            logger.info(f'Manually cleared cache for brand: {brand} ({num_keys} keys)')
        
        if clear_all:
            # List of common brands to clear
            common_brands = ['apple', 'samsung', 'google', 'oneplus', 'xiaomi', 'huawei']
            total_keys = 0
            
            for brand in common_brands:
                num_keys = invalidate_brand_cache(brand)
                total_keys += num_keys
                self.stdout.write(f'Cleared {num_keys} cache keys for {brand}')
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully cleared {total_keys} cache keys for all common brands')
            )
            logger.info(f'Manually cleared cache for all common brands ({total_keys} keys)')
