def calculate_sale_price(original_price, discount_percentage):
    """
    Calculate the sale price based on original price and discount percentage.
    
    Args:
        original_price (Decimal or float): The original price of the item
        discount_percentage (Decimal or float): The discount percentage (e.g., 20 for 20% off)
        
    Returns:
        float: The calculated sale price rounded to 2 decimal places
    """
    if original_price is None or discount_percentage is None:
        return None
    
    discount_multiplier = 1 - (float(discount_percentage) / 100)
    return round(float(original_price) * discount_multiplier, 2)


def calculate_discount_percentage(original_price, sale_price):
    """
    Calculate the discount percentage based on original price and sale price.
    
    Args:
        original_price (Decimal or float): The original price of the item
        sale_price (Decimal or float): The sale price of the item
        
    Returns:
        float: The calculated discount percentage rounded to 2 decimal places
    """
    if original_price is None or sale_price is None or float(original_price) == 0:
        return None
    
    discount = 1 - (float(sale_price) / float(original_price))
    return round(discount * 100, 2)
