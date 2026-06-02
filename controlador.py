import requests
import time
import threading
import sys

# -------- CONFIG --------
API_BASE = "http://181.140.119.7:8000"
API_KEY  = "1027801124J"

HEADERS = {
    "x-api-key": API_KEY
}

corriendo = True

# reutilizar conexión HTTP
session = requests.Session()
session.headers.update(HEADERS)

def limpiar_linea():
    sys.stdout.write("\r" + " " * 120 + "\r")
    sys.stdout.flush()

def monitorear():
    global corriendo

    while corriendo:
        try:
            r = session.get(
                f"{API_BASE}/status",
                timeout=(5,10)
            )

            r.raise_for_status()

            data = r.json()

            irms = data.get("irms",0)
            potencia = data.get("potencia",0)
            rele = "🟢 ON" if data.get("rele") else "🔴 OFF"

            sys.stdout.write(
                f"\r⚡ Corriente: {irms:.3f} A  |  "
                f"🔌 Potencia: {potencia:.1f} W  |  "
                f"🔧 Relé: {rele}     "
            )

            sys.stdout.flush()

        except requests.exceptions.Timeout:
            sys.stdout.write("\r⌛ Timeout servidor      ")
            sys.stdout.flush()

        except requests.exceptions.ConnectionError:
            sys.stdout.write("\r🌐 Error conexión/Tailscale      ")
            sys.stdout.flush()

        except Exception as e:
            sys.stdout.write(f"\r❌ {e}      ")
            sys.stdout.flush()

        time.sleep(2)

def controlar():
    global corriendo

    print("="*55)
    print("   Monitor Wemos / FastAPI / Tailscale")
    print("="*55)
    print("   1 = Encender")
    print("   0 = Apagar")
    print("   q = Salir")
    print("="*55)

    while corriendo:

        try:
            cmd = input("\n> ").strip()

            if cmd == "q":
                corriendo = False
                print("\nSaliendo...")
                break

            elif cmd == "1":

                r = session.post(
                    f"{API_BASE}/rele/1",
                    timeout=(5,10)
                )

                data = r.json()

                if data.get("ok"):
                    print("✅ Relé ENCENDIDO")
                else:
                    print("❌ Error al encender")

            elif cmd == "0":

                r = session.post(
                    f"{API_BASE}/rele/0",
                    timeout=(5,10)
                )

                data = r.json()

                if data.get("ok"):
                    print("⭕ Relé APAGADO")
                else:
                    print("❌ Error al apagar")

            else:
                print("⚠️  Comando inválido")

        except KeyboardInterrupt:
            corriendo = False
            print("\nSaliendo...")
            break

        except Exception as e:
            print(f"\n❌ {e}")

# ---------- MAIN ----------

hilo = threading.Thread(
    target=monitorear,
    daemon=True
)

hilo.start()

controlar()