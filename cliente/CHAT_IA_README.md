# Sistema de Chat con IA - Documentación

## Descripción General

Se ha migrado exitosamente el sistema de chat con IA de la aplicación móvil a la versión web. Este sistema permite registrar ingresos y egresos mediante comandos de texto natural procesados por inteligencia artificial (Ollama).

## Archivos Creados

### 1. Tipos TypeScript
**Ubicación:** `src/types/chat.ts`

Define las interfaces y tipos para el sistema de chat:
- `ParsedIncome`: Interfaz para ingresos parseados por IA
- `ParsedExpense`: Interfaz para egresos parseados por IA
- `UseTextToIncomeResult`: Tipo de retorno del hook de ingresos
- `UseTextToExpenseResult`: Tipo de retorno del hook de egresos

### 2. Hooks Personalizados

#### Hook de Ingresos
**Ubicación:** `src/hooks/useTextToIncome.ts`

Funciones principales:
- `parseTextToIncome(text)`: Parsea el texto sin registrar en BD
- `parseAndRegisterIncome(text)`: Parsea y registra automáticamente en BD

#### Hook de Egresos
**Ubicación:** `src/hooks/useTextToExpense.ts`

Funciones principales:
- `parseTextToExpense(text)`: Parsea el texto sin registrar en BD
- `parseAndRegisterExpense(text)`: Parsea y registra automáticamente en BD

### 3. Componentes de UI

#### Modal de Ingresos
**Ubicación:** `src/movimiento/components/ChatIngresoModal.tsx`

Características:
- Interfaz moderna con Tailwind CSS
- Input de texto para comandos naturales
- Ejemplos de comandos rápidos
- Visualización de datos parseados
- Barra de confianza del análisis IA
- Feedback visual de éxito/error

#### Modal de Egresos
**Ubicación:** `src/movimiento/components/ChatEgresoModal.tsx`

Características:
- Interfaz similar al modal de ingresos
- Adaptada para egresos
- Comandos de ejemplo específicos para egresos
- Feedback visual inmediato

### 4. Integraciones

#### ListarIngresosVarios
**Archivo modificado:** `src/movimiento/components/ListarIngresosVarios.tsx`

Cambios realizados:
- Importación de `ChatIngresoModal`
- Nuevo estado `isOpenChatIA`
- Botón "Registrar por Chat IA" con icono
- Handler `handleIngresoRegistradoIA` para actualizar la lista

#### ListarEgresosVarios
**Archivo modificado:** `src/movimiento/components/Egreso/ListarEgresosVarios.tsx`

Cambios realizados:
- Importación de `ChatEgresoModal`
- Nuevo estado `isOpenChatIA`
- Botón "Registrar por Chat IA" con icono
- Handler `handleEgresoRegistradoIA` para actualizar la lista

## Endpoints del Backend

El sistema utiliza los siguientes endpoints (ya configurados en la app móvil):

### Ingresos
- `POST /voice/parse-income` - Parsea texto a ingreso (sin guardar)
- `POST /voice/register-income` - Parsea y registra ingreso directamente

### Egresos
- `POST /voice/parse-expense` - Parsea texto a egreso (sin guardar)
- `POST /voice/register-expense` - Parsea y registra egreso directamente

### Métricas (IA)
- `GET /voice/metrics-snapshot?from=YYYY-MM-DD&to=YYYY-MM-DD` - Devuelve un snapshot de métricas (ventas/compras/inventario)
- `POST /voice/chat-metricas` - Chat IA para explicar métricas y sugerir acciones
- `POST /voice/vision-analyze` - (Opcional) Análisis multimodal de imagen con Ollama (modelo vision)

## Ejemplos de Uso

### Comandos de Ingresos
```
"Registrar 150 por venta de equipos"
"Ingreso de 50 por servicio técnico"
"Anotar 75 de reparación"
"Venta de productos por 200"
```

### Comandos de Egresos
```
"Egreso de 30000 por pago de servicios"
"Compra de insumos por 50000 guaraníes"
"Gastos varios 20000 gs"
"Pago de alquiler 150000"
```

## Flujo de Funcionamiento

1. **Usuario abre el modal** haciendo clic en "Registrar por Chat IA"
2. **Escribe un comando** en lenguaje natural
3. **El sistema procesa** el texto mediante IA (Ollama)
4. **Se muestra el resultado** parseado con:
   - Monto extraído
   - Concepto/descripción
   - Tipo de movimiento
   - Nivel de confianza (%)
5. **Se registra automáticamente** en la base de datos
6. **Se muestra confirmación** de éxito
7. **Se actualiza la lista** de ingresos/egresos

## Características Técnicas

### Validaciones
- Campo de texto no vacío
- Manejo de errores del servidor
- Estados de carga durante procesamiento
- Mensajes de error informativos

### UI/UX
- Diseño responsivo
- Animaciones suaves (fade-in, zoom-in)
- Feedback visual inmediato
- Cierre automático tras éxito (2 segundos)
- Comandos de ejemplo clicables
- Indicador de confianza visual

### Integración con Sistema Existente
- Usa la misma instancia de Axios (`api`)
- Respeta el sistema de autenticación
- Integrado con modales de éxito/error existentes
- Actualiza automáticamente las listas paginadas

## Próximos Pasos Recomendados

1. **Verificar endpoints del backend**: Asegurarse de que `/voice/*` estén implementados
2. **Probar en desarrollo**: Verificar el funcionamiento completo
3. **Ajustar ejemplos**: Personalizar comandos según necesidades del negocio
4. **Configurar Ollama**: Asegurar que el servidor tenga Ollama configurado
5. **Documentar para usuarios**: Crear guía de uso para usuarios finales

## Notas Importantes

- El sistema requiere que el backend tenga Ollama instalado y configurado
- Los comandos pueden ser en lenguaje natural
- El nivel de confianza indica qué tan preciso fue el análisis
- Los datos se registran automáticamente sin confirmación adicional
- Compatible con el sistema de paginación existente

## Soporte

Para problemas o mejoras, revisar:
- Logs del navegador (console.log)
- Respuestas del servidor en Network
- Estado de Ollama en el backend
