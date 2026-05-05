## Music Bot Maintenance / YouTube Cookies

The bot uses yt-dlp + cookies from a YouTube session logged in on the VPS.

### Common symptoms

If this appears:

```txt
Sign in to confirm you’re not a bot
```

or:

```txt
Requested format is not available
Only images are available for download
Signature solving failed
n challenge solving failed
```

follow the checklist below.

## 1. Enter the bot container
```bash
docker ps
docker exec -it <BOT_CONTAINER_ID> bash
```

## 2. Validate that the cookies exist
```bash
ls -la /app/cookies.txt
cat /app/cookies.txt | grep -E "SID|HSID|SSID|APISID|SAPISID|LOGIN_INFO|__Secure-1PSID|__Secure-3PSID"
```

## 3. Test yt-dlp manually
```bash
yt-dlp --cookies /app/cookies.txt --remote-components ejs:github --list-formats "https://www.youtube.com/watch?v=vOOhV7j2DTU"
```

Expected result: audio formats should appear, for example:
```text
140 m4a audio only
251 webm audio only
```
If only `sb0`, `sb1`, `sb2`, `sb3` appear, the issue is related to the solver/EJS/yt-dlp.

## 4. Update yt-dlp inside the image
Confirm that the Dockerfile has:
```bash
RUN python3 -m pip install --break-system-packages -U "yt-dlp[default]"
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL=/root/.deno
ENV PATH="${DENO_INSTALL}/bin:${PATH}"
```
Then redeploy on Coolify.

5. Log in to YouTube again

If the cookies expire or Google asks you to log in again, run this on the VPS:
```bash
docker run -d \
  --name youtube-login \
  -p 3001:3001 \
  -v /data/youtube-profile:/config \
  lscr.io/linuxserver/chromium:latest
```
Open this in your browser:
```text
https://<IP_DA_VPS>:3001
```
Ignore the insecure certificate warning, log in to YouTube with the secondary account, and confirm that YouTube is logged in.

Then stop the temporary container:
```bash
docker stop youtube-login
docker rm youtube-login
```
Restart the bot on Coolify.

## 6. Force cookies.txt to update

Use /play once or restart the bot so CookieService can re-export the cookies.

Then validate:
```bash
docker exec -it <BOT_CONTAINER_ID> bash
cat /app/cookies.txt | grep -E "SID|HSID|SSID|APISID|SAPISID|LOGIN_INFO"
```

## 7. If it still fails

Possible causes:
- The VPS IP was temporarily blocked by YouTube.
- The Google account requested verification/CAPTCHA.
- yt-dlp is outdated.
- EJS/remote components are broken.
- The /data/youtube-profile volume is not being mounted correctly.

Try:
```bash
docker logs <BOT_CONTAINER_ID> --tail=200
```

And test manually:
```bash
yt-dlp -vU --cookies /app/cookies.txt --remote-components ejs:github --list-formats "https://www.youtube.com/watch?v=vOOhV7j2DTU"
```