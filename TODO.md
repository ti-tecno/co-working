# TODO - Corrección de desfase de fecha en calendario de reservas

- [x] Revisar `frontend/src/pages/Reservar.jsx` para identificar causa del desfase de día.
- [x] Revisar `backend/src/controllers/reservationController.js` para descartar origen en backend.
- [x] Corregir comparación de fechas en `Reservar.jsx` evitando `toISOString()` para `reservation_date`.
- [x] Revisar otras vistas (ej. `MisReservas.jsx`) para el mismo patrón de parseo de fecha.
- [ ] Validar flujo completo: crear reserva y confirmar que aparece en el mismo día en calendario.
