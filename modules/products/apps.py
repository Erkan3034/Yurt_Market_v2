from django.apps import AppConfig


class ProductsConfig(AppConfig):
    name = "modules.products"
    verbose_name = "Products"

    def ready(self):
        from core.events import event_dispatcher
        from core.events.types import ProductOutOfStockEvent, StockDecreasedEvent

        from .handlers import handle_product_out, handle_stock_decreased

        event_dispatcher.subscribe(StockDecreasedEvent.name, handle_stock_decreased)
        event_dispatcher.subscribe(ProductOutOfStockEvent.name, handle_product_out)

