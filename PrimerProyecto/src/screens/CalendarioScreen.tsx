import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://busan.dvpla.com';

interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  categoria: string;
  color: string;
  recordatorio: boolean;
}

type Vista = 'mes' | 'semana' | 'dia';

export default function CalendarioScreen() {
  const [miId, setMiId] = useState<number | null>(null);
  const [vista, setVista] = useState<Vista>('mes');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [modalNuevoVisible, setModalNuevoVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalColorVisible, setModalColorVisible] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '',
    descripcion: '',
    hora_inicio: '10:00',
    hora_fin: '11:00',
    categoria: 'personal',
    color: '#FF0000',
  });

  const coloresPaleta = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3',
    '#FF1493', '#00CED1', '#FFD700', '#FF69B4', '#87CEEB', '#90EE90', '#FFA500',
    '#FF6347', '#32CD32', '#00BFFF', '#DDA0DD', '#F0E68C', '#20B2AA', '#FF8C00',
    '#DC143C', '#00FA9A', '#1E90FF', '#FFB6C1', '#7FFF00', '#FF4500', '#00FF7F',
    '#8A2BE2', '#FF00FF', '#00ffff', '#ADFF2F', '#FF69B4', '#CD5C5C', '#40E0D0',
  ];

  useEffect(() => {
    cargarMiId();
  }, []);

  useEffect(() => {
    if (miId) {
      cargarEventos();
    }
  }, [miId]);

  const cargarMiId = async () => {
    try {
      const id = await AsyncStorage.getItem('id_usuario');
      if (id) {
        setMiId(Number(id));
      }
    } catch (e) {
      console.log('Error cargando id:', e);
    }
  };

  const cargarEventos = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/server_api/eventos.php?id_usuario=${miId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setEventos(data.eventos || []);
      }
    } catch (e) {
      console.log('Error cargando eventos:', e);
    }
  };

  const crearEvento = async () => {
    if (!nuevoEvento.titulo.trim()) {
      alert('Ingresa un título');
      return;
    }

    try {
      const fechaFormato = fechaSeleccionada.toISOString().split('T')[0];

      const response = await fetch(`${BASE_URL}/server_api/eventos.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: miId,
          titulo: nuevoEvento.titulo,
          descripcion: nuevoEvento.descripcion,
          fecha: fechaFormato,
          hora_inicio: nuevoEvento.hora_inicio,
          hora_fin: nuevoEvento.hora_fin,
          categoria: nuevoEvento.categoria,
          color: nuevoEvento.color,
          recordatorio: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const nuevoEventoCompleto: Evento = {
          id: data.id,
          titulo: nuevoEvento.titulo,
          descripcion: nuevoEvento.descripcion,
          fecha: fechaFormato,
          hora_inicio: nuevoEvento.hora_inicio,
          hora_fin: nuevoEvento.hora_fin,
          categoria: nuevoEvento.categoria,
          color: nuevoEvento.color,
          recordatorio: true,
        };

        setEventos([...eventos, nuevoEventoCompleto]);

        setNuevoEvento({
          titulo: '',
          descripcion: '',
          hora_inicio: '10:00',
          hora_fin: '11:00',
          categoria: 'personal',
          color: '#FF0000',
        });
        setModalNuevoVisible(false);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      console.log('Error creando evento:', e);
      alert('Error al crear evento');
    }
  };

  const actualizarEvento = async () => {
    if (!eventoEditando) return;

    try {
      const response = await fetch(`${BASE_URL}/server_api/eventos.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: eventoEditando.id,
          id_usuario: miId,
          titulo: eventoEditando.titulo,
          descripcion: eventoEditando.descripcion,
          fecha: eventoEditando.fecha,
          hora_inicio: eventoEditando.hora_inicio,
          hora_fin: eventoEditando.hora_fin,
          categoria: eventoEditando.categoria,
          color: eventoEditando.color,
          recordatorio: eventoEditando.recordatorio,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEventos(eventos.map(e => e.id === eventoEditando.id ? eventoEditando : e));
        setModalEditarVisible(false);
        setModalDetalleVisible(false);
        setEventoSeleccionado(eventoEditando);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      console.log('Error actualizando evento:', e);
      alert('Error al actualizar evento');
    }
  };

  const eliminarEvento = async (id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/server_api/eventos.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, id_usuario: miId }),
      });

      const data = await response.json();
      if (data.success) {
        setEventos(eventos.filter(e => e.id !== id));
        setModalDetalleVisible(false);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      console.log('Error eliminando evento:', e);
      alert('Error al eliminar evento');
    }
  };

  const getDiasDelMes = () => {
    const año = fechaSeleccionada.getFullYear();
    const mes = fechaSeleccionada.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    let diasVacios = primerDia.getDay() - 1;
    if (diasVacios === -1) diasVacios = 6;
    const diasDelMes = ultimoDia.getDate();

    const dias = [];
    for (let i = 0; i < diasVacios; i++) {
      dias.push(null);
    }
    for (let i = 1; i <= diasDelMes; i++) {
      dias.push(i);
    }
    return dias;
  };

  const getEventosDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return eventos.filter(e => e.fecha === fechaStr);
  };

  const VistaMenual = () => {
    const dias = getDiasDelMes();
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];

    return (
      <View style={styles.container}>
        <View style={styles.headerMes}>
          <TouchableOpacity onPress={() => setFechaSeleccionada(new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() - 1))}>
            <Text style={styles.botonNav}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.tituloMes}>
            {nombresMeses[fechaSeleccionada.getMonth()]} {fechaSeleccionada.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => setFechaSeleccionada(new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1))}>
            <Text style={styles.botonNav}>▶</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridDias}>
          {nombresDias.map(dia => (
            <Text key={dia} style={styles.nombreDia}>{dia}</Text>
          ))}
        </View>

        <View style={styles.gridMes}>
          {dias.map((dia, index) => {
            if (dia === null) {
              return <View key={`vacio-${index}`} style={styles.diaVacio} />;
            }

            const fecha = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), dia);
            const eventosDelDia = getEventosDia(fecha);
            const esHoy = new Date().toDateString() === fecha.toDateString();

            return (
              <TouchableOpacity
                key={dia}
                style={[
                  styles.dia,
                  esHoy && styles.diaHoy,
                ]}
                onPress={() => {
                  setFechaSeleccionada(fecha);
                  setVista('dia');
                }}
              >
                <Text style={[styles.numeroDia, esHoy && styles.numeroHoy]}>{dia}</Text>
                {eventosDelDia.length > 0 && (
                  <View style={styles.puntosEventos}>
                    {eventosDelDia.slice(0, 2).map((e, i) => (
                      <View key={i} style={[styles.punto, { backgroundColor: e.color }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const VistaSemanal = () => {
    const diasSemana = [];
    const hoy = new Date(fechaSeleccionada);
    const primerDia = new Date(hoy);
    let diaSemana = hoy.getDay();
    let diasAtras = diaSemana === 0 ? 6 : diaSemana - 1;
    primerDia.setDate(hoy.getDate() - diasAtras);

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(primerDia);
      fecha.setDate(primerDia.getDate() + i);
      diasSemana.push(fecha);
    }

    const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];

    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerSemana}>
          <TouchableOpacity onPress={() => setFechaSeleccionada(new Date(fechaSeleccionada.getTime() - 7 * 24 * 60 * 60 * 1000))}>
            <Text style={styles.botonNav}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.tituloSemana}>Semana</Text>
          <TouchableOpacity onPress={() => setFechaSeleccionada(new Date(fechaSeleccionada.getTime() + 7 * 24 * 60 * 60 * 1000))}>
            <Text style={styles.botonNav}>▶</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasSemana}>
          {diasSemana.map((fecha, index) => {
            const esHoy = new Date().toDateString() === fecha.toDateString();
            const eventosDelDia = getEventosDia(fecha);
            const diaDelDomingo = fecha.getDay();
            const diaActual = diaDelDomingo === 0 ? 6 : diaDelDomingo - 1;

            return (
              <TouchableOpacity
                key={index}
                style={[styles.diaSemana, esHoy && styles.diaSemanaHoy]}
                onPress={() => {
                  setFechaSeleccionada(fecha);
                  setVista('dia');
                }}
              >
                <Text style={styles.nombreDiaSemana}>{nombresDias[diaActual]}</Text>
                <Text style={[styles.numeroDiaSemana, esHoy && styles.numeroHoy]}>
                  {fecha.getDate()}
                </Text>
                {eventosDelDia.length > 0 && (
                  <Text style={styles.contadorEventos}>{eventosDelDia.length}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.resumenSemana}>
          {diasSemana.map((fecha, index) => {
            const eventosDelDia = getEventosDia(fecha);
            const diaDelDomingo = fecha.getDay();
            const diaActual = diaDelDomingo === 0 ? 6 : diaDelDomingo - 1;
            const nombresDiasCompletos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];

            return (
              <View key={index} style={styles.diaResumen}>
                <Text style={styles.nombreDiaResumen}>
                  {nombresDiasCompletos[diaActual]} {fecha.getDate()}
                </Text>
                {eventosDelDia.length === 0 ? (
                  <Text style={styles.sinEventos}>Sin eventos</Text>
                ) : (
                  eventosDelDia.map(evento => (
                    <TouchableOpacity
                      key={evento.id}
                      style={[styles.eventoResumen, { borderLeftColor: evento.color }]}
                      onPress={() => {
                        setEventoSeleccionado(evento);
                        setModalDetalleVisible(true);
                      }}
                    >
                      <Text style={styles.tituloEventoResumen}>{evento.titulo}</Text>
                      <Text style={styles.horaEventoResumen}>
                        {evento.hora_inicio} - {evento.hora_fin}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const VistaDiaria = () => {
    const eventosDelDia = getEventosDia(fechaSeleccionada).sort((a, b) => 
      a.hora_inicio.localeCompare(b.hora_inicio)
    );

    const horas = Array.from({ length: 24 }, (_, i) => 
      `${String(i).padStart(2, '0')}:00`
    );

    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerDia}>
          <TouchableOpacity onPress={() => setFechaSeleccionada(new Date(fechaSeleccionada.getTime() - 24 * 60 * 60 * 1000))}>
            <Text style={styles.botonNav}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.tituloDia}>
            {fechaSeleccionada.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => setFechaSeleccionada(new Date(fechaSeleccionada.getTime() + 24 * 60 * 60 * 1000))}>
            <Text style={styles.botonNav}>▶</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linea} />

        {horas.map((hora, index) => {
          const eventosHora = eventosDelDia.filter(e => e.hora_inicio.startsWith(String(index).padStart(2, '0')));

          return (
            <View key={hora} style={styles.filaHora}>
              <Text style={styles.hora}>{hora}</Text>
              <View style={styles.contenedorEventosHora}>
                {eventosHora.map(evento => (
                  <TouchableOpacity
                    key={evento.id}
                    style={[styles.eventoHora, { backgroundColor: evento.color + '20', borderLeftColor: evento.color }]}
                    onPress={() => {
                      setEventoSeleccionado(evento);
                      setModalDetalleVisible(true);
                    }}
                  >
                    <Text style={styles.tituloEventoHora}>{evento.titulo}</Text>
                    <Text style={styles.horaEventoHora}>
                      {evento.hora_inicio} - {evento.hora_fin}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.pantalla}>
      <View style={styles.botonesVista}>
        <TouchableOpacity
          style={[styles.botonVista, vista === 'mes' && styles.botonVistaActivo]}
          onPress={() => setVista('mes')}
        >
          <Text style={[styles.textoBotonVista, vista === 'mes' && styles.textoActivo]}>Mes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botonVista, vista === 'semana' && styles.botonVistaActivo]}
          onPress={() => setVista('semana')}
        >
          <Text style={[styles.textoBotonVista, vista === 'semana' && styles.textoActivo]}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botonVista, vista === 'dia' && styles.botonVistaActivo]}
          onPress={() => setVista('dia')}
        >
          <Text style={[styles.textoBotonVista, vista === 'dia' && styles.textoActivo]}>Día</Text>
        </TouchableOpacity>
      </View>

      {vista === 'mes' && <VistaMenual />}
      {vista === 'semana' && <VistaSemanal />}
      {vista === 'dia' && <VistaDiaria />}

      <TouchableOpacity
        style={styles.botonFlotante}
        onPress={() => setModalNuevoVisible(true)}
      >
        <Text style={styles.textoBotonFlotante}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalNuevoVisible}
        onRequestClose={() => setModalNuevoVisible(false)}
      >
        <View style={styles.centroModal}>
          <View style={styles.modal}>
            <Text style={styles.tituloModal}>Nuevo Evento</Text>

            <TextInput
              style={styles.input}
              placeholder="Título"
              value={nuevoEvento.titulo}
              onChangeText={(text) => setNuevoEvento({ ...nuevoEvento, titulo: text })}
            />

            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              placeholder="Descripción"
              value={nuevoEvento.descripcion}
              onChangeText={(text) => setNuevoEvento({ ...nuevoEvento, descripcion: text })}
              multiline
            />

            <View style={styles.filaHoras}>
              <View style={styles.columnaHora}>
                <Text style={styles.labelHora}>Inicio</Text>
                <TextInput
                  style={styles.inputHora}
                  placeholder="10:00"
                  value={nuevoEvento.hora_inicio}
                  onChangeText={(text) => setNuevoEvento({ ...nuevoEvento, hora_inicio: text })}
                />
              </View>
              <View style={styles.columnaHora}>
                <Text style={styles.labelHora}>Fin</Text>
                <TextInput
                  style={styles.inputHora}
                  placeholder="11:00"
                  value={nuevoEvento.hora_fin}
                  onChangeText={(text) => setNuevoEvento({ ...nuevoEvento, hora_fin: text })}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.selectorColor, { backgroundColor: nuevoEvento.color }]}
              onPress={() => setModalColorVisible(true)}
            >
              <Text style={styles.textoSelectorColor}>Seleccionar Color</Text>
            </TouchableOpacity>

            <View style={styles.filaBotones}>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => setModalNuevoVisible(false)}
              >
                <Text style={styles.textoBotonCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonGuardar}
                onPress={crearEvento}
              >
                <Text style={styles.textoBotonGuardar}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalColorVisible}
        onRequestClose={() => setModalColorVisible(false)}
      >
        <View style={styles.centroModal}>
          <View style={styles.modalColor}>
            <View style={styles.headerColor}>
              <TouchableOpacity onPress={() => setModalColorVisible(false)}>
                <Text style={styles.botonCerrarColor}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.tituloModalColor}>Paleta de Colores</Text>
              <View style={{ width: 30 }} />
            </View>

            <ScrollView style={styles.contenidoColor}>
              <View style={styles.gridColores}>
                {coloresPaleta.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorBox,
                      { backgroundColor: color },
                      nuevoEvento.color === color && styles.colorBoxSeleccionado,
                    ]}
                    onPress={() => {
                      setNuevoEvento({ ...nuevoEvento, color });
                      setModalColorVisible(false);
                    }}
                  >
                    {nuevoEvento.color === color && (
                      <Text style={styles.checkmarkColor}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDetalleVisible}
        onRequestClose={() => setModalDetalleVisible(false)}
      >
        <View style={styles.centroModal}>
          <View style={[styles.modalDetalle, { borderTopColor: eventoSeleccionado?.color }]}>
            <View style={styles.headerDetalle}>
              <TouchableOpacity onPress={() => setModalDetalleVisible(false)}>
                <Text style={styles.botonCerrar}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.tituloDetalle}>{eventoSeleccionado?.titulo}</Text>
              <View style={{ width: 30 }} />
            </View>

            <ScrollView style={styles.contenidoDetalle}>
              <View style={styles.seccion}>
                <Text style={styles.etiqueta}>Fecha</Text>
                <Text style={styles.valor}>
                  {eventoSeleccionado && new Date(eventoSeleccionado.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              <View style={styles.seccion}>
                <Text style={styles.etiqueta}>Hora</Text>
                <Text style={styles.valor}>
                  {eventoSeleccionado?.hora_inicio} - {eventoSeleccionado?.hora_fin}
                </Text>
              </View>

              <View style={styles.seccion}>
                <Text style={styles.etiqueta}>Categoría</Text>
                <Text style={styles.valor}>{eventoSeleccionado?.categoria}</Text>
              </View>

              {eventoSeleccionado?.descripcion && (
                <View style={styles.seccion}>
                  <Text style={styles.etiqueta}>Descripción</Text>
                  <Text style={styles.valor}>{eventoSeleccionado.descripcion}</Text>
                </View>
              )}

              <View style={styles.seccion}>
                <Text style={styles.etiqueta}>Recordatorio</Text>
                <Text style={styles.valor}>
                  {eventoSeleccionado?.recordatorio ? '✓ Activado' : '✗ Desactivado'}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.botonesDetalle}>
              <TouchableOpacity
                style={styles.botonEditar}
                onPress={() => {
                  if (eventoSeleccionado) {
                    setEventoEditando(eventoSeleccionado);
                    setModalEditarVisible(true);
                  }
                }}
              >
                <Text style={styles.textoBoton}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonEliminar}
                onPress={() => {
                  if (eventoSeleccionado) {
                    eliminarEvento(eventoSeleccionado.id);
                  }
                }}
              >
                <Text style={styles.textoBotonEliminar}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalEditarVisible}
        onRequestClose={() => setModalEditarVisible(false)}
      >
        <View style={styles.centroModal}>
          <View style={styles.modal}>
            <Text style={styles.tituloModal}>Editar Evento</Text>

            <TextInput
              style={styles.input}
              placeholder="Título"
              value={eventoEditando?.titulo || ''}
              onChangeText={(text) => setEventoEditando(eventoEditando ? { ...eventoEditando, titulo: text } : null)}
            />

            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              placeholder="Descripción"
              value={eventoEditando?.descripcion || ''}
              onChangeText={(text) => setEventoEditando(eventoEditando ? { ...eventoEditando, descripcion: text } : null)}
              multiline
            />

            <View style={styles.filaHoras}>
              <View style={styles.columnaHora}>
                <Text style={styles.labelHora}>Inicio</Text>
                <TextInput
                  style={styles.inputHora}
                  placeholder="10:00"
                  value={eventoEditando?.hora_inicio || ''}
                  onChangeText={(text) => setEventoEditando(eventoEditando ? { ...eventoEditando, hora_inicio: text } : null)}
                />
              </View>
              <View style={styles.columnaHora}>
                <Text style={styles.labelHora}>Fin</Text>
                <TextInput
                  style={styles.inputHora}
                  placeholder="11:00"
                  value={eventoEditando?.hora_fin || ''}
                  onChangeText={(text) => setEventoEditando(eventoEditando ? { ...eventoEditando, hora_fin: text } : null)}
                />
              </View>
            </View>

            <View style={styles.filaBotones}>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => setModalEditarVisible(false)}
              >
                <Text style={styles.textoBotonCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonGuardar}
                onPress={actualizarEvento}
              >
                <Text style={styles.textoBotonGuardar}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#f5f5f5' },
  botonesVista: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  botonVista: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#f0f0f0' },
  botonVistaActivo: { backgroundColor: '#007AFF' },
  textoBotonVista: { color: '#666', fontWeight: '600' },
  textoActivo: { color: '#fff' },
  container: { flex: 1, padding: 10 },
  headerMes: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  tituloMes: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  botonNav: { fontSize: 20, color: '#007AFF', paddingHorizontal: 15 },
  gridDias: { flexDirection: 'row', marginBottom: 10 },
  nombreDia: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#666', paddingVertical: 5 },
  gridMes: { flexDirection: 'row', flexWrap: 'wrap' },
  dia: { width: '14.28%', aspectRatio: 1, borderWidth: 1, borderColor: '#e0e0e0', padding: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  diaVacio: { width: '14.28%', aspectRatio: 1 },
  diaHoy: { backgroundColor: '#E3F2FD', borderColor: '#007AFF', borderWidth: 2 },
  numeroDia: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  numeroHoy: { color: '#007AFF' },
  puntosEventos: { flexDirection: 'row', marginTop: 3 },
  punto: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 1 },
  headerSemana: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tituloSemana: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  diasSemana: { marginBottom: 20 },
  diaSemana: { width: 80, marginRight: 10, padding: 10, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
  diaSemanaHoy: { backgroundColor: '#E3F2FD', borderColor: '#007AFF', borderWidth: 2 },
  nombreDiaSemana: { fontSize: 12, color: '#666', marginBottom: 5 },
  numeroDiaSemana: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  contadorEventos: { fontSize: 12, color: '#007AFF', fontWeight: 'bold' },
  resumenSemana: { marginTop: 10 },
  diaResumen: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  nombreDiaResumen: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  sinEventos: { color: '#999', fontSize: 12, fontStyle: 'italic' },
  eventoResumen: { backgroundColor: '#f9f9f9', padding: 10, marginBottom: 8, borderRadius: 5, borderLeftWidth: 3 },
  tituloEventoResumen: { fontSize: 13, fontWeight: '600', color: '#333' },
  horaEventoResumen: { fontSize: 11, color: '#666', marginTop: 3 },
  headerDia: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tituloDia: { fontSize: 16, fontWeight: 'bold', color: '#333', textTransform: 'capitalize' },
  linea: { height: 1, backgroundColor: '#e0e0e0', marginBottom: 10 },
  filaHora: { flexDirection: 'row', marginBottom: 5 },
  hora: { width: 50, fontSize: 12, color: '#999', paddingVertical: 5 },
  contenedorEventosHora: { flex: 1, paddingLeft: 10 },
  eventoHora: { padding: 10, marginBottom: 5, borderRadius: 5, borderLeftWidth: 4 },
  tituloEventoHora: { fontSize: 13, fontWeight: '600', color: '#333' },
  horaEventoHora: { fontSize: 11, color: '#666', marginTop: 3 },
  botonFlotante: { position: 'absolute', bottom: 100, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 },
  textoBotonFlotante: { fontSize: 30, color: '#fff', fontWeight: 'bold' },
  centroModal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30 },
  tituloModal: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  inputMultilinea: { height: 80, textAlignVertical: 'top' },
  filaHoras: { flexDirection: 'row', marginBottom: 15 },
  columnaHora: { flex: 1, marginRight: 10 },
  labelHora: { fontSize: 12, color: '#666', marginBottom: 5, fontWeight: '600' },
  inputHora: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, fontSize: 14 },
  filaBotones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  botonCancelar: { flex: 1, paddingVertical: 12, marginRight: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  textoBotonCancelar: { color: '#666', fontWeight: '600' },
  botonGuardar: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#007AFF', alignItems: 'center' },
  textoBotonGuardar: { color: '#fff', fontWeight: '600' },
  selectorColor: { padding: 12, borderRadius: 8, marginBottom: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e0e0e0' },
  textoSelectorColor: { color: '#fff', fontWeight: '600', fontSize: 14, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  modalColor: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, flex: 0.7, marginTop: 'auto' },
  headerColor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tituloModalColor: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
  botonCerrarColor: { fontSize: 24, color: '#999', fontWeight: 'bold' },
  contenidoColor: { padding: 15 },
  gridColores: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  colorBox: { width: '23%', aspectRatio: 1, borderRadius: 10, margin: '1%', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  colorBoxSeleccionado: { borderWidth: 3, borderColor: '#333' },
  checkmarkColor: { fontSize: 24, color: '#fff', fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  modalDetalle: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 4, flex: 0.9, marginTop: 'auto' },
  headerDetalle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  botonCerrar: { fontSize: 24, color: '#999', fontWeight: 'bold' },
  tituloDetalle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
  contenidoDetalle: { padding: 20 },
  seccion: { backgroundColor: '#f9f9f9', padding: 15, marginBottom: 10, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  etiqueta: { fontSize: 12, color: '#999', fontWeight: '600', marginBottom: 5, textTransform: 'uppercase' },
  valor: { fontSize: 16, color: '#333', fontWeight: '500' },
  botonesDetalle: { flexDirection: 'row', padding: 20, gap: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  botonEditar: { flex: 1, paddingVertical: 12, backgroundColor: '#007AFF', borderRadius: 8, alignItems: 'center' },
  botonEliminar: { flex: 1, paddingVertical: 12, backgroundColor: '#FF3B30', borderRadius: 8, alignItems: 'center' },
  textoBoton: { color: '#fff', fontWeight: '600', fontSize: 14 },
  textoBotonEliminar: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
