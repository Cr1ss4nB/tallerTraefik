# Taller Traefik

## Punto 1: Topología y redes

### Diagrama simple

Traefik --(red appnet)--> API (Express)
└-> Neo4j (solo interno, sin exponer al host)

### Hosts usados
- api.localhost
- ops.localhost

### Comprobaciones

docker-compose.yml: 

``` 
services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - appnet

  neo4j:
    image: neo4j:5.20
    container_name: neo4j
    environment:
      - NEO4J_AUTH=neo4j/test12345
    volumes:
      - neo4j_data:/data
      - ./imports:/imports
    networks:
      - appnet

  api:
    build: ./backend
    container_name: api
    environment:
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USER=neo4j
      - NEO4J_PASSWORD=test12345
      - EXPRESS_PORT=3000
    networks:
      - appnet
    depends_on:
      - neo4j

networks:
  appnet:

volumes:
  neo4j_data:
```

- [x] Contenedores levantados

![docker ps](./images/docker-ps.png)

- [x] `curl` dentro del contenedor API responde en `/health` con `{"status":"ok"}`.

![api health](./images/health-200.png)

- [x] Neo4j no accesible desde host.

---

## Punto 2: Rutas estructuradas

### Configuración realizada
- Se añadieron entradas en `/etc/hosts`:
  - `127.0.0.1 api.localhost`
  - `127.0.0.1 ops.localhost`

![etc-host](./images/etc-host.png)

- Se configuraron labels en Traefik para enrutar:stripPrefix pero se sabe que está recibiendo la petición en **ops.localhost/dashboard** pero al pasar el interno sin quitar /dashboard puesda error 404.
  - API → `http://api.localhost/`
  - Dashboard → `http://ops.localhost/dashboard/` Aunque aún no es accesible debido a que no sea ha configurado el 

### Comprobaciones
- [x] `curl http://api.localhost/health` responde con `{"status":"ok"}`.  

![curl health v2](./images/health-200-v2)

- [x] El dashboard responde en `http://ops.localhost/dashboard/` (actualmente 404 hasta aplicar stripPrefix).  

![404 not found](./images/404-nofound.png)
