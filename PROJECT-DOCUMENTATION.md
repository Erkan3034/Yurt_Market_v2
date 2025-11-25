# Yurt Market Projesi - Teknik Dokümantasyon

Bu dokümantasyon, Yurt Market projesinde yapılan tüm geliştirmeleri ve mimari kararları detaylı bir şekilde açıklamaktadır. Projeye yeni katılan geliştiriciler veya mevcut geliştiriciler için referans niteliğindedir.

## İçindekiler

1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Mimari Yapı](#mimari-yapı)
3. [Veritabanı Modelleri](#veritabanı-modelleri)
4. [Repository Pattern](#repository-pattern)
5. [Service Layer](#service-layer)
6. [Payment Modülü](#payment-modülü)
7. [Event System (Domain Events)](#event-system-domain-events)
8. [API Endpoints](#api-endpoints)
9. [Authentication ve Authorization](#authentication-ve-authorization)
10. [Cache ve Performans](#cache-ve-performans)
11. [Arkaplan Görevleri ve Celery](#arkaplan-görevleri-ve-celery)
12. [Logging Altyapısı](#logging-altyapısı)
13. [Ortam Yapılandırması](#ortam-yapılandırması)

---

## Proje Genel Bakış

Yurt Market, öğrencilerin kendi yurtlarındaki satıcılardan atıştırmalık sipariş edebileceği çoklu yurt destekli bir marketplace platformudur. Proje Django ve Django REST Framework kullanılarak geliştirilmiştir ve Clean Architecture prensiplerine uygun modüler bir yapıya sahiptir.

### Temel Özellikler

- **Çoklu Yurt Desteği**: Her yurt kendi ürün kataloğuna ve satıcılarına sahiptir
- **Rol Tabanlı Sistem**: Öğrenci (Student) ve Satıcı (Seller) rolleri
- **Sipariş Yönetimi**: Sipariş oluşturma, onaylama, reddetme ve iptal etme
- **Abonelik Sistemi**: Satıcılar için ürün limiti yönetimi
- **Stok Takibi**: Otomatik stok azaltma ve tükenme bildirimleri
- **Analytics**: Popüler satıcı sıralaması ve istatistikler
- **Bildirimler**: Email tabanlı sipariş bildirimleri

---

## Mimari Yapı

Proje, modüler monolith yaklaşımıyla tasarlanmıştır. Her modül kendi içinde bağımsız çalışabilir ancak core katmanı üzerinden ortak işlevleri paylaşır.

### Klasör Yapısı

```
yurt-market-v1/
├── config/              # Django proje yapılandırması
│   ├── settings/        # Ortam bazlı ayarlar (base, dev, prod)
│   ├── urls.py          # Ana URL yapılandırması
│   └── wsgi.py / asgi.py
├── core/                # Cross-cutting concerns
│   ├── events/          # Domain event sistemi
│   ├── exceptions/      # Özel exception'lar
│   ├── repository/      # Base repository pattern
│   ├── mixins/          # Model mixin'leri (TimestampedModel)
│   └── utils/           # Yardımcı fonksiyonlar
├── modules/             # İş mantığı modülleri
│   ├── users/           # Kullanıcı yönetimi
│   ├── dorms/           # Yurt yönetimi
│   ├── products/        # Ürün yönetimi
│   ├── orders/          # Sipariş yönetimi
│   ├── subscription/    # Abonelik yönetimi
│   ├── notifications/   # Bildirim servisleri
│   ├── analytics/        # İstatistik ve analitik
│   └── payments/        # Ödeme entegrasyonu (hazırlık aşamasında)
└── scripts/            # Yardımcı scriptler
```

### Mimari Prensipler

1. **SOLID Prensipleri**: Her sınıf tek bir sorumluluğa sahiptir
2. **Clean Architecture**: Katmanlar arası bağımlılıklar içe doğru yönelir
3. **Repository Pattern**: Veritabanı erişimi soyutlanmıştır
4. **Service Layer**: İş mantığı view'lardan ayrılmıştır
5. **Domain Events**: Modüller arası iletişim event'ler üzerinden yapılır

---

## Veritabanı Modelleri

### Users Modülü

#### User Model

Email tabanlı authentication kullanıyoruz. Django'nun standart `AbstractUser` sınıfını extend ediyoruz:

```python
class User(AbstractUser, TimestampedModel):
    class Roles(models.TextChoices):
        STUDENT = "student", _("Student")
        SELLER = "seller", _("Seller")

    username = None  # Email kullanıyoruz, username yok
    email = models.EmailField(unique=True)
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.PROTECT, related_name="users")
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.STUDENT)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
```

**Önemli Noktalar:**
- `username = None`: Email ile giriş yapıyoruz
- `dorm` ForeignKey: Her kullanıcı bir yurda bağlı
- `PROTECT` kullanımı: Yurt silinmeye çalışılırsa hata verir (veri bütünlüğü için)

#### SellerProfile Model

Satıcılar için ek bilgiler:

```python
class SellerProfile(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="seller_profile")
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.PROTECT, related_name="sellers")
    phone = models.CharField(max_length=32)
    iban = models.CharField(max_length=34, blank=True)
    notification_email = models.EmailField(blank=True)
```

**Kullanım Senaryosu:**
- Satıcı kayıt olurken `SellerProfile` oluşturulur
- `notification_email` boşsa, bildirimler `user.email` adresine gider

### Products Modülü

#### Product Model

```python
class Product(TimestampedModel):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(Decimal("0.5"))])
    is_active = models.BooleanField(default=True)
    is_out_of_stock = models.BooleanField(default=False)
    
    @property
    def stock_quantity(self) -> int:
        return getattr(self.stock, "quantity", 0)
```

**İş Kuralları:**
- Minimum fiyat 0.5 TL
- `is_active=False` olan ürünler listede görünmez
- Stok tükendiğinde `is_out_of_stock=True` ve `is_active=False` yapılır

#### Stock Model ve Stok Azaltma Mantığı

Stok yönetimi için özel bir model ve metod var:

```python
class Stock(TimestampedModel):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="stock")
    quantity = models.PositiveIntegerField(default=0)

    def decrease(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        with transaction.atomic():
            self.refresh_from_db()  # Race condition önleme
            if self.quantity < amount:
                raise ValueError("Insufficient stock.")
            self.quantity -= amount
            self.save(update_fields=["quantity"])
            # Event dispatch
            event_dispatcher.dispatch(
                StockDecreasedEvent(payload={"product_id": self.product_id, "quantity": self.quantity})
            )
            # Stok bitti mi kontrolü
            if self.quantity == 0:
                self.product.is_out_of_stock = True
                self.product.is_active = False
                self.product.save(update_fields=["is_out_of_stock", "is_active"])
                event_dispatcher.dispatch(
                    ProductOutOfStockEvent(payload={"product_id": self.product_id})
                )
```

**Önemli Detaylar:**
- `transaction.atomic()`: Stok azaltma işlemi atomik (ya hep ya hiç)
- `refresh_from_db()`: Race condition'ları önlemek için (aynı anda iki sipariş gelirse)
- Event dispatch: Stok azaldığında ve bittiğinde event fırlatılıyor

### Orders Modülü

#### Order Model

```python
class Order(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Beklemede"
        ONAY = "ONAY", "Onaylandı"
        RED = "RED", "Reddedildi"
        IPTAL = "IPTAL", "İptal Edildi"

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seller_orders")
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    notes = models.TextField(blank=True)
```

**Durum Akışı:**
1. `PENDING`: Sipariş oluşturuldu, satıcı onay bekliyor
2. `ONAY`: Satıcı siparişi onayladı
3. `RED`: Satıcı siparişi reddetti
4. `IPTAL`: Sipariş iptal edildi (müşteri veya satıcı tarafından)

#### OrderItem Model

```python
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(validators=[positive_int_validator])
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
```

**Önemli Nokta:**
- `unit_price` sipariş anındaki fiyatı saklar (ürün fiyatı değişse bile)

#### OrderStatusLog ve SellerCustomerChat

Her durum değişikliği loglanır ve müşteri-satıcı arasında mesajlaşma yapılabilir:

```python
class OrderStatusLog(TimestampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_logs")
    status = models.CharField(max_length=20, choices=Order.Status.choices)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    note = models.TextField(blank=True)

class SellerCustomerChat(TimestampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="chat_messages")
    sender = models.CharField(max_length=20, choices=Sender.choices)  # "customer" veya "seller"
    message = models.TextField()
```

### Subscription Modülü

#### SubscriptionPlan ve SellerSubscription

```python
class SubscriptionPlan(TimestampedModel):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration_days = models.PositiveIntegerField(default=30)
    max_products = models.PositiveIntegerField(default=10)

class SellerSubscription(TimestampedModel):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    starts_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
```

**İş Kuralı:**
- Satıcılar 3 ürünü ücretsiz ekleyebilir
- 3'ten fazla ürün için abonelik gerekli
- Abonelik süresi dolduğunda `is_active=False` yapılmalı (şu an manuel)

#### UsageTracking

Satıcının kaç ürün slotu kullandığını takip eder:

```python
class UsageTracking(TimestampedModel):
    seller = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="usage_tracking")
    product_slots = models.PositiveIntegerField(default=0)
```

**Not:** Şu an `ProductService` içinde `UsageTracking` entegrasyonu eksik. Ürün eklenip silindiğinde bu değer güncellenmeli.

### Analytics Modülü

#### PopularSellerRank

Popüler satıcı sıralaması için cache destekli model:

```python
class PopularSellerRank(TimestampedModel):
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.CASCADE, related_name="popular_sellers")
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=10, decimal_places=2)  # Toplam satış tutarı
    rank = models.PositiveIntegerField()
```

**Hesaplama Mantığı:**
- Son 30 gün içindeki onaylanmış siparişler
- Toplam satış tutarına göre sıralama
- Her yurt için ayrı hesaplanır

---

## Repository Pattern

Repository pattern, veritabanı erişimini soyutlar ve test edilebilirliği artırır. Her modülde kendi repository'leri var.

### BaseRepository

Tüm repository'lerin temel sınıfı:

```python
class BaseRepository(Generic[T]):
    model: Type[T]

    def __init__(self, model: Type[T]) -> None:
        self.model = model

    def create(self, **data) -> T:
        return self.model.objects.create(**data)

    def get(self, **filters) -> T:
        return self.model.objects.get(**filters)

    def filter(self, **filters):
        return self.model.objects.filter(**filters)

    def update(self, instance: T, **data) -> T:
        for attr, value in data.items():
            setattr(instance, attr, value)
        instance.save(update_fields=list(data.keys()))
        return instance

    def delete(self, instance: T) -> None:
        instance.delete()
```

### Özel Repository Örnekleri

#### OrderRepository

```python
class OrderRepository(BaseRepository[Order]):
    def __init__(self) -> None:
        super().__init__(Order)

    def for_customer(self, customer_id: int):
        return self.filter(customer_id=customer_id)

    def for_seller(self, seller_id: int):
        return self.filter(seller_id=seller_id)
```

**Kullanım:**
```python
repo = OrderRepository()
customer_orders = repo.for_customer(user_id)  # QuerySet döner
```

#### ProductRepository

```python
class ProductRepository(BaseRepository[Product]):
    def __init__(self) -> None:
        super().__init__(Product)

    def find_by_dorm(self, dorm_id: int) -> QuerySet[Product]:
        return self.filter(dorm_id=dorm_id, is_active=True)

    def find_by_seller(self, seller_id: int) -> QuerySet[Product]:
        return self.filter(seller_id=seller_id)

    def count_active_by_seller(self, seller_id: int) -> int:
        return self.filter(seller_id=seller_id, is_active=True).count()
```

**Avantajları:**
- Veritabanı sorguları tek yerde toplanır
- Test ederken mock'lanabilir
- İş mantığı service katmanında kalır

---

## Service Layer

Service layer, tüm iş mantığını içerir. View'lar sadece HTTP isteklerini alır, service'leri çağırır ve response döner.

### OrderService

Sipariş işlemlerinin kalbi:

```python
@dataclass
class OrderService:
    order_repo: OrderRepository = OrderRepository()
    dispatcher = event_dispatcher

    def create_order(
        self,
        *,
        customer: User,
        items: List[OrderItemDTO],
        notes: str = "",
    ) -> Order:
        # 1. Validasyonlar
        if not items:
            raise ValidationError("Order requires at least one item.")

        # 2. Ürünleri yükle
        product_ids = {dto.product_id for dto in items}
        products = self._load_products(list(product_ids))
        product_map = {product.id: product for product in products}
        
        if len(product_map) != len(product_ids):
            raise ValidationError("Some products are invalid.")

        # 3. İş kuralları kontrolü
        first_product = next(iter(product_map.values()))
        seller = first_product.seller
        dorm = first_product.dorm

        if customer.dorm_id != dorm.id:
            raise ValidationError("Students can only order from their dorm.")

        for product in product_map.values():
            if product.seller_id != seller.id:
                raise ValidationError("All items must belong to the same seller.")

        # 4. Sipariş oluştur (transaction içinde)
        total = Decimal("0.00")
        with transaction.atomic():
            order = self.order_repo.create(customer=customer, seller=seller, dorm=dorm, notes=notes)
            bulk_items = []
            for dto in items:
                product = product_map[dto.product_id]
                product.stock.decrease(dto.quantity)  # Stok azalt
                line_total = product.price * dto.quantity
                total += line_total
                bulk_items.append(
                    OrderItem(order=order, product=product, quantity=dto.quantity, unit_price=product.price)
                )
            OrderItem.objects.bulk_create(bulk_items)  # Performans için bulk create
            order.total_amount = total
            order.save(update_fields=["total_amount"])
            order.log_status(Order.Status.PENDING, customer.id)

        # 5. Event dispatch
        self.dispatcher.dispatch(
            OrderCreatedEvent(payload={"order_id": order.id, "seller_id": seller.id, "customer_id": customer.id})
        )
        return order
```

**Önemli Noktalar:**
- Tüm validasyonlar service'de
- Transaction kullanımı: Stok azaltma ve sipariş oluşturma atomik
- `bulk_create`: Performans için toplu ekleme
- Event dispatch: Sipariş oluşturulduğunda bildirim gönderilir

#### Sipariş Durum Değiştirme

```python
def approve(self, order_id: int, seller: User) -> Order:
    order = self.order_repo.get(id=order_id, seller=seller)
    return self._change_status(order=order, actor=seller, status=Order.Status.ONAY)

def _change_status(self, *, order: Order, actor: User, status: str, note: str = "") -> Order:
    # Sadece müşteri veya satıcı durum değiştirebilir
    if actor.id not in (order.customer_id, order.seller_id):
        raise PermissionDeniedError("You cannot change this order.")
    order.status = status
    order.save(update_fields=["status"])
    order.log_status(status, actor.id, note)  # Log kaydı
    return order
```

### ProductService

Ürün yönetimi ve abonelik kontrolü:

```python
@dataclass
class ProductService:
    product_repo: ProductRepository = ProductRepository()
    stock_repo: StockRepository = StockRepository()
    max_free_products: int = 3  # Ücretsiz ürün limiti

    def create_product(
        self,
        *,
        seller: User,
        dorm_id: int,
        category_id: int,
        name: str,
        description: str,
        price,
        stock_quantity: int,
    ) -> Product:
        # Abonelik kontrolü
        active_count = self.product_repo.count_active_by_seller(seller.id)
        if active_count >= self.max_free_products and not self._subscription_service().has_active_subscription(seller.id):
            raise ValidationError("Seller must subscribe to add more products.")

        # Ürün oluştur
        product = self.product_repo.create(
            seller=seller,
            dorm_id=dorm_id,
            category_id=category_id,
            name=name,
            description=description,
            price=price,
        )
        # Stok oluştur
        self.stock_repo.create(product=product, quantity=stock_quantity)
        return product
```

**İş Kuralı:**
- İlk 3 ürün ücretsiz
- 3'ten fazla için aktif abonelik gerekli
- Abonelik yoksa `ValidationError` fırlatılır

### SubscriptionService

Abonelik yönetimi:

```python
@dataclass
class SubscriptionService:
    subscription_repo: SubscriptionRepository = SubscriptionRepository()
    plan_repo: SubscriptionPlanRepository = SubscriptionPlanRepository()
    usage_repo: UsageTrackingRepository = UsageTrackingRepository()

    def start_subscription(self, *, seller: User, plan_id: int):
        plan = self.plan_repo.get(id=plan_id)
        subscription = self.subscription_repo.create(
            seller=seller,
            plan=plan,
            expires_at=timezone.now() + timedelta(days=plan.duration_days),
        )
        # Usage tracking güncelle
        self.usage_repo.update_or_create(
            seller=seller,
            defaults={"product_slots": plan.max_products},
        )
        # Event dispatch
        event_dispatcher.dispatch(
            SubscriptionActivatedEvent(payload={"seller_id": seller.id, "plan_id": plan.id})
        )
        return subscription
```

### AnalyticsService

Popüler satıcı hesaplama (Redis cache ile):

```python
class AnalyticsService:
    def generate_popular_sellers(self, dorm_id: int):
        from modules.orders.models import Order

        cutoff = timezone.now() - timedelta(days=30)
        aggregates = (
            Order.objects.filter(dorm_id=dorm_id, created_at__gte=cutoff, status=Order.Status.ONAY)
            .values("seller_id")
            .annotate(total_orders=models.Count("id"), total_amount=models.Sum("total_amount"))
            .order_by("-total_amount")
        )
        # Eski kayıtları sil
        PopularSellerRank.objects.filter(dorm_id=dorm_id).delete()
        # Yeni sıralamayı oluştur
        for idx, aggregate in enumerate(aggregates, start=1):
            PopularSellerRank.objects.create(
                dorm_id=dorm_id,
                seller_id=aggregate["seller_id"],
                score=aggregate["total_amount"] or 0,
                rank=idx,
            )

    def list_popular_sellers(self, dorm_id: int):
        cache_key = f"popular_sellers:{dorm_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        rows = PopularSellerRank.objects.filter(dorm_id=dorm_id).values("seller_id", "score", "rank")[:10]
        data = list(rows)
        cache.set(cache_key, data, 300)  # 5 dakika cache
        return data
```

**Cache Stratejisi:**
- Cache key: `popular_sellers:{dorm_id}`
- TTL: 300 saniye (5 dakika)
- Cache miss durumunda veritabanından okunur ve cache'e yazılır

---

## Payment Modülü

Ödeme tarafı için hem servis katmanında hem de HTTP katmanında temel taşları hazırladım. Şu an `modules.payments` paketi Stripe gibi gerçek sağlayıcılara geçiş yapmadan önce `DummyPaymentAdapter` ile çalışacak şekilde tasarlandı.

### PaymentService

```python
@dataclass
class PaymentService:
    provider: Literal["stripe", "dummy"] = "dummy"

    def _adapter(self):
        if self.provider == "stripe":
            return StripeAdapter(
                api_key=getattr(settings, "STRIPE_SECRET_KEY", ""),
                success_url=settings.PAYMENT_SUCCESS_URL,
                cancel_url=settings.PAYMENT_CANCEL_URL,
            )
        return DummyPaymentAdapter(
            success_url=settings.PAYMENT_SUCCESS_URL,
            cancel_url=settings.PAYMENT_CANCEL_URL,
        )

    def create_checkout(self, amount: float):
        adapter = self._adapter()
        try:
            return adapter.create_checkout_session(amount=amount)
        except PaymentError as exc:
            raise PaymentError(f"Payment provider misconfigured: {exc}") from exc
```

- `provider` parametresi ile Stripe'a geçiş tek satırla yapılabilecek.
- Adapter'lar yönlendirme URL'lerini ayarlıyor, böylece frontend sabit linkleri biliyor.
- Hataları `PaymentError` olarak sarmalayarak üst katmanın tek tip exception yakalamasını sağlıyorum.

### PaymentWebhookView

```python
class PaymentWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        """Receive payment provider webhooks."""
        event = request.data
        logger.info("payment.webhook_received", payload=event)
        return Response({"status": "received"}, status=status.HTTP_200_OK)
```

- Endpoint `modules.payments.urls` içinde `/api/payments/webhook` olarak yayınlanıyor.
- Webhook şimdilik payload'ı log'luyor; ileride PaymentService ile eşlenip sipariş/abonelik güncellenecek.
- CSRF devre dışı çünkü sağlayıcılar anonim POST atıyor.

---

## Event System (Domain Events)

Event sistemi, modüller arası gevşek bağlantı (loose coupling) sağlar. Bir modülde olan değişiklik, diğer modülleri etkilemeden event üzerinden bildirilir.

### Event Yapısı

#### BaseEvent

Tüm event'lerin temel sınıfı:

```python
@dataclass(frozen=True, slots=True)
class BaseEvent:
    """Immutably describes a domain event."""
    name: str
    payload: Dict[str, Any]
    occurred_at: datetime = field(default_factory=lambda: datetime.now(tz=timezone.utc))
```

**Özellikler:**
- `frozen=True`: Immutable (değiştirilemez)
- `slots=True`: Bellek optimizasyonu
- `occurred_at`: Event'in oluşma zamanı

#### Event Tipleri

```python
@dataclass(frozen=True, slots=True)
class OrderCreatedEvent(BaseEvent):
    name: str = "order_created"
    payload: Dict[str, Any] = field(default_factory=dict)

@dataclass(frozen=True, slots=True)
class StockDecreasedEvent(BaseEvent):
    name: str = "stock_decreased"
    payload: Dict[str, Any] = field(default_factory=dict)

@dataclass(frozen=True, slots=True)
class ProductOutOfStockEvent(BaseEvent):
    name: str = "product_out_of_stock"
    payload: Dict[str, Any] = field(default_factory=dict)

@dataclass(frozen=True, slots=True)
class SubscriptionActivatedEvent(BaseEvent):
    name: str = "subscription_activated"
    payload: Dict[str, Any] = field(default_factory=dict)
```

### EventDispatcher

In-memory event dispatcher:

```python
class EventDispatcher:
    """Simple in-memory dispatcher for domain events."""

    def __init__(self) -> None:
        self._subscribers: DefaultDict[str, List[EventHandler]] = defaultdict(list)

    def subscribe(self, event_name: str, handler: EventHandler) -> None:
        self._subscribers[event_name].append(handler)

    def dispatch(self, event: BaseEvent) -> None:
        for handler in self._subscribers.get(event.name, []):
            handler(event)

event_dispatcher = EventDispatcher()
```

**Çalışma Mantığı:**
1. Handler'lar `subscribe()` ile kaydedilir
2. Event oluşturulduğunda `dispatch()` çağrılır
3. İlgili tüm handler'lar sırayla çalıştırılır

### Event Handler Örneği: SMTPNotificationService

Sipariş oluşturulduğunda satıcıya email gönderir:

```python
class SMTPNotificationService:
    """Handles order notifications via SMTP."""

    def handle_order_created(self, event: BaseEvent) -> None:
        seller_id = event.payload.get("seller_id")
        if not seller_id:
            return

        seller = (
            User.objects.select_related("seller_profile")
            .filter(id=seller_id)
            .first()
        )
        if not seller:
            return
        
        # notification_email varsa onu kullan, yoksa user.email
        recipient = getattr(seller.seller_profile, "notification_email", None) or seller.email
        subject = "Yeni siparişiniz var"
        body = f"Sipariş #{event.payload.get('order_id')} oluşturuldu."
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [recipient], fail_silently=True)
```

### Handler Kaydı

Handler'lar Django app ready() metodunda kaydedilir:

```python
# modules/notifications/apps.py
class NotificationsConfig(AppConfig):
    name = "modules.notifications"

    def ready(self):
        from core.events import event_dispatcher
        from core.events.types import OrderCreatedEvent
        from .services import SMTPNotificationService

        service = SMTPNotificationService()
        event_dispatcher.subscribe("order_created", service.handle_order_created)
```

**Önemli:** Django uygulaması başlatıldığında `ready()` metodu otomatik çağrılır ve handler'lar kaydedilir.

### Event Kullanım Senaryoları

1. **Sipariş Oluşturulduğunda:**
   - `OrderService.create_order()` → `OrderCreatedEvent` dispatch
   - `SMTPNotificationService` → Email gönderir

2. **Stok Azaldığında:**
   - `Stock.decrease()` → `StockDecreasedEvent` dispatch
   - `modules.products.handlers.handle_stock_decreased` structlog ile stok bilgilerini kayda geçirir.

3. **Stok Bittiğinde:**
   - `Stock.decrease()` → `ProductOutOfStockEvent` dispatch
   - `modules.products.handlers.handle_product_out` ürünü pasife alındığında log üretir.

4. **Abonelik Aktifleştiğinde:**
   - `SubscriptionService.start_subscription()` → `SubscriptionActivatedEvent` dispatch
   - (Handler henüz yazılmadı)

---

## API Endpoints

API endpoint'leri Django REST Framework kullanılarak oluşturulmuştur. View'lar ince tutulmuş, tüm iş mantığı service katmanındadır.

### View Yapısı

#### OrderViewSet Örneği

```python
class OrderViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        role = request.query_params.get("role", "customer")
        service = OrderService()
        if role == "seller":
            orders = service.list_for_seller(request.user)
        else:
            orders = service.list_for_customer(request.user)
        return Response(OrderSerializer(orders, many=True).data)

    def create(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()  # Serializer içinde service çağrılıyor
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        order = OrderService().approve(order_id=pk, seller=request.user)
        return Response(OrderSerializer(order).data)
```

**Özellikler:**
- `ViewSet` kullanımı: RESTful endpoint'ler
- `@action` decorator: Özel endpoint'ler (approve, reject, cancel)
- Serializer validation: `is_valid(raise_exception=True)`

#### Serializer ve Service Entegrasyonu

Serializer'lar service'leri çağırır:

```python
class OrderCreateSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)
    items = OrderCreateItemSerializer(many=True)

    def create(self, validated_data):
        service = OrderService()
        dto_items = [OrderItemDTO(**item) for item in validated_data["items"]]
        return service.create_order(
            customer=self.context["request"].user,
            items=dto_items,
            notes=validated_data.get("notes", "")
        )
```

**Akış:**
1. Request → Serializer validation
2. Serializer → Service çağrısı
3. Service → İş mantığı + Repository
4. Response → Serializer ile serialize

### URL Yapılandırması

#### Ana URL (config/urls.py)

```python
urlpatterns = [
    path("", root_view, name="root"),
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/users/", include("modules.users.urls")),
    path("api/products/", include("modules.products.urls")),
    path("api/orders/", include("modules.orders.urls")),
    path("api/subscription/", include("modules.subscription.urls")),
    path("api/notifications/", include("modules.notifications.urls")),
    path("api/analytics/", include("modules.analytics.urls")),
]
```

#### Modül URL Örneği (modules/orders/urls.py)

```python
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r"", OrderViewSet, basename="order")

urlpatterns = router.urls
```

**Endpoint'ler:**
- `GET /api/orders/` - Sipariş listesi
- `POST /api/orders/` - Sipariş oluştur
- `POST /api/orders/{id}/approve/` - Sipariş onayla
- `POST /api/orders/{id}/reject/` - Sipariş reddet
- `POST /api/orders/{id}/cancel/` - Sipariş iptal et

### API Dokümantasyonu

Swagger UI kullanıyoruz:

- **URL:** `/api/schema/swagger-ui/`
- **Kütüphane:** `drf-spectacular`
- **Yapılandırma:** `config/settings/base.py` içinde `SPECTACULAR_SETTINGS`

---

## Authentication ve Authorization

### JWT Authentication

`djangorestframework-simplejwt` kullanıyoruz:

```python
# config/settings/base.py
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}
```

**Token Yönetimi:**
- Access token: 30 dakika geçerli
- Refresh token: 7 gün geçerli
- Token rotation: Refresh token kullanıldığında yeni token üretilir

### Login Endpoint

```python
# modules/users/urls.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
```

**Kullanım:**
```bash
POST /api/users/token/
{
  "email": "seller@example.com",
  "password": "password123"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Authorization

View seviyesinde permission kontrolü:

```python
class OrderViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]  # Sadece giriş yapmış kullanıcılar
```

Service seviyesinde iş kuralı kontrolü:

```python
def _change_status(self, *, order: Order, actor: User, status: str, note: str = "") -> Order:
    if actor.id not in (order.customer_id, order.seller_id):
        raise PermissionDeniedError("You cannot change this order.")
    # ...
```

---

## Cache ve Performans

### Redis Cache Yapılandırması

```python
# config/settings/base.py
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_URL"),
    }
}
```

### Cache Kullanımı: Analytics

```python
def list_popular_sellers(self, dorm_id: int):
    cache_key = f"popular_sellers:{dorm_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached  # Cache hit
    
    # Cache miss - veritabanından oku
    rows = PopularSellerRank.objects.filter(dorm_id=dorm_id).values("seller_id", "score", "rank")[:10]
    data = list(rows)
    cache.set(cache_key, data, 300)  # 5 dakika cache
    return data
```

**Cache Stratejisi:**
- Key pattern: `popular_sellers:{dorm_id}`
- TTL: 300 saniye
- Invalidation: Manuel (şu an otomatik değil)

### Performans Optimizasyonları

1. **select_related**: Foreign key ilişkileri için
   ```python
   products = Product.objects.select_related("stock", "category", "seller")
   ```

2. **bulk_create**: Toplu ekleme
   ```python
   OrderItem.objects.bulk_create(bulk_items)
   ```

3. **QuerySet optimizasyonu**: Gereksiz sorguları önleme
   ```python
   orders = Order.objects.select_related("seller", "customer").prefetch_related("items")
   ```

---

## Arkaplan Görevleri ve Celery

Analytics'in otomatik hesaplanması için Celery tabanlı bir worker altyapısı kurdum.

### Celery Uygulaması

```python
# config/celery.py
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

app = Celery("yurt_market")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
```

- `config/__init__.py` içinde `celery_app` export edildiği için Django start edildiğinde worker hazır.
- Broker ve result backend olarak Redis kullanılıyor (`CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`).
- Worker başlatma komutu: `celery -A config worker -l info`.

### Analytics Task'i

```python
@shared_task(name="analytics.refresh_popular_sellers")
def refresh_popular_sellers(dorm_id: int) -> None:
    AnalyticsService().generate_popular_sellers(dorm_id)
```

- Task, servis katmanındaki güncel hesaplama metodunu çağırıyor.
- Şimdilik manuel tetikliyoruz; Celery beat veya external scheduler eklediğimizde otomatik güncelleme tamamlanacak.

---

## Logging Altyapısı

Structlog tabanlı merkezi bir logger helper'ı ekledim:

```python
def get_logger(name: str | None = None):
    """Return a structlog logger with an optional custom name."""
    if name:
        return structlog.get_logger(name)
    return structlog.get_logger()
```

- `core.utils.logging.get_logger` fonksiyonu structured logging için ortak giriş noktası.
- `modules.products.handlers` ve `modules.payments.views.PaymentWebhookView` bu helper'ı kullanarak `stock.decreased`, `product.out_of_stock`, `payment.webhook_received` gibi event'leri JSON formatında log'luyor.
- `STRUCTLOG_CONFIG` ayarları zaten `JSONRenderer` kullanacak şekilde yapılandırılmıştı; yeni helper bu ayarlarla uyumlu şekilde entegre edildi.

---

## Ortam Yapılandırması

### Environment Variables

`.env` dosyası kullanıyoruz (`django-environ`):

```python
# config/settings/base.py
import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env = environ.Env(
    DJANGO_DEBUG=(bool, False),
    DJANGO_ALLOWED_HOSTS=(list, []),
    CORS_ALLOWED_ORIGINS=(list, []),
    DB_USE_SQLITE=(bool, True),
    REDIS_URL=(str, "redis://localhost:6379/0"),
    # ...
)

environ.Env.read_env(env_file=BASE_DIR / ".env")
```

### Ortam Bazlı Ayarlar

#### Development (config/settings/dev.py)

```python
from .base import *

DEBUG = True
ALLOWED_HOSTS = ["*"]

# SQLite kullan (PostgreSQL gerekmez)
if env("DB_USE_SQLITE", default=True):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
```

#### Production (config/settings/prod.py)

```python
from .base import *

DEBUG = False
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS")

# PostgreSQL zorunlu
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT"),
    }
}
```

### CORS Yapılandırması

```python
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS", 
    default=["http://localhost:3000", "http://127.0.0.1:3000"]
)
```

**Not:** Production'da sadece frontend domain'leri eklenmeli.

---

## Önemli Notlar ve Gelecek Geliştirmeler

### Tamamlanan Özellikler ✅

- ✅ Proje yapısı ve modeller
- ✅ Repository Pattern
- ✅ Service Layer
- ✅ Event System (OrderCreatedEvent handler bağlı)
- ✅ Admin paneli
- ✅ API Endpoints (users, products, orders, subscription, analytics)
- ✅ JWT authentication
- ✅ CORS ayarları
- ✅ Redis cache (analytics'te)
- ✅ Migrations
- ✅ Stock event handler'lar (Structlog ile stok ve out-of-stock loglaması)
- ✅ Payment webhook endpoint ve PaymentService
- ✅ Celery uygulaması + `analytics.refresh_popular_sellers` task'i
- ✅ Structlog tabanlı logging helper

### Yapılacaklar 📋

1. **Product Usage Tracking Entegrasyonu**
   - Ürün eklenip silindiğinde `UsageTracking.product_slots` güncellenmeli
   - `ProductService.create_product()` ve `delete_product()` metodlarında

2. **Testler**
   - Unit testler (services, repositories)
   - API endpoint testleri
   - Integration testler

3. **Error Handling**
   - Detaylı hata mesajları
   - Standart API error response formatı

4. **Validation**
   - Serializer validation'ları güçlendirme
   - Business rule validation'ları

5. **Payment Entegrasyonu**
   - Checkout oluşturma ve subscription akışına bağlama
   - Webhook içeriğini Order/Subscription güncellemesine dönüştürme

6. **Analytics Otomatik Güncelleme**
   - Celery beat veya scheduler ile `refresh_popular_sellers` tetikle

7. **Logging**
   - Structlog alanlarını (request id, user id vb.) global middleware ile ekleme

8. **Production Hazırlık**
   - Environment variable validation
   - Health check endpoint
   - Monitoring/logging setup

---

## Sonuç

Bu dokümantasyon, Yurt Market projesinin mevcut durumunu ve mimari kararlarını detaylı bir şekilde açıklamaktadır. Projeye yeni katılan geliştiriciler bu dokümantasyonu referans alarak hızlıca projeye adapte olabilirler.

Sorularınız veya önerileriniz için lütfen iletişime geçin.

