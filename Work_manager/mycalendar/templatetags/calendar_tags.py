from django import template


# Create a template library to register custom template tags and filters
register = template.Library()


# Register this function as a custom Django template filter
@register.filter
def get_item(dictionary, key):

    # Return an empty list if the dictionary is empty or None
    if not dictionary:
        return []

    # Get the value associated with the given key
    # Return an empty list if the key does not exist
    return dictionary.get(key, [])


# ==================================================
# USAGE
# ==================================================

# This filter is used in Django templates to get a value
# from a dictionary using a specific key.
#
# Example:
#
# {% load calendar_tags %}
#
# {{ calendar_data|get_item:day }}
#
# In this example:
# - calendar_data is the dictionary
# - day is the key
# - get_item returns the value stored for that key
#
# If the key does not exist, an empty list is returned.