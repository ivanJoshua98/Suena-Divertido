//Se establece el dia actual en el calendario
function setDate(){
    const today = new Date();
    const lastDate = sessionStorage.getItem("calendar");
    if(lastDate !== null){
        const date = new Date(lastDate);
        document.getElementById('calendar').valueAsDate = date;    
        return date;
    }
    document.getElementById('calendar').valueAsDate = today;
    return today;
}


function setLocation(){
    const lastLocation = sessionStorage.getItem("locations");
    if(lastLocation !== null){
        document.getElementById(lastLocation).selected = true;
    }
}

//Se crea dinamicamente un producto disponible
function crearProductoDisponible(nombre, precio, cantidad, index){
    /* ASPECTO ------------------------------------------------------------------------------------
    <div class="bg-green-sd-light rounded-lg shadow p-4 text-center">
      <img src="./productos/Plaza Soft.jpg" alt="Plaza Soft" class="mx-auto mb-4 rounded">
      <div class="descripcion-oferta">
        <h4 class="text-xl font-bold">Plaza Soft</h4>
        <p class="text-gray-600">$90.000</p>
      </div>
      <button class="mt-4 bg-red-sd text-white px-4 py-2 rounded hover:bg-red-700">Agregar al pedido</button>
    </div>
    ---------------------------------------------------------------------------------------------*/
    const divProducto = document.createElement('div');
    divProducto.classList.add('bg-green-sd-light', 'rounded-lg', 'shadow', 'p-4', 'text-center', 'oferta-especial');
    
    const imagen = crearImagenProductoDisponible(nombre, index);

    const divDescripcion = document.createElement('div');
    divDescripcion.classList.add('descripcion-oferta');

    const titulo = document.createElement('p');
    titulo.textContent = nombre;
    titulo.classList.add("font-extrabold");

    const precioProducto = document.createElement('p');
    precioProducto.textContent = `$${new Intl.NumberFormat().format(Number(precio))}`;
    precioProducto.classList.add("font-extrabold");

    if(cantidad !== "") {
        const divTitulo = crearTituloConCantidad(titulo, cantidad);
        divDescripcion.appendChild(divTitulo);
    } else {
        titulo.classList.add("h-10");
        divDescripcion.appendChild(titulo);
    }
    divDescripcion.appendChild(precioProducto);

    const btnPedido = crearBotonProductoDisponible(index);

    divProducto.appendChild(imagen);
    divProducto.appendChild(divDescripcion);
    divProducto.appendChild(btnPedido);

    const listaProductos = document.getElementById('product-list');
    listaProductos.appendChild(divProducto);
}


function crearTituloConCantidad(titulo, cantidad){
    const div = document.createElement("div");
    div.classList.add("flex", "justify-between", "h-10", "items-center");

    const vacio = document.createElement("span");
    vacio.textContent = `${cantidad}u.`
    vacio.classList.add("font-extrabold", "invisible");

    const libres = document.createElement('p');
    libres.textContent = `${cantidad}u.`
    libres.classList.add("font-extrabold", "show-amount", "content-center");

    div.appendChild(vacio);
    div.appendChild(titulo);
    div.appendChild(libres);

    return div;
}


//Se crea la imagen de un producto disponible
function crearImagenProductoDisponible(nombre, index){
    const imagen = document.createElement('img');
    imagen.id = `img-${index}`;
    imagen.src = "./productos/" + nombre + ".jpg";
    imagen.alt = nombre;
    imagen.classList.add('mx-auto', 'mb-4', 'rounded', 'img-product', 'scroll-top-img', 'cursor-pointer');

    ///
    if(window.screen.width > 850){
        const fullPage = document.getElementById("fullpage");
        imagen.addEventListener("click", function() {
            fullPage.style.backgroundImage = 'url(' + imagen.src + ')';
            fullPage.style.display = "block";
            fullPage.scrollIntoView({ behavior: "instant" });
            document.body.classList.add("overflow-y-hidden");
    
            const closeBtn = document.getElementById("close-btn-img");
            closeBtn.id = `close-img-${index}`;
        })
    }
    ///

    return imagen;
}

function closeImgFullScreen(event){
    document.body.classList.remove("overflow-y-hidden");

    const fullPage = document.getElementById("fullpage");
    fullPage.style.display = "none";

    const btnId = event.currentTarget.id;
    const closeBtn = document.getElementById(btnId);

    //Example id: close-img-11
    const imgId = event.currentTarget.id.slice(6, btnId.length);
    const nodoImg = document.getElementById(imgId);
    nodoImg.scrollIntoView({ behavior: "instant" });

    closeBtn.id = "close-btn-img";
}

//Crea un boton para un producto disponible
function crearBotonProductoDisponible(index){
    const btnPedido = document.createElement('button');
    const btnPedidoId = "btn-" + index.toString();

    btnPedido.id = btnPedidoId;
    btnPedido.type = "button";
    btnPedido.textContent = "Agregar al pedido";
    btnPedido.disabled = false;  
    btnPedido.classList.add('mt-4', 'bg-green-sd', 'px-4', 'py-2', 'rounded', 'font-extrabold', 'hover:bg-green-700');
    btnPedido.addEventListener("click", handleBotonAgregar);

    return btnPedido;
}


//Se obtienen los productos disponibles desde google sheets
async function getProductsAvailables(date, lugar){
    var url = "https://script.google.com/macros/s/AKfycbziB1F3n7VLmLM2JWwQnXiRxc0ebApZQB8sq2AcNnOZZVmiqZtcU-hufCysUaBicCKbBQ/exec?request=AVAILABLES&date=" + date + "&location=" + lugar;
    try {
        const response = await fetch(url, { method: "GET" });
        if(!response.ok){
            throw new Error(`Error al obtener: ${response.status}`);
        }
        const data = await response.json();
        //Se desactiva el loader
        removeSkeleton(1);
        removeSkeleton(2);
        removeSkeleton(3);
        //Almacenamos los productos disponibles
        sessionStorage.setItem("disponibles", JSON.stringify(data.products));
        //Se agregan productos a la seccion de disponibles
        appendProductInDiv(data.products);
    } catch (error) {
        console.log("Error:", error);
    }
}

//Agregar los productos a la seccion productos disponibles
function appendProductInDiv(array){
    for(var i=0;i<array.length;i++){
        try {
            crearProductoDisponible(array[i].name, array[i].price, array[i].amount, i);  
        } catch (error) {
            console.log("No se agrego el producto disponible:", array[i].name, error);
        } 
    }
} 


//Reseteal los cambios hechos por el usuario
function resetChanges(event){
    cleanProdResult();
    cleanPedido();

    const id = event.currentTarget.id;
    const name = event.currentTarget.name;
    const value = document.getElementById(id).value;

    sessionStorage.setItem(name, value);
}

function cleanPedido(){
    const items = document.getElementById("items-pedido");
    if(items.hasChildNodes()){
        window.alert("Cambiar de fecha o ciudad reinicia tu pedido");
        while (items.firstChild) {
            items.removeChild(items.lastChild);
        }
        reiniciarContadorItems(); 
        reiniciarTotalPedido();
        changeToEmptySubtitle();
        deshabilitarBtnEnviar();
    }
}

//Resetear resultados de productos disponibles
function cleanProdResult(){
    const productList = document.getElementById("product-list");
    const btnSearch = document.getElementById("btn-search");
    const divAvailable = document.getElementById("products-available");
    if(productList !== null){
        productList.innerHTML = "";
        btnSearch.disabled = false;
        btnSearch.className = "bg-green-sd font-bold px-6 py-3 rounded-lg shadow hover:bg-red-400 transition"
        divAvailable.classList.add("hidden");
    }
}


//Ejecutar busqueda de productos disponibles
function searchProducts(){
    const btnSearch = document.getElementById("btn-search");
    const titulo = document.getElementById("products-available");

    btnSearch.disabled = true;
    btnSearch.className = "bg-gray-400 font-bold px-6 py-3 rounded-lg shadow cursor-default"

    titulo.classList.remove("hidden");

    createSkeleton(1);
    createSkeleton(2);
    createSkeleton(3);

    var date = document.getElementById("calendar").value;
    var lugar = document.getElementById("locations").value;

    document.getElementById("products-available").scrollIntoView({ behavior: "smooth" });
        
    getProductsAvailables(date, lugar);
}

//Cambia el boton de un producto disponible para quitar del pedido
function cambiarABotonQuitar(btnId){
    const btnPedido = document.getElementById(btnId);

    btnPedido.removeEventListener("click", handleBotonAgregar);
    btnPedido.textContent = "Quitar del pedido";
    btnPedido.classList.remove('bg-green-sd', 'hover:bg-green-700');
    btnPedido.classList.add('text-white', 'hover:bg-red-700', 'bg-red-sd');
    btnPedido.addEventListener("click", handleBotonQuitar);    
}


//Cambia el boton de un producto disponible para agregar al pedido
function cambiarABotonAgregar(btnId){
    const btnPedido = document.getElementById(btnId);

    btnPedido.removeEventListener("click", handleBotonQuitar);
    btnPedido.textContent = "Agregar al pedido";
    btnPedido.classList.remove('text-white', 'hover:bg-red-700', 'bg-red-sd'); 
    btnPedido.classList.add('bg-green-sd', 'hover:bg-green-700');
    btnPedido.addEventListener("click", handleBotonAgregar);
}


//Handle para el boton de quitar del pedido
function handleBotonQuitar(event) {
    const id = event.currentTarget.id;
    //Example: btn-1
    let index = Number(id[id.length - 1]);
    if(id.length > 5){
        //Example: btn-10
        index = Number(id.substring(4, id.length));
    }
    removeItemPedido(index);
    actualizarMontoPedido(index, restar);
    actualizarContadorItems(restar);
    chequearUltimoItem();
    //Al hacer click en el cambia al boton para agregar el item
    cambiarABotonAgregar(id);
}


//Handle para el boton de agregar a pedido
function handleBotonAgregar(event) {
    const id = event.currentTarget.id;
    //Example: btn-1
    let index = Number(id[id.length - 1]);
    if(id.length > 5){
        //Example: btn-10
        index = Number(id.substring(4, id.length));
    }
    createItemPedido(index);
    actualizarMontoPedido(index, sumar);
    actualizarContadorItems(sumar);
    chequearPrimerItem();
    //Al hacer click en el cambia al boton para quitar el item
    cambiarABotonQuitar(id);
}


//Crea una pantalla de carga para los productos
function createSkeleton(id){
    const divProducto = document.createElement('div');
    divProducto.id = "skeleton-loader-" + id.toString();
    divProducto.classList.add('bg-green-sd-light', 'rounded-lg', 'shadow', 'p-4', 'text-center', 'oferta-especial');
    
    ///Skeleton imagen///
    const imagen = createLoader("skeleton-imagen");

    divProducto.appendChild(imagen);
    const listaProductos = document.getElementById('product-list');
    listaProductos.appendChild(divProducto);
}


//Quitar loader de busqueda
function removeSkeleton(id){
    var skeleton = document.getElementById("skeleton-loader-" + id.toString());
    if(skeleton !== null){
        skeleton.remove();
    }
}


//Crea una plantilla de carga
function createLoader(clase){
    const loader = document.createElement("a");
    const loaderAnimation = document.createElement("div");
    loaderAnimation.className = "skeleton";
    loaderAnimation.classList.add('mx-auto', 'mb-4', 'rounded', clase);
    loader.appendChild(loaderAnimation);

    return loader;
}

//Obtiene las localidades a enviar desde google sheets
async function getLocations(){
    let localidades = JSON.parse(
        sessionStorage.getItem("localidades")
    );
    
    if(localidades === null){
        var url = "https://script.google.com/macros/s/AKfycbziB1F3n7VLmLM2JWwQnXiRxc0ebApZQB8sq2AcNnOZZVmiqZtcU-hufCysUaBicCKbBQ/exec?request=LOCATIONS";
        try {
            const response = await fetch(url, { method: "GET" });
            if(!response.ok){
                throw new Error(`Error al obtener: ${response.status}`);
            }
            const data = await response.json();
            localidades = data.locations;
            sessionStorage.setItem("localidades", JSON.stringify(localidades));
        } catch (error) {
            console.log("Error: ", error);
        }
    }
    createLocations(localidades);
}


//Crea las opciones de localiadades
function createLocations(array){
    const select = document.getElementById('locations');
    for(lugar of array) {
        const option = document.createElement('option');
        option.id = lugar;
        option.value = lugar;
        option.textContent = lugar;
        select.appendChild(option);
    }
}


//Carga el dia de hoy y las localidades al iniciar la pagina
async function setUpDisponibles(){
    setDate();

    const calendar = document.getElementById("calendar");
    calendar.addEventListener("change", resetChanges);  

    const locations = document.getElementById("locations");
    locations.addEventListener("change", resetChanges);  

    await getLocations();
    setLocation();
}


//////////////////////////GENERACION DE PEDIDO//////////////////////////////////////////////////////


function changeToSubtitleDate(){
    const date = document.getElementById("calendar").value;
    const location = document.getElementById("locations").value;
    const subtitle = document.getElementById("sidenav-subtitle");
    
    subtitle.textContent = `Productos para el dia ${date} en ${location}`;
}

function changeToEmptySubtitle(){
    const subtitle = document.getElementById("sidenav-subtitle");
    subtitle.textContent = "Agrega productos para armar tu presupuesto";
}

function chequearPrimerItem(){
    const items = document.getElementById("items-pedido");
    if(items.childNodes.length === 1){
        changeToSubtitleDate();
        habilitarBtnEnviar();
    }
}

function chequearUltimoItem(){
    const items = document.getElementById("items-pedido");
    if(items.childNodes.length === 0){
        changeToEmptySubtitle();
        deshabilitarBtnEnviar();
    }
}

function deshabilitarBtnEnviar(){
    const btnSend = document.getElementById("btn-send");
    btnSend.className = "flex items-center bg-gray-400 px-6 py-1 font-extrabold m-4 rounded-lg cursor-default";
    btnSend.disabled = true;

    const sendIcon = document.getElementById("send-icon");
    sendIcon.classList.remove("icono-enviar");
}

function habilitarBtnEnviar(){
    const btnSend = document.getElementById("btn-send");
    btnSend.className = "flex items-center bg-blue-sd px-6 py-1 font-extrabold m-4 rounded-lg shadow hover:bg-green-700 hover:text-white transition";
    btnSend.disabled = false;

    const sendIcon = document.getElementById("send-icon");
    sendIcon.classList.add("icono-enviar");
}

//Se crea un item para el pedido
function createItemPedido(index){
    const productos = JSON.parse(
        sessionStorage.getItem("disponibles")
    );
    const item = productos[index];
    const nombre = document.createElement("a");
    nombre.text = item.name;
    const spanName = document.createElement("span");
    spanName.className = "w-8/12"
    spanName.appendChild(nombre);

    const precio = document.createElement("a");
    precio.text = `$${new Intl.NumberFormat().format(Number(item.price))}`;

    const trashIcon = document.createElement("i");
    trashIcon.className = "fa fa-trash center-prod-in-presup ml-1 cursor-pointer";
    trashIcon.id = `trash-${index}`;
    trashIcon.addEventListener("click", handleTrashIcon);

    const spanRight = document.createElement("span");
    spanRight.appendChild(precio);
    spanRight.appendChild(trashIcon);

    const divItem = document.createElement("div");
    divItem.id = `item-${index}`;
    divItem.className = "flex justify-between items-center py-4";
    divItem.appendChild(spanName);
    divItem.appendChild(spanRight);

    const div = document.getElementById("items-pedido");
    div.appendChild(divItem);
}


function removeItemPedido(index){
    const item = document.getElementById(`item-${index}`);
    if(item !== null){
        item.remove();
    } 
}


function handleTrashIcon(event){
    const id = event.currentTarget.id;
    //Example: trash-1
    let index = Number(id[id.length - 1]);
    if(id.length > 7){
        //Example: trash-10
        index = Number(id.substring(6, id.length));
    }
    const btnId = `btn-${index}`;
    const newEvent = {currentTarget: {id: btnId}};
    handleBotonQuitar(newEvent);
}

function actualizarMontoPedido(index, operacion){
    //const total = document.getElementById("sum-total");
    const total = Number(sessionStorage.getItem("total-pedido"));
    //const newTotal = Number(total.textContent);
    const disponibles = JSON.parse(
        sessionStorage.getItem("disponibles")
    );
    const monto = Number(disponibles[index].price);
    //total.textContent = new Intl.NumberFormat().format(
    //    operacion(newTotal, Number(monto))
    //);
    //total.textContent = operacion(newTotal, Number(monto));
    const updated = operacion(total, monto);
    sessionStorage.setItem("total-pedido", updated);
    document.getElementById("sum-total").textContent = new Intl.NumberFormat().format(updated);
}

function actualizarContadorItems(operacion){
    const actual = document.getElementById("cantidad-items");
    const valor = Number(actual.textContent);
    const contador = document.getElementById("contador");
    //Si el valor actual es cero, se empezara a contar y se debe mostar el contador
    if(valor === 0){
        contador.classList.remove("hidden");
        contador.classList.add("inline-flex");
        actual.textContent = 1;
        return;
    }   
    const nuevoValor = operacion(valor, 1);
    actual.textContent = nuevoValor;
    //Si el nuevo valor es 0, se debera ocultar el contador
    if(nuevoValor === 0){
        contador.classList.remove("inline-flex");
        contador.classList.add("hidden");
    }
    return;
}

function reiniciarContadorItems(){
    const actual = document.getElementById("cantidad-items");
    actual.textContent = 0;

    const contador = document.getElementById("contador");
    contador.classList.remove("inline-flex");
    contador.classList.add("hidden");
}

function reiniciarTotalPedido(){
    sessionStorage.setItem("total-pedido", 0);
    const total = document.getElementById("sum-total");
    total.textContent = 0;
}

function sumar(a, b){
    return a + b;
}

function restar(a, b){
    return a - b;
}


function parrafoFechaYLugar(){
    let fecha = document.getElementById("calendar").valueAsDate;
    fecha = formatearFecha(fecha);
    const lugar = document.getElementById("locations").value;
    return `Hola%2C%20he%20creado%20este%20pedido%20a%20trav%C3%A9s%20de%20tu%20p%C3%A1gina%20para%20el%20dia%20${fecha}%20en%20${lugar}%3A%0A%0A`;
}

function crearMensajeItem(nombre, precio){
    return `-%20${nombre.replaceAll("+", "%2B")}%20%20%20%20%24${precio}%0A`
}

function parrafoItems(items){
    let parrafo = "";
    items.forEach(item => {
        const linea = crearMensajeItem(item.name, item.price)
        parrafo = parrafo.concat(linea)
    });
    return parrafo.replaceAll(" ", "%20");
}

function parrafoTotal(){
    let total = sessionStorage.getItem("total-pedido");
    total = new Intl.NumberFormat().format(total);
    return `%0ATOTAL%3A%20%24${total}%0A`;
}

function getItemsPedido(){
    const disponibles = JSON.parse(
        sessionStorage.getItem("disponibles")
    );
    const pedido = document.getElementById("items-pedido");
    const items = [];
    pedido.childNodes.forEach(nodo => {
        let id = nodo.id.toString();
        let index = Number(id[id.length - 1]);
        if(id.length > 6){
            //Example id: item-10
            index = Number(id.substring(5, id.length));
        }
        items.push(disponibles[index]);
    });
    return items;
}

function enviarPedido(){
    const telefono = "5491136438901";
    const fechaYLugar = parrafoFechaYLugar();
    const items = getItemsPedido();
    const mensajeItems = parrafoItems(items);
    const total = parrafoTotal();

    window.open("https://api.whatsapp.com/send?phone=" +
        telefono +
        "&text=" +
        fechaYLugar + 
        mensajeItems + 
        total
    );
}


function formatearFecha(fecha){
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = new Intl.DateTimeFormat('es-ES', opciones).format(fecha);
    return fechaFormateada.replaceAll(" ", "%20");
}

//////////////////////////////////////////////////////////////////////////////////////////////////


//Se inicializa despues de que el DOM esta listo
document.addEventListener('DOMContentLoaded', function() {
    sessionStorage.setItem("total-pedido", 0);
    setUpDisponibles();  

    const btnSend = document.getElementById("btn-send");
    btnSend.addEventListener("click", enviarPedido);

    const closeBtn = document.getElementById("close-btn-img");
    closeBtn.addEventListener("click", closeImgFullScreen);
});
