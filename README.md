# Habito Brutal

MVP mobile offline feito com React Native, Expo e SQLite local.

## Funcionalidades

- Cadastro, edicao e exclusao de ate 3 habitos diarios.
- Nome, icone simples, cor e data de criacao por habito.
- Prova fotografica opcional por habito usando Expo Camera.
- Check diario com bloqueio de uma conclusao por dia.
- Horario de conclusao salvo no SQLite.
- Streak atual, melhor streak e progresso diario.
- Multa simbolica automatica de R$5 por falha diaria.
- Notificacao local diaria as 21h com a mensagem "Vai falhar hoje?".
- Notificacoes locais para habito concluido, todos completos e streak perdido.
- Timeline com checks, provas fotograficas, falhas e multas.
- Persistencia 100% local e offline.

## Estrutura

```text
components/
database/
hooks/
screens/
services/
utils/
```

## Banco local

O app cria o arquivo SQLite `habito_brutal.db` no dispositivo com:

- `habits`
- `habit_checks`
- `streak_state`
- `proof_photos`
- `penalties`
- `notification_settings`

O streak e recalculado a partir do historico de checks. Se todos os habitos foram concluidos hoje, o dia entra na sequencia. Se algum habito faltar, a sequencia volta para a ultima cadeia completa ate ontem ou zera automaticamente no dia seguinte.

As fotos sao copiadas para o armazenamento local do app em `proofs/`. Multas e configuracao do lembrete tambem ficam no SQLite local, sem integracao bancaria ou servico remoto.

## Como rodar

```bash
npm install
npm run start
```

Depois, abra no Expo Go ou em um emulador Android/iOS.

## Scripts

- `npm run start`: inicia o Expo.
- `npm run android`: abre no Android.
- `npm run ios`: abre no iOS.
- `npm run web`: abre no navegador.
