# -*- coding: utf-8 -*-
import re
from typing import List, Dict, Optional

TOTAL_HINTS = [
    'total',
    'importe',
    'a pagar',
    'pagar',
    'subtotal',
    'sum',
    'amount',
]

SKIP_HINTS = [
    'gastos de envio',
    'envio',
    'envíos',
    'entrega',
    'pedido',
    'articulo',
    'artículo',
    'uds',
    'unidad',
    'unidades',
    'iva',
    'impuesto',
    'descuento',
    'politica',
    'política',
]

DATE_PATTERNS = [
    re.compile(r'(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})'),
    re.compile(r'(\d{4}[\/\-]\d{2}[\/\-]\d{2})'),
]

AMOUNT_RE = re.compile(r'(\d{1,3}(?:[\.,]\d{3})*[\.,]\d{2})')
QTY_RE = re.compile(r'(?:x\s*(\d+)|(\d+)\s*x)', re.IGNORECASE)


def _normalize_amount(raw: str) -> Optional[float]:
    if not raw:
        return None
    cleaned = raw.replace(' ', '')
    if cleaned.count(',') > 0 and cleaned.count('.') > 0:
        if cleaned.rfind(',') > cleaned.rfind('.'):
            cleaned = cleaned.replace('.', '').replace(',', '.')
        else:
            cleaned = cleaned.replace(',', '')
    else:
        cleaned = cleaned.replace(',', '.')
    try:
        return float(cleaned)
    except ValueError:
        return None


def _clean_line(line: str) -> str:
    line = line.replace('€', '').replace('$', '')
    return re.sub(r'\s+', ' ', line).strip()


def _is_skippable(line_lower: str) -> bool:
    return any(hint in line_lower for hint in TOTAL_HINTS + SKIP_HINTS)


def _extract_price_from_line(line: str) -> Optional[float]:
    match = AMOUNT_RE.search(line)
    if not match:
        return None
    return _normalize_amount(match.group(1))


def _extract_qty_from_line(line: str) -> Optional[int]:
    match = QTY_RE.search(line)
    if not match:
        return None
    raw = match.group(1) or match.group(2)
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None


def extract_receipt_fields(lines: List[str]) -> Dict:
    cleaned_lines = [_clean_line(line) for line in lines if line and line.strip()]
    text_lower = [line.lower() for line in cleaned_lines]

    date = None
    for line in cleaned_lines:
        for pattern in DATE_PATTERNS:
            match = pattern.search(line)
            if match:
                date = match.group(1)
                break
        if date:
            break

    total = None
    total_candidates = []
    for idx, line in enumerate(cleaned_lines):
        line_lower = text_lower[idx]
        amounts = AMOUNT_RE.findall(line)
        if not amounts:
            continue
        if any(hint in line_lower for hint in TOTAL_HINTS):
            for value in amounts:
                normalized = _normalize_amount(value)
                if normalized is not None:
                    total_candidates.append(normalized)
        else:
            for value in amounts:
                normalized = _normalize_amount(value)
                if normalized is not None:
                    total_candidates.append(normalized)

    if total_candidates:
        total = max(total_candidates)

    merchant = None
    for line in cleaned_lines[:6]:
        cleaned = re.sub(r'[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]', '', line).strip()
        if len(cleaned) >= 3:
            merchant = cleaned
            break

    items: List[Dict] = []
    pending_name: Optional[str] = None
    for idx, line in enumerate(cleaned_lines):
        line_lower = text_lower[idx]
        if _is_skippable(line_lower):
            pending_name = None
            continue

        qty = _extract_qty_from_line(line)
        price = _extract_price_from_line(line)

        # Pattern: name + price in same line
        if price is not None and re.search(AMOUNT_RE, line):
            name_part = re.sub(AMOUNT_RE, '', line).strip(' -:')
            if name_part and not name_part.isdigit():
                items.append({
                    'name': name_part,
                    'price': price,
                    'qty': qty or 1,
                })
                pending_name = None
                continue

        # Pattern: name line followed by qty/price line
        if pending_name and price is not None:
            items.append({
                'name': pending_name,
                'price': price,
                'qty': qty or 1,
            })
            pending_name = None
            continue

        # Store potential name for next line if line has letters
        if re.search(r'[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]', line):
            pending_name = line
        else:
            pending_name = None

    return {
        'merchant': merchant,
        'date': date,
        'total': total,
        'items': items,
        'raw_text': cleaned_lines,
    }