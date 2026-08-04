# Supabase Storage

Migration:

```text
supabase/migrations/20260803000300_storage_buckets.sql
```

## Buckets

- `invoice-pdfs`: PDFs de notas fiscais.
- `invoice-xmls`: XMLs de notas fiscais.
- `company-certificates`: certificados digitais A1/PFX.
- `documents`: documentos enviados pela empresa ou contador.

Todos os buckets sao privados.

## Padrao de caminhos

Use sempre o `company_id` como primeira pasta:

```text
company_id/invoices/invoice_id.pdf
company_id/invoices/invoice_id.xml
company_id/certificates/certificate.pfx
company_id/documents/document_id.pdf
```

## Regras

- Membros ativos da empresa podem ler PDFs, XMLs e documentos da propria empresa.
- Apenas proprietarios ativos podem ler certificados.
- Uploads sensiveis devem ser feitos pelo backend usando `SUPABASE_SERVICE_ROLE_KEY`.
- Certificados digitais nao devem ser enviados diretamente pelo frontend em producao.

## Endpoint de upload

O backend gera URLs temporarias de upload em:

```text
POST /api/storage
```

Body:

```json
{
  "action": "upload-url",
  "bucket": "documents",
  "fileName": "contrato.pdf",
  "recordId": "documento-123"
}
```

O retorno traz `signedUrl`, `token`, `bucket` e `path`. O frontend usa estes dados com `supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)`.

## Endpoint de download

O backend gera URLs temporarias de download em:

```text
POST /api/storage
```

Body:

```json
{
  "action": "download-url",
  "bucket": "documents",
  "path": "company_id/documents/documento-123/arquivo.pdf",
  "fileName": "arquivo.pdf"
}
```

O link expira em 5 minutos e e gerado em modo download.
