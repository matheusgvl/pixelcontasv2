param(
  [Parameter(Mandatory = $true)]
  [string]$CompanyId,

  [Parameter(Mandatory = $true)]
  [string]$Secret,

  [string]$Url = "https://pixelcontasv2.vercel.app/api/webhooks/hotmart",
  [string]$EventId = "test-hotmart-001"
)

$payload = @{
  company_id = $CompanyId
  event = "PURCHASE_APPROVED"
  event_id = $EventId
  data = @{
    purchase = @{
      transaction = $EventId
      status = "approved"
      order_date = (Get-Date).ToUniversalTime().ToString("o")
      payment = @{
        method = "pix"
      }
      price = @{
        value = 199.90
      }
    }
    buyer = @{
      name = "Cliente Teste Webhook"
      email = "cliente.teste.webhook@pixelconta.com.br"
      cpf = "12345678909"
      phone = "(81) 99999-9999"
    }
    product = @{
      id = "produto-teste-001"
      name = "Produto Teste Hotmart"
    }
  }
} | ConvertTo-Json -Depth 8

$headers = @{
  "Content-Type" = "application/json"
  "x-pixelconta-webhook-secret" = $Secret
}

try {
  Invoke-RestMethod -Method Post -Uri $Url -Headers $headers -Body $payload
} catch {
  $response = $_.Exception.Response
  if ($response -and $response.GetResponseStream()) {
    $reader = [System.IO.StreamReader]::new($response.GetResponseStream())
    $body = $reader.ReadToEnd()
    Write-Host $body
  }

  throw
}
