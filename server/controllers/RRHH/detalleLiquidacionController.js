import DetalleLiquidacion from '../../models/RRHH/DetalleLiquidacion.js';

const parsePagination = (req) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  return { limit, page, offset, search };
};

export const getDetallesByLiquidacion = (req, res) => {
  const idliquidacion = parseInt(req.params.idliquidacion, 10);
  const { limit, page, offset, search } = parsePagination(req);

  DetalleLiquidacion.findAllPaginatedFiltered(idliquidacion, limit, offset, search, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener detalles de liquidacion' });

    DetalleLiquidacion.countFiltered(idliquidacion, search, (countErr, total) => {
      if (countErr) return res.status(500).json({ success: false, message: 'Error al contar detalles de liquidacion' });
      res.json({
        success: true,
        data: rows,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    });
  });
};

export const getDetalleLiquidacionById = (req, res) => {
  DetalleLiquidacion.findById(req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener detalle de liquidacion' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Detalle de liquidacion no encontrado' });
    res.json({ success: true, data: rows[0] });
  });
};

export const createDetalleLiquidacion = (req, res) => {
  const data = req.body;
  if (!data.idliquidacion || !data.concepto || !data.tipo || data.monto == null) {
    return res.status(400).json({ success: false, message: 'idliquidacion, concepto, tipo y monto son obligatorios' });
  }

  DetalleLiquidacion.create(data, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear detalle de liquidacion' });
    res.status(201).json({ success: true, message: 'Detalle de liquidacion creado correctamente', iddetalle: result.insertId });
  });
};

export const updateDetalleLiquidacion = (req, res) => {
  DetalleLiquidacion.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar detalle de liquidacion' });
    res.json({ success: true, message: 'Detalle de liquidacion actualizado correctamente' });
  });
};

export const deleteDetalleLiquidacion = (req, res) => {
  DetalleLiquidacion.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar detalle de liquidacion' });
    res.json({ success: true, message: 'Detalle de liquidacion eliminado correctamente' });
  });
};

export const deleteDetallesByLiquidacion = (req, res) => {
  DetalleLiquidacion.deleteByLiquidacion(req.params.idliquidacion, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar detalles de liquidacion' });
    res.json({ success: true, message: 'Detalles de liquidacion eliminados correctamente' });
  });
};
