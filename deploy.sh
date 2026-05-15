#!/bin/bash
# GP Tournament Manager — Deploy Script (Mac / Linux)
# Uso: ./deploy.sh [--port 3000]
# ──────────────────────────────────────────────────

set -e

PORT="${PORT:-3000}"

# Parsear --port si se pasa como argumento
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --port) PORT="$2"; shift ;;
  esac
  shift
done

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
CYAN="\033[36m"
RESET="\033[0m"

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  GP Tournament Manager — Despliegue${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# ── Función: mostrar IPs de red local ──────────────────
show_urls() {
  echo ""
  echo -e "${GREEN}${BOLD}✓ Servidor corriendo en puerto $PORT${RESET}"
  echo ""
  echo -e "${CYAN}  Acceso local:     http://localhost:$PORT${RESET}"
  echo -e "${CYAN}  Panel de control: http://localhost:$PORT/control${RESET}"
  echo -e "${CYAN}  Vista pública:    http://localhost:$PORT/view${RESET}"
  echo ""

  # Mostrar IPs LAN para otros dispositivos
  if command -v ipconfig &>/dev/null; then
    # Windows (Git Bash)
    IPS=$(ipconfig | grep "IPv4" | awk '{print $NF}' | grep -v "^$")
  else
    # Mac / Linux
    IPS=$(ifconfig 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' \
       || ip -4 addr show 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1)
  fi

  if [[ -n "$IPS" ]]; then
    echo -e "  ${BOLD}Red local (otros dispositivos):${RESET}"
    while IFS= read -r ip; do
      [[ -n "$ip" ]] && echo -e "${CYAN}    http://$ip:$PORT/view${RESET}"
    done <<< "$IPS"
    echo ""
  fi
}

# ─────────────────────────────────────────────────────
# Opción 1: Docker (preferido)
# ─────────────────────────────────────────────────────
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  echo -e "${GREEN}Docker detectado. Usando Docker Compose...${RESET}"
  echo ""

  cd "$ROOT"

  # Crear directorio de datos si no existe
  mkdir -p data

  # Ajustar puerto en docker-compose si es distinto al default
  export PORT="$PORT"

  if command -v docker-compose &>/dev/null; then
    COMPOSE="docker-compose"
  else
    COMPOSE="docker compose"
  fi

  $COMPOSE down --remove-orphans 2>/dev/null || true
  $COMPOSE up --build -d

  show_urls
  echo -e "${YELLOW}Para detener: docker compose down${RESET}"
  echo ""
  exit 0
fi

# ─────────────────────────────────────────────────────
# Opción 2: Node.js directo
# ─────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}Error: ni Docker ni Node.js están instalados.${RESET}"
  echo ""
  echo "  Instala una de estas opciones:"
  echo "  • Docker Desktop: https://www.docker.com/products/docker-desktop"
  echo "  • Node.js 20+:    https://nodejs.org"
  echo ""
  exit 1
fi

NODE_VER=$(node -e "process.exit(parseInt(process.versions.node.split('.')[0]) < 18 ? 1 : 0)" 2>/dev/null && echo ok || echo old)
if [[ "$NODE_VER" == "old" ]]; then
  echo -e "${RED}Node.js 18+ requerido. Versión actual: $(node --version)${RESET}"
  exit 1
fi

echo -e "${GREEN}Node.js $(node --version) detectado. Instalando sin Docker...${RESET}"
echo ""

cd "$ROOT"

# Dependencias servidor
echo -e "${YELLOW}[1/3] Instalando dependencias del servidor...${RESET}"
npm install --prefix server --silent

# Dependencias cliente
echo -e "${YELLOW}[2/3] Instalando dependencias del cliente...${RESET}"
npm install --prefix client --silent

# Build del cliente
echo -e "${YELLOW}[3/3] Compilando cliente React...${RESET}"
npm run build --prefix client --silent

# Crear directorio de datos
mkdir -p data

echo ""
echo -e "${GREEN}✓ Build completado${RESET}"

show_urls
echo -e "${YELLOW}Presiona Ctrl+C para detener el servidor.${RESET}"
echo ""

# Arrancar servidor
PORT="$PORT" NODE_ENV=production DATA_DIR="$ROOT/data" node server/index.js
