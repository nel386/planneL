# planneL OCR Service (PaddleOCR)

Servicio OCR local para extraer datos de tickets con PaddleOCR.

## Requisitos
- Python 3.10+
- CPU (GPU opcional)

## Instalacion (base)
```bash
cd server/ocr_service
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# Linux/macOS
# source .venv/bin/activate
pip install -r requirements.txt
```

> Nota ARM64 (Oracle VM A1): puede requerir un wheel especifico de `paddlepaddle`.
> Si la instalacion falla, sustituye la version en `requirements.txt` por la indicada
> para tu arquitectura en la documentacion oficial de PaddlePaddle.

## Ejecutar
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Variables de entorno
- `OCR_LANG`: `auto` (default), `es` o `en`
- `OCR_USE_ANGLE`: `true`/`false` (default `true`)

## Endpoint
`POST /ocr/receipt`
- multipart/form-data con campo `image`
- Respuesta JSON:
  - `merchant`, `date`, `total`, `items`, `raw_text`, `confidence`, `language`

## Ejemplo cURL
```bash
curl -X POST http://localhost:8000/ocr/receipt \
  -F "image=@/path/to/ticket.jpg"
```