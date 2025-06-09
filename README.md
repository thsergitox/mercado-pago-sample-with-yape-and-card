# Implementación de Pagos con Yape y Tarjeta - MercadoPago

Este proyecto demuestra la integración de MercadoPago con dos métodos de pago:
- **Pagos con Tarjeta** (implementación existente)
- **Pagos con Yape** (nueva implementación)

## Estructura del Proyecto

```
card-payment-sample-node/
├── views/
│   ├── index.html          # Página de pagos con tarjeta
│   └── yape.html           # Página de pagos con Yape
├── static/
│   └── js/
│       ├── index.js        # Lógica para pagos con tarjeta
│       └── yape.js         # Lógica para pagos con Yape
├── index.js                # Servidor principal con ambos endpoints
└── README-YAPE.md          # Este archivo
```

## Rutas Disponibles

- `/` - Página principal con pagos por tarjeta
- `/yape` - Página de pagos con Yape

## Características de la Implementación Yape

### Frontend (`views/yape.html` y `static/js/yape.js`)

1. **Formulario simplificado** que solicita:
   - Email del pagador
   - Número de teléfono
   - Código OTP de 6 dígitos

2. **Validaciones del lado cliente**:
   - Solo números en teléfono y OTP
   - OTP debe tener exactamente 6 dígitos
   - Todos los campos son obligatorios

3. **Integración con SDK de MercadoPago**:
   - Generación de token Yape usando `mp.yape(yapeOptions)`
   - Manejo de errores y estados de carga

4. **Datos de prueba incluidos**:
   - Teléfono: `111111111`
   - OTP: `123456`

### Backend (`index.js`)

1. **Nueva ruta**: `GET /yape` para servir la página de Yape
2. **Nuevo endpoint**: `POST /process_payment_yape` para procesar pagos
3. **Compatibilidad** con la API de MercadoPago para método de pago `yape`

## Flujo de Pago con Yape

1. **Usuario selecciona productos** y va al checkout
2. **Elige "Pay with Yape"** desde la página principal
3. **Llena el formulario** con:
   - Su email
   - Número de teléfono
   - Código OTP generado en la app Yape
4. **El sistema genera un token** usando el SDK de MercadoPago
5. **Se procesa el pago** con el token generado
6. **Se muestra el resultado** (éxito o error)

## Datos de Prueba

Según la documentación de MercadoPago, puedes usar estos datos para probar:

| Teléfono  | OTP    | Resultado Esperado |
|-----------|--------|--------------------|
| 111111111 | 123456 | approved          |
| 111111112 | 123456 | cc_rejected_call_for_authorize |
| 111111113 | 123456 | cc_rejected_insufficient_amount |
| 111111114 | 123456 | cc_rejected_other_reason |

## Diferencias con la Implementación de Tarjeta

### Yape:
- ✅ Formulario más simple (solo email, teléfono, OTP)
- ✅ Un solo pago (sin cuotas)
- ✅ Token generado con `mp.yape()`
- ✅ Método de pago: `yape`

### Tarjeta:
- 📝 Formulario complejo (datos del tarjetahabiente, tarjeta, etc.)
- 📝 Soporte para cuotas
- 📝 Token generado con `cardForm`
- 📝 Múltiples métodos de pago de tarjeta

## Instrucciones de Uso

Lo que hice para la publick key y el access token de mercado es hardcodearlo, no me di el tiempo de mejorarlo, si tienes una mejor solución te invito a hacer un pull request.

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar el servidor**:
   ```bash
   npm start
   ```

3. **Abrir el navegador** en `http://localhost:8080`

4. **Probar ambos métodos**:
   - Clic en "Pay with Card" para el flujo de tarjeta
   - Clic en "Pay with Yape" para el flujo de Yape

## Configuración

Asegúrate de tener configuradas las credenciales correctas en `index.js`:

- `mercadoPagoPublicKey`: Tu clave pública de MercadoPago
- `mercadoPagoAccessToken`: Tu token de acceso de MercadoPago

## Notas Técnicas

- La implementación sigue las mejores prácticas de la documentación oficial de MercadoPago
- Se mantiene consistencia visual y de UX entre ambos métodos de pago
- El código está modularizado para facilitar mantenimiento
- Se incluye manejo de errores robusto para ambos flujos 