import db from '../../db.js';
import { createVenta } from './CrearVenta.js';
import { sendVentaProgramadaEmail } from "../../services/emailService.js";
import { getClienteData } from "./helpers/clienteRepo.js";
import { obtenerPrecioVenta, obtenerPrecioCompra, obtenerNombreProducto, obtenerUnidadMedida, obtenerIVA } from '../Ventas/helpers/productHelpers.js';
import VentasProgramadas from '../../models/Venta/ventasProgramadasModel.js';

const procesarVentasProgramadas = async () => {

  const fechaLocalISO = (tz = "America/Asuncion") => {
    const f = new Intl.DateTimeFormat("sv-SE", { // sv-SE => yyyy-mm-dd
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    return f; // "2025-07-27"
  };

  const today = new Date();
  const todayDay = today.getDate();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  try {
    // Obtener todas las ventas programadas activas agrupadas por usuario
    const [ventas] = await db.promise().query(`
      SELECT vp.*, u.idusuarios
      FROM ventas_programadas vp
      LEFT JOIN usuarios u ON vp.idusuario = u.idusuarios
      WHERE vp.estado = 'activa' AND vp.deleted_at IS NULL
    `);

    console.log(`📅 Procesando ${ventas.length} ventas programadas activas...`);

    for (const vp of ventas) {
      // Obtener el último día del mes actual
      const lastDayOfMonth = new Date(thisYear, thisMonth + 1, 0).getDate();

      // Ajustar el día programado si no existe en el mes actual
      // Ejemplo: Si dia_programado = 31 pero estamos en febrero (28/29 días),
      // diaProgramadoAjustado = 28/29 (el último día de febrero)
      const diaProgramadoAjustado = Math.min(vp.dia_programado, lastDayOfMonth);

      const ultimaVenta = vp.ultima_fecha_venta ? new Date(vp.ultima_fecha_venta) : null;
      const yaGeneradaEsteMes =
        ultimaVenta &&
        ultimaVenta.getMonth() === thisMonth &&
        ultimaVenta.getFullYear() === thisYear;

      if (todayDay >= diaProgramadoAjustado && !yaGeneradaEsteMes) {

        const precioVenta = parseFloat(await obtenerPrecioVenta(vp.idproducto));
        const total = parseFloat(vp.cantidad) * precioVenta;
        const cli = await getClienteData(vp.idcliente);

        const clienteInfo = {
          id: vp.idcliente,
          nombre: cli ? `${cli.nombre} ${cli.apellido}` : "(desconocido)",
          documento: cli?.numDocumento ?? "-",
        };

        const detalles = [
          {
            idproducto: vp.idproducto,
            cantidad: vp.cantidad,
            precio_venta: await obtenerPrecioVenta(vp.idproducto),
            precio_compra: await obtenerPrecioCompra(vp.idproducto),
            fecha_vencimiento: "",
            nombre_producto: await obtenerNombreProducto(vp.idproducto),
            unidad_medida: await obtenerUnidadMedida(vp.idproducto),
            iva: await obtenerIVA(vp.idproducto),
            
            descuento: 0
          },
        ];

        const ventaPayload = {
          venta: {
            idcliente: vp.idcliente,
            fecha: fechaLocalISO(),
            tipo: "credito",
            tipo_comprobante: "T",
            nro_factura: "",
            estado: "pendiente",
            total_descuento: 0,
            observacion: vp.observacion || "",
            idformapago: null,
            datos_bancarios: null, 
            fecha_vencimiento: "", 
            total,
          },
          detalles,
          sistema_venta_por_lote: false,
          tipoDescuento: 'sin_descuento',
        };

        let ventaResp = null;
        const fakeReq = {
          body: ventaPayload,
          user: { idusuario: vp.idusuario || 1 },
        };
        const fakeRes = {
          status: (code) => ({
            json: (data) => {
              ventaResp = data;
            },
          }),
        };

        await createVenta(fakeReq, fakeRes);

        await db
          .promise()
          .query(
            `UPDATE ventas_programadas
             SET ultima_fecha_venta = CURDATE()
             WHERE idprogramacion = ?`,
            [vp.idprogramacion]
          );

        // Enviar email usando la configuración del usuario
        if (vp.idusuarios) {
          try {
            console.log(`📧 Intentando enviar email a usuario ${vp.idusuarios}...`);

            const emailResult = await sendVentaProgramadaEmail(vp.idusuarios, {
              idprogramacion: vp.idprogramacion,
              ventaId: ventaResp?.idventa ?? "(desconocido)",
              total,
              cliente: clienteInfo,
              fecha: ventaPayload.venta.fecha,
              detalles,
            });

            if (emailResult.success) {
              console.log(`✅ Email enviado exitosamente a usuario ${vp.idusuarios}`);
            } else {
              console.log(`ℹ️ Email no enviado: ${emailResult.message || emailResult.error}`);
            }
          } catch (e) {
            console.error(`❌ Error enviando email a usuario ${vp.idusuarios}:`, e.message);
          }
        } else {
          console.log(`⚠️ Venta programada ${vp.idprogramacion} no tiene usuario asociado, no se envió email`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error al procesar ventas programadas:", error);
  }
};

export default procesarVentasProgramadas;