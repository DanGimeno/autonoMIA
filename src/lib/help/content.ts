export const helpContent = {
  dashboard: {
    manual: `## Dashboard

El dashboard es tu **panel de control**. De un vistazo ves el estado de tu actividad como autónomo.

### Tarjetas resumen
- **Proyectos activos**: número de proyectos en curso
- **Facturas pendientes**: importe total de facturas emitidas sin cobrar
- **Facturas cobradas**: importe total ya cobrado
- **Tareas fiscales**: obligaciones pendientes (con aviso de vencidas)

### Próximas tareas fiscales
Lista de las tareas fiscales más próximas. Las que ya han vencido se marcan en rojo.

### Actividad reciente
Últimas horas registradas, con el proyecto y la fecha.

### Cómo usarlo
- Haz clic en cualquier tarjeta para ir a la sección correspondiente
- Revísalo cada mañana para tener una visión general de tu situación`,
    glossary: `## Glosario del Dashboard

- **Proyecto activo**: proyecto con estado "activo" (no pausado ni completado)
- **Factura pendiente**: factura en estado "emitida" o "borrador" que aún no se ha cobrado
- **Factura cobrada**: factura con estado "cobrada" y fecha de cobro registrada
- **Tarea fiscal vencida**: tarea cuya fecha límite ya ha pasado y sigue pendiente
- **IVA**: Impuesto sobre el Valor Añadido, actualmente el 21% general en España
- **IRPF**: Impuesto sobre la Renta de las Personas Físicas, retención que aplicas en tus facturas`,
    eli5: `## Dashboard para principiantes

Imagina que tienes un escritorio con todo lo importante a la vista:

🏠 **Es tu página de inicio**. Cada vez que entras ves:
- Cuántos trabajos tienes en marcha
- Cuánto dinero te deben
- Cuánto has cobrado ya
- Qué trámites del gobierno tienes que hacer pronto

Es como el tablón de corcho de tu oficina, pero digital y siempre actualizado.

**No tienes que hacer nada aquí** — solo mirar. Si algo te llama la atención, haz clic y te lleva a los detalles.`,
  },

  projects: {
    manual: `## Proyectos

Cada trabajo que haces para un cliente es un **proyecto**. Aquí los gestionas todos.

### Crear un proyecto
1. Haz clic en **"Nuevo proyecto"**
2. Rellena el nombre (obligatorio)
3. Selecciona el cliente (si ya lo tienes registrado)
4. Elige el tipo de facturación:
   - **Por horas**: defines una tarifa €/h y registras horas trabajadas
   - **Tarifa plana**: importe fijo mensual independiente de las horas
5. Opcionalmente añade fechas de inicio/fin, presupuesto y color

### Estados
- **Activo**: en curso, puedes registrar horas
- **Pausado**: temporalmente detenido
- **Completado**: finalizado

### Acciones
- **Editar**: modifica cualquier dato del proyecto
- **Eliminar**: borra el proyecto (las horas y facturas asociadas quedan sin proyecto)`,
    glossary: `## Glosario de Proyectos

- **Tarifa por horas (€/h)**: precio que cobras por cada hora trabajada en este proyecto
- **Tarifa plana mensual (€/mes)**: importe fijo que cobras cada mes, sin importar las horas
- **Presupuesto**: importe total máximo acordado con el cliente para el proyecto completo
- **Cliente**: la persona o empresa para quien trabajas (se selecciona de tu lista de clientes)
- **Color**: color que identifica este proyecto en el calendario de horas`,
    eli5: `## Proyectos para principiantes

Un proyecto es **un trabajo que haces para alguien**.

Por ejemplo: "Diseño web para la Panadería García" es un proyecto.

Cada proyecto tiene:
- Un **nombre** para identificarlo
- Un **cliente** (para quién trabajas)
- Cómo te **pagan**: por horas o un fijo al mes
- Si está **en marcha**, **pausado** o **terminado**

Piensa en los proyectos como carpetas donde organizas tu trabajo. Luego las horas que registras y las facturas que haces se vinculan a estas carpetas.`,
  },

  clients: {
    manual: `## Clientes

Aquí gestionas las personas y empresas para las que trabajas.

### ¿Por qué registrar clientes?
- Sus datos fiscales (NIF/CIF, dirección) se usan automáticamente en las facturas
- Puedes definir condiciones por defecto (días de pago, IVA, IRPF) que se auto-rellenan
- Ves el historial de proyectos y facturas por cliente

### Crear un cliente
1. Haz clic en **"Nuevo cliente"**
2. Datos obligatorios: **nombre** (razón social o nombre completo)
3. Datos recomendados: NIF/CIF, email, dirección fiscal completa
4. Tipo: Empresa, Autónomo o Particular
5. Condiciones por defecto: días de pago (30, 60...), IVA y IRPF habituales

### Condiciones por defecto
Al seleccionar un cliente en una factura, se auto-rellenan:
- El **IVA** y **IRPF** con los porcentajes del cliente
- La **fecha de vencimiento** sumando los días de pago a la fecha de emisión`,
    glossary: `## Glosario de Clientes

- **Razón social**: nombre legal de la empresa (el que aparece en el registro mercantil)
- **Nombre comercial**: nombre con el que opera la empresa (puede ser diferente)
- **NIF**: Número de Identificación Fiscal (personas físicas españolas)
- **CIF**: Código de Identificación Fiscal (empresas, aunque ahora se usa NIF para todos)
- **NIE**: Número de Identidad de Extranjero
- **Dirección fiscal**: dirección oficial de la empresa para efectos tributarios
- **Días de pago**: plazo habitual en el que el cliente paga (30, 60, 90 días)
- **Autónomo**: persona que trabaja por cuenta propia (como tú)
- **Particular**: persona física que no es empresa ni autónomo`,
    eli5: `## Clientes para principiantes

Un cliente es **la persona o empresa que te paga por tu trabajo**.

Registras sus datos aquí para no tener que escribirlos cada vez que haces una factura. Es como tu agenda de contactos, pero con la información fiscal que necesitas.

Lo más importante de cada cliente:
- **Nombre**: quién es
- **NIF/CIF**: su número de identificación fiscal (lo necesitas para las facturas)
- **Dirección**: dónde están (también obligatorio en facturas)
- **Cuánto tardan en pagar**: así la app calcula cuándo vence cada factura`,
  },

  workLogs: {
    manual: `## Registro de horas

El calendario donde apuntas las horas que trabajas cada día.

### Cómo registrar horas
1. Haz clic en **cualquier día** del calendario
2. Selecciona el **proyecto** (opcional)
3. Introduce las **horas** (mínimo 0.5h, en intervalos de 0.5)
4. Añade **notas** si quieres (qué hiciste)
5. Guarda

### Navegar por meses
Usa las flechas **← →** para ir al mes anterior o siguiente.

### Resumen
En la parte superior ves:
- **Total de horas** del mes
- **Horas por proyecto** (desglose)

### Editar o eliminar
Haz clic en una entrada existente (los bloques azules) para editarla o eliminarla.

### Consejos
- Registra las horas **cada día** — es más preciso y no se te olvida
- Si trabajas en varios proyectos el mismo día, crea una entrada por cada uno
- Las horas se usan para calcular cuánto facturar en proyectos por horas`,
    glossary: `## Glosario de Registro de horas

- **Horas facturables**: horas que puedes cobrar al cliente
- **Work log / Registro**: cada entrada individual de horas (fecha + proyecto + horas + notas)
- **Tarifa efectiva**: el precio por hora real aplicado (puede diferir del precio por defecto del proyecto)
- **Horas totales del mes**: suma de todas las horas registradas en ese mes calendario`,
    eli5: `## Registro de horas para principiantes

Es un **calendario donde apuntas cuánto trabajas cada día**.

Imagina que tienes un reloj de fichar, pero más fácil:
1. Haces clic en el día de hoy
2. Dices en qué proyecto trabajaste
3. Pones cuántas horas
4. ¡Listo!

Al final del mes ves el total de horas que has trabajado, y cuántas para cada cliente. Esto te ayuda a saber cuánto facturar.`,
  },

  invoices: {
    manual: `## Facturas

Gestión completa de tus facturas emitidas.

### Crear una factura
1. Haz clic en **"Nueva factura"**
2. El **nº de factura** debe ser correlativo (ej: 2026-F001, 2026-F002...)
3. Selecciona la **serie**: F (factura normal), R (rectificativa), P (proforma)
4. Selecciona el **cliente** — se auto-rellenan IVA, IRPF y fecha de vencimiento
5. Introduce la **base imponible** (importe sin impuestos)
6. Verifica el cálculo: Base + IVA - IRPF = Total a cobrar

### Estados de una factura
- **Borrador**: en preparación, no enviada
- **Emitida**: enviada al cliente, pendiente de cobro
- **Cobrada**: pagada por el cliente
- **Vencida**: ha pasado la fecha de vencimiento sin cobrar

### Filtrar
Usa las pestañas para ver facturas por estado.

### Marcar como cobrada
En la lista, haz clic en el icono ✓ para marcar una factura como cobrada.

### Cálculos
- **Base imponible**: lo que cobras por tu trabajo
- **IVA (21%)**: impuesto que añades y luego pagas a Hacienda
- **IRPF (15%)**: retención que el cliente ingresa a Hacienda por ti
- **Total = Base + IVA - IRPF**: lo que realmente recibes`,
    glossary: `## Glosario de Facturas

- **Base imponible**: importe del servicio sin impuestos
- **IVA (Impuesto sobre el Valor Añadido)**: impuesto indirecto (21% tipo general). Lo añades a tu factura y luego lo declaras trimestralmente
- **IRPF (retención)**: porcentaje que el cliente retiene y paga a Hacienda a tu nombre (15% general, 7% nuevos autónomos los primeros 2 años)
- **Factura rectificativa**: factura que corrige una factura anterior (errores, devoluciones)
- **Proforma**: factura provisional, no tiene valor fiscal
- **Serie**: código que agrupa facturas del mismo tipo (F, R, P)
- **Fecha de emisión**: cuándo emites la factura
- **Fecha de vencimiento**: cuándo esperas cobrarla
- **Factura vencida**: factura cuya fecha de vencimiento ha pasado sin cobrar`,
    eli5: `## Facturas para principiantes

Una factura es el **"ticket" que le das a tu cliente para que te pague**.

Es obligatorio hacerla por ley. Tiene que tener:
- Tu nombre y NIF
- El nombre y NIF del cliente
- Un número correlativo (no puedes saltarte números)
- Qué has hecho y cuánto cuesta
- Los impuestos (IVA e IRPF)

**Ejemplo sencillo:**
- Has hecho un trabajo que vale 1.000€
- Le sumas el IVA (21%): +210€
- Le restas el IRPF (15%): -150€
- El cliente te paga: **1.060€**
- Tú luego pagas el IVA a Hacienda, y el IRPF ya lo pagó el cliente por ti`,
  },

  expenses: {
    manual: `## Gastos

Registra los gastos necesarios para tu actividad. Son **deducibles** en tu declaración.

### ¿Por qué registrar gastos?
- El **IVA soportado** (el IVA que pagas al comprar) se resta del IVA que cobras en tus facturas
- Los **gastos deducibles** reducen tu base imponible del IRPF (pagas menos impuestos)
- Hacienda puede pedirte justificación: mejor tenerlo todo registrado

### Crear un gasto
1. **Concepto**: qué has comprado/pagado
2. **Categoría**: tipo de gasto (software, material, viajes, etc.)
3. **Importe**: base imponible (sin IVA)
4. **IVA soportado**: el IVA que has pagado (normalmente 21%)
5. **% IVA deducible**: cuánto de ese IVA puedes deducir (100% normal, 50% vehículo)
6. **Proveedor**: quién te ha vendido/facturado

### Categorías principales
Material, Software, Hardware, Viajes, Comidas, Oficina, Telecom, Servicios profesionales, Formación, Seguros, Vehículo, Marketing, Banca, Impuestos, Otro

### IVA deducible al 50%
Los gastos de vehículo solo son deducibles al 50% si usas el vehículo también para uso personal.`,
    glossary: `## Glosario de Gastos

- **Gasto deducible**: gasto necesario para tu actividad que puedes restar de tus ingresos
- **IVA soportado**: IVA que pagas cuando compras algo (el que aparece en las facturas que recibes)
- **IVA repercutido**: IVA que cobras cuando emites una factura
- **% IVA deducible**: porcentaje del IVA soportado que puedes deducir (100% si es 100% profesional, 50% para vehículo mixto)
- **Base imponible**: precio sin IVA
- **Factura de proveedor**: factura que recibes de quien te vende algo
- **Gasto recurrente**: gasto que se repite periódicamente (ej: alquiler, suscripciones)`,
    eli5: `## Gastos para principiantes

Cada vez que **compras algo para tu trabajo**, es un gasto.

Ejemplos: el ordenador, el software, la factura del móvil, el viaje a ver un cliente...

¿Por qué apuntarlos? Porque **pagas menos impuestos**:
- El IVA que pagas al comprar se resta del IVA que cobras en tus facturas
- Los gastos reducen tus beneficios, así que pagas menos IRPF

Es como decirle a Hacienda: "He ganado 30.000€ pero me he gastado 5.000€ en cosas de trabajo, así que solo he ganado realmente 25.000€".`,
  },

  taxTasks: {
    manual: `## Tareas fiscales

Controla tus obligaciones fiscales periódicas.

### Categorías
- **IVA**: declaraciones trimestrales (modelo 303) y anual (modelo 390)
- **IRPF**: pagos fraccionados trimestrales (modelo 130) y renta anual (modelo 100)
- **Cuota autónomo**: pago mensual a la Seguridad Social
- **Otro**: cualquier otra obligación

### Cómo usarlo
1. **Crear tarea**: define el título, fecha límite y categoría
2. **Marcar como completada**: haz clic en el checkbox cuando la hayas presentado/pagado
3. Las tareas **vencidas** aparecen destacadas en rojo

### Calendario fiscal del autónomo
- **Enero 20**: modelo 303 (IVA T4) y modelo 130 (IRPF T4)
- **Abril 20**: modelo 303 (IVA T1) y modelo 130 (IRPF T1)
- **Julio 20**: modelo 303 (IVA T2) y modelo 130 (IRPF T2)
- **Octubre 20**: modelo 303 (IVA T3) y modelo 130 (IRPF T3)
- **Enero 30**: modelo 390 (resumen anual IVA)
- **Último día de cada mes**: cuota de autónomo`,
    glossary: `## Glosario de Tareas fiscales

- **Modelo 303**: declaración trimestral de IVA (diferencia entre IVA cobrado e IVA pagado)
- **Modelo 130**: pago fraccionado trimestral de IRPF (20% de beneficios del trimestre)
- **Modelo 390**: resumen anual de IVA
- **Modelo 100**: declaración anual de la renta
- **Cuota de autónomo**: pago mensual a la Seguridad Social por estar dado de alta como autónomo
- **Trimestre fiscal**: T1 (ene-mar), T2 (abr-jun), T3 (jul-sep), T4 (oct-dic)`,
    eli5: `## Tareas fiscales para principiantes

Como autónomo, tienes que hacer **"deberes" para Hacienda** varias veces al año.

Los más importantes:
- **Cada 3 meses** (trimestral): dices cuánto IVA has cobrado y pagado, y pagas la diferencia. También pagas un adelanto del IRPF.
- **Cada mes**: pagas la cuota de autónomo (como un "abono" a la Seguridad Social para tener derecho a médico, baja, jubilación...).
- **Una vez al año**: la declaración de la renta.

Esta sección te ayuda a no olvidarte de ningún plazo. Las tareas que ya se han pasado de fecha aparecen en rojo.`,
  },

  taxQuarters: {
    manual: `## Trimestres fiscales

Resumen financiero por trimestre para preparar tus declaraciones de IVA e IRPF.

### Qué muestra cada trimestre
**Sección IVA (Modelo 303):**
- **IVA repercutido**: IVA que has cobrado en tus facturas
- **IVA soportado deducible**: IVA que has pagado en tus gastos (el deducible)
- **Balance**: la diferencia. Si es positivo, debes pagar. Si es negativo, a compensar.

**Sección IRPF (Modelo 130):**
- **Ingresos**: total facturado en el trimestre
- **Gastos deducibles**: total de gastos del trimestre
- **Rendimiento neto**: ingresos - gastos
- **Cuota (20%)**: lo que toca pagar
- **Retenciones**: lo que tus clientes ya han retenido en sus pagos

**Cuota autónomo**: 3 mensualidades

### Estado de presentación
Cada modelo se puede marcar como:
- **Pendiente**: aún no presentado
- **Presentado**: enviado a Hacienda
- **Pagado**: pagado el importe correspondiente`,
    glossary: `## Glosario de Trimestres fiscales

- **Trimestre**: período de 3 meses (T1: ene-mar, T2: abr-jun, T3: jul-sep, T4: oct-dic)
- **IVA repercutido**: el IVA que tú cobras a tus clientes
- **IVA soportado**: el IVA que tú pagas a tus proveedores
- **Balance IVA**: repercutido - soportado. Si es positivo, pagas a Hacienda
- **Rendimiento neto**: ingresos - gastos = beneficio real del trimestre
- **Modelo 303**: declaración trimestral de IVA
- **Modelo 130**: pago fraccionado de IRPF (20% del rendimiento neto)
- **Retenciones practicadas**: IRPF que tus clientes ya han pagado a Hacienda por ti`,
    eli5: `## Trimestres fiscales para principiantes

Cada 3 meses tienes que decirle a Hacienda cuánto has ganado y cuánto has gastado.

Esta página te lo calcula automáticamente:

**IVA** (lo que cobras vs lo que pagas):
- Has cobrado 2.100€ de IVA en tus facturas
- Has pagado 420€ de IVA en tus gastos
- Diferencia: 1.680€ → esto es lo que pagas a Hacienda

**IRPF** (un adelanto de la renta):
- Has ganado 10.000€
- Has gastado 2.000€ en cosas del trabajo
- Beneficio: 8.000€
- Pagas el 20%: 1.600€
- Pero tus clientes ya te retuvieron 1.500€
- Solo pagas: 100€

Es como hacer un mini-resumen de tu negocio cada 3 meses.`,
  },

  settings: {
    manual: `## Configuración

Tu perfil profesional y datos fiscales.

### Datos personales
- **Nombre completo**: como aparece en tus facturas
- **Nombre comercial**: si usas un nombre diferente al legal
- **NIF/NIE**: tu número de identificación fiscal
- **Dirección, ciudad, CP, provincia**: dirección fiscal (aparece en facturas)
- **Teléfono**: contacto

### Datos fiscales
- **IBAN**: cuenta bancaria donde recibes los pagos
- **Epígrafe IAE**: código de tu actividad económica
- **Fecha de alta**: cuándo te diste de alta como autónomo
- **Cuota de autónomo**: importe mensual que pagas a la Seguridad Social
- **IVA por defecto**: porcentaje que se auto-rellena en facturas nuevas (21% general)
- **IRPF por defecto**: retención que se auto-rellena (15% general, 7% primeros años)

### Importante
Estos datos se usan para auto-rellenar tus facturas. Asegúrate de que son correctos.`,
    glossary: `## Glosario de Configuración

- **NIF**: Número de Identificación Fiscal (DNI + letra)
- **NIE**: Número de Identidad de Extranjero
- **IBAN**: código internacional de tu cuenta bancaria (ES + 22 dígitos)
- **Epígrafe IAE**: código numérico que identifica tu actividad profesional ante Hacienda
- **Cuota de autónomo**: pago mensual a la Seguridad Social (~300€/mes aprox., varía según ingresos)
- **IVA general**: 21% en España
- **IRPF nuevos autónomos**: 7% durante los primeros 2 años, después 15%`,
    eli5: `## Configuración para principiantes

Aquí pones **tus datos personales y de tu negocio**.

Es importante porque estos datos aparecen automáticamente en tus facturas. Si los tienes bien rellenados, hacer una factura es mucho más rápido.

Lo mínimo que deberías rellenar:
- Tu **nombre**
- Tu **NIF** (el número de tu DNI con la letra)
- Tu **dirección**
- Tu **cuenta bancaria** (IBAN) para que los clientes sepan dónde pagarte`,
  },

  admin: {
    manual: `## Panel de administración

Gestión de tareas programadas del sistema (solo administradores).

### Tareas programadas
Acciones automáticas que el sistema ejecuta periódicamente:
- **Revisar facturas vencidas**: detecta facturas cuya fecha de vencimiento ha pasado
- **Revisar tareas fiscales**: avisa de tareas fiscales próximas a vencer
- **Generar resumen trimestral**: calcula automáticamente los totales del trimestre
- **Personalizada**: cualquier otra tarea

### Expresiones cron
Definen cuándo se ejecuta la tarea. Formato: \`minuto hora día-mes mes día-semana\`
- \`0 9 * * 1\` = cada lunes a las 9:00
- \`0 8 1 * *\` = el día 1 de cada mes a las 8:00
- \`0 0 * * *\` = cada día a medianoche

### Historial
Muestra las últimas ejecuciones con su estado (éxito, error, en curso).`,
    glossary: `## Glosario de Administración

- **Tarea programada**: acción que el sistema ejecuta automáticamente en intervalos definidos
- **Expresión cron**: formato estándar para definir cuándo se ejecuta una tarea periódica
- **Estado "filed"**: presentado ante Hacienda
- **Administrador**: usuario con permisos especiales (campo is_admin en su perfil)`,
    eli5: `## Admin para principiantes

Esta sección es solo para el administrador del sistema. Aquí se configuran tareas automáticas, como por ejemplo que la app te avise cuando una factura lleva tiempo sin cobrar.

Si no eres administrador, no verás esta sección.`,
  },
}
