# Pointage RAM - Guide de transformation en application Desktop (Electron)

## Présentation
Ce projet est une solution de pointage (gestion de présence) composée d'un backend Java (Spring Boot) et d'un frontend React. Pour des raisons de volumétrie, le dossier `app-electron` (nécessaire pour la version desktop) **n'est pas inclus dans ce dépôt**.

Ce guide explique comment transformer l'application web en application desktop multiplateforme grâce à Electron.

---

## Prérequis
- Node.js (v16 ou supérieur recommandé)
- npm (ou yarn)
- Java JDK 21 (pour le backend)
- [Electron](https://www.electronjs.org/) et [electron-builder](https://www.electron.build/)

---

## 1. Cloner le projet
```bash
git clone <url-du-repo>
cd appPointage
```

---

## 2. Installer les dépendances
### Frontend
```bash
cd Pointage-frontend/pointage-frontend
npm install
```
### Backend
```bash
cd ../../../Pointage-backend
./mvnw clean install
```

---

## 3. Générer le build du frontend
```bash
cd ../Pointage-frontend/pointage-frontend
npm run build
```

---

## 4. Créer le dossier `app-electron`
À la racine du projet (`appPointage/`), crée un dossier `app-electron` et ajoute les fichiers suivants :

- `electron.js` (voir exemple ci-dessous)
- `package.json` (voir exemple ci-dessous)
- Le build React (`build/` généré à l'étape 3)
- Le backend packagé (`Pointage-backend/target/pointage-backend-0.0.1-SNAPSHOT.jar`)
- Une JDK portable (optionnel, pour embarquer Java)
- Une icône `.ico` pour l'application (optionnel)

**Exemple de structure minimale :**
```
app-electron/
  electron.js
  package.json
  build/           # Copie du build React
  pointage-backend-0.0.1-SNAPSHOT.jar
  # (optionnel) jdk-21.0.6/
  # (optionnel) ramLogoIco.ico
```

---

## 5. Exemple de `electron.js`
```js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
    },
    icon: app.isPackaged
      ? path.join(process.resourcesPath, 'ramLogoIco.ico')
      : path.join(__dirname, 'ramLogoIco.ico')
  });
  win.loadFile(path.join(__dirname, 'build', 'index.html'));
}

app.whenReady().then(() => {
  const isPackaged = app.isPackaged;
  const javaPath = isPackaged
    ? path.join(process.resourcesPath, 'jdk-21.0.6', 'bin', 'java.exe')
    : path.join(__dirname, 'jdk-21.0.6', 'bin', 'java.exe');
  const jarPath = isPackaged
    ? path.join(process.resourcesPath, 'pointage-backend-0.0.1-SNAPSHOT.jar')
    : path.join(__dirname, 'pointage-backend-0.0.1-SNAPSHOT.jar');
  const cwdPath = isPackaged ? process.resourcesPath : __dirname;

  backendProcess = spawn(javaPath, [
    '-jar',
    jarPath
  ], {
    cwd: cwdPath,
    detached: false,
    stdio: 'ignore'
  });

  createWindow();
});

app.on('will-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
```

---

## 6. Exemple de `package.json` pour Electron
```json
{
  "name": "app-electron",
  "version": "1.0.0",
  "main": "electron.js",
  "scripts": {
    "start": "electron electron.js",
    "build": "electron-builder"
  },
  "devDependencies": {
    "electron": "^37.2.3",
    "electron-builder": "^24.14.1"
  },
  "build": {
    "icon": "ramLogoIco.ico",
    "files": [
      "build/**/*",
      "electron.js",
      "pointage-backend-0.0.1-SNAPSHOT.jar"
    ],
    "extraResources": [
      "pointage-backend-0.0.1-SNAPSHOT.jar",
      "jdk-21.0.6/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "build/ramLogoIco.ico"
    }
  }
}
```

---

## 7. Installer les dépendances Electron
```bash
cd app-electron
npm install
```

---

## 8. Builder et lancer l’application desktop
```bash
npm run build
# ou pour tester en dev
npm start
```

---

## 9. Conseils
- **Ne pas versionner `app-electron`** (trop volumineux, déjà ignoré dans `.gitignore`).
- Pour embarquer Java, place une JDK portable dans `app-electron/jdk-21.0.6/` et adapte le chemin dans `electron.js`.
- Personnalise l’icône avec un fichier `.ico`.

---

## 10. Support
Pour toute question ou problème, contacte l’équipe technique ou crée une issue sur le dépôt GitHub.
