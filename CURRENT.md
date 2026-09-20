# Arquivo `CURRENT.md`

## Status Atual: Fase 1 

Este repositório é um fork do workerdb e será refatorado para disponibilizar a biblioteca @vanaware/buildit

Esta biblioteca será basicamente o package utils que conterá três cli:
1. denobuid => derivado do build.ts que usará um arquivo config externo  denobuild.jsonc
2. esbuild => derivado do esbuild.ts que usará um arquivo config externo esbuild.jsonc
3. export => derivado do export.ts que usará um arquivo config externo export.jsonc

Precisamos de várias modificações:
* um novo agents.md pois ainda esta com alguns detalhes do pacote antigo workerdb
* um novo readme para o repositorio explicando o que cada um dos 3 apps faz e o conteudo do repositorio
* um readme para o pacote utils - @vanaware/buildit
* um novo pacote UI para servir de exemplo (faça um exemplo simples usando preact, beercss e signals)
* um novo pacote server apenas para mostrar o build do exemplo acima

Já Rodei uma substituição de nomes geral do antigo workerdb para buildit, mas com certeza preciso de ajustes para revisar o que pode ter ficado sem sentido

Atenção: todo o código que será exportadon de nosso novo @vanaware/buildit deverá estar no pacote do diretório: packages/utils . O que não ficará lá são basicamente os codigos do servidor e da ui do exemplo. teremos claro algumas exceções como scripts e arquivos de config de exemplo na raiz do repositório, dentre outros.


