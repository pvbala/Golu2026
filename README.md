# Golu app

A free installable web app (PWA) for Android and iPhone: a summary and 9 videos.

## Files

- `index.html`, `style.css`, `app.js` : the app
- `content.json` : **edit this** to change the title, summary and the 9 video titles
- `manifest.json`, `sw.js` : make it installable and let it open offline
- `icons/` : home screen icon
- `thumbs/1.jpg` to `9.jpg` : placeholder pictures, replace with your own (16:10 or 16:9)
- `videos/1.mp4` to `9.mp4` : **add your videos here**

## Prepare videos (2-3 minutes each)

720p, H.264, "fast start", under 50 MB each.

FFmpeg:

    ffmpeg -i original.mp4 -vf "scale=-2:720" -c:v libx264 -preset slow -crf 26 -maxrate 2M -bufsize 4M -c:a aac -b:a 128k -movflags +faststart 1.mp4

HandBrake: preset "Fast 720p30", tick "Web Optimized".

## Publish

1. VS Code: Source Control, then Publish to GitHub (public repo, e.g. `golu-app`).
2. github.com: repo, Settings, Pages, Deploy from a branch, `main` / `(root)`, Save.
3. After 1-2 minutes the app is at `https://YOURNAME.github.io/golu-app/`.

## Install on the phone

- iPhone: open the link in Safari, tap Share, then Add to Home Screen.
- Android: open the link in Chrome, tap the menu, then Install app.

## Update

Edit files, Commit, Sync. Changes appear within a couple of minutes.
If the phone shows the old version, close the app fully and reopen it.
