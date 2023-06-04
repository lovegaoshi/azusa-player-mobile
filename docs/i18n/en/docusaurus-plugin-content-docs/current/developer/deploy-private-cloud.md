---
sidebar_position: 4
---

# Deploy a Private Cloud for Syncing

I have a very simple file serving API server at [this repo](https://github.com/lovegaoshi/fastapi-fileserv). Note APM forbids http (cleartext connection). Free https certificates are available at zeroSSL.

## Fork the Repository

<!-- prettier-ignore -->
First fork this repo, and change ['王胡桃w'] to ['your-secret-key'], for example ['lovegaoshi']. If using noxplayer the extension, this secret key has to be your bilibili account name (uname).

## Deploy using Vercel

Vercel provides free and easy deployment that also automatically assigns a free subdomain name and ssl certification, as well as free data management via PostgreSQL.

1. switch repo branch to [vercel](https://github.com/lovegaoshi/fastapi-fileserv/tree/vercel) and fork if not already.
2. create a new vercel project and use the forked vercel branch as the source.
3. The Vercel version of noxbackup uses Vercel's postgreSQL for data management, instead of local json. If you havent done so, create a vercel postgreSQL database [here](https://vercel.com/dashboard/stores).
4. connect the sql to your vercel project in step #2.
5. write down the port number in the psql string.
6. navigate to sql->Data->Query, execute the following query to initialize noxbackup's table:
   `CREATE TABLE IF NOT EXISTS noxbackup (username TEXT PRIMARY KEY, data bytea);`
7. make sure in the project in step #2's settings -> environment variables, there are a lot of POSTGRES_XXXX set for you automatically from step #4. Now, add two more variables: POSTGRES_PORT with the value from step #5, and USERID with the secret key of your choice, for example lovegaoshi. If using noxplayer the extension, this secret key has to be your bilibili account name (uname). You may use multiple secrets separated by a single comma.
8. redeploy and hopefully it runs.

## Deploy using Docker

**NOTE: you need a SSL certificate for your domain.**

1. clone forked repo
2. `docker build -t fastapi`
3. `sudo docker run -v "$(pwd)":/fastapi --rm -p 0.0.0.0:9527:5000/tcp fastapi uvicorn main:app --reload --host=0.0.0.0 --port=5000`
4. alternatively, use `docker-compose.yml` and simply run `docker compose up -d`.
5. reroute (eg. using nginx) port 9527 to an address under your domain.

## Deploy on router/NAS

**NOTE: you need a SSL certificate for your router domain.**

I own a ASUS TUF AX-5400 and found that only flask works on this router. To install on ASUS routers, first flash ASUS-merlin and install opkg via AMTM as outlined [here probably](https://github.com/RMerl/asuswrt-merlin.ng/wiki/AMTM).

Next, install tmux, git and python3.

Lastly, ssh into your router, type `tmux` to open a new tmux session, git clone this repo; then run `python noxFlask.py`. Navigate to `http://your-router-ip:6666` and you should see `noxbackup flask is up`
