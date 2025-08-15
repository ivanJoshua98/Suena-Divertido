

//Obtiene los productos desde google sheets 
async function getProducts(){
    let productos = JSON.parse(
        sessionStorage.getItem("productos")
    );
    
    if(productos === null){
        var url = "https://script.google.com/macros/s/AKfycbziB1F3n7VLmLM2JWwQnXiRxc0ebApZQB8sq2AcNnOZZVmiqZtcU-hufCysUaBicCKbBQ/exec?request=PRODUCTS";
        try {
            const response = await fetch(url, { method: "GET" });
            const data = await response.json();
            productos = data.products;
            sessionStorage.setItem("productos", JSON.stringify(productos));
        } catch (error) {
            console.log("Error: ", error);
        }
    }

    return productos;
}


function createProduct(tittle){
  /*
  <div class="bg-white rounded-lg shadow p-4 text-center">
    <img src="./productos/Castillo Blanco Solo.jpg" alt="Castillo Blanco" class="mx-auto mb-4 rounded">
    <h4 class="text-xl font-bold">Castillo Blanco</h4>
  </div>
  */

  const div = document.createElement('div');
  div.className = "bg-white rounded-lg shadow p-4 text-center";

  const img = crearImagenProducto(tittle);

  const h4 = document.createElement('h4');
  h4.className = "text-xl font-bold";
  h4.textContent = tittle;

  div.appendChild(img);
  div.appendChild(h4);

  return div;
}

//Se crea la imagen de un producto 
function crearImagenProducto(nombre){
  const imagen = document.createElement('img');
  imagen.src = "./productos/" + nombre + ".jpg";
  imagen.alt = nombre;
  imagen.classList.add('mx-auto', 'mb-4', 'rounded');

  return imagen;
}

//Carga los productos al iniciar la pagina
async function setUpProductos(){
  const div = document.getElementById("all-product-list");
  if(!div.hasChildNodes()){
    const productos = await getProducts();
    for(let producto of productos){
      const newProduct = createProduct(producto);
      div.appendChild(newProduct);
    }
  }
}


//Se inicializa despues de que el DOM esta listo
document.addEventListener('DOMContentLoaded', function() {
    setUpProductos();  
});