# API NoSQL citation 
### Auteur : EBERST Emmanuel et Dorian SONZOGNI

## 1. API Back end
*Charger de developpement back-end :  Eberst Emmanuel*
*Charger de developpement front-end :  Dorian SONZOGNI*

Nous avons utilisé une base de données en mongodb, les requêtes effectuées dans cette API sont en NoSQL
Le serveur fait appel à la technologie NodeJS avec le framework suivant : <br/>

- Express
- CryptoJs
- Mongodb
- short-uuid

Les fonctionnalités qui sont disponibles sont les suivants.

- se connecter et s'inscrire.
- la liste de toutes les citations.
- list de toutes les citations d'un auteur.
- une recherche d'une citation par caractère ou/et par auteur.
- ajouter une citation en favoris.
- un utilisateur peut ajouter une citation.
- un utilisateur peut supprimer ses propres citations.
  
Pour les statistiques voici ce qui a était fait.

- On peut afficher le membre qui a fait le plus de citation. 
- les 3 citations que les personnes préfèrent le plus. 
- le nombre de citations sans auteur.
- L'auteur dont les citations on était les plus mises en favoris.
- l'auteur le plus cité.



La base de données est une architecture orientée document, nous manipulions 2 collections, un "éditeur" et un "citations"
voici les schémas que l'on utilise.<br/>

Schéma de citations :
```Json
{
  "_id" : string,
  "Auteur" : string,
  "citations" : string,
  "oeuvre" : string,
  "date" : string,
  "langue" : string,
  "favNumber" : integer
}
```
Schéma de éditeur : 
```Json
{
  "_id" : string,
  "nom" : string,
  "email" : string,
  "mot_de_passe" : string,
  "favoris" : [...idCitation],
  "citation_poster" : [...idCitation]
}
```

### Comment utiliser l'API

*Outil nécessaire : [Robot 3T, postman, mongodb, NodeJs]*

Lancer mongodb sur le terminal, ainsi que Robot 3T et crée une base de données nommée "citation" et 2 collections 
Une "citations" et "editeurs"

Voici quelques exemples que vous pouvez insérer:

citations : 
```Json
{
  "_id": "2YF9XeWaxMyyks9dAgVEUD",
  "Auteur" : "Aristote",
  "citations" : "L'ignorant affirme, le savant doute, le sage réfléchit.",
  "oeuvre" : null,
  "date" : null,
  "langue" : "francais",
  "favNumber": 0
}
```
editeur :
```Json
{
    "_id" : "606c57854d3b9800681e3957",
    "nom" : "test2",
    "email" : "test2@test.com",
    "mot_de_passe" : "c63526821e73a8dc412566be9968bcd3",
    "favoris" : ["2YF9XeWaxMyyks9dAgVEUD"],
    "citation_poster" : ["2YF9XeWaxMyyks9dAgVEUD"]
}
```
Ou sinon vous pouvez effectuer les tests via postman.

Ouvrir un terminal à la racine du projet et fait "npm install", ce qui va installer toutes les dépendances que j'ai utilisées.
Par la suite fait "npm serveur".

Les différents liens sont si dessous :

- Get  http://localhost:3000/api/citations                      renvoie toute les citations
- Get  http://localhost:3000/api/citations-auteur/:auteur 
- Post http://localhost:3000/api/citation/:email                avec un body en Json 
- Del  http://localhost:3000/api/citation/delete/idCitation 
- Put  http://localhost:3000/api/citation/update/idCItation     avec un body en Json
- Get  http://localhost:3000/api/citation/character/:character  
- Get  http://localhost:3000/api/citation/search/:Auteur&:character
- Post http://localhost:3000/api/editeur/create/                avec un body en Json
- Put  http://localhost:3000/api/editeur/addFav/email&idcitation
- Get  http://localhost:3000/api/editeur/users/:email
- Get  http://localhost:3000/api/statistique/bestusers/
- Get  http://localhost:3000/api/statistique/unknowEditeur/
- Get  http://localhost:3000/api/statistique/bestCitationFav/
- Get  http://localhost:3000/api/statistique/unknowEditeur/
- Get  http://localhost:3000/api/statistique/bestEditeurCitationFav/

## 2. Front-end 
