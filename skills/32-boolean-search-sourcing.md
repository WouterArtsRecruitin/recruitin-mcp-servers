# 32 — Boolean Search & Sourcing

## Doel
Boolean search string generatie voor LinkedIn en jobboards, look-alike kandidaat matching, vacature copy optimalisatie en AI training data export. Eigen pip package beschikbaar.

## Wanneer activeren
Triggers: boolean search, zoekstring, boolean string, LinkedIn zoeken, sourcing, kandidaten vinden, look-alike matching, vacature optimizer, search string bouwen, JobDigger boolean

## Repos
- Primair: WouterArtsRecruitin/recruitin-boolean- (Python pip package)
- Aanvullend: WouterArtsRecruitin/nederlandse-vacature-optimizer

## Pip package
pip install recruitin-boolean

## Functionaliteiten
1. Boolean Search Generatie — LinkedIn searches per functiegroep
2. Look-alike Matching — vergelijkbare profielen vinden
3. AI Training Data — HuggingFace compatibele datasets exporteren
4. Taxonomie Management — functiegroep definities met skills/titels
5. Excel Integratie — vacatures importeren, resultaten exporteren

## Standaard boolean structuur NL tech
("Java Developer" OR "Java Engineer" OR "Backend Developer")
AND ("Spring Boot" OR "Microservices" OR "REST API")
AND ("Gelderland" OR "Overijssel" OR "Noord-Brabant" OR "Oost-Nederland")
NOT ("Freelance" OR "ZZP" OR "Interim")

## Functiegroep taxonomie Recruitin
- Java/Backend: Java, Spring Boot, Kotlin, Microservices
- Python/Data: Python, Django, FastAPI, Data Engineering
- DevOps: Kubernetes, Docker, CI/CD, Terraform, AWS/Azure
- Automation: PLC, SCADA, Siemens, Rockwell, C++
- Frontend: React, TypeScript, Next.js, Vue

## Nederlandse vacature optimizer
- Copy analyse op leesbaarheid en aantrekkelijkheid
- Genderneutrale taal check
- Salarisindicatie verplicht (Wet toezicht gelijke kansen 2024)
- Inclusiviteitsscore

## Combinaties
- Met 09-recruitment-nl: functietitels + sectorkennis
- Met 31-linkedin-automation: zoekstrings naar bulk outreach
- Met 18-intelligence-hub: marktdata naar boolean verfijning
- Met 14-apollo-enrichment: boolean results naar Apollo verrijking
