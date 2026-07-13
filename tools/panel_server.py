#!/usr/bin/env python3
"""
Mauá Automóviles — Panel de publicación (backend).
Levanta el sitio estático + API REST para gestionar vehículos.

Uso:  python3 tools/panel_server.py
      → http://localhost:8765        (sitio público)
      → http://localhost:8765/panel  (panel admin)
"""

import os, sys, json, hashlib, uuid, shutil, time
from datetime import datetime
from functools import wraps
from flask import (
    Flask, request, jsonify, send_from_directory,
    session, redirect, url_for
)
from werkzeug.utils import secure_filename

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
UPLOAD = os.path.join(ROOT, "assets", "img", "vehiculos")

app = Flask(__name__, static_folder=ROOT, static_url_path="")
app.secret_key = os.environ.get("SECRET_KEY", "maua-panel-" + hashlib.md5(ROOT.encode()).hexdigest()[:12])
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB

ALLOWED_EXT = {"jpg", "jpeg", "png", "webp", "gif"}


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

def data_path(name):
    return os.path.join(DATA, name)

def read_json(name):
    p = data_path(name)
    if not os.path.exists(p):
        return []
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

def write_json(name, obj):
    p = data_path(name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("user"):
            return jsonify({"error": "No autorizado"}), 401
        return f(*args, **kwargs)
    return decorated

def require_roles(*roles):
    def deco(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not session.get("user"):
                return jsonify({"error": "No autorizado"}), 401
            if session.get("rol", "admin_general") not in roles:
                return jsonify({"error": "No tenés permiso para esta acción"}), 403
            return f(*args, **kwargs)
        return wrapper
    return deco


# ──────────────────────────────────────────────────────────────
# Sitio estático
# ──────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(ROOT, "index.html")

@app.route("/panel")
@app.route("/panel/")
@app.route("/panel.html")
def panel():
    return send_from_directory(ROOT, "panel.html")


# ──────────────────────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────────────────────

@app.route("/api/login", methods=["POST"])
def api_login():
    body = request.get_json(silent=True) or {}
    username = body.get("username", "").strip().lower()
    password = body.get("password", "")
    pw_hash = hashlib.sha256(password.encode()).hexdigest()

    # El login vive en vendedores.json: una persona de Personal puede
    # tener (opcionalmente) acceso al panel con usuario/contraseña/rol.
    vendedores = read_json("vendedores.json")
    for v in vendedores:
        if v.get("username") and v["username"] == username and v.get("password") == pw_hash:
            session["user"] = username
            session["nombre"] = v.get("nombre", username)
            session["rol"] = v.get("rol", "vendedor")
            session["sucursal"] = v.get("sucursal", "")
            return jsonify({"ok": True, "nombre": v.get("nombre", username),
                            "rol": session["rol"], "sucursal": session["sucursal"]})

    return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"ok": True})

DEFAULT_PW_HASH = hashlib.sha256("maua2026".encode()).hexdigest()

@app.route("/api/me")
def api_me():
    if session.get("user"):
        vendedores = read_json("vendedores.json")
        must_change = False
        for v in vendedores:
            if v.get("username") == session["user"]:
                must_change = v.get("password") == DEFAULT_PW_HASH
                break
        return jsonify({"user": session["user"], "nombre": session.get("nombre", ""),
                        "rol": session.get("rol", "admin_general"),
                        "sucursal": session.get("sucursal", ""),
                        "mustChangePassword": must_change})
    return jsonify({"user": None}), 401

@app.route("/api/me/password", methods=["POST"])
@login_required
def api_me_password():
    body = request.get_json(silent=True) or {}
    actual = body.get("actual", "")
    nueva = body.get("nueva", "")
    skip_actual = body.get("skipActual", False)
    if len(nueva) < 4:
        return jsonify({"error": "La nueva contraseña debe tener al menos 4 caracteres"}), 400
    nueva_hash = hashlib.sha256(nueva.encode()).hexdigest()
    vendedores = read_json("vendedores.json")
    user = session.get("user")
    for v in vendedores:
        if v.get("username") == user:
            if skip_actual and v.get("password") == DEFAULT_PW_HASH:
                pass
            else:
                actual_hash = hashlib.sha256(actual.encode()).hexdigest()
                if v.get("password") != actual_hash:
                    return jsonify({"error": "La contraseña actual no es correcta"}), 400
            v["password"] = nueva_hash
            write_json("vendedores.json", vendedores)
            return jsonify({"ok": True})
    return jsonify({"error": "Usuario no encontrado"}), 404

@app.route("/api/vendedores/<vid>/reset-password", methods=["POST"])
@login_required
def api_reset_password(vid):
    if session.get("rol") != "admin_general":
        return jsonify({"error": "Solo el administrador general puede restablecer contraseñas"}), 403
    vendedores = read_json("vendedores.json")
    for v in vendedores:
        if v.get("id") == vid:
            v["password"] = DEFAULT_PW_HASH
            write_json("vendedores.json", vendedores)
            return jsonify({"ok": True})
    return jsonify({"error": "Vendedor no encontrado"}), 404


# ──────────────────────────────────────────────────────────────
# CRUD Vehículos
# ──────────────────────────────────────────────────────────────

@app.route("/api/vehiculos", methods=["GET"])
@login_required
def api_vehiculos_list():
    return jsonify(read_json("vehiculos.json"))

@app.route("/api/vehiculos", methods=["POST"])
@login_required
def api_vehiculos_create():
    body = request.get_json(silent=True) or {}
    vehiculos = read_json("vehiculos.json")

    vid = "v-" + str(uuid.uuid4())[:8]
    nuevo = {
        "id": vid,
        "marca": body.get("marca", "").strip(),
        "modelo": body.get("modelo", "").strip(),
        "version": body.get("version", "").strip(),
        "condicion": body.get("condicion", "usado"),
        "etiqueta": body.get("etiqueta", "Usado"),
        "carroceria": body.get("carroceria", "Hatch"),
        "anio": int(body.get("anio", datetime.now().year)),
        "km": int(body.get("km", 0)),
        "costo": int(body.get("costo", 0)),
        "precio": int(body.get("precio", 0)),
        "cuota": int(body.get("cuota", 0)),
        "tipoMotor": body.get("tipoMotor", "Nafta"),
        "transmision": body.get("transmision", "Manual"),
        "traccion": body.get("traccion", "Delantera"),
        "primerDueno": bool(body.get("primerDueno", False)),
        "ubicacion": body.get("ubicacion", "Melo"),
        "fechaIngreso": body.get("fechaIngreso", datetime.now().strftime("%Y-%m-%d")),
        "fotos": body.get("fotos", []),
        "publicado": body.get("publicado", True),
        "creadoPor": session.get("nombre") or session.get("user", ""),
        "creadoEn": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "historial": [],
    }

    vehiculos.insert(0, nuevo)
    write_json("vehiculos.json", vehiculos)
    return jsonify(nuevo), 201


# Etiquetas legibles para el historial de cambios de un vehículo.
CAMPO_LABEL = {
    "marca": "Marca", "modelo": "Modelo", "version": "Versión",
    "condicion": "Condición", "etiqueta": "Etiqueta", "carroceria": "Carrocería",
    "tipoMotor": "Combustible", "transmision": "Transmisión", "traccion": "Tracción",
    "ubicacion": "Sucursal", "fechaIngreso": "Fecha de ingreso",
    "anio": "Año", "km": "Kilómetros", "costo": "Precio de costo", "precio": "Precio", "cuota": "Cuotas de (web)",
    "primerDueno": "Primer dueño", "publicado": "Publicado",
}

def _fmt_val(campo, val):
    if campo == "primerDueno" or campo == "publicado":
        return "Sí" if val else "No"
    return str(val)

@app.route("/api/vehiculos/<vid>", methods=["PUT"])
@login_required
def api_vehiculos_update(vid):
    body = request.get_json(silent=True) or {}
    vehiculos = read_json("vehiculos.json")

    for i, v in enumerate(vehiculos):
        if v["id"] == vid:
            cambios = []
            def registrar(campo, nuevo):
                viejo = vehiculos[i].get(campo)
                if viejo != nuevo:
                    cambios.append({"campo": CAMPO_LABEL.get(campo, campo),
                                    "antes": _fmt_val(campo, viejo),
                                    "despues": _fmt_val(campo, nuevo)})
                    vehiculos[i][campo] = nuevo

            for key in ["marca", "modelo", "version", "condicion", "etiqueta", "carroceria",
                        "tipoMotor", "transmision", "traccion", "ubicacion", "fechaIngreso"]:
                if key in body:
                    registrar(key, body[key].strip() if isinstance(body[key], str) else body[key])
            for key in ["anio", "km", "costo", "precio", "cuota"]:
                if key in body:
                    registrar(key, int(body[key]))
            if "primerDueno" in body:
                registrar("primerDueno", bool(body["primerDueno"]))
            if "publicado" in body:
                registrar("publicado", bool(body["publicado"]))
            if "fotos" in body:
                old_fotos = vehiculos[i].get("fotos", [])
                if old_fotos != body["fotos"]:
                    cambios.append({"campo": "Fotos",
                                    "antes": f"{len(old_fotos)} foto(s)",
                                    "despues": f"{len(body['fotos'])} foto(s)"})
                    vehiculos[i]["fotos"] = body["fotos"]

            if cambios:
                vehiculos[i].setdefault("historial", []).append({
                    "usuario": session.get("nombre") or session.get("user", ""),
                    "fecha": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "cambios": cambios,
                })

            write_json("vehiculos.json", vehiculos)
            return jsonify(vehiculos[i])

    return jsonify({"error": "Vehículo no encontrado"}), 404

@app.route("/api/vehiculos/<vid>", methods=["DELETE"])
@require_roles("admin_general", "admin_sucursal")
def api_vehiculos_delete(vid):
    vehiculos = read_json("vehiculos.json")
    original_len = len(vehiculos)
    vehiculos = [v for v in vehiculos if v["id"] != vid]

    if len(vehiculos) == original_len:
        return jsonify({"error": "Vehículo no encontrado"}), 404

    write_json("vehiculos.json", vehiculos)
    return jsonify({"ok": True})


# ──────────────────────────────────────────────────────────────
# Upload de fotos
# ──────────────────────────────────────────────────────────────

@app.route("/api/upload", methods=["POST"])
@login_required
def api_upload():
    if "foto" not in request.files:
        return jsonify({"error": "No se recibió archivo"}), 400

    f = request.files["foto"]
    if f.filename == "" or not allowed_file(f.filename):
        return jsonify({"error": "Tipo de archivo no permitido"}), 400

    ext = f.filename.rsplit(".", 1)[1].lower()
    filename = secure_filename(f"{uuid.uuid4().hex[:10]}.{ext}")
    filepath = os.path.join(UPLOAD, filename)
    f.save(filepath)

    try:
        from PIL import Image
        img = Image.open(filepath).convert("RGBA")
        webp_name = filename.rsplit(".", 1)[0] + ".webp"
        webp_path = os.path.join(UPLOAD, webp_name)
        img.save(webp_path, "WEBP", quality=85)
        if ext != "webp":
            os.remove(filepath)
        rel_path = f"assets/img/vehiculos/{webp_name}"
    except ImportError:
        rel_path = f"assets/img/vehiculos/{filename}"

    return jsonify({"path": rel_path})


# ──────────────────────────────────────────────────────────────
# CRUD Vendedores / Personal
# Cada persona vive en un solo lugar: datos + comisión, y opcional-
# mente acceso al panel (usuario, contraseña, rol, sucursal). Antes
# esto estaba separado en "vendedores" y "usuarios" y una misma
# persona (ej. el administrador) terminaba duplicada en dos listas.
# ──────────────────────────────────────────────────────────────

ROLES_VALIDOS = {"admin_general", "admin_sucursal", "vendedor", "lavadero"}

def _vendedor_publico(v, full=False):
    out = {
        "id": v.get("id", ""),
        "nombre": v.get("nombre", ""),
        "telefono": v.get("telefono", ""),
        "email": v.get("email", ""),
        "comision": v.get("comision", {"tipo": "porcentaje", "valor": 0}),
        "activo": v.get("activo", True),
    }
    if full:
        out["username"] = v.get("username", "")
        out["rol"] = v.get("rol", "")
        out["sucursal"] = v.get("sucursal", "")
    return out

def _aplicar_acceso(vend, body, vendedores):
    """Aplica el acceso al panel sobre un registro de persona. El acceso
    es obligatorio: toda persona registrada tiene login. Devuelve un
    mensaje de error, o None si todo salió bien."""
    username = (body.get("username") or "").strip().lower()
    rol = body.get("rol", "vendedor")
    sucursal = (body.get("sucursal") or "").strip()

    if not username:
        return "Elegí un nombre de usuario para el acceso al panel"
    if rol not in ROLES_VALIDOS:
        return "Rol inválido"
    if rol in ("admin_sucursal", "vendedor") and not sucursal:
        return "Elegí una sucursal para este rol"
    if any(v.get("username") == username and v.get("id") != vend.get("id") for v in vendedores):
        return "Ese nombre de usuario ya existe"

    password = body.get("password", "")
    if password:
        vend["password"] = hashlib.sha256(password.encode()).hexdigest()
    elif not vend.get("password"):
        return "Ingresá una contraseña"

    vend["username"] = username
    vend["rol"] = rol
    vend["sucursal"] = "" if rol == "admin_general" else sucursal
    return None

@app.route("/api/vendedores", methods=["GET"])
@login_required
def api_vendedores_list():
    # Solo el administrador general ve usuario/rol/sucursal de cada
    # persona (la contraseña nunca se expone por API).
    full = session.get("rol") == "admin_general"
    return jsonify([_vendedor_publico(v, full) for v in read_json("vendedores.json")])

@app.route("/api/vendedores", methods=["POST"])
@require_roles("admin_general")
def api_vendedores_create():
    body = request.get_json(silent=True) or {}
    vendedores = read_json("vendedores.json")
    nuevo = {
        "id": "vnd-" + uuid.uuid4().hex[:8],
        "nombre": body.get("nombre", "").strip(),
        "telefono": body.get("telefono", "").strip(),
        "email": body.get("email", "").strip(),
        "comision": body.get("comision", {"tipo": "porcentaje", "valor": 0}),
        "activo": True,
        "username": "", "password": "", "rol": "", "sucursal": "",
    }
    err = _aplicar_acceso(nuevo, body, vendedores)
    if err:
        return jsonify({"error": err}), 400
    vendedores.append(nuevo)
    write_json("vendedores.json", vendedores)
    return jsonify(_vendedor_publico(nuevo, True)), 201

@app.route("/api/vendedores/<vid>", methods=["PUT"])
@require_roles("admin_general")
def api_vendedores_update(vid):
    body = request.get_json(silent=True) or {}
    vendedores = read_json("vendedores.json")
    for i, v in enumerate(vendedores):
        if v["id"] == vid:
            for key in ["nombre", "telefono", "email"]:
                if key in body:
                    vendedores[i][key] = body[key].strip() if isinstance(body[key], str) else body[key]
            if "comision" in body:
                vendedores[i]["comision"] = body["comision"]
            if "activo" in body:
                vendedores[i]["activo"] = bool(body["activo"])

            if "username" in body or "rol" in body:
                # No dejar al sistema sin ningún administrador general.
                era_admin_general = v.get("rol") == "admin_general" and v.get("username")
                if era_admin_general and body.get("rol") != "admin_general":
                    otros = [x for x in vendedores if x["id"] != vid and x.get("rol") == "admin_general" and x.get("username")]
                    if not otros:
                        return jsonify({"error": "Tiene que quedar al menos un administrador general"}), 400
                err = _aplicar_acceso(vendedores[i], body, vendedores)
                if err:
                    return jsonify({"error": err}), 400

            write_json("vendedores.json", vendedores)
            return jsonify(_vendedor_publico(vendedores[i], True))
    return jsonify({"error": "Vendedor no encontrado"}), 404

@app.route("/api/vendedores/<vid>", methods=["DELETE"])
@require_roles("admin_general")
def api_vendedores_delete(vid):
    vendedores = read_json("vendedores.json")
    target = next((v for v in vendedores if v["id"] == vid), None)
    if not target:
        return jsonify({"error": "Vendedor no encontrado"}), 404
    if target.get("username") and target.get("username") == session.get("user"):
        return jsonify({"error": "No podés eliminar tu propio usuario"}), 400
    if target.get("rol") == "admin_general" and target.get("username"):
        otros = [v for v in vendedores if v["id"] != vid and v.get("rol") == "admin_general" and v.get("username")]
        if not otros:
            return jsonify({"error": "Tiene que quedar al menos un administrador general"}), 400
    vendedores = [v for v in vendedores if v["id"] != vid]
    write_json("vendedores.json", vendedores)
    return jsonify({"ok": True})


# ──────────────────────────────────────────────────────────────
# CRUD Clientes
# ──────────────────────────────────────────────────────────────

@app.route("/api/clientes", methods=["GET"])
@login_required
def api_clientes_list():
    return jsonify(read_json("clientes.json"))

@app.route("/api/clientes", methods=["POST"])
@login_required
def api_clientes_create():
    body = request.get_json(silent=True) or {}
    clientes = read_json("clientes.json")
    nuevo = {
        "id": "cli-" + uuid.uuid4().hex[:8],
        "nombre": body.get("nombre", "").strip(),
        "fechaNacimiento": body.get("fechaNacimiento", ""),
        "direccion": body.get("direccion", "").strip(),
        "telefono": body.get("telefono", "").strip(),
    }
    clientes.append(nuevo)
    write_json("clientes.json", clientes)
    return jsonify(nuevo), 201

@app.route("/api/clientes/<cid>", methods=["PUT"])
@login_required
def api_clientes_update(cid):
    body = request.get_json(silent=True) or {}
    clientes = read_json("clientes.json")
    for i, c in enumerate(clientes):
        if c["id"] == cid:
            for key in ["nombre", "fechaNacimiento", "direccion", "telefono"]:
                if key in body:
                    clientes[i][key] = body[key].strip() if isinstance(body[key], str) else body[key]
            write_json("clientes.json", clientes)
            return jsonify(clientes[i])
    return jsonify({"error": "Cliente no encontrado"}), 404

@app.route("/api/clientes/<cid>", methods=["DELETE"])
@login_required
def api_clientes_delete(cid):
    clientes = read_json("clientes.json")
    original = len(clientes)
    clientes = [c for c in clientes if c["id"] != cid]
    if len(clientes) == original:
        return jsonify({"error": "Cliente no encontrado"}), 404
    write_json("clientes.json", clientes)
    return jsonify({"ok": True})


# ──────────────────────────────────────────────────────────────
# Ventas
# ──────────────────────────────────────────────────────────────

@app.route("/api/ventas", methods=["GET"])
@require_roles("admin_general", "admin_sucursal")
def api_ventas_list():
    ventas = read_json("ventas.json")
    # El administrador de sucursal solo ve las ventas de su sucursal.
    if session.get("rol") == "admin_sucursal":
        suc = session.get("sucursal", "")
        ventas = [v for v in ventas if v.get("sucursal", "") == suc]
    return jsonify(ventas)

def _sumar_meses(fecha_str, n):
    y, m, d = [int(x) for x in fecha_str.split("-")]
    total = (m - 1) + n
    y2 = y + total // 12
    m2 = total % 12 + 1
    import calendar
    d2 = min(d, calendar.monthrange(y2, m2)[1])
    return f"{y2:04d}-{m2:02d}-{d2:02d}"

@app.route("/api/ventas", methods=["POST"])
@login_required
def api_ventas_create():
    body = request.get_json(silent=True) or {}
    ventas = read_json("ventas.json")
    vehiculos = read_json("vehiculos.json")
    vendedores = read_json("vendedores.json")
    clientes = read_json("clientes.json")

    veh_id = body.get("vehiculoId", "")
    vnd_id = body.get("vendedorId", "")
    cli_id = body.get("clienteId", "")
    precio_venta = int(body.get("precioVenta", 0))
    precio_publicado = int(body.get("precioPublicado", precio_venta))
    toma_valor = int(body.get("tomaValor", 0))
    toma_desc = body.get("tomaDescripcion", "").strip()
    metodo_pago = body.get("metodoPago", "efectivo")
    monto_inicial = int(body.get("montoInicial", precio_venta - toma_valor))
    financia = bool(body.get("financia", False))
    monto_financiado = int(body.get("montoFinanciado", 0)) if financia else 0

    veh = next((v for v in vehiculos if v["id"] == veh_id), None)
    vnd = next((v for v in vendedores if v["id"] == vnd_id), None)
    cli = next((c for c in clientes if c["id"] == cli_id), None)
    if not veh:
        return jsonify({"error": "Vehículo no encontrado"}), 404
    if not vnd:
        return jsonify({"error": "Vendedor no encontrado"}), 404
    if not cli:
        return jsonify({"error": "Cliente no encontrado"}), 404

    if monto_financiado < 0:
        return jsonify({"error": "El monto a financiar no puede ser negativo"}), 400

    com = vnd.get("comision", {})
    if com.get("tipo") == "porcentaje":
        comision_monto = round(precio_venta * com.get("valor", 0) / 100)
    else:
        comision_monto = int(com.get("valor", 0))

    fecha = body.get("fecha", datetime.now().strftime("%Y-%m-%d"))
    venta_id = "vta-" + uuid.uuid4().hex[:8]

    financiacion_id = None
    if monto_financiado > 0:
        cant_cuotas = max(1, int(body.get("cantidadCuotas", 1)))
        primer_venc = body.get("primerVencimiento") or fecha
        valor_cuota = int(body.get("valorCuota") or round(monto_financiado / cant_cuotas))
        cuotas = []
        for i in range(cant_cuotas):
            venc = _sumar_meses(primer_venc, i)
            cuotas.append({
                "numero": i + 1, "vencimiento": venc, "valor": valor_cuota,
                "pagada": False, "fechaPago": None, "metodoPago": None,
            })
        tasa_interes = float(body.get("tasaInteres", 0) or 0)
        financiaciones = read_json("financiaciones.json")
        financiacion_id = "fin-" + uuid.uuid4().hex[:8]
        financiaciones.append({
            "id": financiacion_id,
            "ventaId": venta_id,
            "clienteId": cli_id,
            "clienteNombre": cli.get("nombre", ""),
            "clienteTelefono": cli.get("telefono", ""),
            "vehiculo": f'{veh.get("marca","")} {veh.get("modelo","")} {veh.get("anio","")}',
            "montoTotal": monto_financiado,
            "cantidadCuotas": cant_cuotas,
            "valorCuota": valor_cuota,
            "tasaInteres": tasa_interes,
            "cuotas": cuotas,
        })
        write_json("financiaciones.json", financiaciones)

    venta = {
        "id": venta_id,
        "vehiculoId": veh_id,
        "vehiculo": {
            "marca": veh.get("marca", ""),
            "modelo": veh.get("modelo", ""),
            "version": veh.get("version", ""),
            "anio": veh.get("anio", 0),
            "foto": veh.get("fotos", [None])[0],
        },
        "sucursal": veh.get("ubicacion", ""),
        "vendedorId": vnd_id,
        "vendedorNombre": vnd.get("nombre", ""),
        "clienteId": cli_id,
        "clienteNombre": cli.get("nombre", ""),
        "precioPublicado": precio_publicado,
        "precioVenta": precio_venta,
        "tomaPago": {"descripcion": toma_desc, "valor": toma_valor} if toma_valor > 0 else None,
        "metodoPago": metodo_pago,
        "montoInicial": monto_inicial,
        "montoFinanciado": monto_financiado,
        "financiacionId": financiacion_id,
        "ingresoNeto": monto_inicial,
        "comisionVendedor": comision_monto,
        "fecha": fecha,
        "notas": body.get("notas", "").strip(),
    }

    ventas.insert(0, venta)
    write_json("ventas.json", ventas)

    for i, v in enumerate(vehiculos):
        if v["id"] == veh_id:
            vehiculos[i]["publicado"] = False
            vehiculos[i]["condicion"] = "vendido"
            vehiculos[i]["ventaId"] = venta["id"]
            break
    write_json("vehiculos.json", vehiculos)

    return jsonify(venta), 201


# ──────────────────────────────────────────────────────────────
# Financiaciones (cuotas de la casa)
# ──────────────────────────────────────────────────────────────

@app.route("/api/financiaciones", methods=["GET"])
@require_roles("admin_general", "admin_sucursal")
def api_financiaciones_list():
    return jsonify(read_json("financiaciones.json"))

@app.route("/api/financiaciones/<fid>/pagar", methods=["POST"])
@require_roles("admin_general", "admin_sucursal")
def api_financiaciones_pagar(fid):
    body = request.get_json(silent=True) or {}
    metodo = body.get("metodoPago", "efectivo")
    financiaciones = read_json("financiaciones.json")
    for i, f in enumerate(financiaciones):
        if f["id"] == fid:
            pendiente = next((c for c in f["cuotas"] if not c["pagada"]), None)
            if not pendiente:
                return jsonify({"error": "No hay cuotas pendientes"}), 400
            # El frontend calcula el monto a cobrar según la tasa de interés
            # aplicada al momento del cobro y lo envía ya resuelto. Si no viene
            # (compatibilidad), se cobra el valor original de la cuota.
            # La cuota cargada ya incluye el interés a la tasa pactada (1,5% por
            # defecto): revertimos la fórmula francesa para obtener el capital
            # implícito y así medir el interés efectivamente cobrado.
            n = f.get("cantidadCuotas") or 1
            base = f.get("tasaInteres")
            base = 1.5 if base is None else float(base)
            if base > 0:
                r = base / 100.0
                factor = (1 - (1 + r) ** -n) / r
                capital_cuota = (pendiente["valor"] * factor) / n
            else:
                capital_cuota = pendiente["valor"]
            monto_cobrado = body.get("montoCobrado")
            if monto_cobrado is None:
                monto_cobrado = pendiente["valor"]
            monto_cobrado = max(0.0, float(monto_cobrado))
            tasa_aplicada = body.get("tasaAplicada")
            pendiente["pagada"] = True
            pendiente["fechaPago"] = body.get("fecha", datetime.now().strftime("%Y-%m-%d"))
            pendiente["metodoPago"] = metodo
            pendiente["montoCobrado"] = round(monto_cobrado)
            if tasa_aplicada is not None:
                pendiente["tasaAplicada"] = float(tasa_aplicada)
            # Interés cobrado por encima del capital de la cuota (para reportes).
            pendiente["interesCobrado"] = round(max(0.0, monto_cobrado - capital_cuota))
            # Sucursal donde se cobró (el cliente puede pagar en cualquiera).
            # Sirve para atribuir el ingreso al admin de esa sucursal.
            pendiente["sucursalCobro"] = session.get("sucursal", "")
            pendiente["usuarioCobro"] = session.get("nombre") or session.get("user", "")
            write_json("financiaciones.json", financiaciones)
            return jsonify(f)
    return jsonify({"error": "Financiación no encontrada"}), 404


# ──────────────────────────────────────────────────────────────
# Datos públicos (para el frontend)
# ──────────────────────────────────────────────────────────────

@app.route("/data/vehiculos.json")
def public_vehiculos():
    # El sitio público no expone precio ni kilometraje: se cargan en el
    # panel pero no se muestran ni se envían al frontend.
    vehiculos = read_json("vehiculos.json")
    publicados = []
    for v in vehiculos:
        if not v.get("publicado", True):
            continue
        oculto = ("costo", "precio", "km", "creadoPor", "creadoEn", "historial")
        publicados.append({k: val for k, val in v.items() if k not in oculto})
    return jsonify(publicados)


# ──────────────────────────────────────────────────────────────
# Catch-all para archivos estáticos
# ──────────────────────────────────────────────────────────────

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(ROOT, path)


# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

def _init_data():
    os.makedirs(DATA, exist_ok=True)
    os.makedirs(UPLOAD, exist_ok=True)

    if not os.path.exists(data_path("vendedores.json")):
        write_json("vendedores.json", [])

    _vendedores = read_json("vendedores.json")
    if os.path.exists(data_path("usuarios.json")) and not any(v.get("username") for v in _vendedores):
        _usuarios_viejos = read_json("usuarios.json")
        _changed = False
        for _u in _usuarios_viejos:
            _nombre_u = (_u.get("nombre") or "").strip().lower()
            _match = next((v for v in _vendedores if v.get("nombre", "").strip().lower() == _nombre_u), None)
            if _match:
                _match["username"] = _u["username"]
                _match["password"] = _u["password"]
                _match["rol"] = _u.get("rol", "vendedor")
                _match["sucursal"] = _u.get("sucursal", "")
            else:
                _vendedores.append({
                    "id": "vnd-" + uuid.uuid4().hex[:8],
                    "nombre": _u.get("nombre", _u["username"]),
                    "telefono": "", "email": "",
                    "comision": {"tipo": "porcentaje", "valor": 0}, "activo": True,
                    "username": _u["username"], "password": _u["password"],
                    "rol": _u.get("rol", "vendedor"), "sucursal": _u.get("sucursal", ""),
                })
            _changed = True
        if _changed:
            write_json("vendedores.json", _vendedores)
            print("  → Usuarios de login fusionados dentro de Personal")

    _vendedores = read_json("vendedores.json")
    if not any(v.get("rol") == "admin_general" and v.get("username") for v in _vendedores):
        pw = hashlib.sha256("maua2026".encode()).hexdigest()
        _vendedores.append({
            "id": "vnd-" + uuid.uuid4().hex[:8],
            "nombre": "Administrador", "telefono": "", "email": "",
            "comision": {"tipo": "porcentaje", "valor": 0}, "activo": True,
            "username": "admin", "password": pw, "rol": "admin_general", "sucursal": "",
        })
        write_json("vendedores.json", _vendedores)
        print("  → Usuario creado: admin / maua2026")

    if not os.path.exists(data_path("vehiculos.json")):
        write_json("vehiculos.json", [])

    if not os.path.exists(data_path("clientes.json")):
        write_json("clientes.json", [])

    if not os.path.exists(data_path("financiaciones.json")):
        write_json("financiaciones.json", [])

_init_data()

if __name__ == "__main__":
    print(f"\n  🚗  Mauá Automóviles — Panel activo")
    print(f"  →  Sitio:  http://localhost:8765")
    print(f"  →  Panel:  http://localhost:8765/panel")
    print(f"  →  Login:  admin / maua2026\n")

    port = int(os.environ.get("PORT", 8765))
    app.run(host="0.0.0.0", port=port, debug=False)
