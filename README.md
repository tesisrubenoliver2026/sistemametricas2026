# Sistema de Ventas 2026

Sistema de gestión comercial con módulos de ventas, compras, RRHH, contabilidad y facturación. Arquitectura cliente-servidor: frontend de escritorio con Electron + React y backend REST con Node.js + Express + MySQL.

---

## Estructura del repositorio

```
sistemametricas2026/
├── cliente/        # Frontend — Electron + React + Vite + TypeScript
├── server/         # Backend  — Node.js + Express + MySQL
└── database/
    ├── backup_inicial.sql   # Dump completo de la base de datos
    └── migrations/          # Scripts SQL de cambios incrementales
```

---

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|-------------|---------------|----------|
| Node.js     | 18.x o superior | https://nodejs.org |
| MySQL       | 8.x            | https://dev.mysql.com/downloads/mysql/ |
| Ollama      | última         | https://ollama.com/download |

---

## 1 — Configurar la base de datos

### 1.1 Crear la base de datos e importar el backup

```bash
# Conectarse a MySQL
mysql -u root -p

# Dentro de MySQL
CREATE DATABASE sistema_ale_2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Importar el dump completo
mysql -u root -p sistema_ale_2 < database/backup_inicial.sql
```

### 1.2 Aplicar migraciones (en orden cronológico)

```bash
mysql -u root -p sistema_ale_2 < database/migrations/20251214_add_idlote_to_detalle_venta.sql
mysql -u root -p sistema_ale_2 < database/migrations/20251215_add_caja_fields_to_lotes_producto.sql
mysql -u root -p sistema_ale_2 < database/migrations/20251216_create_producto_detalle.sql
mysql -u root -p sistema_ale_2 < database/migrations/plan_cuentas_inicial.sql
mysql -u root -p sistema_ale_2 < database/migrations/agregar_cuotas_simple.sql
mysql -u root -p sistema_ale_2 < database/migrations/add_idfuncionario_columns.sql
mysql -u root -p sistema_ale_2 < database/migrations/add_idusuarios_to_configuracion.sql
mysql -u root -p sistema_ale_2 < database/migrations/add_tienda_columns_to_configuracion.sql
mysql -u root -p sistema_ale_2 < database/migrations/fix_tienda_column_to_boolean.sql
mysql -u root -p sistema_ale_2 < database/migrations/fix_unique_key_configuracion.sql
mysql -u root -p sistema_ale_2 < database/migrations/corregir_saldos_cuotas.sql
```

> Si el backup ya incluye los cambios de las migraciones, omitir este paso.

---

## 2 — Instalar y configurar Ollama (reconocimiento de voz con IA)

Ollama permite correr modelos de lenguaje localmente. El sistema lo usa para el módulo de voz.

### 2.1 Instalar Ollama

**Windows:**
Descargar e instalar desde https://ollama.com/download/windows

**Linux/macOS:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2.2 Descargar el modelo

```bash
ollama pull llama3.2
```

> El modelo pesa aproximadamente 2 GB. Asegurarse de tener espacio disponible.

### 2.3 Verificar que Ollama está corriendo

```bash
# Debe responder con la lista de modelos instalados
ollama list
```

Ollama escucha por defecto en `http://localhost:11434`. El servidor está configurado para conectarse a esa URL automáticamente.

---

## 3 — Configurar y levantar el servidor (backend)

```bash
cd server
npm install
```

Crear el archivo `.env` copiando el ejemplo:

```bash
cp .env.example .env
```

Editar `.env` con los datos reales:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=tu_app_password_de_gmail
NOTIFY_TO=tu_correo@gmail.com
DB_HOST=localhost
HOST=127.0.0.1
PORT=3002
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=sistema_ale_2
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

> **MAIL_PASS** debe ser una *contraseña de aplicación* de Gmail (no la contraseña normal).  
> Generarla en: Cuenta de Google → Seguridad → Verificación en dos pasos → Contraseñas de aplicación.

Iniciar el servidor:

```bash
npm start
# o en modo desarrollo con recarga automática:
npm run dev
```

El servidor queda escuchando en `http://localhost:3002`.

---

## 4 — Configurar y levantar el cliente (frontend)

```bash
cd cliente
npm install
```

### Modo web (desarrollo)

```bash
npm run dev
```

Abre el navegador en `http://localhost:5173`.

### Modo escritorio (Electron)

```bash
npm run electron:dev
```

### Compilar instalador Windows (.exe)

```bash
npm run dist
```

El instalador se genera en `cliente/dist/`.

---

## 5 — Orden de inicio recomendado

1. Iniciar **MySQL**
2. Iniciar **Ollama** (`ollama serve` si no inicia automáticamente)
3. Iniciar el **servidor**: `cd server && npm start`
4. Iniciar el **cliente**: `cd cliente && npm run electron:dev`

---

## Módulos del sistema

| Módulo | Descripción |
|--------|-------------|
| Ventas | Creación de ventas, cuotas, cobro de deuda, ventas programadas |
| Compras | Registro de compras, deudas a proveedores |
| Productos | Stock, lotes, detalles de producto |
| Clientes | ABM de clientes |
| Proveedores | ABM de proveedores |
| Caja | Movimientos, arqueo, cierre de caja |
| RRHH | Empleados, salarios, asistencia, liquidaciones, horas extras |
| Contabilidad | Libro diario, libro mayor |
| Facturación | Facturador, actividades económicas |
| Configuración | Email, datos de la tienda |
| Voz | Comandos por voz con IA (Ollama/llama3.2) |

---

## Tecnologías

**Cliente:** React 19, TypeScript, Vite, Electron, Tailwind CSS, Zustand, React Router, Axios  
**Servidor:** Node.js, Express 5, MySQL2, JWT, Nodemailer, node-cron, jsreport  
**IA:** Ollama con modelo llama3.2 (local, sin internet)
