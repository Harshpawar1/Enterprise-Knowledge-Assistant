from docling.document_converter import DocumentConverter

def extract_text(file_path):
    converter = DocumentConverter()
    result = converter.convert(file_path)
    return result.document.export_to_markdown()