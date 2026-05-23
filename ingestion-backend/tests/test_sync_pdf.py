import os
import pytest
import argparse
from unittest.mock import AsyncMock, MagicMock, patch
from langchain_core.documents import Document

from scripts.sync_anvisa import (
    clear_existing_pdf_embeddings,
    process_local_pdfs,
    main as cli_main
)

@pytest.mark.asyncio
async def test_clear_existing_pdf_embeddings():
    mock_vectorstore = AsyncMock()
    mock_engine = MagicMock()
    mock_conn = MagicMock()
    
    mock_context = MagicMock()
    mock_context.__enter__.return_value = mock_conn
    mock_engine.begin.return_value = mock_context
    mock_vectorstore._engine = mock_engine
    
    await clear_existing_pdf_embeddings("test_file.pdf", mock_vectorstore)
    
    mock_engine.begin.assert_called_once()
    mock_conn.execute.assert_called_once()
    args, kwargs = mock_conn.execute.call_args
    sql_query = str(args[0])
    
    assert "DELETE FROM langchain_pg_embedding" in sql_query
    assert "cmetadata ->> 'filename' = :filename" in sql_query
    assert "cmetadata ->> 'source' = 'local_pdf'" in sql_query
    assert args[1]["filename"] == "test_file.pdf"


@pytest.mark.asyncio
async def test_process_local_pdfs_directory_not_exists(capsys):
    await process_local_pdfs("/path/that/does/not/exist/at/all")
    captured = capsys.readouterr()
    assert "Erro: O diretório" in captured.out


@pytest.mark.asyncio
async def test_process_local_pdfs_no_pdfs(tmp_path, capsys):
    # Directory exists but no files
    await process_local_pdfs(str(tmp_path))
    captured = capsys.readouterr()
    assert "Aviso: Nenhum arquivo PDF encontrado" in captured.out


@pytest.mark.asyncio
async def test_process_local_pdfs_success(tmp_path, capsys):
    # Create mock PDF files
    pdf_file = tmp_path / "example.pdf"
    pdf_file.write_bytes(b"%PDF-1.4 mock pdf data")
    
    # Mock get_vectorstore
    mock_vectorstore = AsyncMock()
    mock_engine = MagicMock()
    mock_conn = MagicMock()
    mock_context = MagicMock()
    mock_context.__enter__.return_value = mock_conn
    mock_engine.begin.return_value = mock_context
    mock_vectorstore._engine = mock_engine
    
    mock_vectorstore.add_documents = MagicMock()
    
    # Mock PdfReader and Page text extraction
    mock_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Este é o conteúdo do PDF da ANVISA para o paracetamol. Deve ser indexado no RAG."
    mock_reader.pages = [mock_page]
    
    with patch("scripts.sync_anvisa.get_vectorstore", return_value=mock_vectorstore), \
         patch("scripts.sync_anvisa.PdfReader", return_value=mock_reader):
         
        await process_local_pdfs(str(tmp_path))
        
        # Verify vectorstore was called to add documents
        mock_vectorstore.add_documents.assert_called_once()
        added_docs = mock_vectorstore.add_documents.call_args[0][0]
        assert len(added_docs) > 0
        
        doc = added_docs[0]
        assert isinstance(doc, Document)
        assert "paracetamol" in doc.page_content
        assert doc.metadata["source"] == "local_pdf"
        assert doc.metadata["filename"] == "example.pdf"
        assert doc.metadata["page"] == 1
        
        # Verify stdout prints success
        captured = capsys.readouterr()
        assert "Encontrados 1 arquivos PDF" in captured.out
        assert "Processamento e indexação de 'example.pdf' concluídos com sucesso!" in captured.out


@pytest.mark.asyncio
async def test_process_local_pdfs_empty_or_scanned(tmp_path, capsys):
    # Create empty mock PDF
    pdf_file = tmp_path / "scanned.pdf"
    pdf_file.write_bytes(b"%PDF-1.4 empty")
    
    mock_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "   "  # whitespace only
    mock_reader.pages = [mock_page]
    
    mock_vectorstore = AsyncMock()
    
    with patch("scripts.sync_anvisa.get_vectorstore", return_value=mock_vectorstore), \
         patch("scripts.sync_anvisa.PdfReader", return_value=mock_reader):
        await process_local_pdfs(str(tmp_path))
        
        captured = capsys.readouterr()
        assert "Página 1 do arquivo 'scanned.pdf' está vazia ou é imagem" in captured.out
        assert "parece estar vazio ou escaneado (sem texto extraível)" in captured.out


@pytest.mark.asyncio
async def test_process_local_pdfs_exception_handling(tmp_path, capsys):
    pdf_file = tmp_path / "corrupt.pdf"
    pdf_file.write_bytes(b"corrupt data")
    
    mock_vectorstore = AsyncMock()
    
    # Make PdfReader raise an exception
    with patch("scripts.sync_anvisa.get_vectorstore", return_value=mock_vectorstore), \
         patch("scripts.sync_anvisa.PdfReader", side_effect=Exception("PDF corrupto de teste")):
        await process_local_pdfs(str(tmp_path))
        
        captured = capsys.readouterr()
        assert "Falha ao processar o arquivo 'corrupt.pdf'" in captured.out
        assert "PDF corrupto de teste" in captured.out


@pytest.mark.asyncio
async def test_cli_main_options(capsys):
    # Test --pdf-dir option
    with patch("scripts.sync_anvisa.process_local_pdfs", new_callable=AsyncMock) as mock_process, \
         patch("argparse.ArgumentParser.parse_args", return_value=argparse.Namespace(pdf_dir="/some/path")):
         
        await cli_main()
        mock_process.assert_called_once_with("/some/path")

