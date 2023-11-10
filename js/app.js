/* DOM */
const contenedor = document.querySelector(".contenedor");
const selectCursos = document.querySelector("#tipo-curso");
const selectDias = document.querySelector("#dia");
const nombre = document.querySelector("#nombre");
const inicioHora = document.querySelector("#hora-inicio");
const finHora = document.querySelector("#hora-fin");
const insertar = document.querySelector("#insertar");
const panel = document.querySelector(".panel");
const resetear = document.querySelector("#resetear");

/* Cursos */
let cursos = [];

let cursoInfo = {
  nombre: "",
  dia: "",
  horaInicio: "",
  horaFin: "",
  tipo: "",
};

/* arrays */
const tiposCursos = [
  "Sincronico",
  "Asincronico",
  "Revisión de Cuaderno",
  "Horas de Preparación",
  "Labores de Instrucción",
];

const diasHorario = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

/* Varibles Importantes */
const horas = getTimeRanges("7:30am", "9:00pm");

document.addEventListener("DOMContentLoaded", () => {
  crearHorario();
  crearEstadisticas();
  timepicker();
  crearSelects(tiposCursos, selectCursos);
  crearSelects(diasHorario, selectDias);

  /* Eventos */
  nombre.addEventListener("blur", (e) => {
    let texto = e.target.value;
    if (texto === "") {
      return;
    }
    const palabras = texto.split(" ");
    texto = palabras
      .map((palabra) => {
        return palabra[0].toUpperCase() + palabra.substring(1);
      })
      .join(" ");

    cursoInfo.nombre = texto.trim();
  });

  selectDias.addEventListener("change", (e) => {
    let texto = e.target.value;
    if (texto === "") {
      return;
    }
    cursoInfo.dia = texto;
  });

  inicioHora.addEventListener("blur", (e) => {
    let texto = e.target.value;
    if (texto === "") {
      return;
    }
    cursoInfo.horaInicio = texto;
  });

  finHora.addEventListener("blur", (e) => {
    let texto = e.target.value;
    if (texto === "") {
      return;
    }
    cursoInfo.horaFin = texto;
  });

  selectCursos.addEventListener("change", (e) => {
    let texto = e.target.value;
    if (texto === "") {
      return;
    }
    cursoInfo.tipo = texto;
  });

  insertar.addEventListener("click", validar);
  resetear.addEventListener("click", () => {
    console.log("si");
    reiniciarPanel();
    cursos = [];
    borrarTablas();
    crearHorario();
    crearEstadisticas();
  });
});
/* Funciones */
function validar(e) {
  /* comprobar si los campos estan vacios*/
  e.preventDefault();
  const values = Object.values(cursoInfo);
  const empty = values.some((value) => {
    return value === "";
  });

  if (empty) {
    crearAdvertencia("Todos los campos son obligatorios", panel);
    return;
  }

  /* comprobar si las horas son validas */
  const { horaInicio, horaFin } = cursoInfo;
  if (validarHoras(horaInicio, horaFin)) {
    crearAdvertencia("Horas incorrectas, intente de nuevo", panel);
    return;
  }

  /* comprobar si el curso ya existe */
  if (!puedeInsertarCurso(cursos, cursoInfo)) {
    crearAdvertencia("Las horas ya estan ocupadas en el horario", panel);
    return;
  }

  asignarCurso();
}

function asignarCurso() {
  cursos.push(cursoInfo);
  reiniciarPanel();
  borrarTablas();
  crearHorario();
  crearEstadisticas();
}

function reiniciarPanel() {
  cursoInfo = {
    nombre: "",
    dia: "",
    horaInicio: "",
    horaFin: "",
    tipo: "",
  };
  nombre.value = "";
  inicioHora.value = "";
  finHora.value = "";
  selectCursos.value = "";
  selectDias.value = "";
}
function timepicker() {
  $(".timepicker").timepicker({
    step: 15,
    minTime: "7:30am",
    maxTime: "9:00pm",
    forceRoundTime: true,
  });

  $(window).on("scroll", function () {
    $(".timepicker").timepicker("hide");
  });
}

function crearSelects(array, lugar) {
  array.forEach((e) => {
    const option = document.createElement("option");
    option.textContent = e;
    option.value = e;
    lugar.appendChild(option);
  });
}

function crearAdvertencia(texto, lugar) {
  const div = document.createElement("div");
  const p = document.createElement("p");
  p.textContent = texto;
  div.appendChild(p);
  div.classList.add("error");
  lugar.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 3500);
}

function getTimeRanges(startTime, endTime) {
  let start = moment(startTime, "h:mma");
  let end = moment(endTime, "h:mma");

  if (start >= end) {
    return false;
  }

  let timeRanges = [];

  while (start < end) {
    const nextTime = moment(start).add(15, "minutes");
    const range = start.format("h:mma") + " - " + nextTime.format("h:mma");
    timeRanges.push(range);
    start = nextTime;
  }

  return timeRanges;
}

/* Crear horario */
function crearHorario() {
  // Crear la tabla
  let tabla = document.createElement("table");
  tabla.classList.add("horario");
  const columnas = ["Hora", ...diasHorario];
  // Crear la fila de encabezado
  let encabezado = document.createElement("tr");
  for (let dia of columnas) {
    let th = document.createElement("th");
    th.textContent = dia;
    th.classList.add("color-azul");
    encabezado.appendChild(th);
  }
  tabla.appendChild(encabezado);
  // ...

  for (let i = 0; i < horas.length; i++) {
    const horaCelda = horas[i];
    const fila = document.createElement("tr");
    for (const dia of columnas) {
      if (dia === "Hora") {
        const celda = document.createElement("td");
        celda.textContent = horaCelda;
        fila.appendChild(celda);
      } else {
        let cursoEnCelda = false;
        for (const curso of cursos) {
          if (curso.dia === dia) {
            const indiceHoraInicio = horas.findIndex(
              (hora) => hora.split(" - ")[0] === curso.horaInicio
            );
            let indiceHoraFin = horas.findIndex(
              (hora) => hora.split(" - ")[1] === curso.horaFin
            );
            if (indiceHoraFin === -1) {
              indiceHoraFin = horas.length;
            }
            if (i >= indiceHoraInicio && i <= indiceHoraFin) {
              cursoEnCelda = true;
              if (i === indiceHoraInicio) {
                const celda = document.createElement("td");
                celda.textContent = curso.nombre;
                celda.rowSpan = indiceHoraFin - indiceHoraInicio + 1;
                fila.appendChild(celda);
              }
            }
          }
        }
        if (!cursoEnCelda) {
          const celda = document.createElement("td");
          fila.appendChild(celda);
        }
      }
    }
    tabla.appendChild(fila);
  }

  // ...

  // Agregar la tabla al documento
  contenedor.appendChild(tabla);
}

function validarHoras(inicio, fin) {
  let start = moment(inicio, "h:mma");
  let end = moment(fin, "h:mma");

  if (!start.isValid() || !end.isValid()) {
    return true;
  }

  if (start >= end) {
    return true;
  }

  return false;
}
function puedeInsertarCurso(cursos, nuevoCurso) {
  for (const curso of cursos) {
    if (curso.dia === nuevoCurso.dia) {
      const indiceHoraInicioCurso = horas.findIndex(
        (hora) => hora.split(" - ")[0] === curso.horaInicio
      );
      let indiceHoraFinCurso = horas.findIndex(
        (hora) => hora.split(" - ")[1] === curso.horaFin
      );
      if (indiceHoraFinCurso === -1) {
        indiceHoraFinCurso = horas.length;
      }

      const indiceHoraInicioNuevo = horas.findIndex(
        (hora) => hora.split(" - ")[0] === nuevoCurso.horaInicio
      );
      let indiceHoraFinNuevo = horas.findIndex(
        (hora) => hora.split(" - ")[1] === nuevoCurso.horaFin
      );
      if (indiceHoraFinNuevo === -1) {
        indiceHoraFinNuevo = horas.length;
      }

      if (
        (indiceHoraInicioNuevo >= indiceHoraInicioCurso &&
          indiceHoraInicioNuevo < indiceHoraFinCurso) ||
        (indiceHoraFinNuevo > indiceHoraInicioCurso &&
          indiceHoraFinNuevo <= indiceHoraFinCurso)
      ) {
        return false;
      }
    }
  }
  return true;
}

function borrarTablas() {
  document.querySelectorAll("table").forEach((table) => {
    table.remove();
  });
}

function crearEstadisticas() {
  // Crear un nuevo array para los encabezados de la tabla
  let encabezados = ["Tipo"].concat(diasHorario);

  // Crear la tabla
  let tabla = document.createElement("table");
  tabla.classList.add("estadisticas");

  // Crear la fila de encabezado
  let encabezado = document.createElement("tr");
  for (let dia of encabezados) {
    let th = document.createElement("th");
    th.textContent = dia;
    th.classList.add("color-azul");
    encabezado.appendChild(th);
  }
  tabla.appendChild(encabezado);

  // Crear las filas de tipos
  for (let tipo of tiposCursos) {
    let fila = document.createElement("tr");
    for (let i = 0; i < encabezados.length; i++) {
      let td = document.createElement("td");
      if (i === 0) {
        td.textContent = tipo; // Primera columna: tipo
      } else {
        td.textContent = "00:00:00"; // Resto de las columnas: inicializar a '00:00:00'
      }
      fila.appendChild(td);
    }
    tabla.appendChild(fila);
  }

  // Añadir una fila para el total
  let filaTotal = document.createElement("tr");
  for (let i = 0; i < encabezados.length; i++) {
    let td = document.createElement("td");
    if (i === 0) {
      td.textContent = "Total"; // Primera columna: 'Total'
    } else {
      td.textContent = "00:00:00"; // Resto de las columnas: inicializar a '00:00:00'
    }
    filaTotal.appendChild(td);
  }
  tabla.appendChild(filaTotal);

  // Llenar las celdas con los datos de los cursos
  for (let curso of cursos) {
    let columnaDia = encabezados.indexOf(curso.dia);
    let filaTipo = tiposCursos.indexOf(curso.tipo) + 1; // +1 porque la primera fila es el encabezado
    let celda = tabla.rows[filaTipo].cells[columnaDia];
    let duracionCurso = moment(curso.horaFin, "h:mma").diff(
      moment(curso.horaInicio, "h:mma"),
      "seconds"
    );
    let duracionActual = moment.duration(celda.textContent).asSeconds();
    let nuevaDuracion = moment.duration(
      duracionActual + duracionCurso,
      "seconds"
    );
    celda.textContent = formatDuration(nuevaDuracion);

    // Actualizar el total para el día
    let celdaTotal = tabla.rows[tabla.rows.length - 1].cells[columnaDia];
    let duracionTotalActual = moment
      .duration(celdaTotal.textContent)
      .asSeconds();
    let nuevaDuracionTotal = moment.duration(
      duracionTotalActual + duracionCurso,
      "seconds"
    );
    celdaTotal.textContent = formatDuration(nuevaDuracionTotal);
  }

  // Calcular el total máximo
  let totalMaximo = 0;
  let totalesPorDia = Array(encabezados.length).fill(0);
  for (let i = 1; i < encabezados.length; i++) {
    // Empezar en 1 para saltar la columna 'Tipo'
    let celdaTotal = tabla.rows[tabla.rows.length - 1].cells[i];
    let duracionTotal = moment.duration(celdaTotal.textContent).asSeconds();
    totalesPorDia[i] = duracionTotal;
  }
  totalMaximo = totalesPorDia.reduce((a, b) => a + b, 0);

  // Crear una nueva fila para el total máximo
  let filaTotalMaximo = document.createElement("tr");
  let celdaTotalMaximo = document.createElement("td");
  celdaTotalMaximo.colSpan = encabezados.length; // Hacer que la celda ocupe toda la columna
  celdaTotalMaximo.textContent = formatDuration(
    moment.duration(totalMaximo, "seconds")
  );
  filaTotalMaximo.appendChild(celdaTotalMaximo);
  tabla.appendChild(filaTotalMaximo);

  // Añadir la tabla al cuerpo del documento
  contenedor.appendChild(tabla);
}

function formatDuration(duracion) {
  let horas = duracion.hours().toString().padStart(2, "0");
  let minutos = duracion.minutes().toString().padStart(2, "0");
  let segundos = duracion.seconds().toString().padStart(2, "0");
  return `${horas}:${minutos}:${segundos}`;
}
