
/* EPE 3 - Sistema de Trazabilidad de Activos */
/* Segundo incremento: registro, bajas e historial */

const CLAVE = "epe3_equipos";
let equipos = [];

// Recuperar los equipos guardados
try {
    equipos = JSON.parse(localStorage.getItem(CLAVE)) || [];

    if (!Array.isArray(equipos)) {
        equipos = [];
    }
} catch (error) {
    equipos = [];
}

// Elementos de la página
const formRegistro = document.getElementById("formRegistro");
const formBaja = document.getElementById("formBaja");
const tablaEquipos = document.getElementById("tablaEquipos");
const tablaHistorial = document.getElementById("tablaHistorial");
const buscar = document.getElementById("buscar");
const equipoBaja = document.getElementById("equipoBaja");

// Guardar los datos en el navegador
function guardarEquipos() {
    localStorage.setItem(CLAVE, JSON.stringify(equipos));
}

// Crear celdas de las tablas
function agregarCelda(fila, contenido) {
    const celda = document.createElement("td");
    celda.textContent = contenido;
    fila.appendChild(celda);
}

// Actualizar los contadores
function actualizarContadores() {
    const activos = equipos.filter(e => e.estado === "Activo");
    const bajas = equipos.filter(e => e.estado === "Baja");

    document.getElementById("total").textContent = equipos.length;
    document.getElementById("activos").textContent = activos.length;
    document.getElementById("bajas").textContent = bajas.length;
}

// Mostrar los equipos registrados
function mostrarEquipos() {
    tablaEquipos.innerHTML = "";

    const texto = buscar.value.trim().toLowerCase();

    const resultados = equipos.filter(equipo =>
        equipo.codigo.toLowerCase().includes(texto) ||
        equipo.descripcion.toLowerCase().includes(texto)
    );

    if (resultados.length === 0) {
        const fila = document.createElement("tr");
        agregarCelda(fila, "No hay equipos para mostrar.");

        fila.firstChild.colSpan = 5;
        tablaEquipos.appendChild(fila);
    }

    resultados.forEach(equipo => {
        const fila = document.createElement("tr");

        agregarCelda(fila, equipo.codigo);
        agregarCelda(fila, equipo.tipo);
        agregarCelda(fila, equipo.descripcion);
        agregarCelda(fila, equipo.responsable);
        agregarCelda(fila, equipo.estado);

        tablaEquipos.appendChild(fila);
    });

    actualizarContadores();
    actualizarOpcionesBaja();
    mostrarHistorial();
}

// Mostrar equipos disponibles para dar de baja
function actualizarOpcionesBaja() {
    equipoBaja.innerHTML = "";

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Seleccionar equipo";
    equipoBaja.appendChild(opcionInicial);

    equipos
        .filter(equipo => equipo.estado === "Activo")
        .forEach(equipo => {
            const opcion = document.createElement("option");

            opcion.value = equipo.codigo;
            opcion.textContent =
                equipo.codigo + " - " + equipo.descripcion;

            equipoBaja.appendChild(opcion);
        });
}

// Mostrar historial de equipos dados de baja
function mostrarHistorial() {
    tablaHistorial.innerHTML = "";

    const bajas = equipos.filter(equipo =>
        equipo.estado === "Baja"
    );

    if (bajas.length === 0) {
        const fila = document.createElement("tr");
        agregarCelda(fila, "No hay bajas registradas.");

        fila.firstChild.colSpan = 4;
        tablaHistorial.appendChild(fila);
        return;
    }

    bajas.forEach(equipo => {
        const fila = document.createElement("tr");

        agregarCelda(fila, equipo.codigo);
        agregarCelda(fila, equipo.tipo);
        agregarCelda(fila, equipo.fechaBaja);
        agregarCelda(fila, equipo.motivoBaja);

        tablaHistorial.appendChild(fila);
    });
}

// Registrar un equipo nuevo
formRegistro.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const codigo = document.getElementById("codigo")
        .value.trim().toUpperCase();

    const tipo = document.getElementById("tipo").value;

    const descripcion = document.getElementById("descripcion")
        .value.trim();

    const responsable = document.getElementById("responsable")
        .value.trim();

    const fechaRegistro =
        document.getElementById("fechaRegistro").value;

    if (!codigo || !tipo || !descripcion ||
        !responsable || !fechaRegistro) {
        alert("Debes completar todos los campos.");
        return;
    }

    const repetido = equipos.some(equipo =>
        equipo.codigo === codigo
    );

    if (repetido) {
        alert("Ya existe un equipo con ese código.");
        return;
    }

    const nuevoEquipo = {
        codigo: codigo,
        tipo: tipo,
        descripcion: descripcion,
        responsable: responsable,
        fechaRegistro: fechaRegistro,
        estado: "Activo",
        fechaBaja: "",
        motivoBaja: ""
    };

    equipos.push(nuevoEquipo);

    guardarEquipos();
    mostrarEquipos();
    formRegistro.reset();

    alert("Equipo registrado correctamente.");
});

// Registrar la baja de un equipo
formBaja.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const codigoSeleccionado = equipoBaja.value;

    const fechaBaja =
        document.getElementById("fechaBaja").value;

    const motivoBaja =
        document.getElementById("motivoBaja").value.trim();

    if (!codigoSeleccionado || !fechaBaja || !motivoBaja) {
        alert("Debes completar todos los datos de la baja.");
        return;
    }

    const equipo = equipos.find(e =>
        e.codigo === codigoSeleccionado &&
        e.estado === "Activo"
    );

    if (!equipo) {
        alert("El equipo seleccionado no está disponible.");
        return;
    }

    if (fechaBaja < equipo.fechaRegistro) {
        alert("La fecha de baja no puede ser anterior al registro.");
        return;
    }

    equipo.estado = "Baja";
    equipo.fechaBaja = fechaBaja;
    equipo.motivoBaja = motivoBaja;

    guardarEquipos();
    mostrarEquipos();
    formBaja.reset();

    alert("Baja registrada correctamente.");
});

// Buscar equipos por código o descripción
buscar.addEventListener("input", mostrarEquipos);

// Cargar información al abrir la página
mostrarEquipos();
