# Waarom "Email Sequence Ready" Stage Nodig Is

## Het Probleem Zonder Nieuwe Stage

**Oude situatie:**
```
Deal in Pipeline 14 → Emails zitten in custom fields → MAAR HOE START DE AUTOMATION?
```

**Pipedrive automations hebben een TRIGGER nodig:**
- Automation kan niet starten "uit het niets"
- Er moet iets veranderen aan de deal
- Anders weet Pipedrive niet wanneer de 6-email sequence moet beginnen

## De Oplossing: Stage Change Trigger

**Nieuwe situatie:**
```
1. MCP genereert emails → Opslaan in custom fields
2. Deal verplaatsen naar "Email Sequence Ready" stage 
3. Stage change triggert de automation
4. Automation leest custom fields en start email sequence
```

## Praktisch Voorbeeld

**Stap voor stap:**
1. **Deal 1110** zit in stage "lead" 
2. **MCP heeft alle 6 emails gegenereerd** en opgeslagen in custom fields
3. **Handmatig**: Verplaats deal naar "Email Sequence Ready"
4. **Automation detecteert**: "Deal moved TO Email Sequence Ready stage"
5. **Automation start**: Email 1 wordt verstuurd met content uit custom field
6. **7 dagen later**: Email 2 (als geen reply)
7. **Continue**: Tot alle 6 emails verstuurd zijn

## Waarom Niet Automatisch?

**Controle & Kwaliteit:**
- Je wilt controleren of alle email content goed is
- Je wilt zelf beslissen wanneer sequence start
- Je kunt deals "pauzeren" in andere stages
- Je houdt controle over timing

## Alternative Triggers (Complexer)

Andere opties zouden zijn:
- Custom field change (maar welk field?)
- Time-based (maar wanneer precies?)  
- Manual button (niet beschikbaar in Pipedrive)

**Stage change is het meest betrouwbaar en gebruiksvriendelijk.**