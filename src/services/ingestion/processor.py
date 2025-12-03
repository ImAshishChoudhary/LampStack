from pathlib import Path

# Shared uploads directory
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def process_file(path: str):
    """
    Main entry point.
    Determines whether the file is parseable or scanned,
    then routes to the correct extraction method.
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(path)

    is_scanned = detect_scanned(path)
    output = {"file": path, "is_scanned": is_scanned}

    if not is_scanned:
        text, bboxes = extract_parseable_text(path)
        output.update(
            {
                "status": "parseable",
                "text_preview": text[:500],
                "bbox_count": len(bboxes),
            }
        )
    else:
        words = run_ocr_on_image(path)
        preview = " ".join(w["text"] for w in words[:40])
        output.update(
            {
                "status": "scanned",
                "ocr_preview": preview,
                "word_count": len(words),
            }
        )

    return output


def detect_scanned(path: str) -> bool:
    """
    Determine whether a file is scanned (OCR needed)
    or parseable (embedded text available).
    """
    p = Path(path)
    ext = p.suffix.lower()

    # Images = always scanned
    if ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
        return True

    # PDFs require text-sample check
    if ext == ".pdf":
        try:
            import pdfplumber

            with pdfplumber.open(path) as pdf:
                sample = ""
                for page in pdf.pages[:3]:
                    sample += page.extract_text() or ""
                return len(sample.strip()) < 200

        except Exception:
            raw = p.read_bytes()[:2000].lower()
            if b"/font" in raw or b"/contents" in raw:
                return False
            return True

    return True


def extract_parseable_text(path: str):
    """
    Extract text + bounding boxes from parseable PDF using pdfplumber.
    """
    import pdfplumber

    full_text = []
    bboxes = []

    with pdfplumber.open(path) as pdf:
        for page_number, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            full_text.append(text)

            for w in page.extract_words() or []:
                bboxes.append(
                    {
                        "text": w["text"],
                        "x0": w["x0"],
                        "x1": w["x1"],
                        "top": w["top"],
                        "bottom": w["bottom"],
                        "page": page_number,
                    }
                )

    return "\n".join(full_text), bboxes


def run_ocr_on_image(path: str):
    """
    OCR for scanned PDFs/images.
    Tries PaddleOCR first, then pytesseract.
    """
    # PaddleOCR path
    try:
        from paddleocr import PaddleOCR

        ocr = PaddleOCR(use_angle_cls=True, lang="en")
        result = ocr.ocr(path, cls=True)

        words = []
        for page in result:
            for line in page:
                box, text, score = line
                xs = [pt[0] for pt in box]
                ys = [pt[1] for pt in box]

                words.append(
                    {
                        "text": text,
                        "x0": min(xs),
                        "x1": max(xs),
                        "top": min(ys),
                        "bottom": max(ys),
                    }
                )

        return words

    except Exception:
        pass

    # pytesseract fallback
    try:
        import pytesseract
        from PIL import Image

        img = Image.open(path)
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

        words = []
        for i, token in enumerate(data["text"]):
            token = token.strip()
            if not token:
                continue

            words.append(
                {
                    "text": token,
                    "x0": data["left"][i],
                    "x1": data["left"][i] + data["width"][i],
                    "top": data["top"][i],
                    "bottom": data["top"][i] + data["height"][i],
                }
            )

        return words

    except Exception:
        raise RuntimeError(
            "No OCR backend found. Install paddleocr or pytesseract+tesseract."
        )
