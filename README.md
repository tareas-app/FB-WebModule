
# Firebase Based WebModule
Frameworkds:
Bootstrap
jQuery
AngularJS
Firebase JS SDK


## Emulator starten met de Firebase CLI:

0. installeer NodeJS:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  [Download NodeJS](https://nodejs.org/en/download/)

1. installeer Firebase CLI: 
```
npm install -g firebase-tools
```

2. Log in (wordt in een browser venster geopend):

```
firebase login
```

3. Start de emulator (localhost:5000):

```
firebase serve --only functions,hosting
```
