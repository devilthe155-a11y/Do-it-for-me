# Do It For Me

A personal toolkit for a fresher starting corporate life. Works offline. No account, no server, no cost.

When a situation is not built in, the app writes a full prompt for you and hands it to **any AI app on your phone** (ChatGPT, Claude, Gemini, Perplexity, Copilot, or anything in the share menu). So the app never runs out of answers, and you never pay for AI inside it.

## What is inside

| Tab | What it does |
| --- | --- |
| Write | 14 ready messages: ask a senior for guidance, LinkedIn note, ask for help, admit a mistake, ask for leave, resign politely and more. Fill the blanks, copy. |
| Ask AI | For anything not covered. Builds a complete prompt with your background and sends it to any AI app on your phone. |
| Decode | 40+ office words in plain language, with a sentence you can say in a meeting. A missing word goes to Ask AI. |
| Prep | Interview answers filled with your details, plus a first-day checklist. |
| Decide | Weighted scoring for tough choices. |
| Money | CTC to monthly in-hand estimate, savings goal timer, 50/30/20 salary split. |
| People | A small network ledger. Tells you who to follow up with and when. |
| Proof | A log of what you build and learn. Copies as resume bullets. |
| Me | Your background (used in every AI prompt) and backup and restore. |

All data stays on your phone.

## Get the Android app (no computer needed)

GitHub builds the APK for you, for free.

1. Make a free account at github.com and press **New repository**. Name it `do-it-for-me`. Keep it Public. Press **Create repository**.
2. Press **uploading an existing file**. Select ALL these files from the project and upload them:
   `index.html`, `app.js`, `data.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `package.json`, `capacitor.config.json`, `.gitignore`.
   Press **Commit changes**.
3. Add the two robot files. Press **Add file > Create new file**. In the name box type exactly `.github/workflows/build-apk.yml` (typing the slashes makes the folders). Paste the contents of that file from the project. Press **Commit changes**. Do the same for `.github/workflows/web.yml`.
4. Press the **Actions** tab. Wait 5 to 8 minutes for **Build Android APK** to turn green.
5. Open that finished run. At the bottom, under **Artifacts**, download **DoItForMe-apk**. Unzip it. You get `app-debug.apk`.
6. Open the APK on your phone. Android will ask to allow installing from this source. Allow it. Done.

On a computer you can also drag the whole project folder (including `.github`) into the GitHub upload page. The folders are kept.

Every time you change a file and commit, a new APK is built.

## Or use it as a web app (even easier)

1. In your repository press **Settings > Pages**. Under **Source** choose **GitHub Actions**.
2. Run **Publish web version** from the Actions tab.
3. Open the address it shows on your phone in Chrome. Press the menu, then **Add to Home screen**. It now opens like an app and works offline.

## Make it yours

* Add your own words, messages and questions in `data.js`. This is the only file you must edit to grow the app.
* Change the look in `styles.css`.
* Change `appId` and `appName` in `capacitor.config.json`.
* Open **Me** inside the app and write your real background. The AI prompts get better with it.

## How the AI hand-off works

No AI runs inside the app. **Ask AI** builds a prompt from your background and your situation. The big button opens the phone's share menu, which lists every app that accepts text, including AI apps. The ChatGPT, Claude, Perplexity and Copilot buttons open that service with the prompt filled in. Gemini cannot be pre-filled, so the prompt is copied and you paste it.

## Good to know

* The APK is a debug build. It installs and runs fine on any Android phone. Publishing to the Play Store would need a signed release build.
* The CTC estimate is rough. Your offer letter is the truth.
* Firefox, Chrome and Android Share all work. On a phone without a share menu, the app copies the prompt instead.
* If the Actions build fails, open the failed step and read the red message. Copy it into any AI app and ask what to fix.

## Run on a computer (optional)

```
npm install
mkdir www && cp index.html app.js data.js styles.css manifest.webmanifest sw.js icon-*.png www/
npx cap add android
npx cap sync android
npx cap open android
```
Or simply open `index.html` in a browser. It needs no server.
