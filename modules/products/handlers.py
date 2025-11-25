from core.utils.logging import get_logger

logger = get_logger(__name__)


def handle_stock_decreased(event):
    logger.info(
        "stock.decreased",
        product_id=event.payload.get("product_id"),
        quantity=event.payload.get("quantity"),
    )


def handle_product_out(event):
    logger.info(
        "product.out_of_stock",
        product_id=event.payload.get("product_id"),
    )

