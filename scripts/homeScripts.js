
const secciones = [
    "todos-los-productos",
    "info-importante",
    "nosotros"
];

//Se abre los detalles del pedido del cliente
function abrirNav() {
    document.getElementById("mi-sidenav").style.width = "300px";
}   


//Se cierran los detalles del pedido del cliente
function cerrarNav() {
    document.getElementById("mi-sidenav").style.width = "0";
}   


//Se abre el menu de navegacion
function abrirNavMenu() {
    document.getElementById("mi-sidenav-menu").style.width = "300px";
}


//Se cierra el menu de navegacion
function cerrarNavMenu() {
    document.getElementById("mi-sidenav-menu").style.width = "0";
}

function irA(seccionId){
    cerrarNavMenu();
    const seccion = document.getElementById(seccionId);
    const otrasSecciones = secciones.filter(s => s !== seccionId);

    if (seccion.classList.contains("hidden")){
        seccion.classList.remove("hidden");
    };

    otrasSecciones.forEach(s => {
        const otraSeccion = document.getElementById(s);
        if(!otraSeccion.classList.contains("hidden")){
            otraSeccion.classList.add("hidden");
        }
    });

    document.getElementById(seccionId).scrollIntoView({ behavior: "smooth" });
}

function irADisponibles(){
    cerrarNavMenu();
    const resultados = document.getElementById("products-available");
    if(resultados.classList.contains("hidden")){
        document.getElementById("busqueda-disponibles").scrollIntoView({ behavior: "smooth" });
        return;
    }
    document.getElementById("products-available").scrollIntoView({ behavior: "smooth" });
    return;
}
