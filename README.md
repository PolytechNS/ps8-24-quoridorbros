# PS8

## Fonctionnalités implémentées pour Tag docker

### Jeu

- **Partie 1v1 locale** : Affrontez un joueur sur le même appareil.
- **Partie contre IA** : Affrontez une IA en communiquant avec le serveur via une socket.
- **Mouvements possibles** :
  - Déplacement d'un pion sur des cases adjacentes
  - Saut par dessus un pion adverse
  - Placer un mur

### Connexion et Inscription

- **Inscription** : Créez un compte utilisateur.
- **Connexion** : Connectez-vous pour accéder à vos parties sauvegardées et reprendre la dernière partie que vous avez enregistrée.

## Technologies et Outils

### MongoDB

- **Stockage de Données** : Toutes les données des utilisateurs sont stockées dans MongoDB sur le port 27017.

### Docker

- **Docker Compose** : Notre projet utilise Docker Compose pour orchestrer les conteneurs NodeJS et MongoDB, simplifiant le déploiement et la gestion des services.

## Mise en Route

Pour lancer le projet, assurez-vous d'avoir Docker et Docker Compose installés sur votre machine. Suivez ensuite ces étapes :

1. Clonez le dépôt du projet.
2. `docker-compose build`.
3. Lancez le service avec `docker-compose up`.
4. Accédez au jeu via votre navigateur web au localhost:8000.

## Contribution

Dorian Bouchard, Julien Soto, Evan Tranvouez
