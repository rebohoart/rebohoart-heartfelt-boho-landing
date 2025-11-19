@echo off
chcp 65001 >nul
color 0A

echo ============================================================
echo    TESTE DA API GEMINI 2.5 FLASH IMAGE
echo ============================================================
echo.

REM Pedir a API Key ao usuário
set API_KEY=
set /p API_KEY="Cole sua API Key do Gemini aqui e pressione ENTER: "

if "%API_KEY%"=="" (
    echo.
    echo [ERRO] Você precisa fornecer uma API Key!
    echo.
    echo Como obter sua API Key:
    echo 1. Acesse: https://aistudio.google.com/app/apikey
    echo 2. Copie a API Key
    echo 3. Execute este script novamente e cole a chave
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] API Key recebida: %API_KEY:~0,20%...
echo.
echo [INFO] Testando a API Gemini...
echo.

REM Criar arquivo JSON temporário para o corpo da requisição
echo { > request.json
echo   "contents": [{ >> request.json
echo     "parts": [{ >> request.json
echo       "text": "Generate a simple red circle" >> request.json
echo     }] >> request.json
echo   }], >> request.json
echo   "generationConfig": { >> request.json
echo     "responseModalities": ["IMAGE"] >> request.json
echo   } >> request.json
echo } >> request.json

REM Fazer requisição usando curl (disponível no Windows 10+)
echo [INFO] Enviando requisição para a API...
echo.

curl -s -w "\n%%{http_code}\n" -X POST ^
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=%API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @request.json > response.txt

REM Ler o status HTTP (última linha)
for /f %%i in (response.txt) do set LAST_LINE=%%i
set HTTP_STATUS=%LAST_LINE%

echo ============================================================
echo    RESULTADO DO TESTE
echo ============================================================
echo.
echo Status HTTP: %HTTP_STATUS%
echo.

REM Analisar o resultado baseado no status HTTP
if "%HTTP_STATUS%"=="200" (
    color 0A
    echo [SUCESSO] A API esta funcionando!
    echo.
    echo Voce TEM acesso ao free tier do Gemini 2.5 Flash Image!
    echo.
    echo Proximos passos:
    echo 1. Ative a 'Generative Language API' no Google Cloud Console
    echo 2. Configure a GEMINI_API_KEY no Supabase
    echo 3. Aguarde 10-15 minutos
    echo 4. Teste no backoffice
    echo.
) else if "%HTTP_STATUS%"=="400" (
    color 0C
    echo [ERRO 400] Bad Request
    echo.
    echo Possiveis causas:
    echo - Formato da requisicao incorreto
    echo - Modelo nao disponivel
    echo - Parametros invalidos
    echo.
) else if "%HTTP_STATUS%"=="401" (
    color 0C
    echo [ERRO 401] Unauthorized
    echo.
    echo Sua API Key e invalida ou expirou!
    echo.
    echo Solucoes:
    echo 1. Verifique se copiou a API Key corretamente
    echo 2. Crie nova API Key em: https://aistudio.google.com/app/apikey
    echo 3. Certifique-se que nao tem espacos extras
    echo.
) else if "%HTTP_STATUS%"=="403" (
    color 0C
    echo [ERRO 403] Forbidden
    echo.
    echo API Key valida mas sem permissao!
    echo.
    echo Possiveis causas:
    echo - API nao ativada no projeto
    echo - Restricoes de regiao
    echo - Requer billing ativado
    echo.
) else if "%HTTP_STATUS%"=="429" (
    color 0E
    echo [ERRO 429] Rate Limit / Quota Exceeded
    echo.

    REM Verificar se é free_tier com limit: 0
    findstr /C:"free_tier" /C:"limit: 0" response.txt >nul
    if %ERRORLEVEL%==0 (
        echo [DIAGNOSTICO] API NAO ATIVADA
        echo.
        echo A 'Generative Language API' nao esta ativada no seu projeto!
        echo.
        echo Como ativar ^(GRATIS - 500 imagens/dia^):
        echo.
        echo 1. Acesse: https://console.cloud.google.com/apis/library
        echo 2. Busque: 'Generative Language API'
        echo 3. Clique em 'ENABLE'
        echo 4. Aguarde 10-15 minutos
        echo 5. Execute este script novamente
        echo.
    ) else (
        echo [DIAGNOSTICO] QUOTA EXCEDIDA OU RATE LIMIT
        echo.
        echo Voce atingiu o limite de requisicoes.
        echo.
        echo Verifique seu uso em: https://ai.dev/usage
        echo.
    )
) else if "%HTTP_STATUS%"=="500" (
    color 0C
    echo [ERRO 500] Erro do Servidor
    echo.
    echo O servidor do Google esta com problemas.
    echo Aguarde alguns minutos e tente novamente.
    echo.
) else if "%HTTP_STATUS%"=="503" (
    color 0C
    echo [ERRO 503] Service Unavailable
    echo.
    echo O servidor do Google esta com problemas.
    echo Aguarde alguns minutos e tente novamente.
    echo.
) else (
    color 0E
    echo [ERRO DESCONHECIDO] Status: %HTTP_STATUS%
    echo.
)

echo ============================================================
echo    DETALHES DA RESPOSTA
echo ============================================================
echo.
type response.txt
echo.
echo ============================================================

echo.
echo Links uteis:
echo - Documentacao: https://ai.google.dev/gemini-api/docs/image-generation
echo - API Keys: https://aistudio.google.com/app/apikey
echo - Cloud Console: https://console.cloud.google.com/apis/library
echo.

REM Limpar arquivos temporários
del request.json >nul 2>&1
del response.txt >nul 2>&1

echo.
pause
